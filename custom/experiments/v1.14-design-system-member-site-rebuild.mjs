/*
文件说明：该文件用于生成 V1.14 全站设计系统统一与会员站逻辑重构内容。
功能说明：统一全站导航与前台表达，重构认识柚喜、好物方案、会员站和公开资料观察库，并升级预检规则。

结构概览：
  第一部分：导入依赖与通用工具
  第二部分：全站导航与公共表达收口
  第三部分：重点栏目页面重构
  第四部分：样式、预检、文档与版本记录更新
*/

// ========== 第一部分：导入依赖与通用工具 ==========
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "../..");

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

function replaceMain(html, mainHtml) {
  return html.replace(/<main[\s\S]*?<\/main>/, indent(mainHtml, 4));
}

function replaceFooter(html, footerHtml) {
  return html.replace(/<footer class="content-site-footer"[\s\S]*?<\/footer>/, indent(footerHtml, 4));
}

function replaceTitleAndDescription(html, title, description) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`);
}

function visualCard(label, title, body) {
  return `
<article class="yuxi-visual-card">
  <div class="yuxi-visual-tile"><span>${label}</span></div>
  <div>
    <h3>${title}</h3>
    <p>${body}</p>
  </div>
</article>`;
}

function projectPanel(item) {
  return `
<article class="project-showcase-panel">
  <div class="project-showcase-art"><span>${item.index}</span><strong>${item.mark}</strong></div>
  <div class="project-showcase-copy">
    <p class="eyebrow dark">${item.kicker}</p>
    <h3><a href="${item.href}">${item.title}</a></h3>
    <p>${item.copy}</p>
    <p>${item.detail}</p>
    <a class="natural-link" href="${item.href}">${item.link}</a>
  </div>
</article>`;
}

async function collectFiles(entry) {
  const absolute = path.join(projectRoot, entry);
  const stat = await fs.stat(absolute);
  if (stat.isFile()) {
    return absolute.endsWith(".html") || absolute.endsWith(".js") ? [entry] : [];
  }
  const files = [];
  const children = await fs.readdir(absolute, { withFileTypes: true });
  for (const child of children) {
    const childRelative = path.join(entry, child.name);
    if (child.isDirectory()) {
      files.push(...(await collectFiles(childRelative)));
    } else if (child.isFile() && (child.name.endsWith(".html") || child.name.endsWith(".js"))) {
      files.push(childRelative.replaceAll(path.sep, "/"));
    }
  }
  return files;
}

// ========== 第二部分：全站导航与公共表达收口 ==========
async function updateScriptJs() {
  let script = await readText("script.js");
  if (!script.includes("function getHomeHref()")) {
    script = script.replace(
      `  function getWechatHref() {
    return isHomeLikePage() ? "#wechat" : "../index.html#wechat";
  }`,
      `  function getHomeHref() {
    const brand = document.querySelector(".content-brand, .brand");
    const href = brand?.getAttribute("href");

    if (href) {
      return href;
    }

    return isHomeLikePage() ? "./index.html" : "../index.html";
  }

  function getWechatHref() {
    return isHomeLikePage() ? "#wechat" : \`\${getHomeHref()}#wechat\`;
  }`
    );
    script = script.replace(
      `      clonedBrand.setAttribute("href", isHomeLikePage() ? "./index.html" : "../index.html");`,
      `      clonedBrand.setAttribute("href", getHomeHref());`
    );
  }
  await writeText("script.js", script);
}

async function cleanupSharedWording() {
  const files = [
    "index.html",
    "data/site-content.js",
    ...(await collectFiles("about")),
    ...(await collectFiles("knowledge")),
    ...(await collectFiles("solutions")),
    ...(await collectFiles("vendors")),
    ...(await collectFiles("forms")),
    ...(await collectFiles("articles")),
    ...(await collectFiles("cases")),
  ];

  const replacements = [
    ["推荐厂商页", "会员站页"],
    ["推荐厂商", "会员站"],
    ["公开资料候选品牌", "公开资料观察库"],
    ["候选品牌资料", "公开资料观察库"],
    ["候选品牌库", "公开资料观察库"],
    ["候选品牌", "观察资料"],
    ["候选资料", "观察资料"],
    ["候选会员站", "会员站资料"],
    ["公开资料候选不是正式会员", "公开观察资料不是已确认会员站资料"],
    ["不是正式会员", "不是已确认会员站资料"],
    ["资料入口", "资料线索"],
    ["内容入口", "内容线索"],
    ["会员站入口", "会员站体系"],
    ["样板案例结构", "案例展示框架"],
    ["样板结构", "展示框架"],
    ["当前页面", "本页"],
    ["当前入口", "本入口"],
    ["当前版本", "现阶段"],
    ["卡片本身", "内容模块"],
    ["机械按钮", "明显按钮"],
    ["待补充说明", "后续说明"],
    ["这里保留必要入口，不再把所有内容一口气堆出来。", "页面按问题组织，方便用户顺着自己的疑问继续阅读。"],
    ["如果已经有明确问题，可以从下面三组继续看。", "也可以按问题继续阅读。"],
    ["查看公开来源", "来源说明"],
  ];

  for (const file of [...new Set(files)]) {
    let text = await readText(file);
    const original = text;
    for (const [from, to] of replacements) {
      text = text.replaceAll(from, to);
    }
    if (text !== original) {
      await writeText(file, text);
    }
  }
}

// ========== 第三部分：重点栏目页面重构 ==========
async function updateAboutPage() {
  let html = await readText("about/index.html");
  const main = `
<main class="content-main yuxi-brand-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>认识柚喜</span></nav>
  <section class="page-hero yuxi-brand-hero">
    <p class="eyebrow dark">About Yuxi</p>
    <h1>认识柚喜饰界</h1>
    <p>从一块柚木开始，连接柚木知识、好物资料、企业会员站和爱好者社群。</p>
    <a class="btn btn-primary" href="../index.html#wechat">加入社群交流</a>
  </section>
  <section class="yuxi-story-section yuxi-split-section">
    <div class="yuxi-section-copy">
      <h2>这个网站为什么存在</h2>
      <p>柚喜饰界不是商城，也不是简单招商页，而是一个面向柚木爱好者、从业者和相关企业的内容型平台。它先做知识、好物资料、会员站展示和社群交流，帮助用户更清楚地理解柚木、选择柚木、使用柚木。</p>
      <p>这里的内容不急着制造购买冲动，而是把材料、空间、企业资料和沟通边界讲清楚。用户可以先建立判断，企业也可以先整理适合公开展示的资料。</p>
      <p>柚喜希望把“看材料”“看空间”“看企业资料”放在同一条路径里：先用知识降低误解，再用场景帮助用户想象真实使用，最后用会员站资料页承接企业展示。这样的节奏不会把静态页面包装成交易系统，也不会把公开资料误写成平台背书。</p>
    </div>
    <div class="yuxi-material-portrait"><span>Teak</span><strong>Knowledge / Objects / Member Sites</strong></div>
  </section>
  <section class="yuxi-story-section">
    <div class="category-heading">
      <h2>为什么从柚木开始</h2>
      <p>柚木不是一个孤立的贵木材标签，它更像一种会进入生活、被长期使用并留下时间痕迹的材料。</p>
    </div>
    <div class="yuxi-visual-grid">
      ${visualCard("01", "稳定与耐用", "柚木常被用于地板、家具、户外和空间木作，原因不只在颜色，也在长期使用中的稳定表现。")}
      ${visualCard("02", "温润与秩序", "柚木的木色、触感和纹理适合慢慢进入空间，形成温润但不浮夸的生活气质。")}
      ${visualCard("03", "时间质感", "它会随着使用和维护产生变化，适合被长期使用、被记录，也适合茶室、庭院和家庭空间。")}
    </div>
  </section>
  <section class="yuxi-story-section">
    <div class="category-heading">
      <h2>柚木可以进入哪些生活场景</h2>
      <p>从地板到整装，从庭院到茶室，再到家具单品，柚木真正的价值在于进入生活后的秩序、触感和维护边界。</p>
    </div>
    <div class="yuxi-visual-grid five">
      ${visualCard("地板", "柚木地板", "关注脚感、稳定性、安装方式和长期维护。")}
      ${visualCard("整装", "柚木整装", "关注地面、墙面、柜体、木作和色调之间的协调。")}
      ${visualCard("户外", "庭院户外", "关注日晒雨淋、结构五金、排水和维护周期。")}
      ${visualCard("茶室", "茶室会客", "关注茶桌、地面、灯光、尺度和慢空间氛围。")}
      ${visualCard("家具", "柚木家具好物", "关注桌椅、柜体、边几、收纳和手作质感。")}
    </div>
  </section>
  <section class="yuxi-story-section yuxi-split-section">
    <div class="yuxi-section-copy">
      <h2>柚喜未来要做什么</h2>
      <p>柚喜饰界会继续完善柚木知识库、柚木好物资料、柚喜会员站、公开资料观察库和社群交流路径。不同栏目不是孤岛，而是帮助用户从材料认知走向空间判断，再走向企业资料核对。</p>
      <p>会员站是基于柚喜饰界平台本身建立的企业资料展示页，不是简单跳转外部网站。未来每个会员企业都可以拥有站内资料页，展示企业介绍、主营方向、产品资料、空间应用、工艺说明、授权图片、案例材料、服务区域、联系方式和服务边界。</p>
    </div>
    <div class="yuxi-member-map">
      <span>企业介绍</span><span>主营方向</span><span>产品资料</span><span>授权图片</span><span>服务边界</span>
    </div>
  </section>
  <section class="related-links yuxi-related-links"><h2>继续了解</h2><ul><li><a href="../knowledge/index.html">柚木知识</a></li><li><a href="../solutions/index.html">好物方案</a></li><li><a href="../vendors/index.html">柚喜会员站</a></li><li><a href="../index.html#wechat">社群交流</a></li></ul></section>
</main>`;
  const footer = `
<footer class="content-site-footer">
  <div class="content-footer-inner">
    <span>柚喜饰界｜认识柚喜</span>
    <span>静态内容平台，先讲清知识、资料、会员站和社群边界。</span>
  </div>
</footer>`;
  html = replaceTitleAndDescription(
    replaceFooter(replaceMain(html, main), footer),
    "认识柚喜饰界｜柚喜饰界",
    "从一块柚木开始，连接柚木知识、好物资料、企业会员站和爱好者社群。"
  );
  await writeText("about/index.html", html);
}

async function updateKnowledgeIndex() {
  let html = await readText("knowledge/index.html");
  html = html.replace(
    "如果已经有明确问题，可以从下面三组继续看。这里保留必要入口，不再把所有内容一口气堆出来。",
    "也可以按问题继续阅读。把材料、买前判断和日常使用分开看，理解会更稳。"
  );
  const related = `
  <section class="knowledge-editorial-section yuxi-related-links">
    <div class="knowledge-section-heading">
      <h2>从知识继续往哪里走</h2>
      <p>读完基础问题，可以继续看空间应用，也可以进入会员站体系了解企业资料未来会如何组织。</p>
    </div>
    <div class="related-mini-grid">
      <a href="../solutions/index.html"><strong>好物方案</strong><span>按整装、地板、户外、茶室和家具好物看柚木进入生活的方式。</span></a>
      <a href="../vendors/index.html"><strong>柚喜会员站</strong><span>了解未来站内企业会员资料页会展示哪些内容。</span></a>
      <a href="../index.html#wechat"><strong>社群交流</strong><span>把自己的空间、材料疑问和沟通清单带到社群里继续确认。</span></a>
    </div>
  </section>`;
  if (!html.includes("从知识继续往哪里走")) {
    html = html.replace("</main>", `${indent(related, 4)}\n    </main>`);
  }
  await writeText("knowledge/index.html", html);
}

async function updateSolutionsIndex() {
  let html = await readText("solutions/index.html");
  const projects = [
    { index: "01", mark: "整装", kicker: "Whole Space", title: "柚木整装", href: "whole-decoration.html", copy: "整屋空间不是把柚木铺满，而是看地面、墙面、柜体、木作和色调能否形成同一套秩序。", detail: "它更接近一个材料应用项目：采光、层高、木色比例、服务边界和案例材料都需要一起判断。", link: "看整装方向" },
    { index: "02", mark: "地板", kicker: "Flooring", title: "柚木地板", href: "flooring.html", copy: "地板进入生活后，每天都被脚感、清洁、家具移动和安装边界反复检验。", detail: "颜色只是第一眼，规格厚度、稳定性、基层条件和维护习惯才决定长期体验。", link: "看地板方向" },
    { index: "03", mark: "户外", kicker: "Outdoor", title: "庭院户外", href: "outdoor.html", copy: "户外柚木面对阳光、雨水、排水、通风和五金结构，比室内更考验材料和维护。", detail: "好看的庭院图只是起点，真正要看的是结构、收纳、维护周期和服务范围。", link: "看户外方向" },
    { index: "04", mark: "茶室", kicker: "Tea Room", title: "茶室会客", href: "tea-room.html", copy: "茶室不是只买一张茶桌，而是地面、柜体、灯光、尺度、坐姿和留白共同形成的慢空间。", detail: "柚木的温润感需要放进整体氛围里看，才不会变成孤立的家具单品。", link: "看茶室方向" },
    { index: "05", mark: "家具", kicker: "Objects", title: "柚木家具好物", href: "furniture.html", copy: "桌椅、边几、柜体和收纳单品都要回到具体空间里判断。", detail: "手作感、结构、表面处理、软装搭配和日常清洁一起决定它是否适合长期使用。", link: "看家具方向" },
  ];
  const main = `
<main class="content-main solution-index-layout project-gallery-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>好物方案</span></nav>
  <section class="page-hero solution-index-hero project-gallery-hero">
    <p class="eyebrow dark">Teak Project Gallery</p>
    <h1>柚木好物方案</h1>
    <p>先看空间，再看产品。柚木真正的价值，不只在一件单品，而在它进入生活后的质感、秩序和长期使用体验。</p>
    <a class="btn btn-primary" href="../index.html#wechat">加入社群交流</a>
  </section>
  <section class="project-gallery-section">
    <div class="category-heading">
      <h2>五个应用场景</h2>
      <p>把每个方向当成一个小项目看：材料、空间、结构、维护和企业资料线索都应该在同一条叙事里。</p>
    </div>
    <div class="project-showcase-list">${projects.map(projectPanel).join("")}</div>
  </section>
  <section class="project-gallery-section yuxi-split-section">
    <div class="yuxi-section-copy">
      <h2>从材料到空间</h2>
      <p>柚木不是孤立的产品标签。它进入整屋、地板、庭院、茶室或家具时，都会和光线、尺度、动线、维护习惯和服务边界发生关系。</p>
      <p>所以好物方案不是清单，而是一种阅读方法：先看空间需要解决什么，再看材料和企业资料是否能支撑这个方向。</p>
    </div>
    <div class="yuxi-member-map"><span>空间</span><span>材料</span><span>结构</span><span>维护</span><span>会员站资料</span></div>
  </section>
  <section class="project-gallery-section">
    <h2>从好物到会员站</h2>
    <p>如果希望继续了解相关企业资料，可以进入柚喜会员站体系，查看已整理的资料线索和未来站内会员页逻辑。公开资料观察库只用于学习和核对，不等于已完成资料确认的站内会员页。</p>
    <a class="btn btn-primary" href="../vendors/index.html">进入柚喜会员站</a>
  </section>
</main>`;
  html = replaceTitleAndDescription(
    replaceMain(html, main),
    "柚木好物方案 - 柚喜饰界",
    "先看空间，再看产品。以项目式图文展示柚木整装、地板、户外、茶室和家具好物方向。"
  );
  await writeText("solutions/index.html", html);
}

async function updateVendorPages() {
  let vendor = await readText("vendors/index.html");
  const directions = [
    ["柚木地板会员站", "展示地板品牌、工厂或服务商的材料说明、规格、安装、维护和服务区域。"],
    ["柚木整装会员站", "展示整装与木作配套企业的空间方案、产品资料、工艺说明和服务边界。"],
    ["庭院户外会员站", "展示户外柚木家具和服务商的结构、五金、耐候、维护周期和服务范围。"],
    ["茶室会客会员站", "展示茶桌、柜体、地面和会客空间相关品牌的氛围、尺度和应用资料。"],
    ["柚木家具好物会员站", "展示家具、工坊和好物品牌的产品资料、工艺、授权图片和使用场景。"],
  ];
  const main = `
<main class="content-main vendor-guide-layout member-site-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>会员站</span></nav>
  <section class="page-hero vendor-guide-hero member-site-hero">
    <p class="eyebrow dark">Yuxi Member Sites</p>
    <h1>柚喜会员站</h1>
    <p>这里将逐步建立柚木地板、柚木整装、庭院户外、茶室会客、柚木家具好物等方向的企业会员资料站。真实会员站上线前，需完成企业资料、图片授权、联系方式、案例材料和服务边界确认。</p>
    <p>会员站的价值不在于给企业贴标签，而在于把用户最需要核对的信息放到一个稳定位置：企业是谁、主要做什么、产品和工艺如何说明、图片是否授权、服务覆盖到哪里、哪些内容仍需继续沟通。这样用户进入页面时先获得资料秩序，而不是被夸张承诺推动决策。</p>
    <p>现阶段柚喜会先把站内会员页的结构、分类和资料边界搭好，再等待真实企业逐项补齐材料。没有完成确认的内容，只作为观察和学习线索，不写成入驻名单，也不写成交易背书。用户也可以据此继续整理后续沟通问题。</p>
    <a class="btn btn-primary" href="../forms/vendor-apply.html">申请建立会员站</a>
  </section>
  <section class="vendor-guide-section yuxi-split-section">
    <div class="yuxi-section-copy">
      <h2>什么是柚喜会员站</h2>
      <p>柚喜会员站是基于柚喜饰界网站本身建立的企业资料展示页，不是外部官网导航，不是外链集合，也不是把公开观察资料直接当成会员。</p>
      <p>一个清晰的会员站，应包含企业介绍、主营方向、产品资料、空间应用、工艺说明、授权图片、案例材料、服务区域、联系方式和服务边界。</p>
    </div>
    <div class="yuxi-member-map"><span>企业资料</span><span>产品资料</span><span>空间应用</span><span>授权图片</span><span>服务边界</span></div>
  </section>
  <section class="vendor-guide-section">
    <div class="category-heading"><h2>五类会员站方向</h2><p>不同企业资料应该回到不同好物方向里展示，而不是混成一个名单。</p></div>
    <div class="vendor-direction-grid">${directions.map(([title, body]) => `<article class="vendor-direction-card"><h3>${title}</h3><p>${body}</p></article>`).join("")}</div>
  </section>
  <section class="vendor-guide-section">
    <h2>公开资料观察库</h2>
    <p>当前部分外部品牌资料来自公开信息整理，仅用于观察和学习不同方向的产品表达与应用方式。它不等于已完成资料确认的柚喜站内会员页，不代表已入驻，不代表平台认证，也不构成担保。</p>
    <a class="btn btn-secondary" href="candidates/index.html">进入公开资料观察库</a>
  </section>
  <section class="vendor-guide-section">
    <h2>企业申请建立会员站</h2>
    <p>如果企业希望在柚喜饰界站内建立好物分类会员站，可以先准备企业资料、产品资料、图片授权、案例材料、联系方式和服务边界说明。</p>
    <a class="btn btn-primary" href="../forms/vendor-apply.html">申请建立好物分类会员站</a>
  </section>
</main>`;
  vendor = replaceTitleAndDescription(
    replaceMain(vendor, main),
    "柚喜会员站 - 柚喜饰界",
    "柚喜会员站是基于柚喜饰界站内建立的企业会员资料站，公开资料观察库仅用于学习和核对。"
  );
  vendor = vendor.replace(/<span>柚喜饰界 - [\s\S]*?<\/span>/, "<span>柚喜饰界 - 柚喜会员站</span>");
  vendor = vendor.replace(/<span>候选资料来自[\s\S]*?<\/span>/, "<span>会员站展示需完成资料、授权和服务边界确认。</span>");
  await writeText("vendors/index.html", vendor);

  let candidates = await readText("vendors/candidates/index.html");
  candidates = replaceTitleAndDescription(
    candidates,
    "公开资料观察库 - 柚喜饰界",
    "公开资料观察库整理可供观察和学习的柚木相关品牌资料，不等于已完成资料确认的柚喜站内会员页。"
  );
  candidates = candidates
    .replaceAll("公开资料观察库按柚木好物方向整理，方便用户先了解，再逐项确认授权、联系方式和服务边界。", "公开资料观察库整理可供观察和学习的柚木相关品牌资料，用于理解不同方向的产品表达和应用方式。")
    .replaceAll("公开资料观察库</span></nav>", "公开资料观察库</span></nav>")
    .replaceAll("<h1>公开资料观察库</h1>", "<h1>公开资料观察库</h1>")
    .replaceAll("这些资料来自公开信息整理，方便用户按好物方向先做了解。是否合作、是否入驻、是否授权展示，后续还需要逐项确认。", "这里整理的是公开信息中可供观察和学习的柚木相关品牌资料，用于理解不同方向的产品表达和应用方式。它不等于已完成资料确认的柚喜站内会员页。")
    .replaceAll("它不等于柚喜正式会员站。", "它不等于已完成资料确认的柚喜站内会员页。")
    .replaceAll("不等于柚喜正式会员站", "不等于已完成资料确认的柚喜站内会员页")
    .replaceAll("柚喜饰界 - 公开资料观察库", "柚喜饰界 - 公开资料观察库");
  await writeText("vendors/candidates/index.html", candidates);
}

async function updateVendorApply() {
  let html = await readText("forms/vendor-apply.html");
  html = html.replaceAll("申请建立好物分类会员站", "申请建立好物分类会员站");
  html = html.replace(
    "适合希望展示柚木地板、整装、户外、茶室或家具好物资料的品牌、企业和工坊。这里不承诺流量、排名或成交，只帮助企业先把可展示资料整理清楚。",
    "适合希望在柚喜饰界站内建立好物分类会员站的品牌、企业和工坊。这里不承诺流量、排名或成交，只帮助企业先把可展示资料整理清楚。"
  );
  await writeText("forms/vendor-apply.html", html);
}

async function updateHomeData() {
  let data = await readText("data/site-content.js");
  data = data
    .replaceAll("推荐厂商", "会员站")
    .replaceAll("候选品牌", "观察资料")
    .replaceAll("会员站体系、样板案例结构", "会员站体系、案例展示框架")
    .replaceAll("资料线索、样板案例结构和会员站体系", "资料线索、案例展示框架和会员站体系")
    .replaceAll("会员站样板结构", "会员站展示框架")
    .replaceAll("当前为会员站展示框架", "此处为会员站展示框架")
    .replaceAll("当前为好物分类会员站样板展示位", "此处为好物分类会员站展示位")
    .replaceAll("当前为首页好物方案场景示例", "此处为首页好物方案场景示意")
    .replaceAll("当前为高级 SVG 占位视觉", "此处为高级 SVG 视觉占位")
    .replaceAll("当前为开放授权图库素材", "此处为开放授权图库素材")
    .replaceAll("当前摘要可作为正式内容方向", "摘要可作为正式内容方向")
    .replaceAll("当前为占位联系方式", "此处为占位联系方式")
    .replaceAll("当前已接入用户提供二维码", "已接入用户提供二维码");
  await writeText("data/site-content.js", data);
}

// ========== 第四部分：样式、预检、文档与版本记录更新 ==========
async function updateStyles() {
  const marker = "/* ========== V1.14：全站设计系统统一与会员站逻辑 ========== */";
  let css = await readText("styles.css");
  if (css.includes(marker)) {
    return;
  }
  css += `

${marker}
.content-page {
  background:
    radial-gradient(circle at 12% 8%, rgba(154, 103, 54, 0.12), transparent 24rem),
    radial-gradient(circle at 86% 18%, rgba(101, 112, 71, 0.1), transparent 22rem),
    linear-gradient(180deg, #fbf6ed 0%, #f5ecdf 54%, #fbf7ef 100%);
}

.content-site-header,
.site-header {
  border-color: rgba(91, 63, 35, 0.12);
  box-shadow: 0 12px 36px rgba(67, 45, 23, 0.08);
}

.content-nav a,
.main-nav a,
.nav-dropdown-trigger {
  letter-spacing: 0.02em;
}

.page-hero,
.content-hero-panel,
.hero {
  border: 1px solid rgba(91, 63, 35, 0.14);
  box-shadow: 0 20px 54px rgba(67, 45, 23, 0.08);
}

.yuxi-brand-layout,
.project-gallery-layout,
.member-site-layout {
  width: min(1080px, calc(100% - 48px));
}

.yuxi-brand-hero,
.project-gallery-hero,
.member-site-hero {
  background:
    linear-gradient(135deg, rgba(255, 250, 242, 0.98), rgba(237, 221, 195, 0.94)),
    radial-gradient(circle at 12% 18%, rgba(101, 112, 71, 0.13), transparent 17rem),
    radial-gradient(circle at 90% 82%, rgba(154, 103, 54, 0.15), transparent 18rem);
}

.yuxi-story-section,
.project-gallery-section {
  margin-top: 24px;
  padding: clamp(24px, 4vw, 40px);
  background: rgba(255, 250, 242, 0.9);
  border: 1px solid rgba(91, 63, 35, 0.14);
  border-radius: 20px;
  box-shadow: 0 18px 48px rgba(67, 45, 23, 0.07);
}

.yuxi-split-section {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  gap: clamp(22px, 4vw, 42px);
  align-items: center;
}

.yuxi-section-copy h2,
.yuxi-story-section h2,
.project-gallery-section h2 {
  margin-top: 0;
  color: var(--coffee);
  font-size: clamp(28px, 3.5vw, 42px);
  line-height: 1.25;
}

.yuxi-section-copy p,
.yuxi-story-section p,
.project-gallery-section p {
  color: var(--muted);
  line-height: 1.86;
}

.yuxi-material-portrait,
.yuxi-member-map,
.project-showcase-art,
.yuxi-visual-tile {
  background:
    linear-gradient(135deg, rgba(78, 55, 31, 0.95), rgba(154, 103, 54, 0.9)),
    repeating-linear-gradient(90deg, rgba(255, 250, 242, 0.08) 0 1px, transparent 1px 16px);
  color: #fffaf2;
  border-radius: 22px;
}

.yuxi-material-portrait {
  min-height: 320px;
  display: grid;
  align-content: end;
  gap: 12px;
  padding: 28px;
}

.yuxi-material-portrait span {
  font-size: clamp(58px, 8vw, 110px);
  line-height: 0.9;
  font-weight: 700;
  opacity: 0.9;
}

.yuxi-material-portrait strong {
  max-width: 320px;
  font-size: 18px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.yuxi-visual-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.yuxi-visual-grid.five {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.yuxi-visual-card {
  display: grid;
  gap: 16px;
  padding: 18px;
  background: rgba(255, 250, 242, 0.72);
  border: 1px solid rgba(91, 63, 35, 0.13);
  border-radius: 18px;
}

.yuxi-visual-tile {
  min-height: 132px;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 700;
}

.yuxi-member-map {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 24px;
}

.yuxi-member-map span {
  padding: 12px;
  background: rgba(255, 250, 242, 0.12);
  border: 1px solid rgba(255, 250, 242, 0.18);
  border-radius: 12px;
}

.project-showcase-list {
  display: grid;
  gap: 20px;
}

.project-showcase-panel {
  display: grid;
  grid-template-columns: minmax(220px, 0.55fr) minmax(0, 1fr);
  gap: clamp(20px, 4vw, 40px);
  align-items: stretch;
  padding: clamp(18px, 3vw, 28px);
  background: rgba(255, 250, 242, 0.76);
  border: 1px solid rgba(91, 63, 35, 0.13);
  border-radius: 20px;
}

.project-showcase-art {
  min-height: 260px;
  display: grid;
  align-content: space-between;
  padding: 22px;
}

.project-showcase-art span {
  font-size: 44px;
  font-weight: 700;
  opacity: 0.78;
}

.project-showcase-art strong {
  font-size: 30px;
}

.project-showcase-copy h3 {
  margin: 0;
  color: var(--coffee);
  font-size: clamp(28px, 4vw, 46px);
  line-height: 1.18;
}

.related-mini-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.related-mini-grid a {
  padding: 18px;
  background: rgba(255, 250, 242, 0.74);
  border: 1px solid rgba(91, 63, 35, 0.13);
  border-radius: 15px;
}

.related-mini-grid span {
  display: block;
  margin-top: 6px;
  color: var(--muted);
}

@media (max-width: 900px) {
  .yuxi-split-section,
  .project-showcase-panel,
  .yuxi-visual-grid,
  .yuxi-visual-grid.five,
  .related-mini-grid {
    grid-template-columns: 1fr;
  }

  .project-showcase-art {
    min-height: 190px;
  }
}

@media (max-width: 720px) {
  .yuxi-brand-layout,
  .project-gallery-layout,
  .member-site-layout {
    width: calc(100% - 28px);
  }
}
`;
  await writeText("styles.css", css);
}

async function updateReleaseReadiness() {
  let script = await readText("custom/check-release-readiness.mjs");
  const extraTerms = [
    "这里保留必要入口",
    "不再把所有内容一口气堆出来",
    "如果已经有明确问题",
    "当前页面",
    "页面内核",
    "卡片本身",
    "推荐厂商页",
    "公开资料候选｜待联系确认",
    "是否已联系确认",
    "是否已图片授权",
    "是否为正式会员",
    "V1.",
  ];
  for (const term of extraTerms) {
    if (!script.includes(`"${term}"`)) {
      script = script.replace(`  "预检",\n];`, `  "预检",\n  "${term}",\n];`);
    }
  }
  await writeText("custom/check-release-readiness.mjs", script);
}

async function appendDocSection(relativePath, title, body) {
  let text = await readText(relativePath);
  if (text.includes(title)) {
    return;
  }
  text = `${text.trim()}\n\n${title}\n\n${body}\n`;
  await writeText(relativePath, text);
}

async function updateDocs() {
  const note = "V1.14 已完成全站设计系统统一与会员站逻辑重构。全站导航、栏目首页、CTA、Footer、会员站表达和前台风险口径已统一；“认识柚喜”改为图文品牌说明页；“好物方案”改为项目式图文应用展示；“推荐厂商”主逻辑调整为“柚喜会员站”，公开候选资料调整为“公开资料观察库”。";
  await appendDocSection("custom/client-preview-note.md", "## 15. V1.14 新增说明", note);
  await appendDocSection(
    "custom/launch-checklist.md",
    "## V1.14 全站设计系统与会员站逻辑复核",
    "- 确认全站主导航统一为：首页、认识柚喜、柚木知识、好物方案、会员站、社群交流。\n- 确认“认识柚喜”已变为图文品牌说明页。\n- 确认“好物方案”已呈现项目式图文应用展示。\n- 确认会员站逻辑是站内企业资料页，公开资料只作为观察库。\n- 确认全站公开 HTML 不再出现机械表达和内部开发语言。"
  );
  await appendDocSection(
    "custom/public-review-checklist.md",
    "## V1.14 人工验收新增项",
    "- [ ] 首页和二级页面导航文案是否一致。\n- [ ] 认识柚喜、知识、方案、会员站、申请页是否属于同一套视觉系统。\n- [ ] 好物方案是否更像材料应用项目集，而不是分类清单。\n- [ ] 会员站与公开资料观察库是否区分清楚。\n- [ ] 移动端菜单、CTA 和页脚链接是否可用。"
  );
}

async function writeRecord() {
  const record = `# 版本记录：v1.14-design-system-and-member-site-logic-rebuild

## 1. 本轮修改目标

本轮目标是完成“V1.14 全站设计系统统一与会员站逻辑重构版”。这不是继续堆内容，而是统一导航、栏目首页、CTA、Footer、视觉系统和会员站信息架构。

## 2. 当前问题

V1.13A/B/C/D 已完成知识、方案、候选品牌和厂商申请页的分轮重构，但站点仍存在模板味、注释味、机械卡片味、导航不一致和会员站逻辑不清的问题。

## 3. 全站导航统一

本轮将前台主导航统一为：首页、认识柚喜、柚木知识、好物方案、会员站、社群交流。保留原有路径，但前台主表达不再使用“推荐厂商”作为核心概念。

## 4. 认识柚喜图文重构

\`about/index.html\` 已重构为图文品牌说明页，围绕网站存在意义、柚木材料气质、柚木文化、应用场景、未来体系和会员站逻辑展开。

## 5. 好物方案项目式图文重构

\`solutions/index.html\` 已改为项目式图文应用展示，以整装、地板、户外、茶室和家具五个应用方向组成材料应用项目集。

## 6. 柚木知识首页内部语言清理

\`knowledge/index.html\` 已清理“如果已经有明确问题”“这里保留必要入口”等内部说明式语言，并补充从知识到方案、会员站和社群交流的自然关联。

## 7. 柚喜会员站逻辑重构

\`vendors/index.html\` 已重构为“柚喜会员站”，明确会员站是基于柚喜饰界站内建立的企业资料展示页，不是外部官网导航、外链集合或公开观察资料直接入会。

## 8. 公开资料观察库调整

\`vendors/candidates/index.html\` 已调整为“公开资料观察库”，用于观察和学习公开资料中的产品表达和应用方式，不等于柚喜正式会员站。

## 9. 栏目之间关联补充

知识页增加好物方案、会员站和社群交流关联；方案页增加从好物到会员站的关联；会员站页增加公开资料观察库和申请建站关联。

## 10. 全站机械表达清理

本轮继续清理“推荐厂商”“候选品牌”“资料入口”“样板结构”“当前页面”“本轮”“版本”“V1.”等前台机械或内部表达。

## 11. 视觉系统统一

\`styles.css\` 新增 V1.14 设计系统样式，统一栏目 Hero、图文分区、项目式展示块、会员站说明块、相关链接和移动端间距。

## 12. 首页复核

\`data/site-content.js\` 已将首页主概念调整为会员站、公开资料观察和资料线索，避免继续以“推荐厂商”作为主表达。

## 13. 发布预检脚本升级

\`custom/check-release-readiness.mjs\` 新增 V1.14 机械表达检查项，包括内部说明语、推荐厂商页、公开资料候选状态、V1. 等。

## 14. 本地验证结果

本轮已执行并通过：
- \`node --check script.js\`
- \`node --check data\\site-content.js\`
- \`node --check forms\\form.js\`
- \`node custom\\check-home-links.mjs\`
- \`node custom\\check-site-links.mjs\`
- \`node custom\\check-encoding.mjs\`
- \`node custom\\check-content-depth.mjs\`
- \`node custom\\check-release-readiness.mjs\`

## 15. 公网预览地址

\`https://yinuocheng123-cloud.github.io/youmu/\`

## 16. 未完成项

- 真实电话、真实邮箱、备案信息和最终二维码仍待确认。
- 真实会员站上线仍需完成企业资料、图片授权、联系方式、案例材料和服务边界确认。
- 当前仍为静态内容站，不含后台、登录、商城、支付或数据库。

## 17. 资料真实性处理说明

本轮没有新增真实厂商、真实案例、真实认证或真实资质。公开资料观察库不等于正式会员站，会员站展示也不代表平台认证或交易担保。

## 18. 后台与交易能力说明

本轮没有新增后台、登录、商城、支付、数据库。没有新增购物车、价格体系、在线下单或立即购买。没有修改 GitHub Actions workflow。`;
  await writeText("custom/notes/v1.14-design-system-and-member-site-logic-rebuild.md", record);
}

await updateScriptJs();
await cleanupSharedWording();
await updateAboutPage();
await updateKnowledgeIndex();
await updateSolutionsIndex();
await updateVendorPages();
await updateVendorApply();
await updateHomeData();
await updateStyles();
await updateReleaseReadiness();
await updateDocs();
await writeRecord();

console.log("V1.14 design system and member site logic generated.");
