/*
文件说明：该文件用于检查公开内容的文章完整性与阅读自然度。
功能说明：扫描重点知识文章与柚木好物文章页，拦截导语重复、模板小节、旧式底部说明和好物页正文不足等问题。

结构概览：
  第一部分：公共扫描工具
  第二部分：重点知识文章检查
  第三部分：好物文章页检查
  第四部分：结果输出
*/

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const problems = [];

// ========== 第一部分：公共扫描工具 ==========
async function collectFiles(entry, extensions = new Set([".html"])) {
  const absolute = path.join(projectRoot, entry);
  const stat = await fs.stat(absolute);

  if (stat.isFile()) {
    return extensions.has(path.extname(absolute)) ? [entry.replaceAll(path.sep, "/")] : [];
  }

  const files = [];
  const children = await fs.readdir(absolute, { withFileTypes: true });
  for (const child of children) {
    const relative = path.join(entry, child.name).replaceAll(path.sep, "/");
    if (child.isDirectory()) {
      files.push(...(await collectFiles(relative, extensions)));
    } else if (child.isFile() && extensions.has(path.extname(child.name))) {
      files.push(relative);
    }
  }
  return files;
}

async function read(relativePath) {
  return fs.readFile(path.join(projectRoot, relativePath), "utf8");
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(text) {
  return stripTags(text).replace(/[，。！？、；：\s]/g, "");
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

// ========== 第二部分：重点知识文章检查 ==========
const focusArticles = [
  "knowledge/topics/teak-origin-basic.html",
  "knowledge/topics/teak-daily-cleaning.html",
  "knowledge/topics/teak-price-difference.html",
  "knowledge/topics/teak-authenticity-basic.html",
  "knowledge/topics/what-is-teak.html",
  "knowledge/topics/teak-buying-pitfalls.html",
];

const articleForbiddenTerms = [
  "人工核验",
  "后续人工核验",
  "阅读路径",
  "继续看",
  "下一步可以看",
  "读完后",
  "知识内容用于建立判断路径",
  "真实资料仍需以后续人工核验为准",
];

function extractLead(html) {
  return (
    html.match(/<header class="article-hero">[\s\S]*?<h1>[\s\S]*?<\/h1>\s*<p>([\s\S]*?)<\/p>/i)?.[1] ??
    html.match(/<p class="content-lead">([\s\S]*?)<\/p>/i)?.[1] ??
    ""
  );
}

function extractFirstBodyParagraph(html) {
  const body = html.match(/<(?:div|section) class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)(?:<section class="[^"]*article-related|<section class="[^"]*article-note|<\/div>|<\/section>)/i)?.[1] ?? "";
  return body.match(/<p>([\s\S]*?)<\/p>/i)?.[1] ?? "";
}

for (const relativePath of focusArticles) {
  const html = await read(relativePath);
  const mainText = stripTags(html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html);
  const lead = normalize(extractLead(html));
  const firstParagraph = normalize(extractFirstBodyParagraph(html));

  if (lead && firstParagraph && (firstParagraph.startsWith(lead) || lead.startsWith(firstParagraph))) {
    problems.push(`${relativePath}：文章导语与正文第一段重复`);
  }

  if (html.includes('class="article-inline-heading"')) {
    problems.push(`${relativePath}：重点知识文章仍存在 article-inline-heading，阅读感像小节拼接`);
  }

  const related = html.match(/<section class="[^"]*article-related[\s\S]*?<\/section>/i)?.[0] ?? "";
  const relatedCount = countMatches(related, /<li\b/g);
  if (relatedCount > 3) problems.push(`${relativePath}：相关内容链接数量 ${relatedCount}，超过 3 个`);

  for (const term of articleForbiddenTerms) {
    if (mainText.includes(term)) problems.push(`${relativePath}：文章仍包含内部话或旧说明“${term}”`);
  }

  const footer = html.match(/<footer[\s\S]*?<\/footer>/i)?.[0] ?? "";
  for (const term of articleForbiddenTerms) {
    if (footer.includes(term)) problems.push(`${relativePath}：文章 Footer 仍包含内部话“${term}”`);
  }
}

// ========== 第三部分：好物文章页检查 ==========
const solutionsIndex = await read("solutions/index.html");
const indexForbiddenTerms = [
  "5 个档案入口",
  "进入档案",
  "第一批好物档案",
  "方向整理",
  "补图",
  "补故事",
  "补观察素材",
  "每一页都按内容阅读方式展开",
];

for (const term of indexForbiddenTerms) {
  if (solutionsIndex.includes(term)) problems.push(`solutions/index.html：仍包含好物首页模板语“${term}”`);
}

if ((solutionsIndex.match(/class="good-item-card\b/g) ?? []).length < 72) {
  problems.push("solutions/index.html：柚木好物内容卡少于 72 条");
}

const goodsFiles = (await collectFiles("solutions/goods", new Set([".html"]))).sort();
if (goodsFiles.length !== 30) problems.push(`solutions/goods：好物文章页数量 ${goodsFiles.length}，应为 30 个`);

const goodsForbiddenTerms = [
  "底部简短说明",
  "进入档案",
  "5 个档案入口",
  "本页整理的是",
  "不涉及具体品牌承诺",
  "价格",
  "库存",
  "购买",
  "下单",
  "立即购买",
  "平台认证",
  "官方推荐",
  "交易担保",
];

const forbiddenSectionTitles = [
  "导语",
  "为什么值得看",
  "材质与气质",
  "适合什么场景",
  "怎么看细节",
  "公开资料观察",
  "底部简短说明",
];

for (const relativePath of goodsFiles) {
  const html = await read(relativePath);
  const visibleText = stripTags(html);

  for (const term of goodsForbiddenTerms) {
    if (visibleText.includes(term)) problems.push(`${relativePath}：好物文章仍包含禁用词“${term}”`);
  }

  for (const title of forbiddenSectionTitles) {
    const h2Pattern = new RegExp(`<h2[^>]*>\\s*${title}\\s*<\\/h2>`, "i");
    if (h2Pattern.test(html)) problems.push(`${relativePath}：仍使用模板小节标题“${title}”`);
  }

  const article = html.match(/<article class="goods-article-prose"[\s\S]*?<\/article>/i)?.[0] ?? "";
  const paragraphCount = countMatches(article, /<p\b/g);
  if (paragraphCount < 8) problems.push(`${relativePath}：正文段落数 ${paragraphCount}，少于 8 段`);

  const related = html.match(/<section class="goods-related-section"[\s\S]*?<\/section>/i)?.[0] ?? "";
  const relatedCount = countMatches(related, /<a\b/g);
  if (relatedCount < 3) problems.push(`${relativePath}：相关好物链接 ${relatedCount} 个，少于 3 个`);

  if (related && !related.includes("浏览更多")) problems.push(`${relativePath}：相关好物按钮文案未统一为“浏览更多”`);
}

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("内容深度检查未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("内容深度检查通过：知识文章与 30 个好物文章页均符合当前发布口径。");
