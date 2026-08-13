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

// v1.30兼容入口：使用新的品牌架构与SEO保护检查。
await import("./check-v130-release-readiness.mjs");
process.exit(0);
import { assetFiles, publicDirectoryRules } from "./production-package-config.mjs";

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
      if (relativePath === "vendors/index.html" && term === "待补" && (line.includes("资料待补充") || line.includes("待补充案例"))) {
        continue;
      }
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
const scriptJs = await read("script.js");
const vendorsIndex = await read("vendors/index.html");
const homeIndex = await read("index.html");
const aboutIndex = await read("about/index.html");
const stylesCss = await read("styles.css");
const homeFooter = homeIndex.match(/<footer class="site-footer"[\s\S]*?<\/footer>/i)?.[0] ?? "";
const footerRequiredLinks = ["柚木知识", "柚木好物", "查看推荐厂商", "社群交流", "空间阅读参考", "企业合作"];
if (!homeFooter) problems.push("index.html：首页缺少 site-footer 页脚");
for (const linkText of footerRequiredLinks) {
  if (!homeFooter.includes(`>${linkText}</a>`)) problems.push(`index.html：首页 Footer 缺少底部导航链接 ${linkText}`);
}
if (homeFooter.includes('class="footer-link-group"')) {
  problems.push("index.html：首页 Footer 不应再使用分组纵排链接，避免中文词组断行");
}
if (!homeFooter.includes('class="footer-qr"') || !homeFooter.includes("关注公众号")) {
  problems.push("index.html：首页 Footer 缺少居中的公众号二维码入口");
}
if (!stylesCss.includes("V1.22.5：首页 Footer 横向紧凑布局修复")) {
  problems.push("styles.css：缺少 V1.22.5 Footer 横向紧凑布局修复样式记录");
}
if (!/\.footer-link-groups\s*\{[\s\S]*?display:\s*flex;[\s\S]*?flex-wrap:\s*wrap;/.test(stylesCss)) {
  problems.push("styles.css：Footer 导航必须使用横向 flex 并允许整词换行");
}
if (!/\.footer-link-groups a\s*\{[\s\S]*?white-space:\s*nowrap;[\s\S]*?word-break:\s*keep-all;/.test(stylesCss)) {
  problems.push("styles.css：Footer 导航链接必须保持词组完整，不允许逐字断行");
}
if (!/\.footer-inner\s*\{[\s\S]*?grid-template-columns:[\s\S]*?minmax\([\s\S]*?minmax\([\s\S]*?minmax\([\s\S]*?minmax\(/.test(stylesCss)) {
  problems.push("styles.css：Footer 桌面端必须保留四区横向布局");
}
if (!/\.footer-qr\s*\{[\s\S]*?justify-self:\s*end;[\s\S]*?text-align:\s*center;/.test(stylesCss)) {
  problems.push("styles.css：Footer 二维码入口必须在最右卡位内居中对齐");
}

const vendorForbiddenTerms = [
  "官方认证",
  "平台认证",
  "交易担保",
  "严选入驻",
  "官方推荐",
  "分类黄页",
  "柚木地板厂商分类",
  "柚木家具厂商分类",
  "柚木整装厂商分类",
  "品牌推荐",
  "厂商分类",
  "认证厂商",
  "优选厂商分组",
  "源头工厂",
  "供应链",
  "品牌商",
  "空间服务",
  "材料供应",
  "案例资料",
];
for (const term of vendorForbiddenTerms) {
  if (vendorsIndex.includes(term)) problems.push(`vendors/index.html：推荐厂商页出现不允许的分类或背书表达“${term}”`);
}

const communityScope = homeIndex.match(/<section class="section wechat-section"[\s\S]*?<\/section>/i)?.[0] ?? "";
const communityForbiddenTerms = ["企业资料入口", "广告群", "马上推销", "官方认证", "平台认证", "交易担保", "成交担保", "保证推荐", "严选入驻", "官方推荐", "最低价", "工厂直供承诺"];
for (const term of communityForbiddenTerms) {
  if (communityScope.includes(term)) problems.push(`index.html#wechat：咨询入口出现不允许的内部或风险表达“${term}”`);
}
for (const term of ["看柚木", "先问清楚再决定", "扫码，先问一个柚木问题", "长按识别二维码", "买柚木前，先问清楚", "进社群和同好交流", "柚木地板", "柚木整装", "推荐厂商"]) {
  if (!communityScope.includes(term)) problems.push(`index.html#wechat：咨询入口缺少客户化表达“${term}”`);
}

for (const className of ["vendor-filter", "vendor-filter-chip", "vendor-grid", "vendor-card", "vendor-tags", "vendor-tag", "vendor-meta", "vendor-status"]) {
  if (!vendorsIndex.includes(className)) problems.push(`vendors/index.html：缺少推荐厂商会员资料库结构类名 ${className}`);
}

const allowedVendorFilterTags = ["全部", "柚木地板", "柚木家具", "柚木整装", "柚木户外", "柚木收藏", "柚木文创"];
const vendorFilterBlock = vendorsIndex.match(/<div class="vendor-filter"[\s\S]*?<\/div>/i)?.[0] ?? "";
const vendorFilterTags = [...vendorFilterBlock.matchAll(/data-vendor-filter="([^"]+)"/g)].map((match) => match[1]);
for (const tag of allowedVendorFilterTags) {
  if (!vendorsIndex.includes(`data-vendor-filter="${tag}"`)) problems.push(`vendors/index.html：内部标签筛选缺少 ${tag}`);
}
for (const tag of vendorFilterTags) {
  if (!allowedVendorFilterTags.includes(tag)) problems.push(`vendors/index.html：内部标签筛选出现不允许的企业属性标签 ${tag}`);
}
if (vendorFilterTags.length !== allowedVendorFilterTags.length) {
  problems.push(`vendors/index.html：内部标签筛选数量为 ${vendorFilterTags.length}，应为 ${allowedVendorFilterTags.length}`);
}

const vendorCards = [...vendorsIndex.matchAll(/<article class="vendor-card" data-tags="([^"]+)">([\s\S]*?)<\/article>/g)];
if (vendorCards.length < 6) problems.push(`vendors/index.html：企业卡片数量 ${vendorCards.length}，少于 6 个`);
for (const [index, cardMatch] of vendorCards.entries()) {
  const tags = cardMatch[1].trim().split(/\s+/).filter(Boolean);
  const cardHtml = cardMatch[2];
  if (tags.length < 1) problems.push(`vendors/index.html：第 ${index + 1} 张企业卡片至少需要 1 个应用方向标签`);
  for (const tag of tags) {
    if (!allowedVendorFilterTags.includes(tag)) problems.push(`vendors/index.html：第 ${index + 1} 张企业卡片 data-tags 出现不允许的标签 ${tag}`);
  }
  for (const required of ["主营方向", "所在区域", "企业类型", "查看资料"]) {
    if (!cardHtml.includes(required)) problems.push(`vendors/index.html：第 ${index + 1} 张企业卡片缺少字段 ${required}`);
  }
  if (!cardHtml.includes('class="vendor-status"')) {
    problems.push(`vendors/index.html：第 ${index + 1} 张企业卡片缺少选择与核实提示`);
  }
  if (!cardHtml.includes('class="vendor-tags"') || !cardHtml.includes('class="vendor-tag"')) {
    problems.push(`vendors/index.html：第 ${index + 1} 张企业卡片缺少可见主题标签`);
  }
  const visibleTags = [...cardHtml.matchAll(/class="vendor-tag">([^<]+)<\/span>/g)].map((match) => match[1]);
  for (const tag of visibleTags) {
    if (!allowedVendorFilterTags.includes(tag)) problems.push(`vendors/index.html：第 ${index + 1} 张企业卡片出现不允许的可见标签 ${tag}`);
  }
}

for (const forbiddenPath of ["vendors/flooring.html", "vendors/furniture.html", "vendors/whole-decoration.html"]) {
  for (const relativePath of publicFiles) {
    const text = await read(relativePath);
    if (text.includes(forbiddenPath)) problems.push(`${relativePath}：不得新增或引用厂商分类 URL ${forbiddenPath}`);
  }
}

for (const category of ["柚木家具", "柚木地板", "柚木整装", "柚木户外", "柚木收藏", "柚木文创"]) {
  if (!solutionsIndex.includes(category)) problems.push(`solutions/index.html：缺少六类新体系分类 ${category}`);
}

for (const id of ["good-furniture", "good-flooring", "good-whole-decoration", "good-outdoor", "good-collection", "good-cultural"]) {
  if (!solutionsIndex.includes(`id="${id}"`)) problems.push(`solutions/index.html：缺少六类分区锚点 ${id}`);
}

// V1.22.4：全站 Header 顶部缝隙与 hash 锚点直达检查。
if (!aboutIndex.includes('id="teak-culture"')) {
  problems.push("about/index.html：缺少 #teak-culture 锚点");
}
if (!stylesCss.includes("V1.22.4：全站 Header 顶部缝隙与锚点直达修复")) {
  problems.push("styles.css：缺少 V1.22.4 Header 顶部缝隙修复样式记录");
}
if (!/scroll-padding-top\s*:\s*1(?:2[0-9]|3[0-9]|4[0-9])px/.test(stylesCss)) {
  problems.push("styles.css：缺少足够的全站 scroll-padding-top 锚点偏移");
}
if (!/scroll-margin-top\s*:\s*1(?:2[0-9]|3[0-9]|4[0-9])px/.test(stylesCss)) {
  problems.push("styles.css：缺少足够的全站 scroll-margin-top 锚点偏移");
}
if (!/body::before\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?z-index:\s*999;[\s\S]*?pointer-events:\s*none;/.test(stylesCss)) {
  problems.push("styles.css：缺少覆盖 Header 上方内容透出的固定顶部遮罩");
}
if (!/\.site-header\s*\{[\s\S]*?top:\s*0;[\s\S]*?z-index:\s*1000;/.test(stylesCss)) {
  problems.push("styles.css：site-header 缺少 top: 0 与足够层级");
}
if (!/\.site-header::before\s*\{[\s\S]*?top:\s*0;/.test(stylesCss)) {
  problems.push("styles.css：site-header 背景承接层缺少 top: 0");
}

const goodsSectionRequirements = [
  { id: "good-furniture", label: "柚木家具", href: "#good-furniture", moreHref: "#good-furniture-more", summary: "从茶桌、餐桌、书柜到收纳柜" },
  { id: "good-flooring", label: "柚木地板", href: "#good-flooring", moreHref: "#good-flooring-more", summary: "从住宅地板到露台平台" },
  { id: "good-whole-decoration", label: "柚木整装", href: "#good-whole-decoration", moreHref: "#good-whole-decoration-more", summary: "从护墙板、柜体、木门到茶室空间" },
  { id: "good-outdoor", label: "柚木户外", href: "#good-outdoor", moreHref: "#good-outdoor-more", summary: "从庭院桌椅到户外平台" },
  { id: "good-collection", label: "柚木收藏", href: "#good-collection", moreHref: "#good-collection-more", summary: "从老门板、老窗到船木桌面" },
  { id: "good-cultural", label: "柚木文创", href: "#good-cultural", moreHref: "#good-cultural-more", summary: "从托盘、书签到台灯底座" },
];

const noteCardCount = (solutionsIndex.match(/class="good-category-note-card"/g) || []).length;
if (noteCardCount !== 6) problems.push(`solutions/index.html：good-category-note-card 数量为 ${noteCardCount}，应为 6`);
const noteMoreCount = (solutionsIndex.match(/class="good-note-more"/g) || []).length;
if (noteMoreCount !== 6) problems.push(`solutions/index.html：good-note-more 数量为 ${noteMoreCount}，应为 6`);

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

  const sectionHtml = sectionMatch[0];
  const noteCardIndex = sectionHtml.indexOf('class="good-category-note-card"');
  const gridIndex = sectionHtml.indexOf('class="goods-archive-list-grid"');
  const lastArticleIndex = sectionHtml.lastIndexOf("goods-archive-list-card");
  const moreIndex = sectionHtml.indexOf('class="good-section-more"');

  if (noteCardIndex < 0) {
    problems.push(`solutions/index.html：${section.label} 分区缺少 good-category-note-card`);
  }
  if (!sectionHtml.includes(`<h3>${section.label}</h3>`) || !sectionHtml.includes(section.summary)) {
    problems.push(`solutions/index.html：${section.label} 分区说明卡标题或说明文案不正确`);
  }
  if (!sectionHtml.includes(`class="good-note-more" href="${section.moreHref}"`)) {
    problems.push(`solutions/index.html：${section.label} 说明卡缺少指向 ${section.moreHref} 的更多内容按钮`);
  }
  if (!sectionHtml.includes(`id="${section.moreHref.slice(1)}"`)) {
    problems.push(`solutions/index.html：${section.label} 分区缺少更多内容锚点 ${section.moreHref}`);
  }
  if (!(gridIndex >= 0 && lastArticleIndex >= 0 && moreIndex >= 0 && gridIndex < lastArticleIndex && lastArticleIndex < noteCardIndex && noteCardIndex < moreIndex)) {
    problems.push(`solutions/index.html：${section.label} 说明卡必须位于文章卡片 grid 内最后一个卡位，且在“更多内容”之前`);
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
  "good-category-note-card",
  "good-section-summary",
  "good-note-more",
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

// ========== 第五部分：正式域名、SEO 与 404 生产配置检查 ==========
const productionOrigin = "https://www.zhengmu.cn";
const retiredPreviewOrigin = "https://yinuocheng123-cloud.github.io/youmu";
const robotsTxt = await read("robots.txt");
const notFoundHtml = await read("404.html");
const pagesWorkflow = await read(".github/workflows/pages.yml");
const indexableHtmlFiles = publicFiles.filter((relativePath) => relativePath.endsWith(".html")).sort();
const canonicalUrls = [];
const pageTitles = [];

if (indexableHtmlFiles.length !== 126) {
  problems.push(`公开可索引 HTML 数量为 ${indexableHtmlFiles.length}，应为 126 个`);
}

for (const relativePath of [...publicFiles, "404.html", "robots.txt", "sitemap.xml"]) {
  const text = await read(relativePath);
  if (text.includes(retiredPreviewOrigin)) problems.push(`${relativePath}：仍包含旧 GitHub Pages 生产地址`);
}

for (const relativePath of indexableHtmlFiles) {
  const html = await read(relativePath);
  const canonicalMatches = [...html.matchAll(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']\s*\/?\s*>/gi)];
  const expectedUrl = relativePath === "index.html" ? `${productionOrigin}/` : `${productionOrigin}/${relativePath}`;
  const titleMatches = [...html.matchAll(/<title>([\s\S]*?)<\/title>/gi)];
  const descriptionMatches = [...html.matchAll(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']\s*\/?\s*>/gi)];
  const ogTypeMatches = [...html.matchAll(/<meta\s+property=["']og:type["']\s+content=["']([^"']+)["']\s*\/?\s*>/gi)];
  const ogTitleMatches = [...html.matchAll(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']\s*\/?\s*>/gi)];
  const ogDescriptionMatches = [...html.matchAll(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']\s*\/?\s*>/gi)];
  const ogUrlMatches = [...html.matchAll(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']\s*\/?\s*>/gi)];
  const ogImageMatches = [...html.matchAll(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']\s*\/?\s*>/gi)];
  const ogSiteNameMatches = [...html.matchAll(/<meta\s+property=["']og:site_name["']\s+content=["']([^"']+)["']\s*\/?\s*>/gi)];
  const ogLocaleMatches = [...html.matchAll(/<meta\s+property=["']og:locale["']\s+content=["']([^"']+)["']\s*\/?\s*>/gi)];

  if (titleMatches.length !== 1 || !titleMatches[0][1].trim()) {
    problems.push(`${relativePath}：title 数量或内容不正确`);
  } else {
    const title = titleMatches[0][1].trim();
    pageTitles.push({ relativePath, title });
    if ([...title].length < 8 || [...title].length > 65) problems.push(`${relativePath}：title 长度不适合搜索结果展示`);
  }
  if (descriptionMatches.length !== 1) {
    problems.push(`${relativePath}：description 数量为 ${descriptionMatches.length}，应为 1`);
  } else if ([...descriptionMatches[0][1].trim()].length < 15 || [...descriptionMatches[0][1].trim()].length > 160) {
    problems.push(`${relativePath}：description 长度不适合搜索结果展示`);
  }
  if (ogTypeMatches.length !== 1 || !/^(website|article)$/.test(ogTypeMatches[0]?.[1] ?? "")) {
    problems.push(`${relativePath}：og:type 缺失或类型不正确`);
  }
  if (ogTitleMatches.length !== 1) problems.push(`${relativePath}：og:title 数量为 ${ogTitleMatches.length}，应为 1`);
  if (ogDescriptionMatches.length !== 1) problems.push(`${relativePath}：og:description 数量为 ${ogDescriptionMatches.length}，应为 1`);
  if (titleMatches.length === 1 && ogTitleMatches.length === 1 && ogTitleMatches[0][1] !== titleMatches[0][1].trim()) {
    problems.push(`${relativePath}：og:title 与 title 不一致`);
  }
  if (descriptionMatches.length === 1 && ogDescriptionMatches.length === 1 && ogDescriptionMatches[0][1] !== descriptionMatches[0][1]) {
    problems.push(`${relativePath}：og:description 与 description 不一致`);
  }
  if (ogUrlMatches.length !== 1 || ogUrlMatches[0]?.[1] !== expectedUrl) {
    problems.push(`${relativePath}：og:url 应为 ${expectedUrl}`);
  }
  if (ogImageMatches.length !== 1 || !ogImageMatches[0]?.[1].startsWith(`${productionOrigin}/assets/`)) {
    problems.push(`${relativePath}：og:image 缺失或未使用正式域名资源`);
  }
  if (ogSiteNameMatches.length !== 1 || ogSiteNameMatches[0]?.[1] !== "柚喜饰界") {
    problems.push(`${relativePath}：og:site_name 缺失或不正确`);
  }
  if (ogLocaleMatches.length !== 1 || ogLocaleMatches[0]?.[1] !== "zh_CN") {
    problems.push(`${relativePath}：og:locale 缺失或不正确`);
  }

  if (canonicalMatches.length !== 1) {
    problems.push(`${relativePath}：canonical 数量为 ${canonicalMatches.length}，应为 1`);
    continue;
  }

  const canonicalUrl = canonicalMatches[0][1];
  canonicalUrls.push(canonicalUrl);
  if (canonicalUrl !== expectedUrl) {
    problems.push(`${relativePath}：canonical 应为 ${expectedUrl}，当前为 ${canonicalUrl}`);
  }
}

const pageTitlesByValue = new Map();
for (const pageTitle of pageTitles) {
  const group = pageTitlesByValue.get(pageTitle.title) ?? [];
  group.push(pageTitle);
  pageTitlesByValue.set(pageTitle.title, group);
}
for (const group of pageTitlesByValue.values()) {
  if (group.length > 1) problems.push(`公开页面：存在重复 title「${group[0].title}」：${group.map(({ relativePath }) => relativePath).join("、")}`);
}

if (!robotsTxt.includes("User-agent: *") || !robotsTxt.includes("Allow: /")) {
  problems.push("robots.txt：未启用正式上线抓取策略");
}
if (/^\s*Disallow:\s*\/\s*$/im.test(robotsTxt)) {
  problems.push("robots.txt：仍禁止全站抓取");
}
if (!robotsTxt.includes(`Sitemap: ${productionOrigin}/sitemap.xml`)) {
  problems.push("robots.txt：Sitemap 地址未指向正式域名");
}

const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const sitemapLastmods = [...sitemapXml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1]);
if (sitemapUrls.length !== 126) problems.push(`sitemap.xml：URL 数量为 ${sitemapUrls.length}，应为 126`);
if (sitemapLastmods.length !== 126) problems.push(`sitemap.xml：lastmod 数量为 ${sitemapLastmods.length}，应为 126`);
if (sitemapLastmods.some((date) => !/^\d{4}-\d{2}-\d{2}$/.test(date))) {
  problems.push("sitemap.xml：存在格式错误的 lastmod");
}
for (const url of sitemapUrls) {
  if (!url.startsWith(`${productionOrigin}/`)) problems.push(`sitemap.xml：存在非正式域名 URL ${url}`);
}
if (new Set(sitemapUrls).size !== sitemapUrls.length) problems.push("sitemap.xml：存在重复 URL");
if (new Set(canonicalUrls).size !== canonicalUrls.length) problems.push("公开页面：存在重复 canonical URL");
for (const canonicalUrl of canonicalUrls) {
  if (!sitemapUrls.includes(canonicalUrl)) problems.push(`sitemap.xml：缺少 canonical URL ${canonicalUrl}`);
}

if (!/<meta\s+name=["']robots["']\s+content=["']noindex,\s*nofollow["']\s*\/?\s*>/i.test(notFoundHtml)) {
  problems.push("404.html：缺少 noindex, nofollow");
}
for (const requiredPath of [
  "/assets/favicon.svg",
  "/assets/images/hero-teak-lifestyle.jpg",
  "/assets/logo-yuxi-horizontal.svg",
  "/script.js",
  'href="/"',
]) {
  if (!notFoundHtml.includes(requiredPath)) problems.push(`404.html：缺少生产根路径 ${requiredPath}`);
}
if (notFoundHtml.includes("./assets/") || notFoundHtml.includes("./index.html") || notFoundHtml.includes("./script.js")) {
  problems.push("404.html：仍包含深层错误 URL 下不安全的相对资源路径");
}
if (/rel=["']canonical["']/i.test(notFoundHtml)) problems.push("404.html：不应设置 canonical");
if (!/<title>[^<]+<\/title>/i.test(notFoundHtml)) problems.push("404.html：缺少有效 title");
if (!homeIndex.includes(`<meta property="og:url" content="${productionOrigin}/"`)) {
  problems.push("index.html：og:url 未指向正式首页");
}
if (!homeIndex.includes(`<meta property="og:image" content="${productionOrigin}/assets/images/hero-teak-lifestyle.jpg"`)) {
  problems.push("index.html：og:image 未指向正式绝对地址");
}

if (/cp\s+-R\s+assets\b/.test(pagesWorkflow)) {
  problems.push("GitHub Pages workflow：仍会复制整个 assets 目录，可能公开开发说明和未使用素材");
}
for (const directory of publicDirectoryRules.keys()) {
  if (!new RegExp(`\\b${directory}\\b`).test(pagesWorkflow)) {
    problems.push(`GitHub Pages workflow：缺少公开目录 ${directory}`);
  }
}
for (const assetFile of assetFiles) {
  if (!pagesWorkflow.includes(assetFile)) problems.push(`GitHub Pages workflow：缺少生产资源 ${assetFile}`);
}

// ========== 第六部分：结果输出 ==========
// V1.23.0-rc.1: image stability and brand UI safeguards.
const performanceHtmlFiles = [...indexableHtmlFiles, "404.html"];
let imageTagCount = 0;
let lazyImageCount = 0;
let priorityImageCount = 0;

for (const relativePath of performanceHtmlFiles) {
  const html = await read(relativePath);
  const imageTags = [...html.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  imageTagCount += imageTags.length;

  for (const imageTag of imageTags) {
    if (!/\swidth=["']\d+["']/i.test(imageTag) || !/\sheight=["']\d+["']/i.test(imageTag)) {
      problems.push(`${relativePath}: image is missing intrinsic width/height: ${imageTag}`);
    }
    if (!/\sdecoding=["']async["']/i.test(imageTag)) {
      problems.push(`${relativePath}: image is missing decoding="async": ${imageTag}`);
    }

    const isHeroImage = /\bhero-image\b/i.test(imageTag);
    const isHeaderBrand = /\bbrand-mark-image\b/i.test(imageTag);
    const isCritical404Logo = relativePath === "404.html";
    const isLazy = /\sloading=["']lazy["']/i.test(imageTag);
    const isPriority = /\sfetchpriority=["']high["']/i.test(imageTag);

    if (isLazy) lazyImageCount += 1;
    if (isPriority) priorityImageCount += 1;
    if (isHeroImage && (!isPriority || isLazy)) {
      problems.push(`${relativePath}: hero image must be high priority and must not be lazy loaded`);
    }
    if (!isHeroImage && !isHeaderBrand && !isCritical404Logo && !isLazy) {
      problems.push(`${relativePath}: non-critical content image must use loading="lazy": ${imageTag}`);
    }
  }
}

if (imageTagCount === 0) problems.push("public HTML: no image tags found during performance validation");
if (lazyImageCount === 0) problems.push("public HTML: no lazy-loaded content images found");
if (priorityImageCount !== 1) problems.push(`public HTML: expected exactly one high-priority image, found ${priorityImageCount}`);
if (!stylesCss.includes("V1.23.0-rc.1：高端木作品牌 UI 体验冲刺")) {
  problems.push("styles.css: missing V1.23.0-rc.1 brand UI layer");
}
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(stylesCss)) {
  problems.push("styles.css: missing reduced-motion safeguards");
}

if (problems.length > 0) {
  console.error("正式发布预检未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("正式发布预检通过：公开内容、正式域名、canonical、robots、sitemap、404 和高风险表达均未发现阻塞问题。");
