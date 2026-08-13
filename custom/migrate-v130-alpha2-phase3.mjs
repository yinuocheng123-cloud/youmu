import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const write = (relativePath, content) => fs.writeFileSync(path.join(root, relativePath), content, "utf8");

const metadataChanges = [];

const addClass = (html, classNames) => html.replace(/<body class="([^"]*)"([^>]*)>/, (_, current, suffix) => {
  const classes = new Set(`${current} ${classNames}`.trim().split(/\s+/));
  return `<body class="${[...classes].join(" ")}"${suffix}>`;
});

const updateMetadata = (relativePath, html, change) => {
  const oldOgTitle = change.oldOgTitle || change.oldTitle;
  const newOgTitle = change.newOgTitle || change.newTitle;
  if (change.oldTitle && change.newTitle && !html.includes(`<title>${change.newTitle}</title>`)) {
    if (!html.includes(`<title>${change.oldTitle}</title>`)) throw new Error(`${relativePath}: old title not found`);
    html = html.replace(`<title>${change.oldTitle}</title>`, `<title>${change.newTitle}</title>`);
  }
  if (oldOgTitle && newOgTitle && !html.includes(`property="og:title" content="${newOgTitle}"`)) {
    if (!html.includes(`property="og:title" content="${oldOgTitle}"`)) throw new Error(`${relativePath}: old OG title not found`);
    html = html.replace(`property="og:title" content="${oldOgTitle}"`, `property="og:title" content="${newOgTitle}"`);
  }
  if (change.oldDescription && change.newDescription && !html.includes(change.newDescription)) {
    if (!html.includes(change.oldDescription)) throw new Error(`${relativePath}: old description not found`);
    html = html.replaceAll(change.oldDescription, change.newDescription);
  }
  metadataChanges.push({ path: relativePath, ...change, oldOgTitle, newOgTitle });
  return html;
};

const modernizeLanguage = (html) => html
  .replaceAll("推荐厂商资料", "品牌资料")
  .replaceAll("推荐厂商", "品牌资料")
  .replaceAll("柚木好物索引", "柚木生活索引")
  .replaceAll("柚木好物时", "柚木生活内容时")
  .replaceAll("好物类别", "生活主题")
  .replaceAll("商家表达", "品牌与服务方表达")
  .replaceAll("商家说明", "品牌与服务方说明")
  .replaceAll("向商家确认", "向品牌或服务方确认");

const knowledgePages = {
  "knowledge/topics/flooring-fit-space.html": "地板是否适合某个空间，不能只凭树种或图片判断；还需结合基层、结构、铺装、湿度、采光、使用频率与维护方式。",
  "knowledge/topics/questions-before-vendor.html": "页面用于整理核对问题，不构成对任何品牌、商家或服务方的推荐、认证与交易担保；具体信息仍应以可核验资料和合同为准。",
  "knowledge/topics/teak-bathroom-balcony.html": "材料名称不能替代卫生间或阳台的防水、排水、通风与安装设计；实际使用需按具体空间和施工条件判断。",
  "knowledge/topics/teak-buying-pitfalls.html": "单一颜色、产地、价格或宣传语都不能独立形成材料与品质结论；必要时应结合文件、结构、工艺与服务说明核验。",
  "knowledge/topics/teak-kids-pets-home.html": "有孩子或宠物的家庭还需分别考虑表面处理、边角、清洁、抓挠、滑动和日常维护；木材种类不能替代具体安全判断。",
  "knowledge/topics/why-teak-for-home.html": "柚木是否适合家居空间取决于用途、结构、环境、维护与预算；材料特征不等于对所有家庭和场景的普遍承诺。",
};

const knowledgeMetadata = {
  "knowledge/topics/questions-before-vendor.html": {
    oldTitle: "选柚木品牌或商家前要问哪些问题 - 柚喜饰界",
    newTitle: "选择柚木品牌或服务方前要确认什么｜柚喜饰界",
  },
};

const migrateKnowledge = (relativePath, boundary) => {
  let html = modernizeLanguage(read(relativePath));
  html = addClass(html, "detail-editorial detail-knowledge");
  if (!html.includes("article-layout")) {
    html = html.replace('<main class="content-main">', '<main class="content-main auxiliary-topic-main">');
  }
  html = html
    .replace(/<h2>相关(?:内容|主题)<\/h2>/g, "<h2>继续探索柚木</h2>")
    .replace(/<p class="article-inline-heading"><strong>相关(?:内容|主题)<\/strong><\/p>/g, '<p class="article-inline-heading"><strong>继续探索柚木</strong></p>');

  if (knowledgeMetadata[relativePath]) {
    html = updateMetadata(relativePath, html, knowledgeMetadata[relativePath]);
    html = html.replaceAll("选柚木品牌或商家前要问哪些问题", "选择柚木品牌或服务方前要确认什么");
  }

  if (!html.includes("detail-boundary-note")) {
    const note = `<section class="detail-boundary-note" aria-label="判断边界"><strong>判断边界</strong><p>${boundary}</p></section>`;
    if (html.includes('<section class="content-cta">')) {
      html = html.replace('<section class="content-cta">', `${note}\n      <section class="content-cta">`);
    } else if (html.includes('<section class="article-note">')) {
      html = html.replace('<section class="article-note">', `${note}\n          <section class="article-note">`);
    }
  }

  if (html.includes('<section class="content-cta">')) {
    html = html.replace(/<section class="content-cta">[\s\S]*?<\/section>/, `<section class="content-cta">
        <a class="btn btn-primary" href="../../index.html#wechat">咨询一个柚木问题</a>
        <a class="detail-back-link" href="../index.html">继续探索柚木</a>
      </section>`);
  } else if (!html.includes("detail-consult")) {
    html = html.replace(/(<section class="article-note">[\s\S]*?<\/section>)/, `$1
          <section class="detail-consult" aria-label="咨询柚木问题"><p>如果你正在核对具体材料或使用条件，可以把资料和疑问整理后发给柚喜。</p><a class="btn btn-primary" href="../../index.html#wechat">咨询一个柚木问题</a></section>`);
  }
  write(relativePath, html);
};

const aestheticCase = {
  path: "cases/flooring-selection-sample.html",
  boundary: "本页为常见家庭地面条件的空间参考，不对应真实完工项目；材料、基层、铺装和维护仍需按具体空间核对。",
};

const migrateAestheticCase = ({ path: relativePath, boundary }) => {
  let html = modernizeLanguage(read(relativePath));
  html = addClass(html, "detail-editorial detail-aesthetic detail-aesthetic-essay detail-aesthetic-flooring");
  html = html.replace('<main class="content-main">', '<main class="content-main detail-aesthetic-main">');
  html = html.replace('<a href="index.html">柚木空间参考</a>', '<a href="index.html">柚木美学</a>');
  html = html.replace("<h2>相关内容</h2>", "<h2>更多柚木美学</h2>");
  if (!html.includes("detail-boundary-note")) {
    html = html.replace('<section class="content-cta">', `<section class="detail-boundary-note" aria-label="内容边界"><strong>内容边界</strong><p>${boundary}</p></section>\n      <section class="content-cta">`);
  }
  html = html.replace(/<section class="content-cta">[\s\S]*?<\/section>/, `<section class="content-cta"><a class="btn btn-primary" href="../index.html#wechat">咨询一个柚木空间问题</a><a class="detail-back-link" href="index.html">更多柚木美学</a></section>`);
  write(relativePath, html);
};

const aestheticSolutions = {
  "solutions/flooring.html": {
    modifier: "detail-aesthetic-flooring",
    oldTitle: "柚木地板 - 柚喜饰界",
    newTitle: "柚木地板的空间关系｜柚木美学｜柚喜饰界",
    h1: "柚木地板的空间关系",
    boundary: "本页从地面与空间的关系出发，不构成材料性能、安装效果或服务能力承诺；具体选择仍需核对现场和产品资料。",
  },
  "solutions/furniture.html": {
    modifier: "detail-aesthetic-furniture",
    oldTitle: "柚木家具 - 柚喜饰界",
    newTitle: "柚木家具的空间尺度｜柚木美学｜柚喜饰界",
    h1: "柚木家具的空间尺度",
    boundary: "本页用于理解家具与空间尺度、动线和日常使用的关系，不对应特定产品或品牌，也不构成品质与交付承诺。",
  },
  "solutions/tea-room.html": {
    modifier: "detail-aesthetic-tea-room",
    oldTitle: "柚木茶室空间 - 柚喜饰界",
    newTitle: "柚木茶室的材料与尺度｜柚木美学｜柚喜饰界",
    h1: "柚木茶室的材料与尺度",
    boundary: "本页为茶空间中的材料、比例与使用关系参考，不对应真实完工项目；实际空间仍需结合尺寸、光线与使用方式判断。",
  },
};

const migrateAestheticSolution = (relativePath, config) => {
  let html = modernizeLanguage(read(relativePath));
  html = updateMetadata(relativePath, html, { oldTitle: config.oldTitle, newTitle: config.newTitle });
  html = addClass(html, `detail-editorial detail-aesthetic detail-aesthetic-solution ${config.modifier}`);
  html = html.replace('<a href="index.html">柚木生活</a>', '<a href="../cases/index.html">柚木美学</a>');
  const oldH1 = html.match(/<h1>(.*?)<\/h1>/)?.[1];
  if (oldH1) html = html.replace(`<h1>${oldH1}</h1>`, `<h1>${config.h1}</h1>`);
  html = html.replace(/\s*<a class="btn btn-primary" href="\.\.\/index\.html#wechat">咨询柚木问题<\/a>/, "");
  html = html.replace("<h2>企业资料怎么看</h2>", "<h2>品牌与服务资料怎么看</h2>");
  html = html.replace("<h2>相关内容</h2>", "<h2>更多柚木美学</h2>");
  html = html.replace(/<section class="soft-notice(?: detail-boundary-note)?">[\s\S]*?<\/section>/, `<section class="soft-notice detail-boundary-note"><strong>内容边界</strong><p>${config.boundary}</p></section>`);
  html = html.replace(/<section class="content-cta">[\s\S]*?<\/section>/, `<section class="content-cta"><a class="btn btn-primary" href="../index.html#wechat">咨询一个柚木空间问题</a><a class="detail-back-link" href="../cases/index.html">更多柚木美学</a></section>`);
  write(relativePath, html);
};

const lifestylePages = {
  "solutions/goods/aged-teak-flooring.html": "使用痕迹和颜色变化不能单独证明材料年代、来源或性能；本页只讨论长期使用后的空间观感与维护判断。",
  "solutions/goods/sunroom-teak-floor.html": "本页为阳光房地面使用参考，不对应真实完工项目；持续日晒、温差、基层与维护方式需按具体空间评估。",
  "solutions/goods/teak-garden-dining.html": "本页为花园用餐场景参考，不对应特定产品或真实项目；结构、排水、五金与维护仍需结合实际环境确认。",
  "solutions/goods/teak-outdoor-bench.html": "本页为户外长椅的使用判断参考，不代表特定产品通过耐候或安全验证；结构、安装与维护应分别核对。",
  "solutions/goods/teak-patio-furniture.html": "本页为露台家具的生活场景参考，不对应特定品牌或产品；光照、雨水、收纳和维护条件会影响长期表现。",
  "solutions/goods/teak-wall-panel.html": "本页讨论护墙板与空间比例、灯光和材料搭配，不对应真实完工项目，也不对材料稀缺性、等级或价值作判断。",
};

const migrateLifestyle = (relativePath, boundary) => {
  let html = modernizeLanguage(read(relativePath));
  html = addClass(html, "detail-editorial detail-lifestyle detail-lifestyle-archive");
  html = html.replace('<h2 id="related-title">你可能还会喜欢</h2>', '<h2 id="related-title">继续了解柚木生活</h2>');
  if (!html.includes("detail-boundary-note")) {
    html = html.replace('<section class="goods-source-section"', `<section class="detail-boundary-note" aria-label="资料边界"><strong>资料边界</strong><p>${boundary}</p></section>\n\n      <section class="goods-source-section"`);
  }
  if (!html.includes("detail-consult")) {
    html = html.replace('    </section>\n  </main>', `      <section class="detail-consult" aria-label="咨询柚木问题"><p>如果你正在核对具体材料、空间条件或使用方式，可以把问题整理后发给柚喜。</p><a class="btn btn-primary" href="../../index.html#wechat">把具体问题发给柚喜</a></section>\n    </section>\n  </main>`);
  }
  write(relativePath, html);
};

const migrateWorkshopSample = () => {
  const relativePath = "vendors/workshop-sample.html";
  const oldTitle = "选择柚木家具品牌或工坊时看什么｜柚喜饰界";
  const newTitle = "品牌资料展示样板｜柚喜饰界";
  const oldDescription = "从家具品类、材料工艺、定制范围、交付与售后责任出发，了解选择柚木家具品牌或工坊时需要确认的信息。";
  const newDescription = "用于说明柚喜饰界品牌资料页的展示结构；本页为样板，不对应真实品牌或企业。";
  let html = read(relativePath);
  html = updateMetadata(relativePath, html, { oldTitle, newTitle, oldDescription, newDescription });
  html = addClass(html, "detail-editorial detail-brand detail-brand-sample");
  const main = `<main class="content-main vendor-profile-layout">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><a href="../cooperation/index.html">生态合作</a><span>品牌资料展示样板</span></nav>
      <section class="page-hero vendor-profile-hero"><p class="eyebrow dark">Brand Profile Sample</p><h1>品牌资料展示样板</h1><p>用克制、可核验的结构说明品牌方向、资料来源和用户仍需确认的边界。</p></section>
      <section class="vendor-boundary-note detail-boundary-note" aria-label="样板边界"><strong>样板边界</strong><p>本页为品牌资料展示样板，不对应真实品牌或企业。页面不包含虚构公司名称、地址、联系方式、产品、历史或服务能力。</p></section>
      <section class="vendor-guide-section"><h2>品牌资料页应先回答什么</h2><p>正式品牌页应先说明品牌名称、与柚木相关的公开方向、可核验的材料或工艺信息，以及资料来自哪里；没有依据的信息不写成网站结论。</p></section>
      <section class="vendor-guide-section"><h2>建议展示的资料维度</h2><div class="vendor-direction-grid"><article class="vendor-direction-card"><h3>公开资料</h3><p>标明企业正式发布、授权提供或网站整理的信息，避免混淆来源。</p></article><article class="vendor-direction-card"><h3>柚木方向</h3><p>只呈现能够确认的产品、材料、工艺或空间应用方向。</p></article><article class="vendor-direction-card"><h3>核验问题</h3><p>提醒用户继续确认材料文件、图片来源、服务范围、交付与售后责任。</p></article></div></section>
      <section class="vendor-guide-section"><h2>正式发布前需要补齐</h2><p>真实品牌名称、经授权的介绍与图片、可核验的产品或工艺资料、服务区域、联系方式和资料更新时间。资料不足时，应继续保持样板身份。</p></section>
      <section class="vendor-guide-section"><h2>用户如何理解本页</h2><p>本页展示的是资料组织方式，不是品牌推荐、官方认证、质量保证或交易担保，也不暗示存在对应企业。</p></section>
      <section class="content-cta"><a class="btn btn-primary" href="../index.html#wechat">咨询一个柚木问题</a><a class="detail-back-link" href="../cooperation/index.html">了解生态合作</a></section>
    </main>`;
  html = html.replace(/<main class="content-main">[\s\S]*?<\/main>/, main);
  html = html.replace(/<footer class="content-site-footer">[\s\S]*?<\/footer>/, '<footer class="content-site-footer"><div class="content-footer-inner"><span>柚喜饰界｜品牌资料展示样板</span><span>本页不对应真实品牌或企业。</span></div></footer>');
  write(relativePath, html);
};

for (const entry of Object.entries(knowledgePages)) migrateKnowledge(...entry);
migrateAestheticCase(aestheticCase);
for (const entry of Object.entries(aestheticSolutions)) migrateAestheticSolution(...entry);
for (const entry of Object.entries(lifestylePages)) migrateLifestyle(...entry);
migrateWorkshopSample();

const metadataPath = "custom/v130-alpha2-phase3-metadata-changes.json";
write(metadataPath, `${JSON.stringify(metadataChanges.sort((a, b) => a.path.localeCompare(b.path)), null, 2)}\n`);

const ledgerPath = "custom/v130-alpha2-migration-audit.json";
const ledger = JSON.parse(read(ledgerPath));
const phase3Paths = new Set([
  ...Object.keys(knowledgePages),
  aestheticCase.path,
  ...Object.keys(aestheticSolutions),
  ...Object.keys(lifestylePages),
  "vendors/workshop-sample.html",
]);

for (const record of ledger.records) {
  if (record.migrationStatus === "MIGRATED" && !record.migrationPhase) record.migrationPhase = "phase.2";
  if (phase3Paths.has(record.path)) {
    record.migrationStatus = "MIGRATED";
    record.migrationPhase = "phase.3";
    record.template = record.path === "vendors/workshop-sample.html"
      ? "Brand Profile"
      : Object.hasOwn(knowledgePages, record.path)
        ? "Knowledge Editorial"
        : record.path === aestheticCase.path || Object.hasOwn(aestheticSolutions, record.path)
          ? "Spatial Editorial"
          : "Lifestyle Editorial";
    record.metadataChanged = metadataChanges.some((change) => change.path === record.path);
    record.imageStatus = record.path === "vendors/workshop-sample.html"
      ? "EXISTING_COMPLIANT_SAMPLE"
      : "EXISTING_COMPLIANT_SHARED";
    record.semanticChanges = record.path === "vendors/workshop-sample.html"
      ? "内部证据确认非真实品牌；改为品牌资料展示样板；首屏明确非真实边界；移除推荐与合作导向"
      : record.template === "Knowledge Editorial"
        ? "迁移专业编辑阅读；补充判断边界；统一相关内容与咨询收口"
        : record.template === "Spatial Editorial"
          ? "迁移图片主导空间编辑；校正美学栏目语义；补充概念／项目边界"
          : "迁移生活方式编辑；补充场景与长期使用边界；统一相关内容与咨询收口";
  } else if (record.priority === "P3") {
    record.migrationStatus = "READY_FOR_PHASE4";
    record.migrationPhase = null;
    record.semanticChanges = "phase.3 已复核：栏目方向基本正确，但仍为旧详情结构，留待 phase.4 受控迁移";
    record.imageStatus = record.imageStatus === "NOT_REVIEWED" ? "REVIEWED_EXISTING" : record.imageStatus;
  }
}

Object.assign(ledger, {
  version: "v1.30-alpha.2-phase.3",
  candidateTotal: 76,
  completedBeforePhase3: 38,
  phase3: {
    p2Before: 17,
    p2Migrated: 17,
    p2NoChangeNeeded: 0,
    p2Blocked: 0,
    p2Remaining: 0,
    p3Reviewed: 21,
    p3ReadyForPhase4: 21,
    p3NoChangeNeeded: 0,
    p3Blocked: 0,
    completedTotal: 55,
    noChangeNeededTotal: 0,
    blockedTotal: 0,
    remainingMigrationCount: 21,
  },
});
write(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);

console.log(JSON.stringify({
  migrated: phase3Paths.size,
  knowledge: Object.keys(knowledgePages).length,
  aesthetic: Object.keys(aestheticSolutions).length + 1,
  lifestyle: Object.keys(lifestylePages).length,
  brandTemplate: 1,
  otherCategory: 1,
  metadataChangeCount: metadataChanges.length,
  p3ReadyForPhase4: 21,
}, null, 2));
