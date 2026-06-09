/*
文件说明：该文件用于执行 V1.15.1 全站导航下拉结构统一修复。
功能说明：批量替换公开 HTML 的 Header，统一桌面下拉、移动端菜单和不同目录层级的导航路径。

结构概览：
  第一部分：导入依赖与公共路径工具
  第二部分：统一导航模板
  第三部分：公开页面 Header 替换与必要锚点补齐
  第四部分：说明文档与版本记录更新
*/

// ========== 第一部分：导入依赖与公共路径工具 ==========
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "../..");
const publicEntries = ["index.html", "about", "knowledge", "solutions", "vendors", "forms", "articles", "cases"];

async function readText(relativePath) {
  return fs.readFile(path.join(projectRoot, relativePath), "utf8");
}

async function writeText(relativePath, content) {
  await fs.writeFile(path.join(projectRoot, relativePath), content, "utf8");
}

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

function href(relativePath, target) {
  return `${prefixFor(relativePath)}${target}`;
}

function homeHref(relativePath) {
  return relativePath === "index.html" ? "./index.html" : href(relativePath, "index.html");
}

function wechatHref(relativePath) {
  return relativePath === "index.html" ? "#wechat" : `${href(relativePath, "index.html")}#wechat`;
}

// ========== 第二部分：统一导航模板 ==========
function dropdown(id, label, items) {
  const links = items.map((item) => `            <a href="${item.href}">${item.label}</a>`).join("\n");

  return `        <div class="nav-dropdown" data-dropdown>
          <button class="nav-link nav-dropdown-trigger" type="button" aria-expanded="false" aria-controls="${id}" data-dropdown-trigger>
            ${label}
          </button>
          <div class="nav-dropdown-menu" id="${id}" data-dropdown-menu>
${links}
          </div>
        </div>`;
}

function navItems(relativePath) {
  return {
    about: [
      { label: "认识柚喜", href: href(relativePath, "about/index.html") },
      { label: "网站目的", href: `${href(relativePath, "about/index.html")}#purpose` },
      { label: "柚木文化", href: `${href(relativePath, "about/index.html")}#teak-culture` },
      { label: "柚木应用", href: `${href(relativePath, "about/index.html")}#teak-application` },
    ],
    knowledge: [
      { label: "柚木知识首页", href: href(relativePath, "knowledge/index.html") },
      { label: "新手必读", href: `${href(relativePath, "knowledge/index.html")}#beginner-reading` },
      { label: "选购避坑", href: `${href(relativePath, "knowledge/index.html")}#buying-judgement` },
      { label: "使用与保养", href: `${href(relativePath, "knowledge/index.html")}#use-and-care` },
      { label: "常见问题", href: `${href(relativePath, "knowledge/index.html")}#faq` },
    ],
    solutions: [
      { label: "好物方案首页", href: href(relativePath, "solutions/index.html") },
      { label: "柚木整装", href: href(relativePath, "solutions/whole-decoration.html") },
      { label: "柚木地板", href: href(relativePath, "solutions/flooring.html") },
      { label: "庭院户外", href: href(relativePath, "solutions/outdoor.html") },
      { label: "茶室会客", href: href(relativePath, "solutions/tea-room.html") },
      { label: "家具好物", href: href(relativePath, "solutions/furniture.html") },
    ],
    vendors: [
      { label: "推荐厂商首页", href: href(relativePath, "vendors/index.html") },
      { label: "公开资料观察库", href: href(relativePath, "vendors/candidates/index.html") },
      { label: "申请建立资料页", href: href(relativePath, "forms/vendor-apply.html") },
    ],
  };
}

function mobileDetails(label, items) {
  const links = items.map((item) => `              <a href="${item.href}">${item.label}</a>`).join("\n");

  return `            <details>
              <summary>${label}</summary>
${links}
            </details>`;
}

function headerTemplate(relativePath) {
  const items = navItems(relativePath);

  return `    <header class="site-header global-site-header" aria-label="顶部导航">
      <a class="brand" href="${homeHref(relativePath)}" aria-label="柚喜饰界首页">
        <img class="brand-mark-image" src="${href(relativePath, "assets/logo-yuxi-mark.svg")}" alt="" aria-hidden="true" />
        <span class="brand-wording">
          <strong>柚喜饰界</strong>
          <small>柚木爱好者乐园</small>
        </span>
      </a>
      <nav class="main-nav desktop-nav" aria-label="主导航">
        <a class="nav-link" href="${homeHref(relativePath)}">首页</a>
${dropdown(`about-menu-${depthOf(relativePath)}`, "认识柚喜", items.about)}
${dropdown(`knowledge-menu-${depthOf(relativePath)}`, "柚木知识", items.knowledge)}
${dropdown(`solutions-menu-${depthOf(relativePath)}`, "好物方案", items.solutions)}
${dropdown(`vendors-menu-${depthOf(relativePath)}`, "推荐厂商", items.vendors)}
        <a class="nav-link" href="${wechatHref(relativePath)}">社群交流</a>
      </nav>
      <a class="nav-cta" href="${wechatHref(relativePath)}">添加柚喜顾问</a>
      <button class="menu-toggle" type="button" aria-label="打开导航菜单" aria-expanded="false" aria-controls="mobile-menu" data-menu-toggle>
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div class="mobile-menu-shell" id="mobile-menu" data-mobile-menu aria-hidden="true">
        <button class="mobile-menu-backdrop" type="button" aria-label="关闭导航菜单" data-menu-backdrop></button>
        <div class="mobile-menu-panel" role="dialog" aria-modal="true" aria-label="移动端导航">
          <div class="mobile-menu-head">
            <a class="brand mobile-brand" href="${homeHref(relativePath)}" aria-label="柚喜饰界首页">
              <img class="brand-mark-image" src="${href(relativePath, "assets/logo-yuxi-mark.svg")}" alt="" aria-hidden="true" />
              <span class="brand-wording">
                <strong>柚喜饰界</strong>
                <small>柚木爱好者乐园</small>
              </span>
            </a>
            <button class="mobile-menu-close" type="button" aria-label="关闭导航菜单" data-menu-close>×</button>
          </div>
          <nav class="mobile-nav" aria-label="移动端主导航">
            <a href="${homeHref(relativePath)}">首页</a>
${mobileDetails("认识柚喜", items.about)}
${mobileDetails("柚木知识", items.knowledge)}
${mobileDetails("好物方案", items.solutions)}
${mobileDetails("推荐厂商", items.vendors)}
            <a href="${wechatHref(relativePath)}">社群交流</a>
          </nav>
          <a class="mobile-menu-cta" href="${wechatHref(relativePath)}">添加柚喜顾问</a>
        </div>
      </div>
    </header>`;
}

// ========== 第三部分：公开页面 Header 替换与必要锚点补齐 ==========
function replaceHeader(html, relativePath) {
  return html.replace(/<header[\s\S]*?<\/header>/, headerTemplate(relativePath));
}

function addAnchorIds(relativePath, html) {
  if (relativePath === "about/index.html") {
    return html
      .replace('<section class="yuxi-story-section yuxi-split-section">', '<section class="yuxi-story-section yuxi-split-section" id="purpose">')
      .replace('<section class="yuxi-story-section">', '<section class="yuxi-story-section" id="teak-culture">')
      .replace('<section class="yuxi-story-section">\n        <div class="category-heading">\n          <h2>柚木可以进入哪些生活场景</h2>', '<section class="yuxi-story-section" id="teak-application">\n        <div class="category-heading">\n          <h2>柚木可以进入哪些生活场景</h2>');
  }

  if (relativePath === "knowledge/index.html") {
    return html
      .replace('<section class="knowledge-editorial-section">\n      <div class="category-heading">\n        <h2>新手先读这 5 篇</h2>', '<section class="knowledge-editorial-section" id="beginner-reading">\n      <div class="category-heading">\n        <h2>新手先读这 5 篇</h2>')
      .replace('<article class="knowledge-problem-group">\n          <h3>买前判断</h3>', '<article class="knowledge-problem-group" id="buying-judgement">\n          <h3>买前判断</h3>')
      .replace('<article class="knowledge-problem-group">\n          <h3>使用与保养</h3>', '<article class="knowledge-problem-group" id="use-and-care">\n          <h3>使用与保养</h3>')
      .replace('<section class="knowledge-editorial-section">\n      <div class="category-heading">\n        <h2>常见问题</h2>', '<section class="knowledge-editorial-section" id="faq">\n      <div class="category-heading">\n        <h2>常见问题</h2>');
  }

  return html;
}

async function updatePublicHeaders() {
  const htmlFiles = (await Promise.all(publicEntries.map(collectHtmlFiles))).flat();

  for (const file of htmlFiles) {
    const html = await readText(file);
    await writeText(file, addAnchorIds(file, replaceHeader(html, file)));
  }
}

// ========== 第四部分：说明文档与版本记录更新 ==========
async function appendDoc(relativePath, title, body) {
  let text = await readText(relativePath);
  if (!text.includes(title)) {
    text = `${text.trim()}\n\n${title}\n\n${body}\n`;
    await writeText(relativePath, text);
  }
}

async function updateDocs() {
  const note =
    "V1.15.1 已修复首页和内页导航结构不一致问题，统一电脑端下拉菜单、移动端菜单、导航路径和社群交流 CTA。前台主导航统一为：首页、认识柚喜、柚木知识、好物方案、推荐厂商、社群交流。";

  await appendDoc("custom/client-preview-note.md", "## 18. V1.15.1 全站导航下拉结构统一修复", note);
  await appendDoc("custom/launch-checklist.md", "## V1.15.1 全站导航复核", `- 确认首页、二级页、三级页使用同一套 Header、桌面下拉、移动菜单和社群交流 CTA。\n- 确认主导航仍为“推荐厂商”，不是“会员站”。\n- 确认 \`node custom\\check-navigation-consistency.mjs\` 通过。`);
  await appendDoc("custom/public-review-checklist.md", "## V1.15.1 导航人工验收", `- [ ] 首页桌面端下拉可打开。\n- [ ] 认识柚喜、柚木知识、好物方案、推荐厂商等内页下拉结构与首页一致。\n- [ ] 移动端菜单可打开、关闭、点击遮罩关闭，点击菜单项后关闭。\n- [ ] 各层级页面的社群交流都能跳回首页企业微信区。`);
}

async function writeRecord() {
  const record = `# 版本记录：v1.15.1-global-navigation-dropdown-fix

## 1. 本轮修改目标

本轮目标是单独完成 V1.15.1 全站导航下拉结构统一修复。重点只修复首页、二级页和三级页的 Header 结构、桌面端下拉、移动端菜单、导航路径和社群交流 CTA，不改正文内容结构、不改好物方案和推荐厂商逻辑。

## 2. 当前问题

V1.15 已统一主导航文案，但首页与内页仍使用不同 Header 结构。首页使用 site-header，内页使用 content-site-header；首页移动菜单为静态结构，内页依赖脚本补齐；桌面端下拉结构在内页缺失，导致公网验收时出现“文字一致但交互不一致”的问题。

## 3. 全站 Header 结构统一情况

本轮使用统一模板批量替换所有公开 HTML 的 Header。统一结构包含 Logo 区、桌面主导航、桌面下拉菜单、社群交流 CTA、移动端菜单按钮、移动端抽屉菜单、遮罩和关闭按钮。

## 4. 桌面端下拉修复情况

桌面端导航恢复下拉结构：认识柚喜、柚木知识、好物方案、推荐厂商均包含下拉菜单；首页和社群交流保持直接链接。下拉菜单继续使用既有 data-dropdown、data-dropdown-trigger 和 data-dropdown-menu 交互。

## 5. 移动端菜单修复情况

移动端菜单改为全站静态统一结构，不再依赖内页运行时动态补齐。菜单包含一级导航和必要子项，点击链接后仍由既有 script.js 关闭菜单。

## 6. 导航路径修复情况

根目录、二级目录和三级目录页面按目录深度生成正确相对路径。社群交流在首页指向 #wechat，在二级页指向 ../index.html#wechat，在三级页指向 ../../index.html#wechat。

## 7. 新增导航一致性检查脚本

新增 custom/check-navigation-consistency.mjs，用于检查所有公开 HTML 是否包含统一主导航文案、是否残留主导航“会员站”、是否具备桌面下拉结构、移动端菜单结构，以及二级/三级页面 script.js 路径和主导航路径是否正确。

## 8. 本地验证结果

待本轮终端验证后更新。

## 9. 公网预览地址

https://yinuocheng123-cloud.github.io/youmu/

## 10. 未完成项

真实电话、邮箱、备案信息、最终二维码、真实企业资料、图片授权、联系方式、案例材料和服务边界仍待补齐。

## 11. 资料真实性处理说明

本轮没有新增真实厂商、真实案例、真实认证或真实资质；只处理导航结构和路径一致性。

## 12. 后台与交易能力说明

本轮没有新增后台、登录、商城、支付或数据库，没有新增购物车、价格体系、在线下单或立即购买，也没有修改 GitHub Actions workflow。`;

  await writeText("custom/notes/v1.15.1-global-navigation-dropdown-fix.md", record);
}

await updatePublicHeaders();
await updateDocs();
await writeRecord();

console.log("V1.15.1 global navigation dropdown fixed.");
