/*
文件说明：该文件用于检查静态站点公开链接与 sitemap。
功能说明：扫描公开 HTML 的 href 与 sitemap URL，确认没有空链接、断链、本地越界链接，也确认 sitemap 不包含 custom 文档。

结构概览：
  第一部分：公共扫描工具
  第二部分：链接目标检查
  第三部分：sitemap 检查
  第四部分：结果输出
*/


import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const publicEntries = ["index.html", "data/site-content.js", "knowledge", "solutions", "vendors", "cooperation", "about", "articles", "cases", "forms"];
const htmlEntries = ["index.html", "knowledge", "solutions", "vendors", "cooperation", "about", "articles", "cases", "forms"];
const problems = [];

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
  return html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractHeader(html) {
  return html.match(/<header[\s\S]*?<\/header>/i)?.[0] ?? "";
}

function extractHrefs(html) {
  return [...html.matchAll(/\shref\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2]);
}

function depthOf(relativePath) {
  return relativePath.split("/").length - 1;
}

function prefixFor(relativePath) {
  const depth = depthOf(relativePath);
  return depth === 0 ? "./" : "../".repeat(depth);
}

function goodThingsHrefs(relativePath) {
  const base = `${prefixFor(relativePath)}solutions/index.html`;
  return [base, `${base}#good-furniture`, `${base}#good-flooring`, `${base}#good-whole-decoration`, `${base}#good-outdoor`, `${base}#good-collection`, `${base}#good-creative`];
}

function goodThingsLabels() {
  return ["柚木好物首页", "柚木家具", "柚木地板", "柚木整装", "柚木户外", "柚木收藏", "柚木文创"];
}

function forbiddenGoodThingsLabels() {
  return ["庭院户外", "茶室会客", "家具好物", "柚木茶室精选", "精选"];
}

function checkGoodThingsMenu(relativePath, header) {
  const desktop = header.match(/<button[^>]*aria-controls="solutions-menu-\d+"[^>]*>[\s\S]*?柚木好物[\s\S]*?<\/button>\s*<div class="nav-dropdown-menu" id="solutions-menu-\d+" data-dropdown-menu>([\s\S]*?)<\/div>/i)?.[1] ?? "";
  const mobile = header.match(/<details>\s*<summary>\s*柚木好物\s*<\/summary>([\s\S]*?)<\/details>/i)?.[1] ?? "";
  for (const [label, block] of [["桌面端", desktop], ["移动端", mobile]]) {
    if (!block) {
      problems.push(`${relativePath}：${label}缺少“柚木好物”下拉菜单`);
      continue;
    }
    const text = stripTags(block);
    const hrefs = extractHrefs(block);
    for (const item of goodThingsLabels()) {
      if (!text.includes(item)) problems.push(`${relativePath}：${label}“柚木好物”下拉缺少 ${item}`);
    }
    for (const item of forbiddenGoodThingsLabels()) {
      if (text.includes(item)) problems.push(`${relativePath}：${label}“柚木好物”下拉仍出现旧项 ${item}`);
    }
    for (const href of goodThingsHrefs(relativePath)) {
      if (!hrefs.includes(href)) problems.push(`${relativePath}：${label}“柚木好物”下拉缺少路径 ${href}`);
    }
  }
}


// ========== 第二部分：链接目标检查 ==========
const siteBaseUrl = "https://yinuocheng123-cloud.github.io/youmu/";
const htmlFiles = (await Promise.all(htmlEntries.map((entry) => collectFiles(entry, new Set([".html"]))))).flat().sort();
const htmlFileSet = new Set(htmlFiles);
let checkedLocalLinks = 0;

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

// ========== 第三部分：sitemap 检查 ==========
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

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("全站链接检查未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(`全站链接检查通过：检查 ${htmlFiles.length} 个 HTML、${checkedLocalLinks} 个本地链接、${sitemapUrls.length} 个 sitemap URL。`);
