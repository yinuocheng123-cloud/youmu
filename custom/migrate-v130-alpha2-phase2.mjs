import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const write = (relativePath, value) => fs.writeFileSync(path.join(root, relativePath), value, "utf8");

const knowledgePages = {
  "knowledge/topics/avoid-cracking-warping.html": "木材会受环境、结构与使用方式影响；本页只能帮助降低风险，不能承诺开裂或变形永远不会发生。",
  "knowledge/topics/brand-or-factory.html": "品牌名称或生产身份都不能单独替代材料、工艺、交付和售后核对；本页不构成对任何品牌或工厂的推荐。",
  "knowledge/topics/is-teak-always-expensive.html": "价格受材料来源、规格、结构、工艺与服务共同影响；本页不提供市场报价，也不以价格高低直接判断真伪或品质。",
  "knowledge/topics/outdoor-teak-judgement.html": "适合户外使用仍不代表可以忽略水汽、维护和材料变化；需结合结构、排水、五金、表面处理和具体环境判断。",
  "knowledge/topics/teak-authenticity-basic.html": "照片、颜色、气味或触感都不能单独完成真假鉴定；需要材料文件、细节信息与必要的专业核验相互印证。",
  "knowledge/topics/teak-drying-process.html": "干燥处理会影响后续表现，但不能脱离树种、尺寸、结构、环境与加工过程单独作出稳定性结论。",
  "knowledge/topics/teak-oil-stability.html": "含油性只是材料特征之一，不能替代对水汽、耐久与形变风险的具体评估；实际表现仍受来源、加工和使用环境影响。",
  "knowledge/topics/teak-origin-basic.html": "产地是来源线索，不等于等级、真伪或最终品质结论；仍需核对材料名称、文件、规格与加工信息。",
  "knowledge/topics/teak-price-difference.html": "报价差异只能作为继续核对的线索；本页不提供价格结论，也不把高价等同于高等级或真实来源。",
  "knowledge/topics/teak-vs-common-wood-basic.html": "不同木材各有适用条件；本页只提供比较维度，不给出脱离用途、结构与维护条件的绝对优劣结论。",
  "knowledge/topics/teak-vs-walnut.html": "柚木与黑胡桃木没有脱离场景的统一优劣；选择应回到用途、触感、空间关系、维护和预算边界。",
};

const aestheticPages = {
  "knowledge/topics/tea-room-teak-space.html": {
    title: "茶空间里的柚木关系｜柚木美学｜柚喜饰界",
    h1: "茶空间里的柚木关系",
    lead: "从茶桌、地面、柜体、光线和停留尺度，看柚木如何成为安静的空间底色。",
  },
  "knowledge/topics/teak-home-spaces.html": {
    title: "柚木在家居空间中的尺度与搭配｜柚木美学｜柚喜饰界",
    h1: "柚木在家居空间中的尺度与搭配",
    lead: "从客厅、餐厅、茶室、卧室与户外过渡区域，理解木色比例、光线和长期使用的关系。",
  },
  "knowledge/topics/whole-decoration-fit-home.html": {
    title: "柚木整体木作的空间分寸｜柚木美学｜柚喜饰界",
    h1: "柚木整体木作的空间分寸",
    lead: "把地面、柜体、墙面与家具放在同一空间里，看木色比例、收口和留白是否协调。",
  },
};

const lifestylePages = {
  "solutions/goods/aged-teak-timber.html": "“年代木料”是需要证据支持的来源描述；没有来源文件、年份线索与结构核验时，只能作为旧料风格与再利用资料参考。",
  "solutions/goods/hotel-teak-floor.html": "本页为酒店空间的材料判断参考，不对应具体酒店完工项目，也不代表特定产品已经通过公共空间性能验证。",
  "solutions/goods/old-teak-carving.html": "“老柚木”不自动代表明确年代、历史出处或收藏价值；来源、修复状态与结构安全需要分别核实。",
  "solutions/goods/old-teak-door.html": "页面中的时间感是空间与修复判断，不构成对具体年代、历史出处、稀缺性或收藏价值的确认。",
  "solutions/goods/old-teak-window.html": "“老柚木窗”需要来源和结构证据支持；资料不足时应按旧料风格与再利用方向理解，不推定具体年代。",
  "solutions/goods/reclaimed-boat-teak.html": "“老船木”名称不能替代来源证明；船用经历、树种、污染处理和结构状态均需通过资料与实物进一步核实。",
  "solutions/goods/reclaimed-teak-flooring.html": "“再生柚木”需要核对旧料来源、树种、分选与再加工信息；本页不对具体材料年代或历史出处作确认。",
  "solutions/goods/seaside-teak-floor.html": "本页为滨海居住环境的判断参考，不对应真实完工案例；防潮、铺装和长期表现需按具体项目条件核实。",
  "solutions/goods/teak-pool-deck.html": "本页为泳池边场景的判断参考，不对应真实完工案例，也不构成防滑、防水或耐久性能检测结论。",
  "solutions/goods/teak-villa-woodwork.html": "本页为大尺度居住空间的木作关系参考，不对应真实别墅完工项目；材料、节点和交付能力需逐项确认。",
  "solutions/goods/teak-yacht-deck.html": "本页为船艇与亲水空间的使用判断参考，不代表任何具体甲板产品通过防滑、耐候或安全性能验证。",
};

const solutionAestheticPage = {
  path: "solutions/whole-decoration.html",
  oldTitle: "柚木整装 - 柚喜饰界",
  newTitle: "柚木整体木作的空间关系｜柚木美学｜柚喜饰界",
};

const brandPages = {
  "vendors/wachen-teak.html": ["佤臣柚木 - 柚喜饰界推荐厂商", "佤臣柚木｜品牌资料｜柚喜饰界"],
  "vendors/xuelianhua-teak-furniture.html": ["雪莲花柚木家具 - 柚喜饰界推荐厂商", "雪莲花柚木家具｜品牌资料｜柚喜饰界"],
  "vendors/yixin-teak.html": ["壹信柚木 - 柚喜饰界推荐厂商", "壹信柚木｜品牌资料｜柚喜饰界"],
  "vendors/yuebaijia-teak-flooring.html": ["悦百家柚木地板 - 柚喜饰界推荐厂商", "悦百家柚木地板｜品牌资料｜柚喜饰界"],
};

const metadataChanges = [];
const updateTitle = (relativePath, html, oldTitle, newTitle) => {
  if (oldTitle === newTitle) return html;
  if (html.includes(`<title>${newTitle}</title>`)) return html;
  if (!html.includes(`<title>${oldTitle}</title>`)) throw new Error(`${relativePath}: old title not found`);
  html = html.replace(`<title>${oldTitle}</title>`, `<title>${newTitle}</title>`);
  html = html.replace(`content="${oldTitle}"`, `content="${newTitle}"`);
  metadataChanges.push({ path: relativePath, oldTitle, newTitle, oldDescription: null, newDescription: null, ogTitleChanged: true });
  return html;
};

const addClass = (html, classNames) => html.replace(/<body class="([^"]*)"([^>]*)>/, (_, current, suffix) => {
  const classes = new Set(`${current} ${classNames}`.trim().split(/\s+/));
  return `<body class="${[...classes].join(" ")}"${suffix}>`;
});

const modernizeCommonLanguage = (html) => html
  .replaceAll("推荐厂商资料", "特色品牌资料")
  .replaceAll("进入柚木好物索引", "进入柚木生活索引")
  .replaceAll("柚木好物时", "柚木生活内容时")
  .replaceAll("好物类别", "生活主题");

const migrateKnowledge = (relativePath, boundary) => {
  let html = modernizeCommonLanguage(read(relativePath));
  html = addClass(html, "detail-editorial detail-knowledge");
  html = html.replace('<main class="content-main">', '<main class="content-main auxiliary-topic-main">');
  html = html.replace(/<h2>相关(?:内容|主题)<\/h2>/, "<h2>继续探索柚木</h2>");
  html = html.replace(/<section class="content-cta">[\s\S]*?<\/section>/, `<section class="content-cta">
        <a class="btn btn-primary" href="../../index.html#wechat">咨询一个柚木问题</a>
        <a class="detail-back-link" href="../index.html">继续探索柚木</a>
      </section>`);
  if (!html.includes("detail-boundary-note")) {
    const note = `<section class="detail-boundary-note" aria-label="判断边界"><strong>判断边界</strong><p>${boundary}</p></section>`;
    if (html.includes('<section class="content-cta">')) {
      html = html.replace('<section class="content-cta">', `${note}\n      <section class="content-cta">`);
    } else {
      html = html.replace(/(<section class="article-note">[\s\S]*?<\/section>)/, `$1\n          ${note}\n          <section class="detail-consult" aria-label="咨询柚木问题"><p>如果你正在核对具体材料或使用条件，可以把资料和疑问整理后发给柚喜。</p><a class="btn btn-primary" href="../../index.html#wechat">咨询一个柚木问题</a></section>`);
    }
  }
  if (relativePath.endsWith("avoid-cracking-warping.html")) {
    html = updateTitle(relativePath, html, "柚木家具如何避免开裂和变形 - 柚喜饰界", "如何降低柚木家具开裂与变形风险｜柚喜饰界");
    html = html.replaceAll("柚木家具如何避免开裂和变形", "如何降低柚木家具开裂与变形风险");
  }
  if (relativePath.endsWith("outdoor-teak-judgement.html")) {
    html = updateTitle(relativePath, html, "柚木户外柚木怎么判断 - 柚喜饰界", "户外使用柚木要判断什么｜柚喜饰界");
    html = html.replaceAll("柚木户外柚木怎么判断", "户外使用柚木要判断什么");
  }
  write(relativePath, html);
};

const migrateAesthetic = (relativePath, config) => {
  let html = modernizeCommonLanguage(read(relativePath));
  const oldTitle = html.match(/<title>(.*?)<\/title>/)?.[1];
  html = updateTitle(relativePath, html, oldTitle, config.title);
  const oldH1 = html.match(/<h1>(.*?)<\/h1>/)?.[1];
  html = html.replaceAll(oldH1, config.h1);
  html = addClass(html, "detail-editorial detail-aesthetic detail-aesthetic-essay");
  html = html.replace('<main class="content-main">', '<main class="content-main detail-aesthetic-main">');
  html = html.replace('<a href="../index.html">探索柚木</a>', '<a href="../../cases/index.html">柚木美学</a>');
  html = html.replace(/<p class="content-lead">[\s\S]*?<\/p>/, `<p class="content-lead">${config.lead}</p>`);
  html = html.replace(/<h2>相关主题<\/h2>/, "<h2>更多柚木美学</h2>");
  html = html.replace(/<section class="content-cta">[\s\S]*?<\/section>/, `<section class="content-cta">
        <a class="btn btn-primary" href="../../index.html#wechat">咨询一个柚木空间问题</a>
        <a class="detail-back-link" href="../../cases/index.html">更多柚木美学</a>
      </section>`);
  html = html.replace('<section class="content-cta">', `<section class="detail-boundary-note" aria-label="内容边界"><strong>内容边界</strong><p>本页为常见空间条件与设计关系的编辑参考，不对应具体完工项目；真实空间仍需结合尺寸、光线、材料资料与使用方式判断。</p></section>\n      <section class="content-cta">`);
  write(relativePath, html);
};

const migrateSolutionAesthetic = ({ path: relativePath, oldTitle, newTitle }) => {
  let html = modernizeCommonLanguage(read(relativePath));
  html = updateTitle(relativePath, html, oldTitle, newTitle);
  html = addClass(html, "detail-editorial detail-aesthetic detail-aesthetic-solution");
  html = html.replace('<a href="index.html">柚木生活</a><span>柚木整装</span>', '<a href="../cases/index.html">柚木美学</a><span>整体木作</span>');
  html = html.replace("<h1>柚木整装</h1>", "<h1>柚木整体木作的空间关系</h1>");
  html = html.replace(/\s*<a class="btn btn-primary" href="\.\.\/index\.html#wechat">咨询柚木问题<\/a>/, "");
  html = html.replace("<h2>相关内容</h2>", "<h2>更多柚木美学</h2>");
  html = html.replace('<section class="soft-notice">', '<section class="soft-notice detail-boundary-note">');
  html = html.replace(/<section class="content-cta">[\s\S]*?<\/section>/, `<section class="content-cta"><a class="btn btn-primary" href="../index.html#wechat">咨询一个柚木空间问题</a><a class="detail-back-link" href="../cases/index.html">更多柚木美学</a></section>`);
  write(relativePath, html);
};

const migrateLifestyle = (relativePath, boundary) => {
  let html = read(relativePath);
  html = addClass(html, "detail-editorial detail-lifestyle detail-lifestyle-archive");
  html = html.replace("<h2 id=\"related-title\">你可能还会喜欢</h2>", "<h2 id=\"related-title\">继续了解柚木生活</h2>");
  if (!html.includes("detail-boundary-note")) {
    html = html.replace('<section class="goods-source-section"', `<section class="detail-boundary-note" aria-label="资料边界"><strong>资料边界</strong><p>${boundary}</p></section>\n\n      <section class="goods-source-section"`);
  }
  if (!html.includes("detail-consult")) {
    html = html.replace('    </section>\n  </main>', `      <section class="detail-consult" aria-label="咨询柚木问题"><p>如果你正在核对具体材料、空间条件或来源资料，可以把问题整理后发给柚喜。</p><a class="btn btn-primary" href="../../index.html#wechat">把具体问题发给柚喜</a></section>\n    </section>\n  </main>`);
  }
  write(relativePath, html);
};

const migrateBrand = (relativePath, [oldTitle, newTitle]) => {
  let html = read(relativePath);
  html = updateTitle(relativePath, html, oldTitle, newTitle);
  html = addClass(html, "detail-editorial detail-brand");
  html = html.replace(/<section class="content-cta">[\s\S]*?<\/section>/, `<section class="content-cta"><a class="btn btn-primary" href="../index.html#wechat">把具体问题发给柚喜</a><a class="detail-back-link" href="index.html">查看更多品牌资料</a></section>`);
  write(relativePath, html);
};

for (const [relativePath, boundary] of Object.entries(knowledgePages)) migrateKnowledge(relativePath, boundary);
for (const [relativePath, config] of Object.entries(aestheticPages)) migrateAesthetic(relativePath, config);
 migrateSolutionAesthetic(solutionAestheticPage);
for (const [relativePath, boundary] of Object.entries(lifestylePages)) migrateLifestyle(relativePath, boundary);
for (const entry of Object.entries(brandPages)) migrateBrand(...entry);

if (metadataChanges.length) {
  const metadataPath = "custom/v130-alpha2-phase2-metadata-changes.json";
  const existing = fs.existsSync(path.join(root, metadataPath)) ? JSON.parse(read(metadataPath)) : [];
  const merged = [...existing.filter((item) => !metadataChanges.some((next) => next.path === item.path)), ...metadataChanges]
    .sort((a, b) => a.path.localeCompare(b.path));
  write(metadataPath, `${JSON.stringify(merged, null, 2)}\n`);
}
const metadataTotal = JSON.parse(read("custom/v130-alpha2-phase2-metadata-changes.json")).length;
console.log(JSON.stringify({ migrated: 30, knowledge: 11, aesthetic: 4, lifestyle: 11, brand: 4, metadataChangeCount: metadataTotal }, null, 2));
