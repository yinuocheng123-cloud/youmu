/*
文件说明：该文件用于检查静态站点公开链接与 sitemap。
功能说明：扫描公开 HTML 的 href 与 sitemap URL，确认没有空链接、断链、本地越界链接，并确认 30 个好物文章页纳入公网链接体系。

结构概览：
  第一部分：公共扫描工具
  第二部分：链接目标检查
  第三部分：sitemap 检查与好物页完整性检查
  第四部分：结果输出
*/

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const htmlEntries = ["index.html", "knowledge", "solutions", "vendors", "cooperation", "about", "articles", "cases", "forms"];
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

function extractHrefs(html) {
  return [...html.matchAll(/\shref\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2]);
}

function idsOf(html) {
  return new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]));
}

async function exists(absolutePath) {
  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

// ========== 第二部分：链接目标检查 ==========
const siteBaseUrl = "https://yinuocheng123-cloud.github.io/youmu/";
const htmlFiles = (await Promise.all(htmlEntries.map((entry) => collectFiles(entry, new Set([".html"]))))).flat().sort();
const htmlFileSet = new Set(htmlFiles);
let checkedLocalLinks = 0;

for (const relativePath of htmlFiles) {
  const absolutePath = path.join(projectRoot, relativePath);
  const html = await read(relativePath);
  const ownIds = idsOf(html);

  for (const href of extractHrefs(html)) {
    if (!href || href === "#" || href.toLowerCase() === "javascript:void(0)") {
      problems.push(`${relativePath}：存在空链接或无效链接 ${href || "(empty)"}`);
      continue;
    }
    if (/^(https?:|mailto:|tel:)/i.test(href)) continue;

    if (href.startsWith("#")) {
      checkedLocalLinks += 1;
      const id = decodeURIComponent(href.slice(1));
      if (!ownIds.has(id)) problems.push(`${relativePath}：当前页缺少锚点 ${href}`);
      continue;
    }

    const [filePart, hash = ""] = href.split("#");
    const target = path.resolve(path.dirname(absolutePath), decodeURIComponent(filePart));
    checkedLocalLinks += 1;

    if (!target.startsWith(projectRoot)) {
      problems.push(`${relativePath} -> ${href}：本地链接越出项目目录`);
      continue;
    }
    if (!(await exists(target))) {
      problems.push(`${relativePath} -> ${href}：目标文件不存在`);
      continue;
    }
    if (hash) {
      const targetHtml = await fs.readFile(target, "utf8");
      if (!idsOf(targetHtml).has(decodeURIComponent(hash))) problems.push(`${relativePath} -> ${href}：目标页缺少锚点 #${hash}`);
    }
  }
}

// ========== 第三部分：sitemap 检查与好物页完整性检查 ==========
const sitemapXml = await read("sitemap.xml");
const sitemapUrls = [...sitemapXml.matchAll(/<loc>(.*?)<\/loc>/gi)].map((match) => match[1].trim());
const sitemapPaths = new Set();
const forbiddenSitemapFragments = ["custom/", "screenshots/", ".github/", ".git/", "notes/", "client-review-package/", ".md"];

for (const url of sitemapUrls) {
  if (!url.startsWith(siteBaseUrl)) {
    problems.push(`sitemap.xml：URL 必须使用公网地址前缀 ${siteBaseUrl}，当前为 ${url}`);
    continue;
  }
  for (const fragment of forbiddenSitemapFragments) {
    if (url.includes(fragment)) problems.push(`sitemap.xml：不允许包含 ${fragment}，当前为 ${url}`);
  }
  const publicPath = url.slice(siteBaseUrl.length) || "index.html";
  sitemapPaths.add(publicPath);
  if (!htmlFileSet.has(publicPath)) problems.push(`sitemap.xml：指向不存在的公开 HTML ${publicPath}`);
}

for (const publicPath of htmlFileSet) {
  if (!sitemapPaths.has(publicPath)) problems.push(`sitemap.xml：缺少公开页面 ${publicPath}`);
}

const goodsFiles = htmlFiles.filter((file) => file.startsWith("solutions/goods/"));
if (goodsFiles.length !== 30) problems.push(`solutions/goods：公开好物文章页数量 ${goodsFiles.length}，应为 30 个`);

for (const publicPath of goodsFiles) {
  if (!sitemapPaths.has(publicPath)) problems.push(`sitemap.xml：缺少好物文章页 ${publicPath}`);
}

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("全站链接检查未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`全站链接检查通过：检查 ${htmlFiles.length} 个 HTML、${checkedLocalLinks} 个本地链接、${sitemapUrls.length} 个 sitemap URL。`);
