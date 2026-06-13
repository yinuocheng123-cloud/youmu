/*
文件说明：该文件用于检查公开内容深度与好物文章完整性。
功能说明：确认知识与好物内容具备可阅读深度，并拦截好物文章模板词、交易化表达、资料模块重复和外部链接缺失。

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
const scriptJs = await read("script.js");
const solutionsIndexForbiddenTerms = [
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
  "查看更多",
  "档案",
  "来源类型",
  "观察重点",
];

for (const term of solutionsIndexForbiddenTerms) {
  if (solutionsIndex.includes(term)) problems.push(`solutions/index.html：仍包含好物首页旧模板词“${term}”`);
}

for (const category of ["柚木家具", "柚木地板", "柚木整装", "柚木户外", "柚木收藏", "柚木文创"]) {
  if (!solutionsIndex.includes(category)) problems.push(`solutions/index.html：缺少六类体系分类 ${category}`);
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

for (const requiredClass of ["good-category-panel", "is-active"]) {
  if (!solutionsIndex.includes(requiredClass)) problems.push(`solutions/index.html：缺少栏目切换类名 ${requiredClass}`);
}

const firstGoodPanelIndex = solutionsIndex.indexOf('class="good-things-section good-section good-category-panel');
const goodTabsIndex = solutionsIndex.indexOf('class="good-things-filter good-category-tabs"');
const goodTabsEndIndex = goodTabsIndex >= 0 ? solutionsIndex.indexOf("</nav>", goodTabsIndex) : -1;
const goodCategoryIntro =
  goodTabsEndIndex >= 0 && firstGoodPanelIndex >= 0
    ? solutionsIndex.slice(goodTabsEndIndex + "</nav>".length, firstGoodPanelIndex)
    : firstGoodPanelIndex >= 0
      ? solutionsIndex.slice(0, firstGoodPanelIndex)
      : solutionsIndex;
const forbiddenGoodCategoryIntroTerms = [
  "分类浏览",
  "选择一个方向",
  "good-category-card",
  "good-category-more",
  "更多内容",
  "柚木家具</",
  "柚木地板</",
  "柚木整装</",
  "柚木户外</",
  "柚木收藏</",
  "柚木文创</",
  "从茶桌、餐桌、书柜到收纳柜",
  "从住宅地板到露台平台",
  "从护墙板、柜体、木门到茶室空间",
  "从庭院桌椅到户外平台",
  "从老门板、老窗到船木桌面",
  "从托盘、书签到台灯底座",
];
for (const term of forbiddenGoodCategoryIntroTerms) {
  if (goodCategoryIntro.includes(term)) {
    problems.push(`solutions/index.html: good things top entry still contains duplicated category intro content before the category panels: ${term}`);
  }
}

if (scriptJs.includes("good-creative")) problems.push("script.js：仍包含旧文创锚点 good-creative");

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
  "查看档案",
  "浏览更多",
  "查看更多",
  "5 个档案入口",
  "本页整理的是",
  "不涉及具体品牌承诺",
  "具体产品仍需",
  "这些资料只作为阅读参考",
  "价格",
  "库存",
  "购买",
  "下单",
  "立即购买",
  "平台认证",
  "官方推荐",
  "交易担保",
  "交易承诺",
  "平台背书",
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
const forbiddenSectionTitles = ["导语", "为什么值得看", "材质与气质", "适合什么场景", "怎么看细节", "公开资料观察", "底部简短说明"];
const sourceIntros = [];

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
  const requiredParagraphs = representativeFiles.has(relativePath) ? 10 : 8;
  if (paragraphCount < requiredParagraphs) problems.push(`${relativePath}：正文段落数 ${paragraphCount}，少于 ${requiredParagraphs} 段`);

  const relatedCount = countMatches(related, /<a\b/g);
  if (relatedCount < 3) problems.push(`${relativePath}：站内关联链接 ${relatedCount} 个，少于 3 个`);
  if (related && !related.includes("你可能还会喜欢")) problems.push(`${relativePath}：关联阅读模块标题未统一为“你可能还会喜欢”`);
  if (related && !related.includes("继续阅读")) problems.push(`${relativePath}：关联阅读按钮文案未统一为“继续阅读”`);

  const sourceLinks = hrefsOf(sourceSection);
  const externalSourceLinks = sourceLinks.filter((href) => /^https?:\/\//i.test(href));
  if (!sourceSection) problems.push(`${relativePath}：缺少延伸阅读模块`);
  const expectedSourceTitle = "继续了解";
  const sourceTitlePattern = new RegExp(`<h2[^>]*>\\s*${expectedSourceTitle}\\s*<\\/h2>`, "i");
  if (sourceSection && !sourceTitlePattern.test(sourceSection)) problems.push(`${relativePath}：外部阅读模块标题应为“${expectedSourceTitle}”`);
  const sourceIntroPattern = new RegExp(`<h2[^>]*>\\s*${expectedSourceTitle}\\s*<\\/h2>\\s*<p>([\\s\\S]*?)<\\/p>`, "i");
  const sourceIntro = sourceSection.match(sourceIntroPattern)?.[1]?.trim() ?? "";
  if (!sourceIntro) problems.push(`${relativePath}：${expectedSourceTitle}缺少说明段落`);
  sourceIntros.push(sourceIntro);
  if (externalSourceLinks.length < 3) problems.push(`${relativePath}：延伸阅读外部链接 ${externalSourceLinks.length} 个，少于 3 个`);
  for (const href of sourceLinks) {
    if (!href.trim()) problems.push(`${relativePath}：延伸阅读存在空链接`);
    if (href.includes("custom/")) problems.push(`${relativePath}：延伸阅读不允许引用 custom 内部文件 ${href}`);
    if (/^[a-zA-Z]:[\\/]/.test(href)) problems.push(`${relativePath}：延伸阅读不允许引用本地绝对路径 ${href}`);
  }
}

if (new Set(sourceIntros).size < 20) problems.push(`solutions/goods：延伸阅读说明重复度过高，当前唯一说明 ${new Set(sourceIntros).size} 条`);

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("内容深度检查未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("内容深度检查通过：好物首页、30 个好物文章页、代表文章和延伸阅读模块均满足当前要求。");
