import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const write = (p, value) => fs.writeFileSync(path.join(root, p), value, "utf8");
const ledgerPath = "custom/v130-alpha2-migration-audit.json";
const ledger = JSON.parse(read(ledgerPath));
const phase1Records = [
  ["knowledge/topics/what-is-teak.html", "探索柚木", "Knowledge Editorial", "长文缺少阅读层级", false],
  ["knowledge/topics/outdoor-teak-maintenance.html", "探索柚木", "Knowledge Editorial", "连续白卡与跳转页感", false],
  ["cases/tea-room-teak-sample.html", "柚木美学", "Spatial Editorial", "图片节奏不足", false],
  ["cases/courtyard-teak-sample.html", "柚木美学", "Spatial Editorial", "图片节奏不足", false],
  ["solutions/outdoor.html", "柚木生活", "Lifestyle Editorial", "连续资料段与白卡感", false],
  ["solutions/goods/teak-dining-table.html", "柚木生活", "Lifestyle Editorial", "物件文章图片不足", false],
  ["vendors/shanghai-zhuangxin-teak.html", "特色品牌", "Brand Profile", "旧推荐厂商语义", true],
  ["vendors/zhenzang-teak-life.html", "特色品牌", "Brand Profile", "旧推荐厂商语义", true],
].map(([pathValue, category, template, riskNotes, metadataChanged]) => ({
  path: pathValue,
  oldCategory: category,
  newCategory: category,
  priority: "PILOT",
  template,
  semanticChanges: "phase.1 试点迁移；模板、栏目语义与咨询收口已通过回归",
  metadataChanged,
  imageStatus: "EXISTING_COMPLIANT_SHARED",
  riskNotes,
  migrationStatus: "MIGRATED",
  migrationPhase: "phase.1",
}));
for (const record of phase1Records) {
  const existing = ledger.records.find((item) => item.path === record.path);
  if (!existing) ledger.records.push(record);
  else if (existing.migrationPhase === "phase.1") Object.assign(existing, record);
}
const ready = ledger.records.filter((item) => item.migrationStatus === "READY_FOR_PHASE4");
if (ready.length !== 21 && !(ready.length === 0 && ledger.phase4?.migratedThisPhase === 21)) {
  throw new Error(`READY_FOR_PHASE4=${ready.length}, expected 21 before first run or 0 after completed run`);
}

const addClass = (html, names) => html.replace(/<body class="([^"]*)"([^>]*)>/, (_, current, suffix) => {
  const classes = new Set(`${current} ${names}`.trim().split(/\s+/));
  return `<body class="${[...classes].join(" ")}"${suffix}>`;
});

const modernizeLanguage = (html) => html
  .replaceAll("推荐厂商资料", "品牌资料")
  .replaceAll("推荐厂商栏目", "特色品牌栏目")
  .replaceAll("推荐厂商", "特色品牌")
  .replaceAll("柚木好物索引", "柚木生活索引")
  .replaceAll("柚木好物时", "柚木生活内容时")
  .replaceAll("柚木好物", "柚木生活")
  .replaceAll("好物类别", "生活主题")
  .replaceAll("社群交流区", "咨询沟通区")
  .replaceAll("社群交流", "咨询沟通");

const knowledgeBoundaries = {
  "knowledge/topics/before-buying-teak-basics.html": "购买前的基础问题用于建立核对顺序，不构成材料、品牌、价格或适用性的直接结论；具体选择仍需回到产品资料与使用条件。",
  "knowledge/topics/clear-teak-description.html": "表达是否清楚只能帮助判断资料完整度，不能替代对材料真伪、等级、性能、来源及合同责任的进一步核验。",
  "knowledge/topics/flooring-vs-furniture-craft.html": "地板与家具的工艺关注点不同；本页提供比较维度，不对具体产品的结构、稳定性或使用寿命作结论。",
  "knowledge/topics/not-only-color-photo.html": "颜色和图片会受光线、拍摄与表面处理影响，不能单独证明树种、产地、等级、年代或材料状态。",
  "knowledge/topics/teak-aging-color.html": "颜色变化需要结合光照、表面处理、清洁和使用环境判断；不能仅凭变深或变浅推定材料真伪、年代或品质。",
  "knowledge/topics/teak-color-change.html": "表面颜色变化并非统一结果；出现异常斑痕、翘曲或涂层问题时，仍需结合材料、施工与维护情况单独检查。",
  "knowledge/topics/teak-daily-cleaning.html": "清洁方法应以具体表面处理和品牌维护说明为准；本页不提供适用于所有柚木制品的统一保养承诺。",
  "knowledge/topics/teak-flooring-daily-care.html": "地板维护还受铺装、基层、地暖、湿度和表面处理影响；日常建议不能替代具体产品与施工方说明。",
  "knowledge/topics/teak-joinery-surface.html": "拼接、结构和表面处理只能结合实物与用途判断；外观整齐不等于材料、结构或长期表现已经得到验证。",
};

const lifestyleBoundaries = {
  "solutions/goods/teak-bedroom.html": "本页讨论卧室中的材料比例与日常使用，不对应特定产品或真实项目，也不对材料等级、稀缺性或价值作判断。",
  "solutions/goods/teak-bench.html": "本页为长凳的空间与使用参考，不对应特定产品；承重、结构、边角与表面处理仍需按实物核对。",
  "solutions/goods/teak-bookcase.html": "本页讨论书柜的长期使用关系，不代表具体产品通过承重、稳定或安全验证；结构和固定方式需分别确认。",
  "solutions/goods/teak-incense-holder.html": "本页为器物使用与陈设参考，不对应特定产品；接近香火或热源时需遵循实际产品与防火安全要求。",
  "solutions/goods/teak-living-room.html": "本页为会客空间的材料与尺度参考，不对应真实完工项目，也不对具体品牌、产品或材料价值作判断。",
  "solutions/goods/teak-lounge-chair.html": "本页讨论休闲椅的坐感与空间关系，不代表具体产品的承重、人体工学或结构安全已经验证。",
  "solutions/goods/teak-pen.html": "本页为柚木笔的触感与使用参考，不对应特定产品；材质、表面处理与耐用性仍需按实物说明判断。",
  "solutions/goods/teak-phone-stand.html": "本页为手机架的日常使用参考，不对应特定产品；稳定性、尺寸适配与表面处理应结合实物确认。",
  "solutions/goods/teak-speaker.html": "木质外壳的观感不能替代声学和电气性能判断；本页不对应特定音箱产品，也不构成音质或安全结论。",
  "solutions/goods/teak-study-room.html": "本页为书房中的材料、光线与使用关系参考，不对应真实完工项目，也不对材料稀缺性或价值作判断。",
  "solutions/goods/teak-tea-table.html": "本页讨论茶桌与空间、清洁和长期使用的关系，不对应特定产品；结构、尺寸与表面处理需按实物判断。",
  "solutions/goods/teak-tray.html": "本页为托盘的使用与陈设参考，不对应特定产品；接触食物、液体或热源时应以实际材质与涂装说明为准。",
};

const migrateKnowledge = (relativePath, boundary) => {
  let html = modernizeLanguage(read(relativePath));
  html = addClass(html, "detail-editorial detail-knowledge");
  if (!html.includes("article-layout")) html = html.replace('<main class="content-main">', '<main class="content-main auxiliary-topic-main">');
  html = html
    .replace(/<h2>相关(?:内容|主题)<\/h2>/g, "<h2>继续探索柚木</h2>")
    .replace(/<p class="article-inline-heading"><strong>相关(?:内容|主题)<\/strong><\/p>/g, '<p class="article-inline-heading"><strong>继续探索柚木</strong></p>');
  if (!html.includes("detail-boundary-note")) {
    const note = `<section class="detail-boundary-note" aria-label="判断边界"><strong>判断边界</strong><p>${boundary}</p></section>`;
    if (html.includes('<section class="content-cta">')) html = html.replace('<section class="content-cta">', `${note}\n      <section class="content-cta">`);
    else html = html.replace('<section class="article-note">', `${note}\n          <section class="article-note">`);
  }
  if (html.includes('<section class="content-cta">')) {
    html = html.replace(/<section class="content-cta">[\s\S]*?<\/section>/, '<section class="content-cta"><a class="btn btn-primary" href="../../index.html#wechat">咨询一个柚木问题</a><a class="detail-back-link" href="../index.html">继续探索柚木</a></section>');
  } else if (!html.includes("detail-consult")) {
    html = html.replace(/(<section class="article-note">[\s\S]*?<\/section>)/, '$1\n          <section class="detail-consult"><p>如果你正在核对具体材料或使用条件，可以把问题整理后发给柚喜。</p><a class="btn btn-primary" href="../../index.html#wechat">咨询一个柚木问题</a></section>');
  }
  write(relativePath, html);
};

const migrateLifestyle = (relativePath, boundary) => {
  let html = modernizeLanguage(read(relativePath));
  html = addClass(html, "detail-editorial detail-lifestyle detail-lifestyle-archive");
  html = html.replace('<h2 id="related-title">你可能还会喜欢</h2>', '<h2 id="related-title">继续了解柚木生活</h2>');
  if (!html.includes("detail-boundary-note")) html = html.replace('<section class="goods-source-section"', `<section class="detail-boundary-note" aria-label="使用边界"><strong>使用边界</strong><p>${boundary}</p></section>\n\n      <section class="goods-source-section"`);
  if (!html.includes("detail-consult")) html = html.replace('    </section>\n  </main>', '      <section class="detail-consult"><p>如果你正在核对具体材料、空间条件或使用方式，可以把问题整理后发给柚喜。</p><a class="btn btn-primary" href="../../index.html#wechat">把具体问题发给柚喜</a></section>\n    </section>\n  </main>');
  write(relativePath, html);
};

for (const [p, boundary] of Object.entries(knowledgeBoundaries)) migrateKnowledge(p, boundary);
for (const [p, boundary] of Object.entries(lifestyleBoundaries)) migrateLifestyle(p, boundary);

// 全站明确旧栏目词汇收口；只替换公开文字，不改 URL、属性名或结构。
const publicHtml = execFileSync("git", ["ls-files", "*.html"], { cwd: root, encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
const semanticTouched = [];
for (const relativePath of publicHtml) {
  const before = read(relativePath);
  const after = modernizeLanguage(before);
  if (after !== before) {
    write(relativePath, after);
    semanticTouched.push(relativePath);
  }
}

for (const record of ledger.records) {
  if (record.migrationStatus === "READY_FOR_PHASE4") {
    record.migrationStatus = "MIGRATED";
    record.migrationPhase = "phase.4";
    record.template = record.newCategory === "探索柚木" ? "Knowledge Editorial" : "Lifestyle Editorial";
    record.semanticChanges = record.template === "Knowledge Editorial"
      ? "迁移专业编辑阅读；补足判断边界；统一相关内容与单次咨询收口"
      : "迁移生活方式编辑；补足使用与事实边界；统一相关内容与单次咨询收口";
    record.metadataChanged = false;
    record.imageStatus = "EXISTING_COMPLIANT_SHARED";
  }
}

const statuses = ledger.records.reduce((acc, item) => ((acc[item.migrationStatus] = (acc[item.migrationStatus] || 0) + 1), acc), {});
Object.assign(ledger, {
  version: "v1.30-alpha.2-phase.4",
  candidateTotal: 76,
  phase4: {
    readyBefore: 21,
    migratedThisPhase: 21,
    noChangeNeededThisPhase: 0,
    blockedThisPhase: 0,
    readyAfter: 0,
    knowledgeProcessed: 9,
    lifestyleProcessed: 12,
    totalMigrated: statuses.MIGRATED || 0,
    totalNoChangeNeeded: statuses.NO_CHANGE_NEEDED || 0,
    totalBlocked: statuses.BLOCKED_FACT_CHECK || 0,
    totalDeferred: statuses.DEFERRED || 0,
    notReviewedCount: statuses.NOT_REVIEWED || 0,
  },
});
write(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
write("custom/v130-alpha2-phase4-metadata-changes.json", "[]\n");

const allMetadata = [
  ["phase.1", [{ path: "vendors/shanghai-zhuangxin-teak.html" }, { path: "vendors/zhenzang-teak-life.html" }]],
  ["phase.2", JSON.parse(read("custom/v130-alpha2-phase2-metadata-changes.json"))],
  ["phase.3", JSON.parse(read("custom/v130-alpha2-phase3-metadata-changes.json"))],
  ["phase.4", []],
];
const metadataTotal = allMetadata.reduce((sum, [, rows]) => sum + rows.length, 0);
const reclassified = ledger.records.filter((item) => item.oldCategory !== item.newCategory);
const highRiskFixed = ledger.records.filter((item) => item.priority === "P0" || /边界|高风险|保守|条件化/.test(item.semanticChanges)).length;
const brandBoundaryFixed = ledger.records.filter((item) => item.template === "Brand Profile" || item.path === "vendors/workshop-sample.html").length;
const imageGaps = ledger.records.filter((item) => item.imageStatus.startsWith("IMAGE_ASSET_GAP"));

const summary = `# V1.30 Alpha 2 Migration Summary

- 候选总数：76
- 最终模板数量：Knowledge Editorial ${ledger.records.filter((x) => x.template === "Knowledge Editorial").length}；Spatial Editorial ${ledger.records.filter((x) => x.template === "Spatial Editorial").length}；Lifestyle Editorial ${ledger.records.filter((x) => x.template === "Lifestyle Editorial").length}；Brand Profile ${ledger.records.filter((x) => x.template === "Brand Profile").length}
- MIGRATED：${statuses.MIGRATED || 0}
- NO_CHANGE_NEEDED：${statuses.NO_CHANGE_NEEDED || 0}
- BLOCKED：${statuses.BLOCKED_FACT_CHECK || 0}
- metadata 修改总数：${metadataTotal}
- 栏目重分类数量：${reclassified.length}
- 高风险／事实边界处理页面：${highRiskFixed}
- 品牌边界处理页面：${brandBoundaryFixed}
- workshop-sample：已确认非真实品牌，改为品牌资料展示样板
- IMAGE_ASSET_GAP：${imageGaps.length}（均为品牌专属授权图片缺口）
- 剩余未完成事项：0 个候选迁移；${imageGaps.length} 个授权图片缺口留待发布收口决策
`;
write("custom/V130_ALPHA2_MIGRATION_SUMMARY.md", summary);

const sitemap = read("sitemap.xml");
const urls = [...sitemap.matchAll(/<loc>https:\/\/www\.zhengmu\.cn\/(.*?)<\/loc>/g)].map((match) => match[1] || "index.html");
const recordMap = new Map(ledger.records.map((item) => [item.path, item]));
const classify = (p) => {
  const candidate = recordMap.get(p);
  if (candidate) return { pageType: "candidate-detail", section: candidate.newCategory, template: candidate.template, migrationStatus: candidate.migrationStatus };
  if (p === "index.html") return { pageType: "homepage", section: "首页", template: "Homepage", migrationStatus: "NOT_CANDIDATE" };
  if (p.endsWith("index.html")) return { pageType: "section-index", section: p.split("/")[0], template: "Section Index", migrationStatus: "NOT_CANDIDATE" };
  if (p.startsWith("forms/")) return { pageType: "form", section: "咨询／合作", template: "Utility", migrationStatus: "NOT_CANDIDATE" };
  if (p.startsWith("articles/") || p.includes("/guides/")) return { pageType: "supporting-article", section: p.split("/")[0], template: "Supporting Editorial", migrationStatus: "NOT_CANDIDATE" };
  return { pageType: "supporting-page", section: p.split("/")[0], template: "Supporting Page", migrationStatus: "NOT_CANDIDATE" };
};
const architecture = urls.map((p) => ({ path: p, ...classify(p) }));
write("custom/v130-page-architecture.json", `${JSON.stringify({ version: "v1.30-alpha.2-phase.4", pageCount: architecture.length, pages: architecture }, null, 2)}\n`);

console.log(JSON.stringify({ readyBefore: ledger.phase4.readyBefore, migrated: 21, knowledge: 9, lifestyle: 12, semanticTouched, recordCount: ledger.records.length, statuses, metadataTotal, reclassified: reclassified.length, highRiskFixed, brandBoundaryFixed, imageAssetGap: imageGaps.length, architecturePages: architecture.length }, null, 2));
