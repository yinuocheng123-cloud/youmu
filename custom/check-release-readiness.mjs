/*
文件说明：该文件用于执行正式发布前的公开页面口径预检。
功能说明：扫描公开 HTML 与数据源，拦截好物旧模板词、交易化表达、背书化表达和资料来源模块缺失。

结构概览：
  第一部分：路径与扫描工具
  第二部分：公开页面旧词与高风险表达检查
  第三部分：柚木好物文章与延伸资料检查
  第四部分：结果输出
*/

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const publicEntries = [
  "index.html",
  "data/site-content.js",
  "knowledge",
  "solutions",
  "vendors",
  "cooperation",
  "about",
  "articles",
  "cases",
  "forms",
];
const problems = [];

// ========== 第一部分：路径与扫描工具 ==========
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

function extractHrefs(html) {
  return [...html.matchAll(/\shref\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2]);
}

// ========== 第二部分：公开页面旧词与高风险表达检查 ==========
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
  "会员站",
  "审核",
  "平台认证",
  "官方推荐",
  "立即购买",
  "进入档案",
  "浏览更多",
  "查看档案",
  "第一批好物档案",
  "方向卡片",
  "内容流",
  "5 个档案入口",
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
        problems.push(`${relativePath}:${index + 1}：发现公开旧口径或高风险表达“${term}”`);
      }
    }
  });

  // 这里拦截的是明确交易化组合，而不是知识文章中“选购判断”一类自然语境。
  const visibleOnly = relativePath.endsWith(".html") ? stripTags(visibleText) : visibleText;
  const transactionPatterns = [
    /价格\s*[:：]/,
    /库存\s*[:：]/,
    /购买链接/,
    /购买入口/,
    /在线下单/,
    /直接下单/,
    /下单入口/,
    /加入购物车/,
  ];
  for (const pattern of transactionPatterns) {
    if (pattern.test(visibleOnly)) problems.push(`${relativePath}：发现交易化表达 ${pattern}`);
  }
}

// ========== 第三部分：柚木好物文章与延伸资料检查 ==========
const solutionsIndex = await read("solutions/index.html");
for (const category of ["柚木家具", "柚木地板", "柚木整装", "柚木户外", "柚木收藏", "柚木文创"]) {
  if (!solutionsIndex.includes(category)) problems.push(`solutions/index.html：缺少六类新体系分类 ${category}`);
}

for (const id of ["good-furniture", "good-flooring", "good-whole-decoration", "good-outdoor", "good-collection", "good-creative"]) {
  if (!solutionsIndex.includes(`id="${id}"`)) problems.push(`solutions/index.html：缺少六类分区锚点 ${id}`);
}

const goodsFiles = (await collectFiles("solutions/goods", new Set([".html"]))).sort();
if (goodsFiles.length !== 30) problems.push(`solutions/goods：好物文章页数量 ${goodsFiles.length}，应为 30 个`);

const goodsForbiddenTerms = [
  "底部简短说明",
  "进入档案",
  "查看档案",
  "浏览更多",
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
const forbiddenSectionTitles = ["导语", "为什么值得看", "材质与气质", "适合什么场景", "怎么看细节", "公开资料观察", "底部简短说明"];
const featuredPages = new Set([
  "solutions/goods/teak-tea-table.html",
  "solutions/goods/aged-teak-flooring.html",
  "solutions/goods/teak-wall-panel.html",
  "solutions/goods/teak-yacht-deck.html",
  "solutions/goods/old-teak-door.html",
  "solutions/goods/teak-tray.html",
]);
const featuredForbiddenTerms = ["观察重点", "来源类型", "公开资料观察", "为什么值得看", "怎么看细节", "适合什么场景", "本页整理的是", "不涉及具体品牌承诺", "具体产品仍需"];

for (const relativePath of goodsFiles) {
  const html = await read(relativePath);
  const visibleText = stripTags(html);
  const article = html.match(/<article class="goods-article-prose"[\s\S]*?<\/article>/i)?.[0] ?? "";
  const sourceSection = html.match(/<section class="goods-source-section"[\s\S]*?<\/section>/i)?.[0] ?? "";

  for (const term of goodsForbiddenTerms) {
    if (visibleText.includes(term)) problems.push(`${relativePath}：好物文章仍包含交易化、背书化或模板表达“${term}”`);
  }

  for (const title of forbiddenSectionTitles) {
    const h2Pattern = new RegExp(`<h2[^>]*>\\s*${title}\\s*<\\/h2>`, "i");
    if (h2Pattern.test(html)) problems.push(`${relativePath}：仍使用模板小节标题“${title}”`);
  }

  if (featuredPages.has(relativePath)) {
    const featuredScope = stripTags(`${article} ${sourceSection}`);
    for (const term of featuredForbiddenTerms) {
      if (featuredScope.includes(term)) problems.push(`${relativePath}：代表文章仍包含字段化表达“${term}”`);
    }
  }

  const paragraphCount = countMatches(article, /<p\b/g);
  if (paragraphCount < 8) problems.push(`${relativePath}：正文段落数 ${paragraphCount}，少于 8 段`);

  const related = html.match(/<section class="goods-related-section"[\s\S]*?<\/section>/i)?.[0] ?? "";
  const relatedCount = countMatches(related, /<a\b/g);
  if (relatedCount < 3) problems.push(`${relativePath}：相关好物链接 ${relatedCount} 个，少于 3 个`);

  if (!sourceSection) {
    problems.push(`${relativePath}：缺少延伸资料模块`);
    continue;
  }

  const sourceHrefs = extractHrefs(sourceSection);
  const externalSourceCount = sourceHrefs.filter((href) => /^https?:\/\//i.test(href)).length;
  if (externalSourceCount < 3) problems.push(`${relativePath}：延伸资料外部链接 ${externalSourceCount} 个，少于 3 个`);
  for (const href of sourceHrefs) {
    if (!href || href === "#") problems.push(`${relativePath}：延伸资料存在空链接`);
    if (href.includes("custom/")) problems.push(`${relativePath}：延伸资料不允许引用 custom 内部文件 ${href}`);
  }
}

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("正式发布预检未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("正式发布预检通过：好物文章、延伸资料、旧口径和高风险表达均未发现阻塞问题。");
