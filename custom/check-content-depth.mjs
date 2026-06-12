/*
文件说明：该文件用于检查公开内容深度与好物文章完整性。
功能说明：确认知识与好物内容具备可阅读深度，并拦截好物文章模板词、交易化表达和延伸资料缺失。

结构概览：
  第一部分：公共扫描工具
  第二部分：好物首页旧模板词检查
  第三部分：30 个好物文章页检查
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

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function hrefsOf(html) {
  return [...html.matchAll(/\shref\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2]);
}

// ========== 第二部分：好物首页旧模板词检查 ==========
const solutionsIndex = await read("solutions/index.html");
const solutionsIndexForbiddenTerms = [
  "5 个档案入口",
  "进入档案",
  "查看档案",
  "第一批好物档案",
  "方向整理",
  "方向卡片",
  "内容流",
  "资料框架",
  "每一页都按内容阅读方式展开",
  "浏览更多",
];

for (const term of solutionsIndexForbiddenTerms) {
  if (solutionsIndex.includes(term)) problems.push(`solutions/index.html：仍包含好物首页旧模板词“${term}”`);
}

for (const category of ["柚木家具", "柚木地板", "柚木整装", "柚木户外", "柚木收藏", "柚木文创"]) {
  if (!solutionsIndex.includes(category)) problems.push(`solutions/index.html：缺少六类体系分类 ${category}`);
}

// ========== 第三部分：30 个好物文章页检查 ==========
const goodsFiles = (await collectFiles("solutions/goods", new Set([".html"]))).sort();
if (goodsFiles.length !== 30) problems.push(`solutions/goods：好物文章页数量 ${goodsFiles.length}，应为 30 个`);

const goodsForbiddenTerms = [
  "导语",
  "为什么值得看",
  "材质与气质",
  "适合什么场景",
  "怎么看细节",
  "公开资料观察",
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
const representativeFiles = new Set([
  "solutions/goods/teak-tea-table.html",
  "solutions/goods/aged-teak-flooring.html",
  "solutions/goods/teak-wall-panel.html",
  "solutions/goods/teak-yacht-deck.html",
  "solutions/goods/old-teak-door.html",
  "solutions/goods/teak-tray.html",
]);
const representativeForbiddenTerms = [
  "观察重点",
  "来源类型",
  "公开资料观察",
  "为什么值得看",
  "怎么看细节",
  "适合什么场景",
  "本页整理的是",
  "不涉及具体品牌承诺",
  "具体产品仍需",
];
const forbiddenSectionTitles = ["导语", "为什么值得看", "材质与气质", "适合什么场景", "怎么看细节", "公开资料观察", "底部简短说明"];

for (const relativePath of goodsFiles) {
  const html = await read(relativePath);
  const article = html.match(/<article class="goods-article-prose"[\s\S]*?<\/article>/i)?.[0] ?? "";
  const related = html.match(/<section class="goods-related-section"[\s\S]*?<\/section>/i)?.[0] ?? "";
  const sourceSection = html.match(/<section class="goods-source-section"[\s\S]*?<\/section>/i)?.[0] ?? "";
  const visibleArticle = stripTags(`${article} ${related} ${sourceSection}`);

  for (const term of goodsForbiddenTerms) {
    if (visibleArticle.includes(term)) problems.push(`${relativePath}：好物正文区域仍包含禁用词“${term}”`);
  }

  if (representativeFiles.has(relativePath)) {
    const representativeScope = stripTags(`${article} ${sourceSection}`);
    for (const term of representativeForbiddenTerms) {
      if (representativeScope.includes(term)) problems.push(`${relativePath}：代表文章仍包含字段化表达“${term}”`);
    }
  }

  for (const title of forbiddenSectionTitles) {
    const h2Pattern = new RegExp(`<h2[^>]*>\\s*${title}\\s*<\\/h2>`, "i");
    if (h2Pattern.test(html)) problems.push(`${relativePath}：仍使用模板小节标题“${title}”`);
  }

  const paragraphCount = countMatches(article, /<p\b/g);
  if (paragraphCount < 8) problems.push(`${relativePath}：正文段落数 ${paragraphCount}，少于 8 段`);

  const relatedCount = countMatches(related, /<a\b/g);
  if (relatedCount < 3) problems.push(`${relativePath}：相关好物链接 ${relatedCount} 个，少于 3 个`);
  if (related && !related.includes("继续阅读")) problems.push(`${relativePath}：相关好物按钮文案未统一为“继续阅读”`);

  const sourceLinks = hrefsOf(sourceSection);
  const externalSourceLinks = sourceLinks.filter((href) => /^https?:\/\//i.test(href));
  if (!sourceSection) problems.push(`${relativePath}：缺少延伸资料模块`);
  if (externalSourceLinks.length < 3) problems.push(`${relativePath}：延伸资料外部链接 ${externalSourceLinks.length} 个，少于 3 个`);
  for (const href of sourceLinks) {
    if (!href.trim()) problems.push(`${relativePath}：延伸资料存在空链接`);
    if (href.includes("custom/")) problems.push(`${relativePath}：延伸资料不允许引用 custom 内部文件 ${href}`);
  }
}

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("内容深度检查未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("内容深度检查通过：好物首页、30 个好物文章页、代表文章和延伸资料模块均满足当前要求。");
