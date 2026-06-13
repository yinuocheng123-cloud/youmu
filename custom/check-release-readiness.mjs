/*
文件说明：该文件用于执行正式发布前的公开页面口径预检。
功能说明：扫描公开 HTML 与公开数据源，拦截旧模板词、交易化表达、背书化表达、好物旧二级名和资料来源模块缺失。

结构概览：
  第一部分：路径与扫描工具
  第二部分：公开页面旧词与高风险表达检查
  第三部分：柚木好物文章与延伸阅读检查
  第四部分：sitemap 好物页完整性检查
  第五部分：结果输出
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
  "Teak Lifestyle Picks",
  "这是柚木好物，不是商品销售页",
  "先看生活里的样子",
  "先按分类浏览",
  "阅读线索会持续扩充",
  "值得细读的柚木好物",
  "值得细读",
  "精选阅读",
  "第二入口",
  "精选",
  "档案系统",
  "资料库",
  "阅读中心",
  "档案",
  "进入档案",
  "查看档案",
  "第一批",
  "5 个档案入口",
  "内容流",
  "方向卡片",
  "来源类型",
  "观察重点",
  "公开资料观察",
  "本页整理的是",
  "不涉及具体品牌承诺",
  "底部简短说明",
  "补图",
  "补故事",
  "补观察素材",
  "资料框架",
  "资料整理",
  "人工核验",
  "后续人工核验",
  "真实资料仍需以后续人工核验为准",
  "知识内容用于建立判断路径",
  "阅读路径",
  "判断路径",
  "继续看",
  "下一步可以看",
  "读完后",
  "浏览更多",
  "查看更多",
  "样板",
  "占位",
  "待补",
  "建设中",
  "会员站",
  "审核",
  "平台认证",
  "官方推荐",
  "交易担保",
  "交易承诺",
  "平台背书",
  "价格",
  "库存",
  "购买",
  "下单",
  "立即购买",
];

const publicFiles = (await Promise.all(publicEntries.map((entry) => collectFiles(entry))))
  .flat()
  .filter((file) => file !== "forms/form.js")
  .sort();

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

  const visibleOnly = relativePath.endsWith(".html") ? stripTags(visibleText) : visibleText;
  const transactionPatterns = [
    /加入购物车/,
    /在线下单/,
    /直接下单/,
    /下单入口/,
    /购买链接/,
    /购买入口/,
    /库存\s*[:：]/,
    /价格\s*[:：]/,
  ];
  for (const pattern of transactionPatterns) {
    if (pattern.test(visibleOnly)) problems.push(`${relativePath}：发现交易化表达 ${pattern}`);
  }
}

// ========== 第三部分：柚木好物文章与延伸阅读检查 ==========
const solutionsIndex = await read("solutions/index.html");
for (const category of ["柚木家具", "柚木地板", "柚木整装", "柚木户外", "柚木收藏", "柚木文创"]) {
  if (!solutionsIndex.includes(category)) problems.push(`solutions/index.html：缺少六类新体系分类 ${category}`);
}

for (const id of ["good-furniture", "good-flooring", "good-whole-decoration", "good-outdoor", "good-collection", "good-cultural"]) {
  if (!solutionsIndex.includes(`id="${id}"`)) problems.push(`solutions/index.html：缺少六类分区锚点 ${id}`);
}

const goodsSectionRequirements = [
  { id: "good-furniture", label: "柚木家具", href: "#good-furniture" },
  { id: "good-flooring", label: "柚木地板", href: "#good-flooring" },
  { id: "good-whole-decoration", label: "柚木整装", href: "#good-whole-decoration" },
  { id: "good-outdoor", label: "柚木户外", href: "#good-outdoor" },
  { id: "good-collection", label: "柚木收藏", href: "#good-collection" },
  { id: "good-cultural", label: "柚木文创", href: "#good-cultural" },
];

for (const section of goodsSectionRequirements) {
  if (!solutionsIndex.includes(`href="${section.href}"`)) problems.push(`solutions/index.html：六类二级导航缺少 ${section.href}`);

  const sectionMatch = solutionsIndex.match(new RegExp(`<section[^>]+id="${section.id}"[\\s\\S]*?<\\/section>`, "i"));
  if (!sectionMatch) {
    problems.push(`solutions/index.html：缺少六类分区锚点 ${section.id}`);
    continue;
  }

  const sectionText = stripTags(sectionMatch[0]);
  for (const requiredLabel of ["代表文章", "更多内容", "相关参考"]) {
    if (!sectionText.includes(requiredLabel)) problems.push(`solutions/index.html：${section.label} 分区缺少“${requiredLabel}”`);
  }
}

const goodsFiles = (await collectFiles("solutions/goods", new Set([".html"]))).sort();
if (goodsFiles.length !== 30) problems.push(`solutions/goods：好物文章页数量 ${goodsFiles.length}，应为 30 个`);

const forbiddenSectionTitles = ["导语", "为什么值得看", "材质与气质", "适合什么场景", "怎么看细节", "公开资料观察", "底部简短说明"];
const featuredPages = new Set([
  "solutions/goods/teak-tea-table.html",
  "solutions/goods/aged-teak-flooring.html",
  "solutions/goods/teak-wall-panel.html",
  "solutions/goods/teak-yacht-deck.html",
  "solutions/goods/old-teak-door.html",
  "solutions/goods/teak-tray.html",
]);
const featuredForbiddenTerms = [
  "延伸资料",
  "资料来源",
  "参考资料",
  "观察重点",
  "来源类型",
  "公开资料观察",
  "为什么值得看",
  "怎么看细节",
  "适合什么场景",
  "本页整理的是",
  "不涉及具体品牌承诺",
  "具体产品仍需",
  "这些资料只作为阅读参考",
];
const sourceIntros = [];

for (const relativePath of goodsFiles) {
  const html = await read(relativePath);
  const visibleText = stripTags(html);
  const article = html.match(/<article class="goods-article-prose"[\s\S]*?<\/article>/i)?.[0] ?? "";
  const related = html.match(/<section class="goods-related-section"[\s\S]*?<\/section>/i)?.[0] ?? "";
  const sourceSection = html.match(/<section class="goods-source-section"[\s\S]*?<\/section>/i)?.[0] ?? "";

  for (const term of publicForbiddenTerms) {
    if (visibleText.includes(term)) problems.push(`${relativePath}：好物文章仍包含公开禁用词“${term}”`);
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
  const requiredParagraphs = featuredPages.has(relativePath) ? 10 : 8;
  if (paragraphCount < requiredParagraphs) problems.push(`${relativePath}：正文段落数 ${paragraphCount}，少于 ${requiredParagraphs} 段`);

  const relatedCount = countMatches(related, /<a\b/g);
  if (relatedCount < 3) problems.push(`${relativePath}：站内关联链接 ${relatedCount} 个，少于 3 个`);
  if (!related.includes("你可能还会喜欢")) problems.push(`${relativePath}：关联阅读模块标题未统一为“你可能还会喜欢”`);
  if (related && !related.includes("继续阅读")) problems.push(`${relativePath}：关联阅读按钮文案未统一为“继续阅读”`);

  if (!sourceSection) {
    problems.push(`${relativePath}：缺少延伸阅读模块`);
    continue;
  }

  const expectedSourceTitle = "继续了解";
  const sourceTitlePattern = new RegExp(`<h2[^>]*>\\s*${expectedSourceTitle}\\s*<\\/h2>`, "i");
  if (!sourceTitlePattern.test(sourceSection)) problems.push(`${relativePath}：外部阅读模块标题应为“${expectedSourceTitle}”`);
  const sourceIntroPattern = new RegExp(`<h2[^>]*>\\s*${expectedSourceTitle}\\s*<\\/h2>\\s*<p>([\\s\\S]*?)<\\/p>`, "i");
  const sourceIntro = sourceSection.match(sourceIntroPattern)?.[1]?.trim() ?? "";
  if (!sourceIntro) problems.push(`${relativePath}：${expectedSourceTitle}缺少说明段落`);
  sourceIntros.push(sourceIntro);

  const sourceHrefs = extractHrefs(sourceSection);
  const externalSourceCount = sourceHrefs.filter((href) => /^https?:\/\//i.test(href)).length;
  if (externalSourceCount < 3) problems.push(`${relativePath}：延伸阅读外部链接 ${externalSourceCount} 个，少于 3 个`);
  for (const href of sourceHrefs) {
    if (!href || href === "#") problems.push(`${relativePath}：延伸阅读存在空链接`);
    if (!/^https?:\/\//i.test(href)) problems.push(`${relativePath}：延伸阅读只能使用公开外部链接，当前为 ${href}`);
    if (href.includes("custom/")) problems.push(`${relativePath}：延伸阅读不允许引用 custom 内部文件 ${href}`);
    if (/^[a-zA-Z]:[\\/]/.test(href)) problems.push(`${relativePath}：延伸阅读不允许引用本地绝对路径 ${href}`);
  }
}

if (new Set(sourceIntros).size < 20) problems.push(`solutions/goods：延伸阅读说明重复度过高，当前唯一说明 ${new Set(sourceIntros).size} 条`);

// ========== 第四部分：sitemap 好物页完整性检查 ==========
const sitemapXml = await read("sitemap.xml");
for (const relativePath of goodsFiles) {
  if (!sitemapXml.includes(relativePath)) problems.push(`sitemap.xml：缺少好物文章页 ${relativePath}`);
}

// ========== 第五部分：结果输出 ==========
if (problems.length > 0) {
  console.error("正式发布预检未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("正式发布预检通过：公开旧口径、好物文章、延伸阅读、sitemap 和高风险表达均未发现阻塞问题。");
