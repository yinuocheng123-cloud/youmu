/*
文件说明：该文件用于检查公网发布前的旧口径与高风险表达。
功能说明：扫描公开 HTML 与数据源，拦截好物旧口径、内部审核话、交易化词汇和 V1.17 以前的旧表达回潮。

结构概览：
  第一部分：公共扫描工具
  第二部分：旧词与高风险表达检查
  第三部分：重点好物页结构检查
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


// ========== 第二部分：旧词与高风险表达检查 ==========
const forbiddenTerms = [
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
  "交易担保",
  "价格",
  "库存",
  "下单",
  "立即购买",
  "柚木茶室精选",
];
const publicFiles = (await Promise.all(publicEntries.map((entry) => collectFiles(entry)))).flat().filter((file) => file !== "forms/form.js").sort();

for (const relativePath of publicFiles) {
  const text = await read(relativePath);
  const visibleText = relativePath.endsWith(".html") ? text.replace(/<!--[\s\S]*?-->/g, "") : text;
  const lines = visibleText.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const term of forbiddenTerms) {
      if (line.includes(term)) {
        problems.push(`${relativePath}:${index + 1}：发现公网旧口径或高风险表达“${term}”`);
      }
    }
  });
}

// ========== 第三部分：重点好物页结构检查 ==========
const solutionsIndex = await read("solutions/index.html");
for (const category of ["柚木家具", "柚木地板", "柚木整装", "柚木户外", "柚木收藏", "柚木文创"]) {
  if (!solutionsIndex.includes(category)) problems.push(`solutions/index.html：缺少六类新体系分类 ${category}`);
}
for (const id of ["good-furniture", "good-flooring", "good-whole-decoration", "good-outdoor", "good-collection", "good-creative"]) {
  if (!solutionsIndex.includes(`id="${id}"`)) problems.push(`solutions/index.html：缺少六类分区锚点 ${id}`);
}

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("正式发布预检未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("正式发布预检通过：未发现旧口径、高风险交易表达或内部审核话回潮。");
