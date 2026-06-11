/*
文件说明：该文件用于检查全站导航与柚木好物六类下拉的一致性。
功能说明：扫描公开 HTML 的 Header，确认桌面端和移动端好物下拉都使用六类新体系，并拦截旧二级名回潮。

结构概览：
  第一部分：公共扫描工具
  第二部分：Header 与下拉菜单检查
  第三部分：结果输出
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


// ========== 第二部分：Header 与下拉菜单检查 ==========
const htmlFiles = (await Promise.all(htmlEntries.map((entry) => collectFiles(entry, new Set([".html"]))))).flat().sort();

for (const relativePath of htmlFiles) {
  const html = await read(relativePath);
  const header = extractHeader(html);

  if (!header) {
    problems.push(`${relativePath}：缺少 Header`);
    continue;
  }

  for (const label of ["首页", "认识柚喜", "柚木知识", "柚木好物", "推荐厂商", "社群交流"]) {
    if (!stripTags(header).includes(label)) problems.push(`${relativePath}：Header 缺少主导航文案 ${label}`);
  }

  checkGoodThingsMenu(relativePath, header);
}

// ========== 第三部分：结果输出 ==========
if (problems.length > 0) {
  console.error("全站导航一致性检查未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("全站导航一致性检查通过：柚木好物下拉已统一为六类新体系。");
