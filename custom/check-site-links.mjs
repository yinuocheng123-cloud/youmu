/*
文件说明：该文件用于检查“柚喜饰界”静态网站的全站公开链接与 sitemap。
功能说明：扫描公开 HTML 的 href、本地相对链接和 sitemap URL，确认没有空链接、坏链接、错误路径或公开暴露风险。

结构概览：
  第一部分：导入依赖与基础配置
  第二部分：公开 HTML 与 sitemap 读取
  第三部分：HTML href 链接规则检查
  第四部分：sitemap 规则检查
  第五部分：结果输出
*/

// ========== 第一部分：导入依赖与基础配置 ==========
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const sitemapPath = path.join(projectRoot, "sitemap.xml");
const siteBaseUrl = "https://yinuocheng123-cloud.github.io/youmu/";

const publicHtmlEntries = [
  "index.html",
  "knowledge",
  "solutions",
  "vendors",
  "cases",
  "articles",
  "forms",
  "about",
];

const externalProtocolPattern = /^(https?:|mailto:|tel:)/i;
const forbiddenSitemapFragments = [
  "custom/",
  "screenshots/",
  "screenshot",
  ".github/",
  ".git/",
  "notes/",
  "client-review-package/",
  "client-preview",
  "launch-checklist",
  "content-source-log",
  ".md",
  "C:/",
  "D:/",
  "file:",
];

const problems = [];
let checkedLocalLinks = 0;

// ========== 第二部分：公开 HTML 与 sitemap 读取 ==========
async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function collectHtmlFiles(entry) {
  const absoluteEntry = path.join(projectRoot, entry);
  const stat = await fs.stat(absoluteEntry);

  if (stat.isFile()) {
    return absoluteEntry.endsWith(".html") ? [absoluteEntry] : [];
  }

  const files = [];
  const children = await fs.readdir(absoluteEntry, { withFileTypes: true });

  for (const child of children) {
    const childPath = path.join(absoluteEntry, child.name);

    if (child.isDirectory()) {
      files.push(...(await collectHtmlFiles(path.relative(projectRoot, childPath))));
      continue;
    }

    if (child.isFile() && child.name.endsWith(".html")) {
      files.push(childPath);
    }
  }

  return files;
}

function normalizeRelativePath(filePath) {
  return path.relative(projectRoot, filePath).replaceAll(path.sep, "/");
}

const htmlFiles = (await Promise.all(publicHtmlEntries.map(collectHtmlFiles))).flat().sort();
const htmlFileSet = new Set(htmlFiles.map(normalizeRelativePath));
const sitemapXml = await fs.readFile(sitemapPath, "utf8");

// ========== 第三部分：HTML href 链接规则检查 ==========
function extractHrefs(html) {
  return [...html.matchAll(/\shref\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2]);
}

function splitHref(href) {
  const [withoutHash, hashPart = ""] = href.split("#");
  return {
    filePart: withoutHash,
    anchorId: hashPart ? decodeURIComponent(hashPart) : "",
  };
}

function isUnsafeLocalTarget(targetPath) {
  const relative = normalizeRelativePath(targetPath);
  return relative.startsWith("..") || path.isAbsolute(relative);
}

function extractIds(html) {
  return new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]));
}

async function checkTargetAnchor(sourceLabel, href, targetPath, anchorId) {
  if (!anchorId) {
    return;
  }

  const targetHtml = await fs.readFile(targetPath, "utf8");
  const targetIds = extractIds(targetHtml);

  if (!targetIds.has(anchorId)) {
    problems.push(`${sourceLabel} -> ${href}：目标页面缺少锚点 #${anchorId}`);
  }
}

async function checkLocalHref(sourceFile, href, sourceHtml) {
  const sourceLabel = normalizeRelativePath(sourceFile);

  if (href.trim() !== href) {
    problems.push(`${sourceLabel} -> ${href}：链接前后不应包含空白字符`);
  }

  if (href === "" || href === "#" || href.toLowerCase() === "javascript:void(0)") {
    problems.push(`${sourceLabel} -> ${href || "(empty)"}：不允许空链接或最终 href=\"#\"`);
    return;
  }

  if (href.startsWith("#")) {
    const sourceIds = extractIds(sourceHtml);
    const anchorId = decodeURIComponent(href.slice(1));
    checkedLocalLinks += 1;

    if (!sourceIds.has(anchorId)) {
      problems.push(`${sourceLabel} -> ${href}：当前页面缺少锚点 #${anchorId}`);
    }

    return;
  }

  if (externalProtocolPattern.test(href)) {
    return;
  }

  const { filePart, anchorId } = splitHref(href);

  if (!filePart) {
    problems.push(`${sourceLabel} -> ${href}：带锚点链接缺少目标文件`);
    return;
  }

  const targetPath = path.resolve(path.dirname(sourceFile), decodeURIComponent(filePart));
  checkedLocalLinks += 1;

  if (isUnsafeLocalTarget(targetPath)) {
    problems.push(`${sourceLabel} -> ${href}：本地链接越出公开项目目录`);
    return;
  }

  if (!(await pathExists(targetPath))) {
    problems.push(`${sourceLabel} -> ${href}：本地目标不存在`);
    return;
  }

  await checkTargetAnchor(sourceLabel, href, targetPath, anchorId);
}

for (const htmlFile of htmlFiles) {
  const html = await fs.readFile(htmlFile, "utf8");
  const hrefs = extractHrefs(html);

  for (const href of hrefs) {
    await checkLocalHref(htmlFile, href, html);
  }
}

// ========== 第四部分：sitemap 规则检查 ==========
function extractSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/gi)].map((match) => match[1].trim());
}

function sitemapUrlToPublicPath(url) {
  if (!url.startsWith(siteBaseUrl)) {
    return null;
  }

  const relativeUrl = url.slice(siteBaseUrl.length);
  return relativeUrl === "" ? "index.html" : decodeURIComponent(relativeUrl);
}

const sitemapUrls = extractSitemapUrls(sitemapXml);
const sitemapPaths = new Set();

for (const url of sitemapUrls) {
  if (!url.startsWith(siteBaseUrl)) {
    problems.push(`sitemap.xml -> ${url}：URL 必须使用 ${siteBaseUrl}`);
    continue;
  }

  for (const fragment of forbiddenSitemapFragments) {
    if (url.includes(fragment)) {
      problems.push(`sitemap.xml -> ${url}：sitemap 不允许包含 ${fragment}`);
    }
  }

  const publicPath = sitemapUrlToPublicPath(url);

  if (!publicPath) {
    continue;
  }

  sitemapPaths.add(publicPath);

  if (!htmlFileSet.has(publicPath)) {
    problems.push(`sitemap.xml -> ${url}：sitemap 指向的公开 HTML 文件不存在`);
  }
}

for (const publicPath of htmlFileSet) {
  if (!sitemapPaths.has(publicPath)) {
    problems.push(`sitemap.xml：缺少公开页面 ${publicPath}`);
  }
}

// ========== 第五部分：结果输出 ==========
if (problems.length > 0) {
  console.error("全站链接检查未通过：");

  for (const problem of problems) {
    console.error(`- ${problem}`);
  }

  process.exit(1);
}

console.log(`全站链接检查通过：检查 ${htmlFiles.length} 个 HTML 文件，${checkedLocalLinks} 个本地链接，sitemap ${sitemapUrls.length} 个 URL。`);
