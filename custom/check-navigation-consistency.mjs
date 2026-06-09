/*
文件说明：该文件用于检查柚喜饰界公开页面的导航一致性。
功能说明：扫描所有公开 HTML，确认主导航文案、桌面下拉、移动端菜单、脚本路径和不同目录层级的导航路径一致。

结构概览：
  第一部分：导入依赖与检查范围
  第二部分：文件收集与路径工具
  第三部分：Header、桌面导航、移动菜单与脚本路径检查
  第四部分：结果输出
*/

// ========== 第一部分：导入依赖与检查范围 ==========
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const publicEntries = ["index.html", "about", "knowledge", "solutions", "vendors", "forms", "articles", "cases"];
const requiredLabels = ["首页", "认识柚喜", "柚木知识", "柚木好物", "推荐厂商", "社群交流"];
const dropdownLabels = ["认识柚喜", "柚木知识", "柚木好物", "推荐厂商"];
const problems = [];

// ========== 第二部分：文件收集与路径工具 ==========
async function collectHtmlFiles(entry) {
  const absolute = path.join(projectRoot, entry);
  const stat = await fs.stat(absolute);

  if (stat.isFile()) {
    return absolute.endsWith(".html") ? [entry] : [];
  }

  const files = [];
  const children = await fs.readdir(absolute, { withFileTypes: true });

  for (const child of children) {
    const relative = path.join(entry, child.name).replaceAll(path.sep, "/");

    if (child.isDirectory()) {
      files.push(...(await collectHtmlFiles(relative)));
      continue;
    }

    if (child.isFile() && child.name.endsWith(".html")) {
      files.push(relative);
    }
  }

  return files;
}

function depthOf(relativePath) {
  return relativePath.split("/").length - 1;
}

function prefixFor(relativePath) {
  const depth = depthOf(relativePath);
  return depth === 0 ? "./" : "../".repeat(depth);
}

function homeHref(relativePath) {
  return relativePath === "index.html" ? "./index.html" : `${prefixFor(relativePath)}index.html`;
}

function wechatHref(relativePath) {
  return relativePath === "index.html" ? "#wechat" : `${prefixFor(relativePath)}index.html#wechat`;
}

function stripTags(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractHeader(html) {
  return html.match(/<header[\s\S]*?<\/header>/)?.[0] ?? "";
}

function extractHrefs(block) {
  return [...block.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1]);
}

function expectedMainHrefs(relativePath) {
  const prefix = prefixFor(relativePath);
  return [
    homeHref(relativePath),
    `${prefix}about/index.html`,
    `${prefix}knowledge/index.html`,
    `${prefix}solutions/index.html`,
    `${prefix}vendors/index.html`,
    wechatHref(relativePath),
  ];
}

// ========== 第三部分：Header、桌面导航、移动菜单与脚本路径检查 ==========
function checkHeader(relativePath, html) {
  const header = extractHeader(html);
  const headerText = stripTags(header);
  const depth = depthOf(relativePath);
  const prefix = prefixFor(relativePath);

  if (!header) {
    problems.push(`${relativePath}：缺少 Header`);
    return;
  }

  for (const label of requiredLabels) {
    if (!headerText.includes(label)) {
      problems.push(`${relativePath}：Header 缺少主导航文案“${label}”`);
    }
  }

  if (headerText.includes("会员站")) {
    problems.push(`${relativePath}：主导航或移动菜单仍残留“会员站”`);
  }

  if (!header.includes('class="site-header global-site-header"')) {
    problems.push(`${relativePath}：Header 未使用统一 class="site-header global-site-header"`);
  }

  const dropdownCount = (header.match(/class="nav-dropdown"/g) ?? []).length;
  if (dropdownCount < dropdownLabels.length) {
    problems.push(`${relativePath}：桌面下拉菜单数量不足，当前 ${dropdownCount} 个`);
  }

  for (const label of dropdownLabels) {
    const hasTrigger = new RegExp(`<button[^>]*data-dropdown-trigger[\\s\\S]*?${label}[\\s\\S]*?<\\/button>`).test(header);
    if (!hasTrigger) {
      problems.push(`${relativePath}：缺少“${label}”桌面下拉触发按钮`);
    }
  }

  const mobileRequired = ["data-menu-toggle", "data-mobile-menu", "data-menu-backdrop", "data-menu-close", "mobile-menu-cta"];
  for (const token of mobileRequired) {
    if (!header.includes(token)) {
      problems.push(`${relativePath}：移动端菜单缺少 ${token}`);
    }
  }

  const scriptPath = depth === 0 ? "./script.js" : `${prefix}script.js`;
  if (!html.includes(`src="${scriptPath}"`)) {
    problems.push(`${relativePath}：script.js 路径应为 ${scriptPath}`);
  }

  const mainNav = header.match(/<nav class="main-nav desktop-nav"[\s\S]*?<\/nav>/)?.[0] ?? "";
  const hrefs = extractHrefs(mainNav);
  for (const expected of expectedMainHrefs(relativePath)) {
    if (!hrefs.includes(expected)) {
      problems.push(`${relativePath}：桌面主导航缺少路径 ${expected}`);
    }
  }

  if (depth === 1 && !hrefs.includes("../index.html")) {
    problems.push(`${relativePath}：二级页面首页路径应为 ../index.html`);
  }

  if (depth === 2 && !hrefs.includes("../../index.html")) {
    problems.push(`${relativePath}：三级页面首页路径应为 ../../index.html`);
  }
}

const htmlFiles = (await Promise.all(publicEntries.map(collectHtmlFiles))).flat().sort();

for (const relativePath of htmlFiles) {
  const html = await fs.readFile(path.join(projectRoot, relativePath), "utf8");
  checkHeader(relativePath, html);
}

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("全站导航一致性检查未通过：");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log("全站导航一致性检查通过。");
