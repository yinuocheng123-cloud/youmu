/*
文件说明：该文件用于批量重构 V1.11 内页前台体验。
功能说明：重写知识、好物、候选企业、厂商申请等关键公开页面，并清理公开 HTML 中的开发语言。

结构概览：
  第一部分：导入依赖与通用模板
  第二部分：页面内容数据
  第三部分：核心页面生成
  第四部分：公开页面表达清理
*/

// ========== 第一部分：导入依赖与通用模板 ==========
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "../..");

async function writeProjectFile(relativePath, content) {
  await fs.mkdir(path.join(projectRoot, path.dirname(relativePath)), { recursive: true });
  await fs.writeFile(path.join(projectRoot, relativePath), `${content.trim()}\n`, "utf8");
}

async function readProjectFile(relativePath) {
  return fs.readFile(path.join(projectRoot, relativePath), "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function header(prefix) {
  return `
    <header class="content-site-header">
      <a class="content-brand" href="${prefix}index.html" aria-label="返回柚喜饰界首页">
        <img src="${prefix}assets/logo-yuxi-mark.svg" alt="" />
        <span><strong>柚喜饰界</strong><small>柚木爱好者乐园</small></span>
      </a>
      <nav class="content-nav" aria-label="内容页导航">
        <a href="${prefix}about/index.html">认识柚喜</a>
        <a href="${prefix}knowledge/index.html">柚木知识</a>
        <a href="${prefix}solutions/index.html">好物方案</a>
        <a href="${prefix}vendors/index.html">推荐厂商</a>
        <a href="${prefix}index.html#wechat">社群交流</a>
      </nav>
    </header>`;
}

function footer(prefix, title, note) {
  return `
    <footer class="content-site-footer">
      <div class="content-footer-inner">
        <span>柚喜饰界 - ${escapeHtml(title)}</span>
        <span>${escapeHtml(note)}</span>
      </div>
    </footer>
    <script src="${prefix}script.js"></script>`;
}

function shell({ title, description, prefix, body, footerNote }) {
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} - 柚喜饰界</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="${prefix}styles.css" />
  </head>
  <body class="content-page">
${header(prefix)}
${body}
${footer(prefix, title, footerNote)}
  </body>
</html>`;
}

function card(item, options = {}) {
  const meta = item.meta ? `<span class="compact-meta">${escapeHtml(item.meta)}</span>` : "";
  const tag = item.tag ? `<span class="compact-meta">${escapeHtml(item.tag)}</span>` : "";
  const cta = options.cta || item.cta || "开始阅读";
  return `
          <article class="${options.className || "content-card"}">
            ${tag || meta}
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary)}</p>
            <a class="text-link" href="${item.href}">${escapeHtml(cta)}</a>
          </article>`;
}

function categoryCards(items) {
  return items.map((item) => card(item, { className: "content-card compact-card" })).join("\n");
}

function boundaryText() {
  return "公开资料候选不代表已入驻，不代表平台认证，不构成平台背书或交易担保。真实会员站上线前，仍需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。";
}

// ========== 第二部分：页面内容数据 ==========
const knowledgeCategories = [
  {
    name: "柚木入门",
    intro: "适合第一次接触柚木的人，先把树种、空间和买前问题讲清楚。",
    items: [
      ["什么是柚木", "从树种、常见用途和材料特征入手，先建立最基础的柚木认知。", "topics/what-is-teak.html"],
      ["柚木为什么适合家居空间", "把稳定性、触感、耐用性和空间气质放在一起看。", "topics/why-teak-for-home.html"],
      ["柚木和普通木材有什么不同", "比较材料差异，但不把差异写成绝对优劣。", "topics/teak-vs-common-wood-basic.html"],
      ["柚木常见产地与基础认知", "了解产地只是起点，不能把产地直接等同于最终品质。", "topics/teak-origin-basic.html"],
      ["买柚木前应该先弄懂哪些基本问题", "先整理空间、用途、维护和沟通问题，再看品牌或报价。", "topics/before-buying-teak-basics.html"],
    ],
  },
  {
    name: "选购避坑",
    intro: "适合已经开始看产品、看报价、看商家页面的人。",
    items: [
      ["买柚木最容易踩的坑", "梳理只看颜色、只听口号、忽略维护和服务边界等常见误区。", "topics/teak-buying-pitfalls.html"],
      ["怎么看柚木是不是表达清楚", "看页面是否讲清材料、结构、适用空间、维护和服务范围。", "topics/clear-teak-description.html"],
      ["柚木价格差异到底看什么", "把价格差异放回材料、规格、工艺和服务范围中理解。", "topics/teak-price-difference.html"],
      ["为什么不能只看颜色和图片", "理解光线、后期处理和表面状态对判断的影响。", "topics/not-only-color-photo.html"],
      ["选柚木品牌或商家前要问哪些问题", "整理沟通前的问题清单，让后续交流更聚焦。", "topics/questions-before-vendor.html"],
    ],
  },
  {
    name: "材质工艺",
    intro: "适合想看懂木材状态、拼接结构、干燥和表面处理的人。",
    items: [
      ["柚木含油性与稳定性怎么理解", "解释含油性、耐用性和稳定性之间的关系。", "topics/teak-oil-stability.html"],
      ["干燥处理为什么重要", "说明干燥处理对开裂、变形和长期稳定性的影响。", "topics/teak-drying-process.html"],
      ["拼接、结构和表面处理怎么看", "帮助用户理解单板、拼接、涂装和触感差异。", "topics/teak-joinery-surface.html"],
      ["柚木地板和柚木家具的工艺差异", "比较地板与家具在结构、受力、安装和维护上的不同。", "topics/flooring-vs-furniture-craft.html"],
      ["柚木表面颜色变化是否正常", "解释氧化、日晒、清洁和维护对表面颜色的影响。", "topics/teak-color-change.html"],
    ],
  },
  {
    name: "空间应用",
    intro: "适合把柚木放进整装、地板、庭院、茶室和会客空间里判断的人。",
    items: [
      ["柚木适合哪些家居空间", "从客厅、餐厅、茶室、卧室、阳台和庭院等场景看适配逻辑。", "topics/teak-home-spaces.html"],
      ["柚木整装适合什么样的家", "说明整装场景中柚木更适合哪些风格和沟通方式。", "topics/whole-decoration-fit-home.html"],
      ["柚木地板适合什么空间", "围绕脚感、维护、光线和使用强度判断地板适配。", "topics/flooring-fit-space.html"],
      ["庭院户外柚木怎么判断", "从日晒、雨水、通风、维护周期和结构安全看户外使用。", "topics/outdoor-teak-judgement.html"],
      ["茶室会客空间为什么适合柚木", "说明柚木在茶桌、地面、柜体和会客氛围中的作用。", "topics/tea-room-teak-space.html"],
    ],
  },
  {
    name: "保养维护",
    intro: "适合关心清洁、户外风化、变色、开裂和地板日常使用的人。",
    items: [
      ["柚木日常怎么清洁", "整理日常清洁的温和原则和不建议使用的粗暴方式。", "topics/teak-daily-cleaning.html"],
      ["柚木户外使用怎么维护", "说明日晒、雨水和自然变灰下的维护思路。", "topics/outdoor-teak-maintenance.html"],
      ["柚木变色是不是问题", "解释自然氧化、紫外线、清洁和油养对颜色的影响。", "topics/teak-aging-color.html"],
      ["柚木家具如何避免开裂和变形", "围绕湿度、日晒、受力和清洁方式说明日常注意。", "topics/avoid-cracking-warping.html"],
      ["柚木地板日常使用注意事项", "整理地板清洁、拖地、家具脚垫和局部污渍处理。", "topics/teak-flooring-daily-care.html"],
    ],
  },
  {
    name: "常见问答",
    intro: "适合快速查看用户反复会问到的价格、家庭使用和品牌选择问题。",
    items: [
      ["柚木一定贵吗", "用更完整的变量理解价格，不把贵或便宜写成绝对结论。", "topics/is-teak-always-expensive.html"],
      ["柚木适合有孩子和宠物的家庭吗", "从耐用、清洁、安全边角和维护接受度看家庭场景。", "topics/teak-kids-pets-home.html"],
      ["柚木可以用在卫生间或阳台吗", "解释潮湿空间与半户外空间的判断边界。", "topics/teak-bathroom-balcony.html"],
      ["柚木和黑胡桃木怎么选", "从风格、触感、维护和空间气质比较两类常见木材。", "topics/teak-vs-walnut.html"],
      ["柚木产品选品牌还是选工厂", "理解品牌、工厂、服务和资料完整度之间的关系。", "topics/brand-or-factory.html"],
    ],
  },
].map((category) => ({
  ...category,
  items: category.items.map(([title, summary, href]) => ({ title, summary, href, meta: "约 3 分钟" })),
}));

const solutionCategories = [
  {
    title: "我想做柚木整装",
    name: "柚木整装",
    page: "whole-decoration.html",
    summary: "适合正在规划私宅、茶室、会客厅、民宿或庭院整体空间的人。",
    forWhom: "想让地面、墙面、柜体和家具形成统一木质氛围的人。",
    points: ["空间比例", "木作范围", "后续维护"],
    candidates: "整装 / 木作 / 空间类候选企业",
    items: [
      ["柚木整装适合什么样的家", "判断整装是否匹配空间、预算、维护和风格预期。", "guides/whole-decoration-fit-home.html"],
      ["柚木整装和普通定制有什么不同", "比较整装视角与单项定制在材料、设计和沟通上的区别。", "guides/whole-decoration-vs-custom.html"],
      ["柚木整装选材注意事项", "从材料来源、板材结构、表面处理和空间适用性看选材。", "guides/whole-decoration-material-check.html"],
      ["柚木整装空间搭配建议", "关注地面、柜体、墙面、灯光和软装之间的协调。", "guides/whole-decoration-matching.html"],
      ["柚木整装页面应该看什么", "看空间条件、材料清单、授权状态和服务边界。", "guides/whole-decoration-sample-structure.html"],
    ],
  },
  {
    title: "我想看柚木地板",
    name: "柚木地板",
    page: "flooring.html",
    summary: "适合从地面开始建立柚木空间质感的人。",
    forWhom: "正在看客厅、卧室、茶室或半户外地面材料的人。",
    points: ["材料结构", "安装条件", "日常维护"],
    candidates: "地板方向候选企业",
    items: [
      ["柚木地板怎么选", "从材料、结构、脚感、安装和维护五个维度看地板。", "guides/flooring-how-to-choose.html"],
      ["柚木地板适合哪些空间", "判断客厅、卧室、茶室、过道等空间是否适合铺设。", "guides/flooring-fit-spaces.html"],
      ["柚木地板安装前要确认什么", "整理基层、地暖、伸缩缝、门口高差和现场条件。", "guides/flooring-before-install.html"],
      ["柚木地板日常维护建议", "从清洁、拖地、家具脚垫和局部污渍处理整理维护。", "guides/flooring-care-guide.html"],
      ["柚木地板页面应该看什么", "看空间条件、材料说明、现场边界和维护责任。", "guides/flooring-sample-structure.html"],
    ],
  },
  {
    title: "我想布置庭院露台",
    name: "庭院户外柚木",
    page: "outdoor.html",
    summary: "适合关注庭院、露台、阳台和户外休闲家具的人。",
    forWhom: "希望户外空间更耐用、更自然，也愿意理解维护周期的人。",
    points: ["日晒雨淋", "收纳遮蔽", "维护周期"],
    candidates: "户外柚木候选品牌",
    items: [
      ["户外为什么常见柚木", "理解柚木在户外家具和庭院空间中常被讨论的原因。", "guides/outdoor-why-teak.html"],
      ["庭院柚木家具怎么选", "从结构、坐感、摆放、收纳和维护看庭院家具。", "guides/outdoor-furniture-choose.html"],
      ["露台阳台柚木使用注意事项", "判断小户外空间中的日晒、排水、承重和邻里边界。", "guides/terrace-balcony-teak.html"],
      ["户外柚木维护周期怎么理解", "说明清洁、自然变灰、油养和季节维护的预期管理。", "guides/outdoor-maintenance-cycle.html"],
      ["庭院户外页面应该看什么", "看环境条件、维护方式、授权资料和服务边界。", "guides/outdoor-sample-structure.html"],
    ],
  },
  {
    title: "我想做茶室会客",
    name: "茶室会客柚木",
    page: "tea-room.html",
    summary: "适合重视茶桌、地面、柜体、收纳和会客氛围的人。",
    forWhom: "希望空间更沉稳、温润，同时需要兼顾水渍和日常清洁的人。",
    points: ["茶桌尺度", "地面柜体", "会客氛围"],
    candidates: "茶室会客候选品牌",
    items: [
      ["茶室为什么适合柚木", "从触感、温润感、稳定感和空间氛围理解茶室场景。", "guides/tea-room-why-teak.html"],
      ["柚木茶桌怎么选", "从尺寸、结构、桌面处理、坐姿和使用频率看茶桌。", "guides/teak-tea-table-choose.html"],
      ["茶室地面和柜体如何搭配", "整理地面、柜体、茶具收纳和墙面之间的搭配方式。", "guides/tea-room-floor-cabinet.html"],
      ["柚木会客空间氛围怎么做", "从尺度、光线、座椅、茶桌和留白理解会客氛围。", "guides/teak-reception-atmosphere.html"],
      ["茶室会客页面应该看什么", "看茶桌、地面、柜体、授权状态和服务边界。", "guides/tea-room-sample-structure.html"],
    ],
  },
  {
    title: "我想先看家具单品",
    name: "柚木家具好物",
    page: "furniture.html",
    summary: "适合从桌椅、柜体、边几、茶几和小件家具开始了解柚木的人。",
    forWhom: "想先买单件家具，再慢慢形成整体木质空间的人。",
    points: ["尺寸比例", "触感结构", "材质搭配"],
    candidates: "家具好物候选品牌",
    items: [
      ["柚木桌椅怎么选", "从尺寸、坐感、结构、边角和家庭使用场景看桌椅。", "guides/teak-table-chair-choose.html"],
      ["柚木柜体和收纳怎么搭配", "整理柜体尺寸、收纳方式、开合动线和空间比例。", "guides/teak-cabinet-storage.html"],
      ["柚木边几、茶几、单品如何选", "从移动频率、尺度、表面维护和组合方式看小件好物。", "guides/teak-side-coffee-table.html"],
      ["柚木家具和其他木材家具怎么搭", "说明柚木与黑胡桃、橡木、藤编、金属等材质的搭配。", "guides/teak-with-other-wood.html"],
      ["家具好物页面应该看什么", "看单品信息、使用场景、授权状态和服务边界。", "guides/furniture-sample-structure.html"],
    ],
  },
].map((category) => ({
  ...category,
  items: category.items.map(([title, summary, href]) => ({ title, summary, href, meta: "约 4 分钟" })),
}));

const candidateGroups = [
  {
    id: "flooring",
    name: "柚木地板",
    label: "柚木地板候选企业",
    intro: "适合正在比较地板材料、地面铺装和木材供应资料的人。",
    entries: [
      ["Indoteak Design", "再生柚木地板、墙面材料、台面与定制构件", "正在比较再生柚木地板和室内木材资料的人", "https://www.indoteakdesign.com/"],
      ["Arc Wood & Timbers", "再生柚木地板与木材产品", "关注地板材料来源和产品页结构的人", "https://arcwoodandtimbers.com/products/reclaimed-teak-flooring/"],
      ["Luxury Wood Flooring", "实木与工程木地板资料", "希望比较地板服务表达方式的人", "https://www.luxurywoodflooring.com/"],
      ["Havwoods", "木地板、木质表面材料与项目资料", "关注地板资料体系和规格表达的人", "https://www.havwoods.com/"],
      ["East Teak Fine Hardwoods", "柚木硬木材料与供应资料", "需要从原材料角度理解地板候选资料的人", "https://www.eastteak.com/teak/"],
    ],
  },
  {
    id: "fitout",
    name: "柚木整装",
    label: "柚木整装候选企业",
    intro: "适合关注墙面、柜体、木作配套和空间表面材料的人。",
    entries: [
      ["Noblewood Reclaimed Teak", "再生柚木墙板、饰面板和空间材料", "关注墙面、柜体和整装木作材料的人", "https://noblewood.com/products/reclaimed-teak-panels/"],
      ["Anthology Woods", "再生柚木墙面、天花和定制材料", "关注整装表面材料和空间气质的人", "https://anthologywoods.com/products/pearly-teak"],
      ["WoodCo", "再生柚木墙板和空间饰面材料", "正在寻找墙面木作资料结构的人", "https://www.woodco.com/wallboard-danube-3d-reclaimed-teak/"],
      ["Wonderwall Studios", "木质墙面材料和空间表面产品", "关注空间表面材料和设计表达的人", "https://www.wonderwallstudios.com/"],
      ["Indoteak Design", "再生柚木地板、墙面、台面与定制", "关注同一材料在整装多位置应用的人", "https://www.indoteakdesign.com/"],
    ],
  },
  {
    id: "outdoor",
    name: "庭院户外",
    label: "庭院户外柚木候选品牌",
    intro: "适合关注庭院、露台、阳台和户外家具资料的人。",
    entries: [
      ["Westminster Teak", "户外柚木家具与庭院空间产品", "关注庭院、露台和户外家具的人", "https://westminsterteak.com/"],
      ["Barlow Tyrie", "户外家具、柚木家具和家具维护资料", "关注经典户外柚木家具品牌资料的人", "https://www.teak.com/"],
      ["Gloster", "户外家具和柚木工艺资料", "关注户外空间品质表达的人", "https://www.gloster.com/"],
      ["Royal Botania", "户外家具、庭院生活方式和相关产品", "关注户外家具体系化资料的人", "https://www.royalbotania.com/"],
      ["Kingsley Bate", "户外家具与庭院产品", "关注户外家具企业资料的人", "https://www.kingsleybate.com/"],
    ],
  },
  {
    id: "tea-room",
    name: "茶室会客",
    label: "茶室会客柚木候选品牌",
    intro: "适合关注茶桌、餐桌、会客桌椅和空间家具资料的人。",
    entries: [
      ["Hati Home", "再生柚木餐桌和家居单品", "关注茶桌、餐桌和会客桌资料的人", "https://www.hatihome.com/products/hollis-dining-table-reclaimed-teak"],
      ["Teak Two", "柚木家具和家居产品", "关注茶室会客桌椅组合的人", "https://teaktwo.com/"],
      ["Ethnicraft", "家具、餐桌和空间单品资料", "关注会客空间家具搭配的人", "https://www.ethnicraft.com/"],
      ["MasayaCo", "柚木家具、座椅和空间单品", "关注可持续家具和会客座椅的人", "https://www.masayaco.com/"],
      ["d-Bodhi", "再生柚木家具和家居产品", "关注再生柚木家具资料的人", "https://dbodhi.com/reclaimed-teak"],
    ],
  },
  {
    id: "furniture",
    name: "家具好物",
    label: "柚木家具好物候选品牌",
    intro: "适合关注桌椅、柜体、边几、茶几和工坊型家具的人。",
    entries: [
      ["Chic Teak", "柚木家具、室内外家具和家居单品", "关注桌椅、柜体和单品组合的人", "https://chicteak.com/"],
      ["Teak Two", "柚木家具和家居产品", "关注柚木桌椅、柜体和居家单品的人", "https://teaktwo.com/"],
      ["Tikamoon", "实木家具、柚木家具和材料说明", "关注柚木家具材料和保养表达的人", "https://www.tikamoon.co/ins-our-materials-95/teak-246.htm"],
      ["Ethnicraft", "家具、桌椅、柜体和空间单品", "关注整体家具风格搭配的人", "https://www.ethnicraft.com/"],
      ["MasayaCo", "手工家具、柚木座椅和空间单品", "关注手作家具和可持续设计的人", "https://www.masayaco.com/"],
    ],
  },
];

// ========== 第三部分：核心页面生成 ==========
async function buildKnowledgeIndex() {
  const starter = [
    { title: "什么是柚木", summary: "先认识树种、纹理和常见用途。", href: "topics/what-is-teak.html", meta: "约 3 分钟" },
    { title: "买柚木最容易踩的坑", summary: "把常见话术和判断盲区提前看清。", href: "topics/teak-buying-pitfalls.html", meta: "约 3 分钟" },
    { title: "柚木地板怎么选", summary: "从材料、结构、脚感和安装条件开始判断。", href: "../solutions/guides/flooring-how-to-choose.html", meta: "约 4 分钟" },
    { title: "柚木日常怎么清洁", summary: "了解温和清洁、表面维护和使用习惯。", href: "topics/teak-daily-cleaning.html", meta: "约 3 分钟" },
    { title: "品牌和工厂怎么判断", summary: "看资料完整度、服务边界和沟通方式。", href: "topics/brand-or-factory.html", meta: "约 3 分钟" },
  ];

  const groups = knowledgeCategories
    .map(
      (group) => `
      <section class="category-section">
        <div class="category-heading">
          <h2>${escapeHtml(group.name)}</h2>
          <p>${escapeHtml(group.intro)}</p>
        </div>
        <div class="featured-grid compact-grid">
${categoryCards(group.items)}
        </div>
      </section>`,
    )
    .join("\n");

  await writeProjectFile(
    "knowledge/index.html",
    shell({
      title: "柚木知识",
      description: "第一次了解柚木，先从材质、选购、空间和保养这些问题看起。",
      prefix: "../",
      footerNote: "知识内容用于帮助阅读和判断，具体资料仍需以后续人工核验为准。",
      body: `
    <main class="content-main editorial-layout">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>柚木知识</span></nav>
      <section class="page-hero">
        <p class="eyebrow dark">Teak Knowledge</p>
        <h1>柚木知识</h1>
        <p>第一次了解柚木，先从材质、选购、空间和保养这些问题看起。</p>
        <a class="btn btn-primary" href="../index.html#wechat">添加柚喜顾问</a>
      </section>
      <section class="category-section">
        <div class="category-heading">
          <h2>第一次了解柚木，先看这 5 篇</h2>
          <p>不用一口气读完全部内容，先把最容易影响判断的几个问题弄清楚。</p>
        </div>
        <div class="featured-grid">
${starter.map((item) => card(item)).join("\n")}
        </div>
      </section>
${groups}
      <section class="soft-notice">
        <h2>参考资料与说明</h2>
        <p>这里的知识内容用于帮助普通用户建立判断路径，不替代专业检测、合同确认或现场服务判断。涉及真实品牌、真实产品参数、真实案例或真实授权时，仍需以后续正式资料和人工核验为准。</p>
      </section>
      <section class="content-cta">
        <a class="btn btn-primary" href="../index.html#wechat">加入社群交流</a>
        <a class="btn btn-secondary" href="../solutions/index.html">按场景看好物方案</a>
      </section>
    </main>`,
    }),
  );
}

async function buildSolutionsIndex() {
  const sceneCards = solutionCategories
    .map(
      (item) => `
          <article class="path-card">
            <span class="compact-meta">${escapeHtml(item.name)}</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.summary)}</p>
            <p><strong>适合谁：</strong>${escapeHtml(item.forWhom)}</p>
            <ul>
              ${item.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
            </ul>
            <a class="text-link" href="${item.page}">进入这个方向</a>
          </article>`,
    )
    .join("\n");

  const featured = solutionCategories
    .map((item) => ({ ...item.items[0], title: item.items[0].title, tag: item.name }))
    .map((item) => card(item, { cta: "查看重点内容" }))
    .join("\n");

  const groups = solutionCategories
    .map(
      (group) => `
      <section class="category-section">
        <div class="category-heading">
          <h2>${escapeHtml(group.name)}</h2>
          <p>${escapeHtml(group.summary)}</p>
        </div>
        <div class="featured-grid compact-grid">
${categoryCards(group.items)}
        </div>
      </section>`,
    )
    .join("\n");

  await writeProjectFile(
    "solutions/index.html",
    shell({
      title: "柚木好物方案",
      description: "从整装、地板、庭院、茶室到家具单品，按你的生活场景找到适合先看的内容。",
      prefix: "../",
      footerNote: "好物方案用于帮助用户按生活场景查资料，真实产品与服务仍需人工确认。",
      body: `
    <main class="content-main editorial-layout">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>好物方案</span></nav>
      <section class="page-hero">
        <p class="eyebrow dark">Teak Living Scenes</p>
        <h1>柚木好物方案</h1>
        <p>从整装、地板、庭院、茶室到家具单品，按你的生活场景找到适合先看的内容。</p>
        <a class="btn btn-primary" href="../index.html#wechat">添加柚喜顾问</a>
      </section>
      <section class="category-section">
        <div class="category-heading">
          <h2>你想先看哪类柚木好物？</h2>
          <p>先选择生活场景，再进入对应内容，不用在一长串清单里找方向。</p>
        </div>
        <div class="featured-grid">
${sceneCards}
        </div>
      </section>
      <section class="category-section">
        <div class="category-heading">
          <h2>精选内容</h2>
          <p>每个方向先挑一篇最值得看的内容，适合快速建立判断。</p>
        </div>
        <div class="featured-grid compact-grid">
${featured}
        </div>
      </section>
${groups}
      <section class="soft-notice">
        <h2>阅读边界</h2>
        <p>这些内容用于帮助用户按生活场景建立判断清单，不是商城页、下单页或交易承诺页。继续查看候选企业资料时，也应理解为公开信息整理，不代表平台认证，也不构成交易担保。</p>
      </section>
      <section class="content-cta">
        <a class="btn btn-primary" href="../index.html#wechat">加入社群交流</a>
        <a class="btn btn-secondary" href="../vendors/index.html">查看候选企业资料</a>
      </section>
    </main>`,
    }),
  );
}

async function buildSolutionDetailPages() {
  for (const group of solutionCategories) {
    const topThree = group.items.slice(0, 3).map((item) => card(item)).join("\n");
    const allCards = categoryCards(group.items);

    await writeProjectFile(
      `solutions/${group.page}`,
      shell({
        title: group.name,
        description: `${group.name}专题页，适合${group.forWhom}`,
        prefix: "../",
        footerNote: `${group.name}专题用于帮助用户建立判断，不替代真实产品资料和后续人工确认。`,
        body: `
    <main class="content-main editorial-layout">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><a href="index.html">好物方案</a><span>${escapeHtml(group.name)}</span></nav>
      <section class="page-hero">
        <p class="eyebrow dark">Teak Scene Guide</p>
        <h1>${escapeHtml(group.name)}</h1>
        <p>${escapeHtml(group.summary)} ${escapeHtml(group.forWhom)}</p>
        <a class="btn btn-primary" href="../index.html#wechat">添加柚喜顾问</a>
      </section>
      <section class="category-section">
        <div class="category-heading">
          <h2>先看这 3 个问题</h2>
          <p>把影响判断的关键问题先看清，再继续展开阅读。</p>
        </div>
        <div class="featured-grid">
${topThree}
        </div>
      </section>
      <section class="category-section">
        <div class="category-heading">
          <h2>深入了解</h2>
          <p>围绕使用空间、材料表达、维护方式和服务边界继续看。</p>
        </div>
        <div class="featured-grid compact-grid">
${allCards}
        </div>
      </section>
      <section class="category-section">
        <div class="category-heading">
          <h2>这个方向应该怎么判断</h2>
          <p>先把生活场景讲清楚，再看材料和企业资料，判断会稳定很多。</p>
        </div>
        <div class="content-body">
          <p>${escapeHtml(group.name)}不是单看某一件产品，而是看它能不能进入你的真实生活。判断时建议先写下空间位置、使用频率、是否接触水、是否长期日晒、是否需要安装或维护服务，再去看材料、工艺和候选企业资料。</p>
          <p>如果资料只展示漂亮图片，却没有说明适用空间、材料结构、维护方式和服务边界，就适合先收藏为灵感，不适合直接作为决定依据。更稳妥的做法，是把图片、文字说明、企业资料和后续沟通放在一起看。</p>
          <p>对普通用户来说，这个页面的作用是帮你形成问题清单；对品牌或企业来说，它也提示未来会员站需要准备哪些公开资料。一个可阅读的页面，应该让用户知道下一步问什么，而不是只留下“看起来不错”的印象。</p>
          <p>建议阅读顺序是：先看前三个核心问题，再看五条深入内容，最后进入候选企业页。这样能先确认自己真正关心的是空间效果、材料稳定、日常维护还是服务边界，后续添加柚喜顾问沟通时也更容易说清需求。</p>
          <p>如果读完之后仍然说不清自己的空间条件、维护接受度或服务需求，建议先不要急着比较企业。可以回到柚木知识页补基础判断，或者加入社群把问题描述清楚，再决定是否继续看候选企业资料。</p>
          <p>这样的阅读方式更慢一点，但能减少后续误解，也更适合当前以公开预览和人工确认为主的网站阶段。</p>
        </div>
      </section>
      <section class="category-section">
        <div class="category-heading">
          <h2>继续沟通前可以准备什么</h2>
          <p>提前整理这些信息，会让社群交流和后续人工确认更有效。</p>
        </div>
        <div class="featured-grid compact-grid">
          <article class="content-card compact-card"><span class="compact-meta">空间</span><h3>使用位置</h3><p>说明是室内、半户外、庭院、茶室、卧室、会客厅还是餐厅，并补充采光、湿度和使用频率。</p></article>
          <article class="content-card compact-card"><span class="compact-meta">材料</span><h3>关心重点</h3><p>说明更在意稳定性、脚感、颜色、触感、结构、维护还是整体风格，避免沟通时只停留在图片偏好。</p></article>
          <article class="content-card compact-card"><span class="compact-meta">服务</span><h3>边界问题</h3><p>提前确认是否需要安装、测量、维护建议、售后说明和服务区域，后续看候选企业资料会更清楚。</p></article>
          <article class="content-card compact-card"><span class="compact-meta">资料</span><h3>核验材料</h3><p>如果继续看候选企业，需要关注企业资料、图片授权、联系方式、案例材料和服务边界是否已经确认。</p></article>
        </div>
      </section>
      <section class="soft-notice">
        <h2>相关候选企业</h2>
        <p>可以继续查看<a href="../vendors/candidates/index.html#${group.page.replace(".html", "")}">${escapeHtml(group.candidates)}</a>。这些企业资料来自公开信息整理，是否合作、是否授权展示、是否适合你的需求，仍需后续联系确认。</p>
      </section>
      <section class="soft-notice">
        <h2>边界说明</h2>
        <p>本页不承诺交付，不做平台担保，也不替代合同、售后和现场条件判断。真实合作前，请继续核实企业资料、授权资料、联系方式、案例材料和服务边界。</p>
      </section>
      <section class="content-cta">
        <a class="btn btn-primary" href="../index.html#wechat">加入社群交流</a>
        <a class="btn btn-secondary" href="index.html">返回好物方案</a>
      </section>
    </main>`,
      }),
    );
  }
}

async function buildVendorsIndex() {
  const categories = candidateGroups
    .map(
      (group) => `
          <article class="path-card">
            <span class="compact-meta">${escapeHtml(group.name)}</span>
            <h3>${escapeHtml(group.label)}</h3>
            <p>${escapeHtml(group.intro)}</p>
            <p><strong>已整理 ${group.entries.length} 家公开资料候选。</strong></p>
            <a class="text-link" href="candidates/index.html#${group.id}">查看这一类</a>
          </article>`,
    )
    .join("\n");

  const featured = candidateGroups
    .flatMap((group) => group.entries.slice(0, 2).map((entry) => ({ group, entry })))
    .slice(0, 8)
    .map(({ group, entry }) => {
      const [name, direction, audience, url] = entry;
      return `
          <article class="brand-card">
            <span class="compact-meta">${escapeHtml(group.name)}</span>
            <h3>${escapeHtml(name)}</h3>
            <p>${escapeHtml(direction)}</p>
            <p>${escapeHtml(audience)}</p>
            <a class="text-link" href="${escapeHtml(url)}" rel="nofollow noopener">查看公开来源</a>
          </article>`;
    })
    .join("\n");

  await writeProjectFile(
    "vendors/index.html",
    shell({
      title: "按柚木好物方向看企业资料",
      description: "先选择你关心的柚木好物方向，再查看对应的公开资料候选品牌或企业。",
      prefix: "../",
      footerNote: "推荐厂商入口用于查看公开候选资料，展示不等于平台担保。",
      body: `
    <main class="content-main editorial-layout">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>推荐厂商</span></nav>
      <section class="page-hero">
        <p class="eyebrow dark">Candidate Companies</p>
        <h1>按柚木好物方向看企业资料</h1>
        <p>先选择你关心的柚木好物方向，再查看对应的公开资料候选品牌或企业。</p>
        <a class="btn btn-primary" href="candidates/index.html">查看候选品牌</a>
      </section>
      <section class="category-section">
        <div class="category-heading">
          <h2>先选好物方向</h2>
          <p>地板、整装、庭院、茶室和家具好物的关注点不同，先按方向看会更清楚。</p>
        </div>
        <div class="featured-grid">
${categories}
        </div>
      </section>
      <section class="category-section">
        <div class="category-heading">
          <h2>精选候选品牌</h2>
          <p>以下只展示部分公开资料候选，完整列表可进入候选品牌页查看。</p>
        </div>
        <div class="brand-grid">
${featured}
        </div>
      </section>
      <section class="soft-notice">
        <h2>会员站展示规则说明</h2>
        <p>柚喜饰界会优先看资料完整度、好物分类匹配度、公开授权状态、联系方式确认情况和服务边界清晰度。这里不是认证排名，也不是交易担保。</p>
      </section>
      <section class="soft-notice">
        <h2>申请建立好物分类会员站</h2>
        <p>如果你是品牌、企业或工坊，可以先整理企业资料、图片授权、服务范围和案例材料，再生成申请摘要继续沟通。</p>
        <a class="btn btn-secondary" href="../forms/vendor-apply.html">进入申请页</a>
      </section>
      <section class="soft-notice">
        <p>${boundaryText()}</p>
      </section>
    </main>`,
    }),
  );
}

async function buildCandidatesPage() {
  const jump = candidateGroups
    .map((group) => `<a class="pill-button" href="#${group.id}">${escapeHtml(group.name)}</a>`)
    .join("\n          ");

  const groups = candidateGroups
    .map((group) => {
      const cards = group.entries
        .map(([name, direction, audience, url]) => `
          <article class="brand-card">
            <span class="compact-meta">${escapeHtml(group.name)}</span>
            <h3>${escapeHtml(name)}</h3>
            <p>${escapeHtml(direction)}</p>
            <p><strong>适合谁看：</strong>${escapeHtml(audience)}</p>
            <span class="status-tag">公开资料候选｜待联系确认</span>
            <a class="text-link" href="${escapeHtml(url)}" rel="nofollow noopener">查看公开来源</a>
          </article>`)
        .join("\n");

      return `
      <section class="category-section" id="${group.id}">
        <div class="category-heading">
          <h2>${escapeHtml(group.label)}</h2>
          <p>${escapeHtml(group.intro)}</p>
        </div>
        <div class="brand-grid">
${cards}
        </div>
      </section>`;
    })
    .join("\n");

  await writeProjectFile(
    "vendors/candidates/index.html",
    shell({
      title: "公开资料候选品牌",
      description: "以下资料来自公开信息整理，仅作为未来会员站展示参考。",
      prefix: "../../",
      footerNote: "候选资料来自公开信息整理，后续仍需联系确认与授权确认。",
      body: `
    <main class="content-main editorial-layout">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../../index.html">首页</a><a href="../index.html">推荐厂商</a><span>公开资料候选品牌</span></nav>
      <section class="page-hero">
        <p class="eyebrow dark">Public Candidate Brands</p>
        <h1>公开资料候选品牌</h1>
        <p>以下资料来自公开信息整理，仅作为未来会员站展示参考。是否合作、是否入驻、是否授权展示，仍需后续联系确认。</p>
        <a class="btn btn-primary" href="../../index.html#wechat">添加柚喜顾问</a>
      </section>
      <section class="category-section">
        <div class="category-heading">
          <h2>按分类查看</h2>
          <p>选择你关心的柚木好物方向，快速跳到对应候选品牌。</p>
        </div>
        <div class="inline-actions">
          ${jump}
        </div>
      </section>
${groups}
      <section class="soft-notice">
        <h2>候选资料说明</h2>
        <p>本页所有候选资料默认未联系确认、未取得图片授权、未转为真实会员站。正式上线前需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。</p>
        <p>${boundaryText()}</p>
      </section>
    </main>`,
    }),
  );
}

async function buildVendorApplyPage() {
  await writeProjectFile(
    "forms/vendor-apply.html",
    `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>申请建立好物分类会员站 - 柚喜饰界</title>
    <meta name="description" content="适合希望展示柚木地板、整装、户外、茶室或家具好物资料的品牌、企业和工坊。" />
    <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="../styles.css" />
    <script src="./form.js" defer></script>
  </head>
  <body class="content-page">
${header("../")}
    <main class="content-main editorial-layout">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>申请建立好物分类会员站</span></nav>
      <section class="page-hero">
        <p class="eyebrow dark">Vendor Apply</p>
        <h1>申请建立好物分类会员站</h1>
        <p>适合希望展示柚木地板、整装、户外、茶室或家具好物资料的品牌、企业和工坊。</p>
        <a class="btn btn-primary" href="#apply-form">开始整理资料</a>
      </section>
      <section class="category-section">
        <div class="category-heading">
          <h2>三步完成申请准备</h2>
          <p>本页不会自动提交到后台，只帮助你把沟通材料整理成清楚摘要。</p>
        </div>
        <div class="featured-grid">
          <article class="step-panel"><span>01</span><h3>选择好物分类</h3><p>先确认你更适合柚木地板、整装、户外、茶室还是家具好物方向。</p></article>
          <article class="step-panel"><span>02</span><h3>填写企业资料</h3><p>整理企业名称、主营方向、服务区域、授权图片和案例材料情况。</p></article>
          <article class="step-panel"><span>03</span><h3>生成申请摘要</h3><p>复制摘要后添加柚喜顾问，继续确认资料、授权和展示边界。</p></article>
        </div>
      </section>
      <section class="soft-notice">
        <h2>申请前请先了解</h2>
        <p>提交申请不代表已经成为真实会员站，也不代表平台认证。真实展示前需要完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。</p>
      </section>
      <section class="form-panel apply-panel" id="apply-form">
        <h2>填写申请资料</h2>
        <form class="summary-form" data-summary-form="vendor">
          <div class="form-section">
            <h3>第一步：企业与分类</h3>
            <div class="form-grid">
              <label class="form-field"><span>企业名称</span><input name="company" autocomplete="organization" placeholder="请填写企业或工作室名称" /></label>
              <label class="form-field"><span>所在地区</span><input name="region" autocomplete="address-level2" placeholder="例如：广东佛山" /></label>
              <label class="form-field"><span>主营方向</span><select name="business"><option>柚木地板</option><option>柚木整装</option><option>柚木家具</option><option>户外柚木</option><option>柚木工坊</option><option>其他</option></select></label>
              <label class="form-field"><span>服务区域</span><input name="serviceArea" placeholder="例如：华东、华南、全国或指定城市" /></label>
            </div>
          </div>
          <div class="form-section">
            <h3>第二步：授权与材料</h3>
            <div class="form-grid">
              <label class="form-field"><span>是否有真实图片授权</span><select name="imageAuth"><option>已有可公开图片授权</option><option>有图片但需确认授权</option><option>暂时没有图片材料</option></select></label>
              <label class="form-field"><span>是否有案例材料</span><select name="caseMaterial"><option>已有案例材料</option><option>有案例但需补充授权</option><option>暂时没有案例材料</option></select></label>
              <label class="form-field"><span>联系人</span><input name="contactPerson" autocomplete="name" placeholder="请填写联系人姓名或称呼" /></label>
              <label class="form-field"><span>联系方式</span><input name="contact" autocomplete="tel" placeholder="手机号、微信号或其他联系方式" /></label>
              <label class="form-field form-field-wide"><span>简要介绍</span><textarea name="intro" placeholder="简单介绍主营内容、服务经验、可公开材料情况和希望展示的方向。"></textarea></label>
            </div>
          </div>
          <div class="form-section">
            <h3>第三步：生成摘要</h3>
            <div class="form-actions">
              <button class="btn btn-primary" type="button" data-generate-summary>生成申请摘要</button>
              <button class="btn btn-secondary" type="button" data-copy-summary>复制申请摘要</button>
              <button class="btn btn-ghost form-reset-button" type="button" data-clear-form>清空重填</button>
            </div>
            <label class="form-summary"><span>申请摘要</span><textarea data-summary-output readonly placeholder="生成后，申请摘要会显示在这里。"></textarea></label>
            <p class="copy-status" data-copy-status aria-live="polite"></p>
          </div>
        </form>
      </section>
      <section class="content-cta">
        <a class="btn btn-primary" href="../index.html#wechat">返回首页社群交流</a>
        <a class="btn btn-secondary" href="../vendors/index.html">查看候选企业资料</a>
      </section>
    </main>
${footer("../", "申请建立好物分类会员站", "静态申请页只用于整理摘要，真实展示仍需完成五项确认。")}
  </body>
</html>`,
  );
}

// ========== 第四部分：公开页面表达清理 ==========
async function collectHtml(entry) {
  const absolute = path.join(projectRoot, entry);
  const stat = await fs.stat(absolute);
  if (stat.isFile()) {
    return entry.endsWith(".html") ? [entry] : [];
  }
  const files = [];
  const children = await fs.readdir(absolute, { withFileTypes: true });
  for (const child of children) {
    files.push(...(await collectHtml(path.join(entry, child.name))));
  }
  return files;
}

async function cleanupPublicHtml() {
  const entries = ["index.html", "knowledge", "solutions", "vendors", "cases", "articles", "forms", "about"];
  const files = (await Promise.all(entries.map(collectHtml))).flat();
  const replacements = [
    [/V1\.10/g, ""],
    [/V1\.9/g, ""],
    [/已把/g, "已将"],
    [/已扩展/g, "整理为"],
    [/已补充/g, "整理了"],
    [/资料入口页/g, "专题页"],
    [/资料入口/g, "阅读路径"],
    [/内容入口/g, "阅读入口"],
    [/页面内核/g, "页面重点"],
    [/当前入口仍保留/g, "导航名称保持"],
    [/本轮/g, "这次"],
    [/样板结构参考/g, "展示参考"],
    [/结构参考/g, "展示参考"],
    [/待补充说明/g, "后续说明"],
    [/公开资料来源记录/g, "公开来源说明"],
    [/来源记录/g, "来源说明"],
    [/上线阻塞项/g, "上线前需确认事项"],
    [/咨询摘要表/g, "社群交流"],
    [/填写咨询表单/g, "添加柚喜顾问"],
    [/是否为正式会员：否。/g, ""],
    [/是否已联系确认：否；是否已图片授权：否；/g, ""],
    [/好物分类页已补充五条以上可点击阅读路径。/g, "好物分类页用于帮助用户按生活场景继续阅读。"],
    [/知识索引用于帮助阅读和判断/g, "知识内容用于帮助阅读和判断"],
  ];

  for (const file of files) {
    const relative = file.replaceAll(path.sep, "/");
    let text = await readProjectFile(relative);
    text = text.replace(/<!--[\s\S]*?-->\n?/g, "");
    for (const [pattern, replacement] of replacements) {
      text = text.replace(pattern, replacement);
    }
    await writeProjectFile(relative, text);
  }
}

async function main() {
  await buildKnowledgeIndex();
  await buildSolutionsIndex();
  await buildSolutionDetailPages();
  await buildVendorsIndex();
  await buildCandidatesPage();
  await buildVendorApplyPage();
  await cleanupPublicHtml();
}

await main();
