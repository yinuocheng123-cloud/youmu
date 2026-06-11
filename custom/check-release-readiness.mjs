/*
文件说明：该文件用于检查公网发布前的旧口径与高风险表达。
功能说明：扫描公开 HTML 与数据源，拦截好物旧二级名、建设期模板语、内部审核话、交易化表达和 V1.17 以前旧表达回潮。

结构概览：
  第一部分：公共扫描工具
  第二部分：公开页面旧口径检查
  第三部分：好物文章页发布检查
  第四部分：结果输出
*/

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const publicEntries = ["index.html", "data/site-content.js", "knowledge", "solutions", "vendors", "cooperation", "about", "articles", "cases", "forms"];
const problems = [];

// ========== 第一部分：公共扫描工具 ==========
async function collectFiles(entry, extensions = new Set([".html", ".js"])) {
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

// ========== 第二部分：公开页面旧口径检查 ==========
const publicForbiddenTerms = [
  "Teak Project Gallery",
  "五个应用场景",
  "庭院户外",
  "茶室会客",
  "家具好物",
  "好物方案",
  "资料框架",
  "人工核验",
  "后续人工核验",
  "真实资料仍需以后续人工核验为准",
  "知识内容用于建立判断路径",
  "阅读路径",
  "继续看",
  "下一步可以看",
  "读完后",
  "样板",
  "占位",
  "待补",
  "建设中",
  "立即购买",
  "柚木茶室精选",
  "5 个档案入口",
  "进入档案",
  "第一批好物档案",
  "方向整理",
  "补图",
  "补故事",
  "补观察素材",
  "底部简短说明",
  "本页整理的是",
  "不涉及具体品牌承诺",
];

const publicFiles = (await Promise.all(publicEntries.map((entry) => collectFiles(entry)))).flat().filter((file) => file !== "forms/form.js").sort();

for (const relativePath of publicFiles) {
  const text = await read(relativePath);
  const visibleText = relativePath.endsWith(".html") ? text.replace(/<!--[\s\S]*?-->/g, "") : text;
  const lines = visibleText.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const term of publicForbiddenTerms) {
      if (line.includes(term)) {
        problems.push(`${relativePath}:${index + 1}：发现公网旧口径或高风险表达“${term}”`);
      }
    }
  });
}

// ========== 第三部分：好物文章页发布检查 ==========
const solutionsIndex = await read("solutions/index.html");
for (const category of ["柚木家具", "柚木地板", "柚木整装", "柚木户外", "柚木收藏", "柚木文创"]) {
  if (!solutionsIndex.includes(category)) problems.push(`solutions/index.html：缺少六类新体系分类 ${category}`);
}

for (const id of ["good-furniture", "good-flooring", "good-whole-decoration", "good-outdoor", "good-collection", "good-creative"]) {
  if (!solutionsIndex.includes(`id="${id}"`)) problems.push(`solutions/index.html：缺少六类分区锚点 ${id}`);
}

const goodsFiles = (await collectFiles("solutions/goods", new Set([".html"]))).sort();
if (goodsFiles.length !== 30) problems.push(`solutions/goods：好物文章页数量 ${goodsFiles.length}，应为 30 个`);

const goodsForbiddenTerms = ["价格", "库存", "购买", "下单", "立即购买", "平台认证", "官方推荐", "交易担保"];
const forbiddenSectionTitles = ["导语", "为什么值得看", "材质与气质", "适合什么场景", "怎么看细节", "公开资料观察", "底部简短说明"];

for (const relativePath of goodsFiles) {
  const html = await read(relativePath);
  const visibleText = stripTags(html);

  for (const term of goodsForbiddenTerms) {
    if (visibleText.includes(term)) problems.push(`${relativePath}：好物文章仍包含交易化或背书化表达“${term}”`);
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

  const sourceSection = html.match(/<section class="goods-source-section"[\s\S]*?<\/section>/i)?.[0] ?? "";
  const sourceCount = countMatches(sourceSection, /href="https?:\/\//g);
  if (sourceCount < 3) problems.push(`${relativePath}：延伸资料外部链接 ${sourceCount} 个，少于 3 个`);
}

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("正式发布预检未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("正式发布预检通过：未发现旧口径、好物模板语或交易化高风险表达回潮。");
