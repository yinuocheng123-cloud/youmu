import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const excludedDirectories = new Set([".git", "_site", "custom", "release"]);

async function collectHtml(directory = root) {
  const files = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectHtml(absolute)));
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(absolute);
  }
  return files.sort();
}

function relative(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function decode(text) {
  return text
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function strip(html) {
  return decode(html)
    .replace(/<!--[^]*?-->/g, " ")
    .replace(/<(script|style)\b[^]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function match(html, expression) {
  return strip(html.match(expression)?.[1] ?? "");
}

function mainHtml(html) {
  return html.match(/<main\b[^>]*>([^]*?)<\/main>/i)?.[1] ?? html;
}

function mainBlocks(html) {
  const main = mainHtml(html);
  return [...main.matchAll(/<(h1|h2|h3|p|li|figcaption)\b[^>]*>([^]*?)<\/\1>/gi)]
    .map((entry) => strip(entry[2]))
    .filter((text) => text.length >= 24);
}

function normalizedBlock(text) {
  return text
    .replace(/[“”‘’「」『』《》【】（）()，。！？：；、,.!?:;\s]/g, "")
    .toLowerCase();
}

function extractMeta(html, key, value) {
  return (
    html.match(new RegExp(`<meta\\s+[^>]*${key}=["']${value}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i"))?.[1] ??
    html.match(new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*${key}=["']${value}["'][^>]*>`, "i"))?.[1] ??
    ""
  ).trim();
}

const files = await collectHtml();
const pages = [];
const duplicateMap = new Map();
const aiTerms = [
  "这一页", "不是把", "而是把", "阅读建议", "从一个", "建立长期连接", "长期连接", "内容共建",
  "公开信息持续完善中", "从一个柚木问题开始", "产品方向", "综合方向", "联系入口", "生态赋能",
  "持续连接", "探索更多", "长期主义", "长期价值", "帮助用户建立判断", "形成价值闭环", "构建", "开启", "赋能",
];
const backendTerms = [
  "阅读建议", "怎样使用这些资料", "公开信息持续完善中", "资料待补充", "普通用户", "品牌 / 企业",
  "产品方向", "综合方向", "联系入口", "咨询入口", "内容路径", "探索路径", "入口沟通",
];
const occurrences = (text, term) => text.split(term).length - 1;

for (const file of files) {
  const html = await fs.readFile(file, "utf8");
  const pagePath = relative(file);
  const main = mainHtml(html);
  const visibleMain = strip(main);
  const title = match(html, /<title>([^]*?)<\/title>/i);
  const description = extractMeta(html, "name", "description");
  const canonical = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i)?.[1] ?? "";
  const h1Count = [...html.matchAll(/<h1\b/gi)].length;
  const ctaCount = [...main.matchAll(/<(a|button)\b[^>]*(?:class=["'][^"']*(?:btn|view-all|text-link)[^"']*["']|data-[^>]*cta)[^>]*>/gi)].length;
  const jsonLd = [...html.matchAll(/<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([^]*?)<\/script>/gi)];
  const jsonLdErrors = [];
  for (const block of jsonLd) {
    try { JSON.parse(block[1]); } catch (error) { jsonLdErrors.push(String(error.message)); }
  }
  const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const missingAlt = imageTags.filter((tag) => !/\salt=["'][^"']*["']/i.test(tag)).length;
  const missingDimensions = imageTags.filter((tag) => !/\swidth=["'][^"']+["']/i.test(tag) || !/\sheight=["'][^"']+["']/i.test(tag)).length;

  for (const block of mainBlocks(html)) {
    if (block.length < 38) continue;
    const key = normalizedBlock(block);
    if (!duplicateMap.has(key)) duplicateMap.set(key, { text: block, pages: new Set() });
    duplicateMap.get(key).pages.add(pagePath);
  }

  pages.push({
    path: pagePath,
    title,
    description,
    canonical,
    h1Count,
    mainTextCharacters: visibleMain.length,
    ctaCount,
    aiLikeMatches: aiTerms.reduce((total, term) => total + occurrences(visibleMain, term), 0),
    backendLikeMatches: backendTerms.reduce((total, term) => total + occurrences(visibleMain, term), 0),
    aiTermsMatched: aiTerms.filter((term) => occurrences(visibleMain, term) > 0),
    backendTermsMatched: backendTerms.filter((term) => occurrences(visibleMain, term) > 0),
    vendorPlaceholders: occurrences(visibleMain, "公开信息持续完善中") + occurrences(visibleMain, "资料待补充"),
    jsonLdBlocks: jsonLd.length,
    jsonLdErrors,
    imageCount: imageTags.length,
    missingAlt,
    missingDimensions,
  });
}

const duplicates = [...duplicateMap.values()]
  .map((entry) => ({ text: entry.text, pages: [...entry.pages].sort() }))
  .filter((entry) => entry.pages.length > 1)
  .sort((a, b) => b.pages.length - a.pages.length || b.text.length - a.text.length);

const groupDuplicates = (field) => {
  const groups = new Map();
  for (const page of pages) {
    if (!page[field]) continue;
    if (!groups.has(page[field])) groups.set(page[field], []);
    groups.get(page[field]).push(page.path);
  }
  return [...groups.entries()]
    .filter(([, group]) => group.length > 1)
    .map(([value, group]) => ({ value, pages: group }));
};

const sitemap = await fs.readFile(path.join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((entry) => entry[1].trim());
const normalizedSitemap = sitemapUrls.map((url) => url.replace(/\/index\.html$/i, "/"));
const duplicateHomepageUrls = sitemapUrls.filter((url) => ["https://www.zhengmu.cn/", "https://www.zhengmu.cn/index.html"].includes(url));

const summary = {
  htmlPageCount: pages.length,
  duplicateContentGroups: duplicates.length,
  duplicateContentExamples: duplicates.slice(0, 12),
  aiLikeCopyMatchCount: pages.reduce((total, page) => total + page.aiLikeMatches, 0),
  backendLikeCopyMatchCount: pages.reduce((total, page) => total + page.backendLikeMatches, 0),
  aiLikeCopyMatches: pages
    .filter((page) => page.aiLikeMatches)
    .map((page) => ({ path: page.path, terms: page.aiTermsMatched })),
  backendLikeCopyMatches: pages
    .filter((page) => page.backendLikeMatches)
    .map((page) => ({ path: page.path, terms: page.backendTermsMatched })),
  vendorPlaceholderCount: pages.reduce((total, page) => total + page.vendorPlaceholders, 0),
  missingTitleCount: pages.filter((page) => !page.title).length,
  missingDescriptionCount: pages.filter((page) => !page.description && page.path !== "404.html").length,
  duplicateTitleGroups: groupDuplicates("title").length,
  duplicateDescriptionGroups: groupDuplicates("description").length,
  invalidH1Count: pages.filter((page) => page.h1Count !== 1).length,
  missingCanonicalCount: pages.filter((page) => !page.canonical && page.path !== "404.html").length,
  jsonLdBlockCount: pages.reduce((total, page) => total + page.jsonLdBlocks, 0),
  jsonLdErrorCount: pages.reduce((total, page) => total + page.jsonLdErrors.length, 0),
  imageMissingAltCount: pages.reduce((total, page) => total + page.missingAlt, 0),
  imageMissingDimensionsCount: pages.reduce((total, page) => total + page.missingDimensions, 0),
  sitemapUrlCount: sitemapUrls.length,
  sitemapNormalizedDuplicateCount: normalizedSitemap.length - new Set(normalizedSitemap).size,
  duplicateHomepageUrls,
  keyPages: Object.fromEntries(
    ["index.html", "knowledge/index.html", "cases/index.html", "solutions/index.html", "vendors/index.html", "cooperation/index.html"]
      .map((pagePath) => [pagePath, pages.find((page) => page.path === pagePath)])
  ),
};

console.log(JSON.stringify(summary, null, 2));

if (process.argv.includes("--strict")) {
  const failures = [];
  if (summary.missingTitleCount) failures.push("missing-title");
  if (summary.missingDescriptionCount) failures.push("missing-description");
  if (summary.duplicateTitleGroups) failures.push("duplicate-title");
  if (summary.duplicateDescriptionGroups) failures.push("duplicate-description");
  if (summary.invalidH1Count) failures.push("invalid-h1");
  if (summary.missingCanonicalCount) failures.push("missing-canonical");
  if (summary.jsonLdErrorCount) failures.push("invalid-json-ld");
  if (summary.imageMissingAltCount) failures.push("missing-alt");
  if (summary.sitemapNormalizedDuplicateCount) failures.push("duplicate-sitemap-url");
  if (failures.length) {
    console.error(`v1.31 content/SEO check failed: ${failures.join(", ")}`);
    process.exitCode = 1;
  }
}
