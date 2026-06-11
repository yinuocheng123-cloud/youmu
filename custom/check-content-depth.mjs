/*
文件说明：该文件用于检查公开文章完整性与内容自然度。
功能说明：扫描知识文章、好物页和好物档案页，拦截文章导语重复、小节拼接感过强、相关链接过多和旧 Footer 内部话。

结构概览：
  第一部分：公共扫描工具
  第二部分：重点文章完整性检查
  第三部分：好物页与档案页检查
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


// ========== 第二部分：重点文章完整性检查 ==========
const focusArticles = [
  "knowledge/topics/teak-origin-basic.html",
  "knowledge/topics/teak-daily-cleaning.html",
  "knowledge/topics/teak-price-difference.html",
  "knowledge/topics/teak-authenticity-basic.html",
  "knowledge/topics/what-is-teak.html",
  "knowledge/topics/teak-buying-pitfalls.html"
];
const articleForbiddenTerms = ["人工核验", "后续人工核验", "阅读路径", "继续看", "下一步可以看", "读完后", "知识内容用于建立判断路径", "真实资料仍需以后续人工核验为准", "审核"];

function normalize(text) {
  return stripTags(text).replace(/[，。！？、；：\s]/g, "");
}

function extractLead(html) {
  return html.match(/<header class="article-hero">[\s\S]*?<h1>[\s\S]*?<\/h1>\s*<p>([\s\S]*?)<\/p>/i)?.[1]
    ?? html.match(/<p class="content-lead">([\s\S]*?)<\/p>/i)?.[1]
    ?? "";
}

function extractFirstBodyParagraph(html) {
  const body = html.match(/<(?:div|section) class="[^"]*article-body[^"]*"[^>]*>([\s\S]*?)(?:<section class="[^"]*article-related|<section class="[^"]*article-note|<\/div>|<\/section>)/i)?.[1] ?? "";
  return body.match(/<p>([\s\S]*?)<\/p>/i)?.[1] ?? "";
}

for (const relativePath of focusArticles) {
  const html = await read(relativePath);
  const mainText = stripTags(html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html);
  const lead = normalize(extractLead(html));
  const firstParagraph = normalize(extractFirstBodyParagraph(html));

  if (lead && firstParagraph && (firstParagraph.startsWith(lead) || lead.startsWith(firstParagraph))) {
    problems.push(`${relativePath}：文章导语与正文第一段重复`);
  }

  if ((html.match(/class="article-inline-heading"/g) ?? []).length > 0) {
    problems.push(`${relativePath}：重点文章仍像小节拼接，存在 article-inline-heading`);
  }

  const related = html.match(/<section class="[^"]*article-related[\s\S]*?<\/section>/i)?.[0] ?? "";
  const relatedCount = (related.match(/<li\b/g) ?? []).length;
  if (relatedCount > 3) problems.push(`${relativePath}：相关内容链接数量 ${relatedCount}，超过 3 个`);

  for (const term of articleForbiddenTerms) {
    if (mainText.includes(term)) problems.push(`${relativePath}：文章仍包含内部话或旧说明“${term}”`);
  }

  const footer = html.match(/<footer[\s\S]*?<\/footer>/i)?.[0] ?? "";
  for (const term of articleForbiddenTerms) {
    if (footer.includes(term)) problems.push(`${relativePath}：文章 Footer 仍包含内部话“${term}”`);
  }
}

// ========== 第三部分：好物页与档案页检查 ==========
const solutionsIndex = await read("solutions/index.html");
if ((solutionsIndex.match(/class="good-item-card\b/g) ?? []).length < 72) {
  problems.push("solutions/index.html：柚木好物内容卡少于 72 条");
}
const goodsFiles = (await collectFiles("solutions/goods", new Set([".html"]))).sort();
if (goodsFiles.length < 30) problems.push(`solutions/goods：好物档案页数量 ${goodsFiles.length}，少于 30 个`);

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("内容深度检查未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("内容深度检查通过：重点文章导语、正文和相关链接已收口。");
