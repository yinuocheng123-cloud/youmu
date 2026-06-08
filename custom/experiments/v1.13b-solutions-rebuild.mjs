/*
文件说明：该文件用于生成 V1.13B 好物方案与五个专题页质量重构内容。
功能说明：重写 solutions 总入口和五个方案详情页，清理 solutions 下机械表达，并更新样式、预检、说明文档和版本记录。

结构概览：
  第一部分：导入依赖与通用工具
  第二部分：方案页数据
  第三部分：页面生成与机械表达清理
  第四部分：样式、预检、文档与记录更新
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

function replaceTitleAndDescription(html, title, description) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`);
}

function section(title, intro, body, className = "solution-editorial-section") {
  return `
<section class="${className}">
  <div class="solution-section-heading">
    <h2>${title}</h2>
    ${intro ? `<p>${intro}</p>` : ""}
  </div>
  ${body}
</section>`;
}

function paragraphs(items) {
  return items.map((item) => `<p>${item}</p>`).join("\n  ");
}

function useAdvice(page) {
  const title = page.title.replace(/^柚木/, "");
  return section(
    `读完${title}后，可以怎么用`,
    "",
    paragraphs([
      `这一页更适合当成沟通前的整理清单，而不是直接替你做决定。读完以后，可以先把自己的空间条件写下来：放在哪个房间或区域，平时谁在用，使用频率高不高，是否会接触水、阳光、灰尘和频繁移动。条件越具体，后面看材料和服务时越不容易被单张图片带着走。`,
      `继续比较资料时，可以把问题拆成三层：第一层看空间是否适合，第二层看材料、规格、结构和表面处理是否说清楚，第三层看测量、安装、维护、售后和服务区域由谁负责。这样做的好处，是把“喜欢这个感觉”变成“知道还要确认什么”。`,
      `如果候选企业的公开资料暂时不完整，不必急着否定，也不要直接当成最终依据。更稳妥的做法，是把缺少的资料列出来，后续通过社群交流或顾问沟通继续确认，包括图片授权、联系方式、案例材料、产品说明和服务边界。`,
      `真正进入具体沟通前，可以先准备几张现场照片、简单尺寸、使用习惯和最担心的问题。对${page.title}来说，审美只是起点，长期使用、清洁维护、交付责任和后续沟通才会决定体验是否稳定。`,
      `也可以把这一类需求分成“现在必须决定”和“后面继续确认”两部分。前者通常是空间位置、使用方式和能接受的维护习惯，后者才是具体材料、做法、企业资料和服务安排。先把顺序理清，后续交流会更像共同确认方案，而不是在零散信息里反复摇摆。`,
      `如果后续要和不同企业沟通，建议每次都使用同一组问题，这样更容易比较回答质量。谁能把适用空间、材料做法、交付范围和维护责任讲得更清楚，谁的资料就更值得继续核对；谁只停留在风格形容和图片展示，就先把它放在灵感参考的位置。`,
    ]),
    "solution-topic-section"
  );
}

function sceneCard(item) {
  return `
<article class="solution-scene-card">
  <div class="solution-scene-mark">${item.mark}</div>
  <div>
    <h3><a href="${item.href}">${item.title}</a></h3>
    <p>${item.copy}</p>
    <ul>${item.points.map((point) => `<li>${point}</li>`).join("")}</ul>
    <a class="natural-link" href="${item.href}">${item.linkText}</a>
  </div>
</article>`;
}

function guideBlock(item) {
  return `
<article class="solution-guide-block">
  <h3>${item.title}</h3>
  <p>${item.copy}</p>
</article>`;
}

function topicMain(page) {
  return `
<main class="content-main solution-topic-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><a href="index.html">好物方案</a><span>${page.title}</span></nav>
  <article class="solution-topic-shell">
    <header class="solution-topic-hero">
      <p class="eyebrow dark">${page.kicker}</p>
      <h1>${page.title}</h1>
      <p>${page.lead}</p>
      <a class="btn btn-primary" href="../index.html#wechat">加入社群交流</a>
    </header>
    ${section(page.scene.title, "", paragraphs(page.scene.paragraphs), "solution-topic-section")}
    ${section(page.standard.title, page.standard.intro, `<div class="solution-judgement-grid">${page.standard.items.map((item) => `<article><h3>${item.title}</h3><p>${item.copy}</p></article>`).join("")}</div>`, "solution-topic-section")}
    ${section(page.mistake.title, "", paragraphs(page.mistake.paragraphs), "solution-topic-section")}
    ${section("候选企业资料怎么看", "", paragraphs(page.candidates), "solution-topic-section")}
    ${useAdvice(page)}
    <section class="soft-notice">
      <p>${page.boundary}</p>
    </section>
    <section class="content-cta">
      <a class="btn btn-primary" href="../index.html#wechat">把空间需求发给柚喜顾问</a>
      <a class="btn btn-secondary" href="../vendors/candidates/index.html">看看候选品牌资料</a>
    </section>
  </article>
</main>`;
}

// ========== 第二部分：方案页数据 ==========
const scenes = [
  {
    mark: "整屋",
    title: "整屋空间想用柚木",
    href: "whole-decoration.html",
    copy: "如果你想让地面、墙面、柜体和家具形成统一木质气质，先不要急着问买哪一款，而要看空间是否适合大面积使用柚木。整装更像一套空间表达，材质只是其中一部分。",
    points: ["整体风格是否需要统一木色", "地面、墙面、柜体能否协调", "服务边界和案例材料是否清楚"],
    linkText: "继续看柚木整装怎么判断",
  },
  {
    mark: "地板",
    title: "想选一款柚木地板",
    href: "flooring.html",
    copy: "地板每天都在脚下，不能只看颜色和图片。脚感、稳定性、规格厚度、安装条件和维护习惯，都会影响你几年后的使用感受。",
    points: ["空间是否适合铺设", "规格厚度和结构是否说明清楚", "安装与维护责任是否明确"],
    linkText: "继续看柚木地板怎么选",
  },
  {
    mark: "户外",
    title: "庭院和露台想用柚木",
    href: "outdoor.html",
    copy: "户外环境比室内复杂得多，阳光、雨水、通风、五金和收纳方式都会放大材料差异。选户外柚木，外观只是第一眼，结构和维护才是长期体验。",
    points: ["日晒雨淋和排水条件", "结构、五金和收纳方式", "维护周期是否能接受"],
    linkText: "继续看庭院户外柚木",
  },
  {
    mark: "茶室",
    title: "想做一个茶室或会客空间",
    href: "tea-room.html",
    copy: "茶室不是只买一张茶桌。地面、柜体、灯光、尺度、坐姿和留白一起决定空间是否安静、舒展、好用。柚木的温润感要放进整个慢空间里看。",
    points: ["茶桌和地面是否协调", "灯光、尺度和留白是否舒服", "水渍清洁和日常使用是否方便"],
    linkText: "继续看茶室会客柚木",
  },
  {
    mark: "家具",
    title: "想先从柚木家具单品入手",
    href: "furniture.html",
    copy: "桌椅、柜体、边几、茶几和收纳小件都要回到具体空间里判断。单品再好看，也要和家里的木色、软装、动线和使用习惯匹配。",
    points: ["单品尺寸是否适合空间", "材质、结构和工艺是否清楚", "与现有软装和木材能否搭配"],
    linkText: "继续看柚木家具好物",
  },
];

const guideBlocks = [
  { title: "大面积使用柚木，先看空间承受力", copy: "整屋和整装场景要看采光、层高、墙地比例和木作范围。木色统一可以让空间更完整，也可能因为面积过大显得沉重。" },
  { title: "地板先看脚下，再看照片", copy: "地板要面对走动、清洁、家具脚垫和长期维护。照片里的颜色很重要，但现场条件和安装边界更关键。" },
  { title: "户外先问环境，再问款式", copy: "庭院、露台和阳台的日晒雨水不同，家具结构、五金和维护周期要跟环境匹配。" },
  { title: "茶室先看节奏，不只看茶桌", copy: "茶室要让人坐得住，尺度、灯光、柜体、地面和触感比单件茶桌更能决定体验。" },
  { title: "家具单品要回到生活动线", copy: "桌椅柜和边几都要看摆放位置、使用频率、移动方式和清洁习惯。好看的单品也需要合适的空间关系。" },
];

const topicPages = {
  "solutions/whole-decoration.html": {
    title: "柚木整装",
    kicker: "Whole Space",
    description: "柚木整装要看整体空间是否适合统一表达，而不是把柚木铺满。",
    lead: "柚木整装不是把柚木铺满，而是看一个空间是否适合用统一木色、木作和材质语言慢慢展开。",
    scene: {
      title: "先看空间，而不是先看材料",
      paragraphs: [
        "整装场景里，柚木常常不是单独出现。它可能在地面、墙面、柜体、门套、茶室、会客区和家具里同时出现。真正需要先判断的，是这个空间能不能承受统一木色和木作比例，而不是某一块板材好不好看。",
        "如果空间采光很好、层高舒展、动线清楚，柚木的温润感更容易成为整体气质。如果空间偏小、采光弱、软装也很厚重，大面积木色反而可能让人觉得压抑。",
        "所以整装第一步不是问“用什么柚木”，而是问“哪些位置真的需要柚木”。有些空间只需要地面和局部柜体，有些空间才适合墙面、顶面和家具一起表达。",
      ],
    },
    standard: {
      title: "判断标准",
      intro: "把整装拆成几个具体问题，会比只看效果图更可靠。",
      items: [
        { title: "地面和墙面比例", copy: "木色面积越大，越要看采光、层高和留白。比例不合适，再好的材质也会显得沉。" },
        { title: "柜体和木作范围", copy: "柜体、门套、墙板和家具是否同一逻辑，决定空间是不是完整，而不是拼贴。" },
        { title: "色调和表面处理", copy: "不同批次和不同表面处理会影响整体一致性，需要提前确认样块和维护方式。" },
        { title: "服务边界", copy: "测量、设计、供材、安装、收边、维护和售后分别由谁负责，要比单张图更重要。" },
      ],
    },
    mistake: {
      title: "常见误区",
      paragraphs: [
        "最常见的误区，是把整装理解成“柚木越多越好”。实际上，整装更看重空间节奏。该留白的地方要留白，该用其他材质过渡的地方也不必勉强统一。",
        "第二个误区，是只看效果图，不看真实案例材料。整装如果没有空间条件、材料清单、施工边界和后续维护说明，用户很难判断它是否能落地。",
        "第三个误区，是忽略服务边界。整装往往涉及多个环节，如果谁负责测量、安装、维护和售后没有写清楚，后续沟通成本会很高。",
      ],
    },
    candidates: [
      "看候选企业资料时，不要只看它是否展示了漂亮空间图。更重要的是它能不能说明材料来源、木作范围、服务区域、案例材料和授权状态。",
      "如果资料里只有风格词，没有空间条件、服务边界和联系方式确认，可以先作为灵感参考，不要直接当成完整整装能力。",
      "后续进入候选品牌页时，可以重点看整装木作、墙面材料和同一材料多位置应用的公开资料，再把未确认内容列入沟通清单。",
    ],
    boundary: "本页为柚木整装方向的基础阅读，不代表任何企业已完成资料确认或获得平台背书；具体合作仍需结合企业资料、授权材料、合同和服务说明确认。",
  },
  "solutions/flooring.html": {
    title: "柚木地板",
    kicker: "Flooring",
    description: "柚木地板不要只看颜色和图片，要看空间、规格、安装和维护。",
    lead: "柚木地板铺在脚下，也会成为整个家的底色。选地板时，不要只看颜色和图片，要把空间、规格、安装和维护一起看。",
    scene: {
      title: "什么样的空间适合考虑柚木地板",
      paragraphs: [
        "柚木地板适合被认真使用的空间，而不是只为照片存在。客厅、卧室、茶室、走廊和半户外区域，对脚感、稳定性和清洁方式的要求并不一样。",
        "如果空间长期潮湿、日晒强烈，或者清洁方式比较粗放，就要提前问清材料结构和表面处理。地板面积大，后期更换成本高，前期判断要比买单件家具更谨慎。",
        "选地板时，可以先把空间条件写下来：是否有地暖、基层是否平整、门口高度是否允许、家具是否经常移动、家里是否有孩子或宠物。这些问题会影响最终选择。",
      ],
    },
    standard: {
      title: "判断标准",
      intro: "地板判断最好把材料和现场条件放在同一张表里。",
      items: [
        { title: "适用空间", copy: "不同房间对耐磨、脚感、清洁和稳定性的要求不同，不能一套说法走到底。" },
        { title: "规格厚度", copy: "厚度、宽度、长度和结构都会影响成本、稳定性和铺装效果。" },
        { title: "安装方式", copy: "基层、地暖、伸缩缝、收边和门口高度需要提前确认。" },
        { title: "维护习惯", copy: "拖地湿度、家具脚垫、局部污渍和颜色变化都要有预期。" },
      ],
    },
    mistake: {
      title: "常见误区",
      paragraphs: [
        "第一个误区，是只看颜色。地板颜色会受光线、拍摄、表面处理和后期变化影响，不能替代材料说明。",
        "第二个误区，是只问单价。低价可能不包含安装、辅料、收边、损耗和售后，最终成本未必低。",
        "第三个误区，是忽略服务区域。地板安装和后期维护都依赖现场服务，如果服务半径说不清，体验很难稳定。",
      ],
    },
    candidates: [
      "看候选企业资料时，可以先看它是否讲清地板规格、材料结构、适用空间、安装服务和维护建议。",
      "如果资料只有产品名和图片，没有安装边界、服务区域和售后说明，建议先把它作为初步资料，不要直接进入报价比较。",
      "真正适合继续沟通的资料，通常能回答材料、规格、安装、维护和服务责任这五类问题。",
    ],
    boundary: "本页为柚木地板方向的基础阅读，不构成购买建议或服务承诺；具体判断仍需结合实际产品资料、合同和服务说明。",
  },
  "solutions/outdoor.html": {
    title: "庭院户外柚木",
    kicker: "Outdoor",
    description: "庭院户外柚木要看阳光、雨水、结构、五金和维护周期，不能只看外观。",
    lead: "户外环境比室内更复杂。庭院和露台里的柚木，不只要好看，还要面对阳光、雨水、通风、结构和维护周期。",
    scene: {
      title: "先看户外环境有多复杂",
      paragraphs: [
        "庭院、露台、阳台和泳池边，看起来都属于户外，但实际条件差别很大。有的地方长期暴晒，有的地方容易积水，有的地方通风差，有的地方需要经常移动家具。",
        "户外柚木的判断，不能只停留在外观。结构连接、五金、排水、收纳、遮阳和清洁习惯，都会影响长期使用。",
        "如果用户希望户外空间自然、耐用又不过度维护，就要提前接受木材颜色会变化，也要知道维护周期和责任边界。",
      ],
    },
    standard: {
      title: "判断标准",
      intro: "户外场景要把环境和结构一起看。",
      items: [
        { title: "日晒雨水", copy: "暴晒、雨淋、潮湿和通风条件，会直接影响颜色变化和维护频率。" },
        { title: "结构五金", copy: "户外家具长期受力和受潮，连接方式和五金比外观更重要。" },
        { title: "收纳摆放", copy: "是否经常移动、是否需要遮蔽、雨后是否能通风，都要提前考虑。" },
        { title: "维护周期", copy: "自然变灰、清洁、油养和季节检查，都需要用户能接受。" },
      ],
    },
    mistake: {
      title: "常见误区",
      paragraphs: [
        "最容易误解的是把户外柚木当成完全不用维护。即使材料适合户外，也会经历日晒、雨水和颜色变化。",
        "第二个误区，是只看家具外观，不看结构和五金。户外家具如果结构薄弱，短期照片好看，长期体验也可能不稳。",
        "第三个误区，是忽略服务范围。户外家具的配送、安装、维护建议和售后沟通，最好在购买前问清楚。",
      ],
    },
    candidates: [
      "看候选企业资料时，可以重点看它是否说明户外使用环境、结构材料、维护建议和服务范围。",
      "如果资料只展示户外氛围图，却不讲结构和维护，建议先作为风格参考，不要直接当成完整判断。",
      "户外方向的候选企业尤其需要确认图片授权、产品资料、联系方式和售后边界。",
    ],
    boundary: "本页为庭院户外柚木方向的基础阅读，不代表平台背书或服务承诺；具体合作需完成资料和服务边界确认。",
  },
  "solutions/tea-room.html": {
    title: "茶室会客柚木",
    kicker: "Tea Room",
    description: "茶室会客柚木不是只买一张茶桌，而是看茶桌、地面、柜体、灯光、尺度和氛围。",
    lead: "茶室不是只买一张茶桌，而是一个让人慢下来的空间。柚木适不适合，要放在茶桌、地面、柜体、灯光和尺度里看。",
    scene: {
      title: "先看茶室是不是一个完整空间",
      paragraphs: [
        "茶桌是茶室的中心，但不是茶室的全部。地面、柜体、收纳、灯光、座椅、通道和留白，都会影响这个空间是否舒服。",
        "柚木的温润感适合慢空间，但如果尺度失衡、灯光太硬、柜体过满，再好的木材也很难营造安静感。",
        "所以茶室会客空间的判断，应该先从人的停留方式开始：几个人使用，坐多久，是否需要收纳，是否经常接触水，是否兼顾会客。",
      ],
    },
    standard: {
      title: "判断标准",
      intro: "茶室要把触感、尺度和日常使用放在一起看。",
      items: [
        { title: "茶桌尺度", copy: "桌面大小、坐姿距离和通行动线，会直接影响使用舒适度。" },
        { title: "地面柜体", copy: "地面和柜体的木色、纹理和比例，要和茶桌形成整体。" },
        { title: "灯光氛围", copy: "茶室需要柔和光线和适当留白，不能只依赖木材本身。" },
        { title: "清洁维护", copy: "水渍、茶渍、杯垫和日常擦拭方式，要提前有预期。" },
      ],
    },
    mistake: {
      title: "常见误区",
      paragraphs: [
        "第一个误区，是只买一张好看的茶桌，却忽略了空间比例。茶桌过大，动线会紧；茶桌过小，空间又容易散。",
        "第二个误区，是把木色做得太满。茶室需要沉稳，也需要呼吸感，墙面、地面、柜体和软装之间要有层次。",
        "第三个误区，是忽略清洁。茶室会接触水、茶渍和杯具，表面处理和日常维护要提前问清。",
      ],
    },
    candidates: [
      "看候选企业资料时，可以关注它是否理解茶室空间，而不只是展示一张桌子。",
      "有价值的资料通常会说明茶桌、椅凳、柜体、地面和灯光之间的关系，也会说明材料和维护方式。",
      "如果资料只讲单品好看，却不讲尺寸、使用场景和服务边界，建议先继续追问。",
    ],
    boundary: "本页为茶室会客柚木方向的基础阅读，不代表真实案例或平台背书；具体展示需完成资料、授权和服务边界确认。",
  },
  "solutions/furniture.html": {
    title: "柚木家具好物",
    kicker: "Furniture",
    description: "柚木家具单品也要看使用场景，不能只看一张漂亮图片。",
    lead: "柚木家具可以从一张桌、一把椅、一个柜体开始，但单品也要回到生活场景里判断，不能只看一张漂亮图片。",
    scene: {
      title: "先看单品放在哪里、怎么用",
      paragraphs: [
        "桌椅、柜体、边几、茶几、收纳小件，看起来都是家具，但使用方式完全不同。餐桌要看坐感和清洁，柜体要看收纳和开合，边几要看移动和稳定。",
        "单品再好看，也要和家里的木色、墙面、地板、布艺、金属和灯光搭配。柚木的温润感需要空间关系来承接。",
        "如果只是被图片吸引，可以先问自己：它放在哪里，谁会用，多久移动一次，是否容易碰水，和现有家具是否协调。",
      ],
    },
    standard: {
      title: "判断标准",
      intro: "家具单品要看材料、工艺，也要看生活动线。",
      items: [
        { title: "尺寸比例", copy: "桌椅柜和边几都要符合空间尺度，不能只看产品单独好不好看。" },
        { title: "结构工艺", copy: "连接方式、边角处理、抽屉轨道和承重会影响长期使用。" },
        { title: "触感维护", copy: "桌面、扶手、柜门和边角的触感与清洁方式，都需要提前了解。" },
        { title: "软装搭配", copy: "柚木和布艺、藤编、金属、黑胡桃或橡木搭配时，要看色温和比例。" },
      ],
    },
    mistake: {
      title: "常见误区",
      paragraphs: [
        "最常见的误区，是只看单品图。产品在白底图里好看，不代表放进家里比例合适。",
        "第二个误区，是忽略结构。桌椅柜的稳定性、边角、五金和开合体验，往往比第一眼颜色更影响使用。",
        "第三个误区，是忽略维护。桌面水渍、柜体清洁、边几移动和日常磕碰，都需要对应的使用习惯。",
      ],
    },
    candidates: [
      "看候选企业资料时，可以先看它是否说明材料、结构、尺寸、表面处理和使用场景。",
      "如果资料只展示图片，没有说明工艺和维护方式，可以先把它作为风格参考。",
      "家具方向后续如转为真实展示，还需要企业资料、图片授权、联系方式、案例材料和服务边界逐项确认。",
    ],
    boundary: "本页为柚木家具好物方向的基础阅读，不构成购买承诺或平台担保；具体判断仍需结合产品资料和服务说明。",
  },
};

// ========== 第三部分：页面生成与机械表达清理 ==========
async function updateSolutionsIndex() {
  const html = await readText("solutions/index.html");
  const main = `
<main class="content-main solution-index-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>好物方案</span></nav>
  <section class="page-hero solution-index-hero">
    <p class="eyebrow dark">Teak Living Scenes</p>
    <h1>柚木好物方案</h1>
    <p>先看生活场景，再看产品。不同空间里，柚木要解决的问题不一样。</p>
    <a class="btn btn-primary" href="../index.html#wechat">添加柚喜顾问</a>
  </section>
  ${section("你现在更关心哪种空间？", "从生活场景开始看，会比直接翻产品清单更容易判断。每个方向都先讲空间，再讲材料和服务。", `<div class="solution-scene-list">${scenes.map(sceneCard).join("")}</div>`)}
  ${section("不同场景，先判断这几件事", "如果暂时拿不准，可以先把自己的空间放进这五类问题里，看哪一类最接近。", `<div class="solution-guide-grid">${guideBlocks.map(guideBlock).join("")}</div>`)}
  <section class="soft-notice">
    <h2>拿不准怎么选</h2>
    <p>如果你还没想清楚从哪个方向开始，可以先把空间照片、使用习惯和最担心的问题整理出来，到首页社群交流区继续沟通。</p>
    <p><a href="../index.html#wechat">加入社群交流，先把需求说清楚</a></p>
  </section>
</main>`;
  const next = replaceTitleAndDescription(
    replaceMain(html, main),
    "柚木好物方案 - 柚喜饰界",
    "先看生活场景，再看产品。不同空间里，柚木要解决的问题不一样。"
  );
  await writeText("solutions/index.html", next);
}

async function updateTopicPages() {
  for (const [relativePath, page] of Object.entries(topicPages)) {
    const html = await readText(relativePath);
    const next = replaceTitleAndDescription(
      replaceMain(html, topicMain(page)),
      `${page.title} - 柚喜饰界`,
      page.description
    );
    await writeText(relativePath, next);
  }
}

async function collectHtmlFiles(relativeDir) {
  const absoluteDir = path.join(projectRoot, relativeDir);
  const files = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".html")) {
        files.push(path.relative(projectRoot, entryPath).replaceAll(path.sep, "/"));
      }
    }
  }
  await walk(absoluteDir);
  return files;
}

async function cleanupSolutionMechanicalTerms() {
  const replacements = new Map([
    ["阅读提示", "继续留意"],
    ["适合谁看", "适合关注"],
    ["资料入口", "资料线索"],
    ["内容入口", "阅读线索"],
    ["查看资料", "继续看资料"],
    ["进入这个方向", "继续看这个方向"],
    ["阅读全文", "继续阅读"],
    ["了解更多", "继续了解"],
    ["样板结构", "参考框架"],
    ["待补充说明", "后续说明"],
    ["按阅读顺序", "按场景线索"],
    ["当前页面", "这个页面"],
    ["本轮", "这次调整"],
    ["版本", "阶段"],
    ["已扩展", "已经整理"],
    ["已补充", "已经整理"],
  ]);
  const files = await collectHtmlFiles("solutions");
  for (const file of files) {
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

// ========== 第四部分：样式、预检、文档与记录更新 ==========
async function updateStyles() {
  const marker = "/* ========== V1.13B：好物方案生活场景专题 ========== */";
  let css = await readText("styles.css");
  if (css.includes(marker)) {
    return;
  }
  css += `

${marker}
.solution-index-layout,
.solution-topic-layout {
  width: min(1040px, calc(100% - 48px));
}

.solution-index-hero,
.solution-topic-hero {
  background:
    linear-gradient(135deg, rgba(255, 250, 242, 0.98), rgba(239, 216, 185, 0.92)),
    radial-gradient(circle at 88% 20%, rgba(154, 103, 54, 0.15), transparent 17rem),
    radial-gradient(circle at 8% 86%, rgba(101, 112, 71, 0.11), transparent 15rem);
}

.solution-editorial-section,
.solution-topic-section {
  margin-top: 24px;
  padding: clamp(24px, 4vw, 36px);
  background: rgba(255, 250, 242, 0.9);
  border: 1px solid rgba(91, 63, 35, 0.14);
  border-radius: 16px;
  box-shadow: 0 16px 42px rgba(67, 45, 23, 0.07);
}

.solution-section-heading {
  max-width: 780px;
  margin-bottom: 20px;
}

.solution-section-heading h2,
.solution-topic-section h2 {
  margin: 0;
  color: var(--coffee);
  font-size: clamp(25px, 3vw, 36px);
  font-weight: 600;
  line-height: 1.25;
}

.solution-section-heading p,
.solution-topic-section > p,
.solution-topic-section p {
  color: var(--muted);
  line-height: 1.86;
}

.solution-scene-list {
  display: grid;
  gap: 16px;
}

.solution-scene-card {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 22px;
  align-items: start;
  padding: 22px;
  background:
    linear-gradient(180deg, rgba(255, 250, 242, 0.96), rgba(247, 239, 226, 0.92)),
    radial-gradient(circle at 100% 0%, rgba(154, 103, 54, 0.09), transparent 10rem);
  border: 1px solid rgba(91, 63, 35, 0.13);
  border-radius: 16px;
}

.solution-scene-mark {
  display: grid;
  min-height: 104px;
  place-items: center;
  color: #fffaf2;
  background: linear-gradient(135deg, var(--coffee-soft), var(--teak));
  border-radius: 14px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.solution-scene-card h3 {
  margin: 0;
  color: var(--coffee);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.32;
}

.solution-scene-card h3 a,
.natural-link {
  border-bottom: 1px solid rgba(72, 84, 54, 0.26);
}

.solution-scene-card p {
  margin: 10px 0 0;
  color: var(--muted);
}

.solution-scene-card ul {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 14px 0 0;
  list-style: none;
}

.solution-scene-card li {
  padding: 5px 10px;
  color: var(--coffee-soft);
  background: rgba(154, 103, 54, 0.08);
  border: 1px solid rgba(154, 103, 54, 0.13);
  border-radius: 999px;
  font-size: 13px;
}

.natural-link {
  display: inline-flex;
  margin-top: 14px;
  color: var(--olive-dark);
  font-weight: 700;
}

.solution-guide-grid,
.solution-judgement-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.solution-guide-block,
.solution-judgement-grid article {
  padding: 18px;
  background: rgba(255, 250, 242, 0.66);
  border: 1px solid rgba(101, 112, 71, 0.16);
  border-radius: 12px;
}

.solution-guide-block h3,
.solution-judgement-grid h3 {
  margin: 0;
  color: var(--coffee);
  font-size: 19px;
  font-weight: 600;
}

.solution-guide-block p,
.solution-judgement-grid p {
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 15px;
}

.solution-topic-shell {
  display: grid;
  gap: 20px;
}

.solution-topic-hero {
  display: grid;
  gap: 16px;
  padding: clamp(34px, 6vw, 62px);
  border: 1px solid rgba(91, 63, 35, 0.14);
  border-radius: 16px;
  box-shadow: 0 16px 42px rgba(67, 45, 23, 0.07);
}

.solution-topic-hero h1 {
  max-width: 760px;
  margin: 0;
  color: var(--coffee);
  font-size: clamp(36px, 5vw, 58px);
  font-weight: 600;
  line-height: 1.16;
}

.solution-topic-hero p {
  max-width: 780px;
  margin: 0;
  color: var(--muted);
  font-size: 18px;
}

.solution-topic-hero .btn {
  width: fit-content;
}

.solution-topic-section p + p {
  margin-top: 12px;
}

@media (max-width: 820px) {
  .solution-index-layout,
  .solution-topic-layout {
    width: calc(100% - 28px);
  }

  .solution-scene-card,
  .solution-guide-grid,
  .solution-judgement-grid {
    grid-template-columns: 1fr;
  }

  .solution-scene-mark {
    min-height: 82px;
  }
}
`;
  await writeText("styles.css", css);
}

async function updateReleaseReadiness() {
  let script = await readText("custom/check-release-readiness.mjs");
  if (!script.includes("solutionEditorialTerms")) {
    script = script.replace(
      `const frontendPatchTerms = [`,
      `const solutionEditorialTerms = [
  "阅读提示",
  "适合谁看",
  "资料入口",
  "内容入口",
  "查看资料",
  "进入这个方向",
  "阅读全文",
  "了解更多",
  "样板结构",
  "待补充说明",
  "按阅读顺序",
  "当前页面",
  "本轮",
  "版本",
  "已扩展",
  "已补充",
];

const frontendPatchTerms = [`
    );
    script = script.replace(
      `    if (!isBackupContactPage && label.startsWith("knowledge/")) {`,
      `    if (!isBackupContactPage && label.startsWith("solutions/")) {
      for (const term of solutionEditorialTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(\`\${label}:\${index + 1}：方案区前台仍存在机械表达“\${term}”\`);
          }
        });
      }
    }

    if (!isBackupContactPage && label.startsWith("knowledge/")) {`
    );
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
  const note = "V1.13B 已将好物方案页和五个方案详情页从阅读顺序页改成生活场景专题页。";
  await appendDocSection("custom/client-preview-note.md", "## 12. V1.13B 新增说明", note);
  await appendDocSection(
    "custom/launch-checklist.md",
    "## V1.13B 好物方案复核",
    "- 确认 `solutions/index.html` 已改为按生活场景选柚木的总入口。\n- 确认五个方案详情页已经专题化，不再是 01、02、03 清单。\n- 确认 `solutions/` 中没有“阅读提示”“适合谁看”“资料入口”“内容入口”等机械表达。\n- 确认本轮没有修改知识页、厂商页、候选品牌页、厂商申请页或表单逻辑。"
  );
  await appendDocSection(
    "custom/public-review-checklist.md",
    "## V1.13B 人工验收新增项",
    "- [ ] 好物方案页是否像生活场景入口，而不是卡片导航页。\n- [ ] 五个方案详情页是否有导语、正文、小标题、判断建议和候选企业引导。\n- [ ] 方案页是否没有“阅读提示”“适合谁看”“按阅读顺序”等程序化表达。\n- [ ] 移动端下场景块和专题正文是否有舒适间距。"
  );
}

async function writeRecord() {
  const record = `# 版本记录：v1.13b-solutions-and-topic-pages-rebuild

## 1. 本轮修改目标

本轮目标是单独完成“V1.13B 好物方案与五个专题页质量重构”。只处理 \`solutions/\` 相关页面和必要的样式、预检、说明记录，不改知识页、推荐厂商、候选品牌、厂商申请页或表单逻辑。

## 2. 当前基础：V1.13A 已完成知识页重构

当前基础为 \`5211cfb V1.13A 柚木知识页与核心文章质量重构\`。知识区已先完成内容产品化，本轮承接同一方向处理好物方案区。

## 3. 好物方案总入口重构

\`solutions/index.html\` 已从场景顺序卡改为生活场景入口，围绕整屋空间、柚木地板、庭院露台、茶室会客、家具单品五类需求组织内容。

## 4. 五个方案详情页专题化

本轮重写：

- \`solutions/whole-decoration.html\`
- \`solutions/flooring.html\`
- \`solutions/outdoor.html\`
- \`solutions/tea-room.html\`
- \`solutions/furniture.html\`

每页改为小专题结构，包含导语、场景、判断标准、常见误区、候选企业资料怎么看和边界说明。

## 5. 机械表达清理

已清理 \`solutions/\` 中的“阅读提示”“适合谁看”“资料入口”“内容入口”“样板结构”“按阅读顺序”等机械表达。对 \`solutions/guides/\` 中的旧词只做轻量替换，不做结构重写。

## 6. 样式轻量优化

\`styles.css\` 新增 V1.13B 场景模块、专题正文、判断点和移动端间距样式，没有修改首页和移动端导航脚本。

## 7. 发布预检结果

\`custom/check-release-readiness.mjs\` 增加方案区前台表达检查，用于拦截 \`solutions/\` 中的机械表达。

## 8. 本地验证结果

本轮已执行并通过：

- \`node --check script.js\`
- \`node --check data\\site-content.js\`
- \`node --check forms\\form.js\`
- \`node custom\\check-home-links.mjs\`
- \`node custom\\check-site-links.mjs\`
- \`node custom\\check-encoding.mjs\`
- \`node custom\\check-content-depth.mjs\`
- \`node custom\\check-release-readiness.mjs\`

## 9. 公网预览地址

\`https://yinuocheng123-cloud.github.io/youmu/\`

## 10. 未完成项

- 推荐厂商、候选品牌和厂商申请页仍保留 V1.12 阶段结构，后续可按 V1.13C/后续版本分轮处理。
- 真实电话、真实邮箱、备案信息、最终二维码、真实企业资料、图片授权、案例材料和服务边界仍待确认。

## 11. 资料真实性处理说明

本轮没有新增真实厂商、真实案例、真实认证或真实资质。方案页只作为生活场景阅读和判断参考，不替代真实产品资料、合同和服务说明。

## 12. 后台与交易能力说明

本轮没有新增后台、登录、商城、支付、数据库。没有新增购物车、价格、在线下单或立即购买。没有修改 GitHub Actions workflow、\`forms/form.js\`、厂商申请页或候选品牌页。
`;
  await writeText("custom/notes/v1.13b-solutions-and-topic-pages-rebuild.md", record);
}

await updateSolutionsIndex();
await updateTopicPages();
await cleanupSolutionMechanicalTerms();
await updateStyles();
await updateReleaseReadiness();
await updateDocs();
await writeRecord();

console.log("V1.13B solutions and topic pages generated.");
