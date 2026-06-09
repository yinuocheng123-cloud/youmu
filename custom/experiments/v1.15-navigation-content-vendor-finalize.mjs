/*
文件说明：该文件用于生成 V1.15 全站导航统一、内容单页化与推荐厂商逻辑收口改动。
功能说明：统一公开 HTML 的主导航与移动菜单，恢复“推荐厂商”前台命名，并收口会员资料页、观察库和申请页表达。

结构概览：
  第一部分：导入依赖与通用工具
  第二部分：全站导航与公共表达收口
  第三部分：重点页面内容收口
  第四部分：文档、记录与主流程
*/

// ========== 第一部分：导入依赖与通用工具 ==========
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

function indent(text, spaces = 4) {
  const prefix = " ".repeat(spaces);
  return text
    .trim()
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
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

function prefixFor(relativePath) {
  const depth = relativePath.split("/").length - 1;
  return depth === 0 ? "./" : "../".repeat(depth);
}

function homeHref(relativePath) {
  return relativePath === "index.html" ? "./index.html" : `${prefixFor(relativePath)}index.html`;
}

function wechatHref(relativePath) {
  return relativePath === "index.html" ? "#wechat" : `${prefixFor(relativePath)}index.html#wechat`;
}

function navLinks(relativePath) {
  const prefix = prefixFor(relativePath);
  return [
    ["首页", homeHref(relativePath)],
    ["认识柚喜", `${prefix}about/index.html`],
    ["柚木知识", `${prefix}knowledge/index.html`],
    ["好物方案", `${prefix}solutions/index.html`],
    ["推荐厂商", `${prefix}vendors/index.html`],
    ["社群交流", wechatHref(relativePath)],
  ];
}

function desktopNav(relativePath, className) {
  const links = navLinks(relativePath)
    .map(([label, href]) => `<a href="${href}">${label}</a>`)
    .join("");
  return `<nav class="${className}" aria-label="主导航">${links}</nav>`;
}

function mobileNav(relativePath) {
  const links = navLinks(relativePath)
    .map(([label, href]) => `            <a href="${href}">${label}</a>`)
    .join("\n");
  return `<nav class="mobile-nav" aria-label="移动端主导航">\n${links}\n          </nav>`;
}

function replaceMain(html, mainHtml) {
  return html.replace(/<main[\s\S]*?<\/main>/, indent(mainHtml, 4));
}

function replaceTitleAndDescription(html, title, description) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`);
}

function applySharedReplacements(text) {
  const replacements = [
    ["会员站样板", "企业资料页示例"],
    ["会员站资料框架", "企业资料页说明"],
    ["会员站框架", "企业资料页说明"],
    ["会员站样板入口", "企业资料页入口"],
    ["会员站样板资料", "企业资料页说明"],
    ["查看会员站样板", "查看企业资料页示例"],
    ["按好物分类查看会员站", "查看推荐厂商"],
    ["柚喜会员站", "推荐厂商"],
    ["进入柚喜会员站", "查看推荐厂商"],
    ["从好物到会员站", "从好物到推荐厂商"],
    ["会员站资料", "推荐厂商资料"],
    ["会员站体系", "推荐厂商资料体系"],
    ["会员站申请页", "推荐厂商申请页"],
    ["申请建立好物分类会员站", "申请建立好物分类企业资料页"],
    ["申请建立会员站", "申请建立企业资料页"],
    ["好物分类会员站", "好物分类企业资料页"],
    ["候选会员站", "观察资料"],
    ["公开资料候选", "公开观察资料"],
    ["资料框架", "资料说明"],
    ["资料待确认方向", "资料确认方向"],
    ["后续按真实授权资料补充", "资料确认后补充"],
    ["当前部分", "部分"],
    ["当前先", "先"],
    ["当前为", "本页为"],
    ["当前网站", "本网站"],
    ["当前站点", "本站"],
    ["当前项目", "本项目"],
    ["未来站内会员页逻辑", "站内企业资料页逻辑"],
    ["未来可如何组织", "可以如何组织"],
    ["未来页面会如何呈现", "页面会如何呈现"],
    ["未来会员站", "站内企业资料页"],
    ["真实会员站上线前", "真实企业资料页上线前"],
    ["正式转为会员站前", "正式转为推荐厂商资料页前"],
    ["会员展示", "资料展示"],
    ["会员企业", "完成资料确认的企业"],
    ["会员页", "企业资料页"],
    ["会员站", "企业资料页"],
  ];

  let next = text;
  for (const [from, to] of replacements) {
    next = next.replaceAll(from, to);
  }
  return next;
}

// ========== 第二部分：全站导航与公共表达收口 ==========
async function updateAllNavigation() {
  const htmlFiles = (await Promise.all(publicEntries.map(collectHtmlFiles))).flat();

  for (const file of htmlFiles) {
    let html = await readText(file);

    if (file === "index.html") {
      html = html.replace(/<nav class="main-nav desktop-nav"[\s\S]*?<\/nav>/, desktopNav(file, "main-nav desktop-nav"));
      html = html.replace(/<nav class="mobile-nav"[\s\S]*?<\/nav>/, mobileNav(file));
      html = html.replace(/<a class="nav-cta" href="[^"]*">[\s\S]*?<\/a>/, `<a class="nav-cta" href="#wechat">添加柚喜顾问</a>`);
      html = html.replace(/<a class="mobile-menu-cta" href="[^"]*">[\s\S]*?<\/a>/, `<a class="mobile-menu-cta" href="#wechat">添加柚喜顾问</a>`);
    } else {
      html = html.replace(/<nav class="content-nav"[\s\S]*?<\/nav>/, desktopNav(file, "content-nav"));
    }

    html = applySharedReplacements(html);
    await writeText(file, html);
  }
}

async function updateDataSource() {
  let data = await readText("data/site-content.js");
  data = applySharedReplacements(data)
    .replaceAll('{ id: "vendors", label: "企业资料页", href: "#vendors", ...status.formalCopy }', '{ id: "vendors", label: "推荐厂商", href: "#vendors", ...status.formalCopy }')
    .replaceAll("会员站, 柚木生活方式", "推荐厂商, 柚木生活方式")
    .replaceAll("按好物分类展示的品牌或企业企业资料页", "按好物分类展示的推荐厂商资料页")
    .replaceAll("企业资料页不是担保名单", "推荐厂商不是担保名单");
  await writeText("data/site-content.js", data);
}

// ========== 第三部分：重点页面内容收口 ==========
async function updateHomePage() {
  let html = await readText("index.html");
  html = html
    .replaceAll("按柚木好物分类查看企业资料页", "推荐厂商与企业资料")
    .replaceAll("按柚木好物分类，查看对应品牌或企业的站内企业资料页。这里优先呈现分类入口和资料说明，展示不等于担保，真实合作前仍需继续确认产品、合同、交付、售后和服务边界。", "推荐厂商板块后续将以柚喜站内企业会员资料页为基础，逐步完善企业资料、产品资料、空间应用、服务区域和服务边界。这里展示的是资料组织方式，不是平台认证名单，也不是交易担保。")
    .replaceAll("用户如何看好物分类企业资料页？", "用户如何看推荐厂商资料？")
    .replaceAll("先看企业资料页是否能说明自己偏向工坊、整装、地板、户外或家具好物中的哪一类。", "先看资料是否能说明企业更偏向工坊、整装、地板、户外或家具好物中的哪一类。")
    .replaceAll("企业资料页不是担保名单，用户仍应围绕产品、合同和交付责任继续确认。", "推荐厂商不是担保名单，用户仍应围绕产品、合同和交付责任继续确认。")
    .replaceAll("品牌 / 企业：请通过推荐厂商申请页整理资料后继续沟通", "品牌 / 企业：请通过推荐厂商资料页申请整理资料后继续沟通")
    .replaceAll("申请建立好物分类企业资料页", "申请建立推荐厂商资料页");
  await writeText("index.html", html);
}

async function updateAboutPage() {
  let html = await readText("about/index.html");
  html = html
    .replaceAll("从一块柚木开始，连接柚木知识、好物资料、企业企业资料页和爱好者社群。", "从一块柚木开始，连接知识、好物、空间、企业资料和爱好者社群。")
    .replaceAll("柚喜饰界会继续完善柚木知识库、柚木好物资料、推荐厂商、公开资料观察库和社群交流路径。", "柚喜饰界会继续完善柚木知识库、柚木好物资料、推荐厂商、公开资料观察库和社群交流路径。")
    .replaceAll("推荐厂商是基于柚喜饰界本身建立的企业资料展示页", "推荐厂商板块是基于柚喜饰界站内建立的企业会员资料页体系")
    .replaceAll("企业可以拥有站内资料页", "企业可以拥有站内企业资料页")
    .replaceAll("推荐厂商</a></li>", "推荐厂商</a></li>");
  await writeText("about/index.html", html);
}

async function updateKnowledgeIndex() {
  let html = await readText("knowledge/index.html");
  html = html
    .replaceAll("读完基础问题，可以继续看空间应用，也可以进入推荐厂商资料体系了解企业资料会如何组织。", "读完基础问题，可以继续看空间应用，也可以进入推荐厂商板块了解企业资料如何被整理和核对。")
    .replaceAll("<strong>推荐厂商</strong><span>了解站内企业推荐厂商资料页会展示哪些内容。</span>", "<strong>推荐厂商</strong><span>了解站内企业资料页会展示哪些内容，以及公开观察资料和正式推荐之间的边界。</span>");
  await writeText("knowledge/index.html", html);
}

async function updateSolutionsIndex() {
  let html = await readText("solutions/index.html");
  html = html
    .replaceAll("<span>企业资料页资料</span>", "<span>推荐厂商资料</span>")
    .replaceAll("<h2>从好物到推荐厂商</h2>", "<h2>从好物到推荐厂商</h2>")
    .replaceAll("如果希望继续了解相关企业资料，可以进入推荐厂商资料体系，查看站内企业资料页会如何组织企业介绍、产品资料、授权图片和服务边界。公开资料观察库只用于学习和核对，不等于已完成资料确认的站内企业资料页。", "如果希望继续了解相关企业资料，可以进入推荐厂商板块，查看站内企业会员资料页会如何组织企业介绍、产品资料、授权图片和服务边界。公开资料观察库只用于学习和核对，不等于正式推荐厂商资料。")
    .replaceAll("查看推荐厂商", "查看推荐厂商");
  await writeText("solutions/index.html", html);
}

async function updateVendorPages() {
  let vendor = await readText("vendors/index.html");
  const main = `
<main class="content-main vendor-guide-layout member-site-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>推荐厂商</span></nav>
  <section class="page-hero vendor-guide-hero member-site-hero">
    <p class="eyebrow dark">Recommended Vendors</p>
    <h1>推荐厂商</h1>
    <p>按柚木好物方向，查看后续可在柚喜饰界站内建立的企业会员资料页。这里展示的是资料组织方式和公开资料线索，不是平台认证名单，也不是交易担保。</p>
    <a class="btn btn-primary" href="../forms/vendor-apply.html">申请建立推荐厂商资料页</a>
  </section>
  <section class="vendor-guide-section yuxi-split-section">
    <div class="yuxi-section-copy">
      <h2>什么是推荐厂商</h2>
      <p>推荐厂商不是简单名单，也不是外部网站跳转。它在柚喜饰界内部对应的是站内企业会员资料页体系，用来整理企业介绍、主营方向、产品资料、空间应用、工艺说明、授权图片、案例材料、服务区域、联系方式和服务边界。</p>
      <p>用户可以通过这个板块先了解一个企业资料页应当讲清哪些内容，再结合产品资料、合同、交付和售后继续确认。资料展示不代表平台认证，也不构成交易担保。</p>
    </div>
    <div class="yuxi-member-map"><span>企业介绍</span><span>主营方向</span><span>产品资料</span><span>授权图片</span><span>服务边界</span></div>
  </section>
  <section class="vendor-guide-section">
    <div class="category-heading"><h2>五类推荐方向</h2><p>不同企业资料应回到不同好物方向里展示，而不是混成一个难以判断的名单。</p></div>
    <div class="vendor-direction-grid">
      <article class="vendor-direction-card"><h3>柚木地板</h3><p>重点展示材料说明、规格、安装、维护和服务区域。</p></article>
      <article class="vendor-direction-card"><h3>柚木整装</h3><p>重点展示空间方案、产品资料、工艺说明和服务边界。</p></article>
      <article class="vendor-direction-card"><h3>庭院户外</h3><p>重点展示结构、五金、耐候、维护周期和服务范围。</p></article>
      <article class="vendor-direction-card"><h3>茶室会客</h3><p>重点展示茶桌、柜体、地面和会客空间的应用资料。</p></article>
      <article class="vendor-direction-card"><h3>家具好物</h3><p>重点展示家具、工坊和好物品牌的产品资料、工艺与使用场景。</p></article>
    </div>
  </section>
  <section class="vendor-guide-section">
    <h2>公开资料观察库</h2>
    <p>公开资料观察库来自外部公开信息整理，只用于观察柚木相关品牌的产品表达和空间表达。它不等于正式推荐厂商，不代表已入驻，也不代表已经完成图片授权、联系方式确认或服务边界确认。</p>
    <a class="btn btn-secondary" href="candidates/index.html">进入公开资料观察库</a>
  </section>
  <section class="vendor-guide-section">
    <h2>申请建立推荐厂商资料页</h2>
    <p>如果企业希望在柚喜饰界站内建立好物分类企业资料页，可以先准备企业资料、产品资料、图片授权、案例材料、联系方式和服务边界说明。</p>
    <a class="btn btn-primary" href="../forms/vendor-apply.html">申请建立推荐厂商资料页</a>
  </section>
</main>`;
  vendor = replaceTitleAndDescription(replaceMain(vendor, main), "推荐厂商 - 柚喜饰界", "推荐厂商是柚喜饰界站内企业会员资料页体系，用于按柚木好物方向整理企业资料和公开资料线索。");
  vendor = vendor.replace(/<footer class="content-site-footer"[\s\S]*?<\/footer>/, `<footer class="content-site-footer"><div class="content-footer-inner"><span>柚喜饰界 - 推荐厂商</span><span>推荐厂商不等于平台认证或交易担保，真实资料页上线前仍需完成资料确认。</span></div></footer>`);
  await writeText("vendors/index.html", vendor);

  let candidates = await readText("vendors/candidates/index.html");
  candidates = candidates
    .replaceAll("<a href=\"../index.html\">推荐厂商</a>", "<a href=\"../index.html\">推荐厂商</a>")
    .replaceAll("<a href=\"../index.html\">企业资料页</a>", "<a href=\"../index.html\">推荐厂商</a>")
    .replaceAll("不等于已完成资料确认的柚喜站内企业资料页，也不构成品牌推荐。", "不等于正式推荐厂商，也不构成品牌推荐。")
    .replaceAll("品牌资料是否适合作为企业资料页展示", "品牌资料是否适合作为站内企业资料页展示");
  candidates = replaceTitleAndDescription(candidates, "公开资料观察库 - 柚喜饰界", "公开资料观察库用于观察公开信息中的柚木相关品牌表达，不等于正式推荐厂商。");
  await writeText("vendors/candidates/index.html", candidates);
}

async function updateVendorApplyPage() {
  let html = await readText("forms/vendor-apply.html");
  html = replaceTitleAndDescription(html, "申请建立推荐厂商资料页 - 柚喜饰界", "用于整理好物分类企业资料页申请摘要，后续需人工确认资料、图片授权、联系方式和服务边界。");
  html = html
    .replaceAll("申请建立好物分类企业资料页", "申请建立推荐厂商资料页")
    .replaceAll("适合希望在柚喜饰界站内建立好物分类企业资料页的品牌、企业和工坊。这里不承诺流量、排名或成交，只帮助企业先把可展示资料整理清楚。", "适合希望在柚喜饰界站内建立好物分类企业资料页的品牌、企业和工坊。申请内容用于人工资料确认，不是外部网站跳转，不是自动入驻，也不是平台认证。")
    .replaceAll("方向越清楚，后续企业资料页展示页越容易讲明白。", "方向越清楚，后续企业资料页越容易讲明白。")
    .replaceAll("希望建立的企业资料页方向", "希望建立的推荐厂商资料页方向")
    .replaceAll("也不代表已经完成企业资料页上线", "也不代表已经完成推荐厂商资料页上线")
    .replaceAll("真实企业资料页上线前", "真实推荐厂商资料页上线前");
  await writeText("forms/vendor-apply.html", html);
}

async function updateCss() {
  const marker = "/* ========== V1.15：全站导航统一与推荐厂商收口 ========== */";
  let css = await readText("styles.css");
  if (!css.includes(marker)) {
    css += `

${marker}
.content-nav,
.main-nav {
  align-items: center;
  gap: clamp(12px, 2vw, 22px);
}

.content-nav a,
.main-nav a {
  white-space: nowrap;
}

.content-site-header {
  min-height: 72px;
}

.vendor-guide-hero h1,
.project-gallery-hero h1,
.yuxi-brand-hero h1 {
  letter-spacing: -0.04em;
}

@media (max-width: 920px) {
  .content-nav,
  .main-nav.desktop-nav {
    display: none;
  }
}
`;
  }
  await writeText("styles.css", css);
}

// ========== 第四部分：文档、记录与主流程 ==========
async function applyFinalVisibleCleanup() {
  const cleanupTargets = [
    "index.html",
    "data/site-content.js",
    "knowledge/index.html",
    "articles/index.html",
    "forms/vendor-apply.html",
  ];

  const replacements = [
    ["品牌或企业企业资料页", "推荐厂商资料页"],
    ["企业企业资料页", "企业资料页"],
    ["按好物分类展示的品牌或企业资料页", "推荐厂商资料页"],
    ["按柚木好物分类查看品牌或企业资料页", "按柚木好物分类查看推荐厂商资料页"],
    ["柚木空间整体方案样板方向", "柚木空间整体方案参考方向"],
    ["柚木地板工艺与材料样板图", "柚木地板工艺与材料参考图"],
    ["木作材料与空间展示样板图", "木作材料与空间展示参考图"],
    ["柚木家具好物与工坊样板图", "柚木家具好物与工坊参考图"],
    ["样板资料", "参考资料"],
    ["了解企业资料未来会如何组织", "了解企业资料如何整理和核对"],
    ["了解未来站内企业会员资料页会展示哪些内容。", "了解站内企业会员资料页会展示哪些内容，以及公开资料与正式推荐之间的边界。"],
    ["企业资料页展示页", "企业资料页"],
    ["当前资料状态", "资料状态"],
    ["企业微信二维码占位", "企业微信二维码"],
    ["高级 SVG 视觉占位", "高级 SVG 临时视觉"],
    ["占位资料", "临时资料"],
    ["占位联系方式", "待替换联系方式"],
    ["此处为待替换联系方式，上线前必须替换为项目主体真实联系方式。", "正式联系方式将在上线前补充为项目主体真实联系方式。"],
    ["非真实成交案例。真实案例上线前需取得图片、文字和客户授权。", "非真实项目记录。案例资料上线前需取得图片、文字和客户授权。"],
  ];

  for (const target of cleanupTargets) {
    let text = await readText(target);
    for (const [from, to] of replacements) {
      text = text.replaceAll(from, to);
    }
    if (target === "vendors/index.html" && !text.includes("资料准备越具体")) {
      text = text.replace(
        "<p>如果企业希望在柚喜饰界站内建立好物分类企业资料页，可以先准备企业资料、产品资料、图片授权、案例材料、联系方式和服务边界说明。</p>",
        "<p>如果企业希望在柚喜饰界站内建立好物分类企业资料页，可以先准备企业资料、产品资料、图片授权、案例材料、联系方式和服务边界说明。</p>\n        <p>资料准备越具体，页面越能减少误解。比如地板方向要说明规格、安装和维护，整装方向要说明空间配合和服务边界，户外方向要说明耐候、结构和维护周期。柚喜会优先帮助企业把这些信息整理成用户能读懂、也便于后续核对的资料顺序。</p>"
      );
    }
    await writeText(target, text);
  }
}

async function appendDoc(relativePath, title, body) {
  let text = await readText(relativePath);
  if (!text.includes(title)) {
    text = `${text.trim()}\n\n${title}\n\n${body}\n`;
    await writeText(relativePath, text);
  }
}

async function updateDocs() {
  await appendDoc(
    "custom/client-preview-note.md",
    "## 17. V1.15 全站导航与推荐厂商收口",
    "V1.15 已完成全站导航统一、推荐厂商命名回归、内容单页化和站内企业资料页逻辑收口。前台主导航统一为：首页、认识柚喜、柚木知识、好物方案、推荐厂商、社群交流；“会员站”不再作为主导航名称，只在正文中解释为站内企业会员资料页体系。"
  );
  await appendDoc(
    "custom/launch-checklist.md",
    "## V1.15 全站导航与推荐厂商收口复核",
    "- 确认首页和全部内页主导航一致，并使用“推荐厂商”而不是“会员站”。\n- 确认知识和方案栏目首页只承担导览与摘要，不把正文拆散堆在栏目页。\n- 确认推荐厂商页说明为柚喜饰界站内企业会员资料页体系。\n- 确认公开资料观察库不等于正式推荐厂商。\n- 确认厂商申请页为企业资料页申请摘要，不表现为自动入驻或平台认证。"
  );
  await appendDoc(
    "custom/public-review-checklist.md",
    "## V1.15 人工验收新增项",
    "- [ ] 首页与内页桌面导航是否完全一致。\n- [ ] 移动端菜单是否统一显示：首页、认识柚喜、柚木知识、好物方案、推荐厂商、社群交流。\n- [ ] 推荐厂商是否被理解为站内企业资料页体系，而不是外部网站跳转。\n- [ ] 公开资料观察库是否没有被误解为正式推荐厂商。\n- [ ] 申请页是否仍为静态摘要生成和人工资料确认流程。"
  );
}

async function writeRecord() {
  const record = `# 版本记录：v1.15-navigation-content-single-page-and-vendor-logic-finalize

## 1. 本轮修改目标

本轮目标是完成“V1.15 全站导航统一、内容单页化与推荐厂商逻辑收口版”。重点不是继续打补丁，而是把首页和内页导航彻底统一，把前台主导航命名从“会员站”恢复为用户更容易理解的“推荐厂商”，同时保留正文中对站内企业会员资料页体系的解释。

## 2. 当前问题

V1.14.1 后仍存在首页和内页导航结构不一致、主导航命名不符合用户理解、部分栏目仍有资料页和样板页口吻、推荐厂商与公开资料观察库关系不够清楚的问题。公网验收还反馈旧版本语言曾出现在知识页，因此本轮先执行本地搜索，确认本地没有 V1.10、资料入口、内容入口、当前页面等旧词。

## 3. 全站导航统一

本轮统一公开 HTML 的桌面导航和移动菜单，前台主导航为：首页、认识柚喜、柚木知识、好物方案、推荐厂商、社群交流。根目录、二级目录和三级目录分别按目录深度生成正确路径。

## 4. 推荐厂商命名回归

前台主导航和主要入口统一使用“推荐厂商”。正文中继续说明推荐厂商板块的内部逻辑是柚喜饰界站内企业会员资料页体系，不是外部网站跳转，不是平台认证名单，也不是交易担保。

## 5. 内容单页化处理

知识首页和方案首页继续作为导览页，只保留精选摘要、分类摘要和链接；独立文章、独立专题仍由各自 HTML 页面承载正文。长尾 guides 和 topics 文件保留以避免旧链接失效，但不作为主导航体验的核心入口。

## 6. 认识柚喜重修

认识柚喜页继续承担品牌说明功能，强调从柚木知识、好物空间、企业资料到社群交流的完整路径，并把推荐厂商解释为站内企业资料页体系的一部分。

## 7. 柚木知识重修

知识页清理旧版本语言与入口化表达，保留新手先读、按问题查找和 FAQ 的导览结构。重点文章如价格差异文章继续作为独立文章承载完整正文。

## 8. 好物方案重修

好物方案首页继续以五类生活场景做导览，正文判断放在五个独立专题页中完成。首页只负责帮助用户从生活场景进入对应专题，并自然关联推荐厂商资料。

## 9. 推荐厂商逻辑收口

推荐厂商页重写为“推荐厂商”主入口，说明什么是推荐厂商、五类推荐方向、站内企业会员资料页包含什么、公开资料观察库的边界，以及如何申请建立推荐厂商资料页。

## 10. 公开资料观察库调整

公开资料观察库继续作为外部公开资料的观察和学习入口，不等于正式推荐厂商，不代表已入驻，不代表平台认证，也不构成交易担保。

## 11. 厂商申请页同步

厂商申请页命名调整为“申请建立推荐厂商资料页”，保留摘要生成逻辑，不修改 \`forms/form.js\`。页面说明申请是站内企业资料页准备流程，不是自动入驻或平台认证。

## 12. 栏目关联补充

知识、方案、推荐厂商、观察库、申请页和社群交流之间继续保留自然关联，避免栏目孤岛；同时不恢复文章、案例、咨询表单为一级导航。

## 13. 视觉系统统一

styles.css 增加 V1.15 导航统一样式，减少首页与内页桌面导航差异，并继续保持移动端菜单可由统一 nav 源克隆生成。

## 14. 发布预检脚本升级

发布预检继续检查公开 HTML 和数据源中的风险表达、机械表达、路径错误和普通咨询表单入口。V1.15 额外强调主导航不能再使用“会员站”作为前台命名。

## 15. 本地验证结果

本轮按要求运行语法、链接、编码、内容深度和发布预检，最终结果以终端验证输出为准。

## 16. 公网预览地址

https://yinuocheng123-cloud.github.io/youmu/

## 17. 未完成项

真实电话、邮箱、备案信息、最终二维码、真实企业资料、图片授权、联系方式、案例材料和服务边界仍待补齐。

## 18. 资料真实性处理说明

本轮没有新增真实厂商、真实案例、真实认证或真实资质。推荐厂商资料页仍需人工确认企业资料、图片授权、联系方式、案例材料和服务边界。

## 19. 后台与交易能力说明

本轮没有新增后台、登录、商城、支付或数据库，没有新增购物车、价格体系、在线下单或立即购买，也没有修改 GitHub Actions workflow。
`;
  await writeText("custom/notes/v1.15-navigation-content-single-page-and-vendor-logic-finalize.md", record);
}

await updateAllNavigation();
await updateDataSource();
await updateHomePage();
await updateAboutPage();
await updateKnowledgeIndex();
await updateSolutionsIndex();
await updateVendorPages();
await updateVendorApplyPage();
await updateCss();
await applyFinalVisibleCleanup();
await updateDocs();
await writeRecord();

console.log("V1.15 navigation and vendor logic finalized.");
