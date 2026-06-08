/*
文件说明：该文件用于生成 V1.12 子栏目图文内容重排版本。
功能说明：集中重写知识、好物方案、推荐厂商和候选品牌核心页面，并补充样式、发布预检和说明文档。

结构概览：
  第一部分：导入依赖与通用工具
  第二部分：页面数据与渲染片段
  第三部分：核心页面重写
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

function indent(text, spaces = 6) {
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

function replaceHeadText(html, title, description) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`);
}

function visualTile(label, title, tone = "grain") {
  return `
<div class="story-media">
  <div class="visual-tile visual-tile-${tone}">
    <span>${label}</span>
    <strong>${title}</strong>
  </div>
</div>`;
}

function storyItem(item, index, options = {}) {
  const number = String(index + 1).padStart(2, "0");
  const tone = item.tone || options.tone || "grain";
  const linkOpen = item.href ? `<a class="story-title-link" href="${item.href}">` : "";
  const linkClose = item.href ? `</a>` : "";
  const bullets = item.points
    ? `<ul class="story-points">${item.points.map((point) => `<li>${point}</li>`).join("")}</ul>`
    : "";
  const source = item.source
    ? `<p class="source-note">来源：<a href="${item.source.href}" rel="nofollow noopener">${item.source.label}</a></p>`
    : "";

  return `
<article class="story-item">
  ${visualTile(number, item.visual || item.title, tone)}
  <div class="story-content">
    <p class="story-kicker"><span class="story-index">${number}</span>${item.kicker || options.kicker || "阅读顺序"}</p>
    <h3>${linkOpen}${item.title}${linkClose}</h3>
    <p>${item.summary}</p>
    ${bullets}
    <p><strong>适合谁看：</strong>${item.audience}</p>
    <p><strong>阅读提示：</strong>${item.tip}</p>
    ${source}
  </div>
</article>`;
}

function smallCard(item, index) {
  const number = String(index + 1).padStart(2, "0");
  return `
<article class="ordered-mini-card">
  <span>${number}</span>
  <h3><a href="${item.href}">${item.title}</a></h3>
  <p>${item.summary}</p>
</article>`;
}

function section(title, intro, body, className = "category-section") {
  return `
<section class="${className}">
  <div class="category-heading">
    <h2>${title}</h2>
    <p>${intro}</p>
  </div>
  ${body}
</section>`;
}

// ========== 第二部分：页面数据与渲染片段 ==========
const knowledgeFirst = [
  {
    title: "什么是柚木",
    visual: "柚木入门",
    href: "topics/what-is-teak.html",
    summary: "先用自然语言把柚木为什么常被用于地板、家具、户外和空间木作讲清楚，不急着背概念。",
    audience: "第一次接触柚木、还分不清树种、用途和材料表达的人。",
    tip: "先看它适合哪些空间，再看后续选购、工艺和维护问题。",
    tone: "grain",
  },
  {
    title: "买柚木最容易踩的坑",
    visual: "选购避坑",
    href: "topics/teak-buying-pitfalls.html",
    summary: "把只看颜色、只看图片、只听一句宣传语、忽略工艺和服务边界这些常见误区提前拆开。",
    audience: "已经开始看商家页面、产品图或报价说明的人。",
    tip: "把每个卖点都追问到资料、工艺、维护和服务边界。",
    tone: "check",
  },
  {
    title: "柚木地板怎么选",
    visual: "地板场景",
    href: "../solutions/guides/flooring-how-to-choose.html",
    summary: "从材质、规格、安装、维护和使用空间看地板，而不是只看色卡或单张铺装图。",
    audience: "正在比较客厅、卧室、茶室或半户外地面材料的人。",
    tip: "先确认空间和安装条件，再回头看材料结构和维护责任。",
    tone: "floor",
  },
  {
    title: "柚木怎么保养",
    visual: "保养维护",
    href: "topics/teak-daily-cleaning.html",
    summary: "把日常清洁、户外维护、颜色变化和使用习惯放在一起理解，避免把保养想得过度简单。",
    audience: "担心变色、开裂、清洁方式或长期维护成本的人。",
    tip: "先接受木材会随环境变化，再判断自己能否接受维护节奏。",
    tone: "care",
  },
  {
    title: "品牌和工厂怎么判断",
    visual: "资料判断",
    href: "topics/brand-or-factory.html",
    summary: "重点看资料完整度、服务区域、案例材料、联系方式和边界说明，不把名称大小直接等同于可靠程度。",
    audience: "准备继续看候选品牌、工厂或会员站资料的人。",
    tip: "把未确认的信息单独列出来，后续再沟通确认。",
    tone: "brand",
  },
];

const knowledgeGroups = [
  {
    title: "柚木入门",
    intro: "先把树种、用途、空间气质和买前问题讲清楚，适合第一轮阅读。",
    items: [
      ["什么是柚木", "topics/what-is-teak.html", "从树种、常见用途和材料特征入手，建立基础认知。"],
      ["柚木为什么适合家居空间", "topics/why-teak-for-home.html", "把稳定性、触感和空间气质放在家居场景里理解。"],
      ["柚木和普通木材有什么不同", "topics/teak-vs-common-wood-basic.html", "比较材料差异，但不把差异写成绝对优劣。"],
      ["柚木常见产地与基础认知", "topics/teak-origin-basic.html", "了解产地只是起点，不能直接等同最终品质。"],
      ["买柚木前应先弄懂哪些问题", "topics/before-buying-teak-basics.html", "先整理空间、用途、维护和沟通问题。"],
    ],
  },
  {
    title: "选购避坑",
    intro: "把容易被图片、颜色、口号和单一报价带偏的问题提前拆开。",
    items: [
      ["买柚木最容易踩的坑", "topics/teak-buying-pitfalls.html", "梳理只看颜色、只听口号和忽略服务边界等误区。"],
      ["怎么判断柚木表达是否清楚", "topics/clear-teak-description.html", "看页面是否讲清材料、结构、适用空间和维护范围。"],
      ["柚木价格差异到底看什么", "topics/teak-price-difference.html", "把差异放回材料、规格、工艺和服务范围中理解。"],
      ["为什么不能只看颜色和图片", "topics/not-only-color-photo.html", "理解光线、后期处理和表面状态对判断的影响。"],
      ["选品牌或商家前要问哪些问题", "topics/questions-before-vendor.html", "整理沟通前的问题清单，让交流更聚焦。"],
    ],
  },
  {
    title: "材质工艺",
    intro: "这一组适合想把木材状态、拼接结构、干燥和表面处理看得更细的人。",
    items: [
      ["柚木含油性与稳定性怎么理解", "topics/teak-oil-stability.html", "解释含油性、耐用性和稳定性的关系。"],
      ["干燥处理为什么重要", "topics/teak-drying-process.html", "说明干燥处理对开裂、变形和长期稳定的影响。"],
      ["拼接、结构和表面处理怎么看", "topics/teak-joinery-surface.html", "理解单板、拼接、涂装和触感差异。"],
      ["地板和家具的工艺差异", "topics/flooring-vs-furniture-craft.html", "比较地板与家具在结构、受力和维护上的不同。"],
      ["表面颜色变化是否正常", "topics/teak-color-change.html", "解释氧化、日晒、清洁和维护对颜色的影响。"],
    ],
  },
  {
    title: "空间应用",
    intro: "把柚木放进整装、地板、庭院、茶室和会客空间里看，而不是孤立看单品。",
    items: [
      ["柚木适合哪些家居空间", "topics/teak-home-spaces.html", "从客厅、餐厅、茶室、卧室、阳台和庭院看适配。"],
      ["柚木整装适合什么样的家", "topics/whole-decoration-fit-home.html", "说明整装场景中柚木更适合哪些风格和沟通方式。"],
      ["柚木地板适合什么空间", "topics/flooring-fit-space.html", "围绕脚感、维护、光线和使用强度判断地板。"],
      ["庭院户外柚木怎么判断", "topics/outdoor-teak-judgement.html", "从日晒、雨水、通风、维护周期和结构安全看户外使用。"],
      ["茶室会客空间为什么适合柚木", "topics/tea-room-teak-space.html", "说明柚木在茶桌、地面、柜体和会客氛围中的作用。"],
    ],
  },
  {
    title: "保养维护",
    intro: "关注清洁、户外风化、变色、开裂和地板日常使用的人可以从这里继续。",
    items: [
      ["柚木日常怎么清洁", "topics/teak-daily-cleaning.html", "整理日常清洁的温和原则和不建议使用的粗暴方式。"],
      ["户外使用怎么维护", "topics/outdoor-teak-maintenance.html", "说明日晒、雨水和自然变灰下的维护思路。"],
      ["变色是不是问题", "topics/teak-aging-color.html", "解释自然氧化、紫外线、清洁和油养对颜色的影响。"],
      ["如何避免开裂和变形", "topics/avoid-cracking-warping.html", "围绕湿度、日晒、受力和清洁方式说明注意点。"],
      ["柚木地板日常使用注意事项", "topics/teak-flooring-daily-care.html", "整理拖地、脚垫、家具脚垫和局部污渍处理。"],
    ],
  },
  {
    title: "常见问答",
    intro: "适合快速查看用户反复会问到的价格、家庭使用和品牌选择问题。",
    items: [
      ["柚木一定贵吗", "topics/is-teak-always-expensive.html", "用更完整的变量理解价格，不写绝对结论。"],
      ["适合有孩子和宠物的家庭吗", "topics/teak-kids-pets-home.html", "从耐用、清洁、安全边角和维护接受度看家庭场景。"],
      ["可以用在卫生间或阳台吗", "topics/teak-bathroom-balcony.html", "解释潮湿空间与半户外空间的判断边界。"],
      ["柚木和黑胡桃木怎么选", "topics/teak-vs-walnut.html", "从风格、触感、维护和空间气质比较两类木材。"],
      ["选品牌还是选工厂", "topics/brand-or-factory.html", "理解品牌、工厂、服务和资料完整度之间的关系。"],
    ],
  },
];

const solutionScenes = [
  {
    title: "柚木整装",
    visual: "整装空间",
    href: "whole-decoration.html",
    summary: "适合关注整体空间、木作搭配、墙顶地柜协调的人，重点不是单品好看，而是空间能否形成一致语言。",
    audience: "正在规划私宅、民宿、茶室或会客厅整体木作的人。",
    tip: "先看空间协调、选材统一和服务边界，再看候选企业资料。",
    points: ["空间协调", "选材统一", "服务边界"],
    tone: "space",
  },
  {
    title: "柚木地板",
    visual: "地面脚感",
    href: "flooring.html",
    summary: "适合关注脚感、稳定性、安装和长期维护的人，地板判断需要把空间条件和施工边界一起看。",
    audience: "正在比较客厅、卧室、茶室或半户外地面的用户。",
    tip: "先确认使用空间和安装条件，不要只看铺装效果图。",
    points: ["材质", "安装", "维护"],
    tone: "floor",
  },
  {
    title: "庭院户外柚木",
    visual: "庭院户外",
    href: "outdoor.html",
    summary: "适合关注露台、阳台、庭院家具和户外使用的人，核心是耐候、结构与维护预期。",
    audience: "希望户外空间自然耐用，也愿意理解维护周期的人。",
    tip: "先看环境复杂度，再看结构、五金和维护方式。",
    points: ["耐候", "结构", "保养"],
    tone: "outdoor",
  },
  {
    title: "茶室会客柚木",
    visual: "茶室会客",
    href: "tea-room.html",
    summary: "适合关注氛围、触感、尺度和整体气质的人，茶室不是只买一张茶桌。",
    audience: "正在规划茶桌、地面、柜体和会客氛围的人。",
    tip: "把茶桌、地面、灯光和柜体放在同一张图里看。",
    points: ["茶桌", "地面", "柜体"],
    tone: "tea",
  },
  {
    title: "柚木家具好物",
    visual: "家具单品",
    href: "furniture.html",
    summary: "适合先从桌椅、柜体、边几、收纳等单品入手的人，重点看材质、工艺和搭配。",
    audience: "想先买单件家具，再慢慢形成木质空间的人。",
    tip: "单品也要看使用场景，不要只看产品图。",
    points: ["材质", "工艺", "搭配"],
    tone: "furniture",
  },
];

const solutionGroups = [
  {
    title: "柚木整装",
    intro: "从整体空间、定制差异、选材、搭配和页面资料完整度开始。",
    items: [
      ["柚木整装适合什么样的家", "guides/whole-decoration-fit-home.html", "判断整装是否匹配空间、预算、维护和风格预期。"],
      ["整装和普通定制有什么不同", "guides/whole-decoration-vs-custom.html", "比较整装视角与单项定制在材料、设计和沟通上的区别。"],
      ["整装选材注意事项", "guides/whole-decoration-material-check.html", "从材料来源、结构、表面处理和空间适用性看选材。"],
      ["整装空间搭配建议", "guides/whole-decoration-matching.html", "关注地面、柜体、墙面、灯光和软装之间的协调。"],
      ["整装页面应该看什么", "guides/whole-decoration-sample-structure.html", "看空间条件、材料清单、授权状态和服务边界。"],
    ],
  },
  {
    title: "柚木地板",
    intro: "地板要把使用空间、材质规格、安装条件、维护方式和服务区域放在一起看。",
    items: [
      ["柚木地板怎么选", "guides/flooring-how-to-choose.html", "从材料、结构、脚感、安装和维护五个维度看地板。"],
      ["地板适合哪些空间", "guides/flooring-fit-spaces.html", "判断客厅、卧室、茶室、过道等空间是否适合铺设。"],
      ["安装前要确认什么", "guides/flooring-before-install.html", "整理基层、地暖、伸缩缝、门口高差和现场条件。"],
      ["日常维护建议", "guides/flooring-care-guide.html", "从清洁、拖地、家具脚垫和局部污渍处理看维护。"],
      ["地板页面应该看什么", "guides/flooring-sample-structure.html", "看空间条件、材料说明、现场边界和维护责任。"],
    ],
  },
  {
    title: "庭院户外柚木",
    intro: "户外场景要先理解环境复杂度，再看家具结构、露台边界和维护周期。",
    items: [
      ["户外为什么常见柚木", "guides/outdoor-why-teak.html", "理解柚木在户外家具和庭院空间中常被讨论的原因。"],
      ["庭院家具怎么选", "guides/outdoor-furniture-choose.html", "从结构、坐感、摆放、收纳和维护看庭院家具。"],
      ["露台阳台使用注意事项", "guides/terrace-balcony-teak.html", "判断日晒、排水、承重和邻里边界。"],
      ["维护周期怎么理解", "guides/outdoor-maintenance-cycle.html", "说明清洁、自然变灰、油养和季节维护的预期。"],
      ["户外页面应该看什么", "guides/outdoor-sample-structure.html", "看环境条件、维护方式、授权资料和服务边界。"],
    ],
  },
  {
    title: "茶室会客柚木",
    intro: "茶室会客空间要把茶桌、地面、柜体、灯光和留白一起看。",
    items: [
      ["茶室为什么适合柚木", "guides/tea-room-why-teak.html", "从触感、温润感、稳定感和空间氛围理解茶室场景。"],
      ["柚木茶桌怎么选", "guides/teak-tea-table-choose.html", "从尺寸、结构、桌面处理、坐姿和使用频率看茶桌。"],
      ["地面和柜体如何搭配", "guides/tea-room-floor-cabinet.html", "整理地面、柜体、茶具收纳和墙面的搭配方式。"],
      ["会客氛围怎么做", "guides/teak-reception-atmosphere.html", "从尺度、光线、座椅、茶桌和留白理解氛围。"],
      ["茶室页面应该看什么", "guides/tea-room-sample-structure.html", "看茶桌、地面、柜体、授权状态和服务边界。"],
    ],
  },
  {
    title: "柚木家具好物",
    intro: "单品好物也要放回具体使用场景，看尺寸、结构、触感和搭配。",
    items: [
      ["柚木桌椅怎么选", "guides/teak-table-chair-choose.html", "从尺寸、坐感、结构、边角和家庭使用场景看桌椅。"],
      ["柜体和收纳怎么搭配", "guides/teak-cabinet-storage.html", "整理柜体尺寸、收纳方式、开合动线和空间比例。"],
      ["边几、茶几、单品如何选", "guides/teak-side-coffee-table.html", "从移动频率、尺度、表面维护和组合方式看小件。"],
      ["与其他木材家具怎么搭", "guides/teak-with-other-wood.html", "说明柚木与黑胡桃、橡木、藤编、金属等材质的搭配。"],
      ["家具页面应该看什么", "guides/furniture-sample-structure.html", "看单品信息、使用场景、授权状态和服务边界。"],
    ],
  },
];

const detailPages = {
  "solutions/whole-decoration.html": {
    crumb: "柚木整装",
    title: "柚木整装",
    lead: "先看整体空间，不要只看单品。整装判断的重点是地面、墙面、柜体、家具和服务边界能否合在一起。",
    items: [
      ["先看整体空间，不要只看单品", "整装不是把多个柚木单品堆在一起，而是先确认空间比例、采光、动线和生活方式。", "正在规划整屋木作或大面积木质空间的人。", "先画出空间范围，再判断哪些位置真的需要柚木。"],
      ["看木作、地面、墙面是否协调", "地面、墙面、柜体和家具如果各自表达不同，会让空间显得散。整装要先确认材质、色调和比例。", "担心不同材料拼在一起不协调的人。", "把色调、纹理和使用强度放到同一张表里比较。"],
      ["看企业是否能讲清服务边界", "整装涉及测量、设计、材料、安装、维护和售后沟通，不能只看展示图。", "需要企业持续沟通、而不是只买单品的人。", "重点问清哪些内容由对方负责，哪些需要另行确认。"],
      ["看案例材料是否完整", "案例资料应说明空间条件、材料选择、施工边界和授权状态，不能只放几张好看的图片。", "准备参考样板结构判断真实资料完整度的人。", "没有授权和联系方式确认前，不把展示当真实合作案例。"],
      ["看后续维护和沟通方式", "整装完成后的清洁、补修、局部维护和沟通路径，要在前期就形成预期。", "希望长期使用更省心的人。", "维护责任说不清时，先不要把方案当成最终承诺。"],
    ],
  },
  "solutions/flooring.html": {
    crumb: "柚木地板",
    title: "柚木地板",
    lead: "先看使用空间，再看材质、规格、安装和维护。地板不是一张色卡，而是长期踩在脚下的空间基础。",
    items: [
      ["先看使用空间", "客厅、卧室、茶室、走廊和半户外区域，对稳定性、耐磨、清洁和脚感的要求不一样。", "正在决定哪些房间适合铺柚木地板的人。", "先确认空间湿度、采光、使用频率和清洁方式。"],
      ["再看材质和规格", "材质说明、结构层次、规格尺寸和表面处理，会影响脚感、视觉比例和长期稳定。", "已经开始比较不同地板资料的人。", "不要只比较名称和颜色，要追问结构与规格。"],
      ["安装方式要提前问清", "基层条件、地暖、伸缩缝、门口高差和收边方式都可能影响最终效果。", "准备进入施工沟通阶段的人。", "把安装条件当作必问项，而不是最后才处理的细节。"],
      ["后期维护不能忽略", "日常拖地、家具脚垫、局部污渍和表面变化都需要提前有预期。", "担心柚木地板长期维护复杂的人。", "先确认自己能接受的维护频率和颜色变化。"],
      ["品牌资料和服务区域要确认", "地板往往涉及配送、安装、售后和服务半径，候选资料只提供线索。", "准备从资料阅读进入沟通确认的人。", "把企业资料、联系方式和服务边界列为确认项。"],
    ],
  },
  "solutions/outdoor.html": {
    crumb: "庭院户外柚木",
    title: "庭院户外柚木",
    lead: "户外环境比室内更复杂，日晒、雨水、通风、五金、收纳和维护周期都要提前看清。",
    items: [
      ["户外环境比室内更复杂", "露台、阳台、庭院和泳池边都有不同的日晒、雨水、排水和通风条件。", "正在为户外空间选择柚木家具或地面的人。", "先描述使用环境，再谈材料是否适合。"],
      ["结构和五金不能只看外观", "户外家具长期受力、移动、收纳和受潮，结构连接和五金耐用性需要重点确认。", "看中户外家具但担心使用寿命的人。", "图片只能看外观，结构和五金要靠资料说明。"],
      ["颜色变化要提前接受", "户外柚木会经历自然风化、变灰或维护后颜色变化，这不是单纯的质量问题。", "对颜色变化敏感的人。", "先看自己能否接受自然变化，再判断维护方式。"],
      ["维护周期要有预期", "清洁、遮蔽、油养、季节性检查和收纳方式，都会影响户外使用体验。", "希望户外空间长期保持自然状态的人。", "维护周期说不清，就先把它当成待确认项。"],
      ["候选企业资料要看服务范围", "户外项目可能涉及配送、安装、维护建议和服务区域，公开候选不等于正式合作。", "准备比较户外候选品牌的人。", "关注资料完整度，不把候选名单当成平台背书。"],
    ],
  },
  "solutions/tea-room.html": {
    crumb: "茶室会客柚木",
    title: "茶室会客柚木",
    lead: "茶室不是只买一张茶桌，而是地面、柜体、灯光、尺度和留白一起形成的慢空间。",
    items: [
      ["茶室不是只买一张茶桌", "茶桌只是中心，地面、柜体、收纳、灯光和人的停留方式共同决定茶室气质。", "正在规划茶室或会客角的人。", "先看空间整体，再决定单品尺寸。"],
      ["地面、柜体、灯光要一起看", "茶室里的木色、墙面、光线和收纳会互相影响，单独看某件家具容易失真。", "担心茶室显乱或不够沉稳的人。", "把材质、光线和留白一起纳入判断。"],
      ["柚木的温润感适合慢空间", "柚木常被用于茶室讨论，是因为触感、稳定感和自然纹理容易营造安静氛围。", "喜欢温润木质感的人。", "温润不等于无需维护，仍要看水渍和清洁习惯。"],
      ["尺寸比例比材质名词更重要", "茶桌大小、坐姿距离、通行动线和柜体尺度，往往比材料名词更直接影响体验。", "空间面积有限、担心比例失衡的人。", "先量尺寸，再看款式和材料。"],
      ["候选企业要能讲清空间理解", "茶室会客不是单件销售，候选资料应说明适用场景、材料表达和服务边界。", "准备查阅茶室方向候选资料的人。", "把空间理解能力和资料完整度一起看。"],
    ],
  },
  "solutions/furniture.html": {
    crumb: "柚木家具好物",
    title: "柚木家具好物",
    lead: "单品也要看使用场景。桌椅、柜体、边几和收纳小件，都要回到尺寸、结构、触感和搭配里判断。",
    items: [
      ["单品也要看使用场景", "餐桌、椅子、边几、茶几和柜体的使用频率不同，判断重点也不同。", "想先从单件家具入手的人。", "先写清放在哪里、谁使用、多久移动一次。"],
      ["桌椅柜不能只看图片", "图片很容易放大氛围，却看不清结构、边角、坐感、收纳和表面维护。", "已经收藏很多家具图片的人。", "每张图片背后都要追问尺寸、结构和使用条件。"],
      ["工艺和结构决定使用体验", "连接方式、边角处理、抽屉轨道、承重和表面处理，都会影响长期使用。", "担心家具好看但不好用的人。", "把触感和结构放在外观之前确认。"],
      ["与其他木材和软装要协调", "柚木与黑胡桃、橡木、藤编、布艺、金属等材质搭配时，要注意色温和比例。", "家里已有其他木材或软装的人。", "先看整体材质比例，不要让单品孤立。"],
      ["工坊或品牌资料要看完整度", "候选资料应说明材料、工艺、联系方式、授权状态和服务边界。", "准备比较家具方向候选品牌的人。", "资料越具体，后续沟通越容易聚焦。"],
    ],
  },
};

const vendorsDirections = [
  ["柚木地板候选企业", "candidates/index.html#flooring", "已整理 5 家公开资料候选，适合比较地板材料、铺装表达和服务资料。", "地板材料"],
  ["柚木整装候选企业", "candidates/index.html#fitout", "已整理 5 家公开资料候选，适合查看墙面、柜体、木作和空间表面材料。", "整装木作"],
  ["庭院户外柚木候选品牌", "candidates/index.html#outdoor", "已整理 5 家公开资料候选，适合关注户外家具、庭院和露台场景。", "户外空间"],
  ["茶室会客柚木候选品牌", "candidates/index.html#tea-room", "已整理 5 家公开资料候选，适合比较茶桌、餐桌和会客单品资料。", "茶室会客"],
  ["柚木家具好物候选品牌", "candidates/index.html#furniture", "已整理 5 家公开资料候选，适合查看桌椅、柜体、边几和单品资料。", "家具单品"],
];

const brands = {
  flooring: [
    ["Indoteak Design", "再生柚木地板、墙面材料、台面与定制构件", "正在比较再生柚木地板和室内木材资料的人", "Indoteak Design 官网公开资料", "https://www.indoteakdesign.com/"],
    ["Arc Wood & Timbers", "再生柚木地板与木材产品", "关注地板材料来源和产品页结构的人", "Arc Wood & Timbers 官网公开资料", "https://arcwoodandtimbers.com/products/reclaimed-teak-flooring/"],
    ["Luxury Wood Flooring", "实木与工程木地板资料", "希望比较地板服务表达方式的人", "Luxury Wood Flooring 官网公开资料", "https://www.luxurywoodflooring.com/"],
    ["Havwoods", "木地板、木质表面材料与项目资料", "关注地板资料体系和规格表达的人", "Havwoods 官网公开资料", "https://www.havwoods.com/"],
    ["East Teak Fine Hardwoods", "柚木硬木材料与供应资料", "需要从原材料角度理解地板候选资料的人", "East Teak Fine Hardwoods 官网公开资料", "https://www.eastteak.com/teak/"],
  ],
  fitout: [
    ["Noblewood Reclaimed Teak", "再生柚木墙板、饰面板和空间材料", "关注墙面、柜体和整装木作材料的人", "Noblewood 官网公开资料", "https://noblewood.com/products/reclaimed-teak-panels/"],
    ["Anthology Woods", "再生柚木墙面、天花和定制材料", "关注整装表面材料和空间气质的人", "Anthology Woods 官网公开资料", "https://anthologywoods.com/products/pearly-teak"],
    ["WoodCo", "再生柚木墙板和空间饰面材料", "正在寻找墙面木作资料结构的人", "WoodCo 官网公开资料", "https://www.woodco.com/wallboard-danube-3d-reclaimed-teak/"],
    ["Wonderwall Studios", "木质墙面材料和空间表面产品", "关注空间表面材料和设计表达的人", "Wonderwall Studios 官网公开资料", "https://www.wonderwallstudios.com/"],
    ["Indoteak Design", "再生柚木地板、墙面、台面与定制", "关注同一材料在整装多位置应用的人", "Indoteak Design 官网公开资料", "https://www.indoteakdesign.com/"],
  ],
  outdoor: [
    ["Westminster Teak", "户外柚木家具与庭院空间产品", "关注庭院、露台和户外家具的人", "Westminster Teak 官网公开资料", "https://westminsterteak.com/"],
    ["Barlow Tyrie", "户外家具、柚木家具和家具维护资料", "关注经典户外柚木家具品牌资料的人", "Barlow Tyrie 官网公开资料", "https://www.teak.com/"],
    ["Gloster", "户外家具和柚木工艺资料", "关注户外空间品质表达的人", "Gloster 官网公开资料", "https://www.gloster.com/"],
    ["Royal Botania", "户外家具、庭院生活方式和相关产品", "关注户外家具体系化资料的人", "Royal Botania 官网公开资料", "https://www.royalbotania.com/"],
    ["Kingsley Bate", "户外家具与庭院产品", "关注户外家具企业资料的人", "Kingsley Bate 官网公开资料", "https://www.kingsleybate.com/"],
  ],
  "tea-room": [
    ["Hati Home", "再生柚木餐桌和家居单品", "关注茶桌、餐桌和会客桌资料的人", "Hati Home 官网公开资料", "https://www.hatihome.com/products/hollis-dining-table-reclaimed-teak"],
    ["Teak Two", "柚木家具和家居产品", "关注茶室会客桌椅组合的人", "Teak Two 官网公开资料", "https://teaktwo.com/"],
    ["Ethnicraft", "家具、餐桌和空间单品资料", "关注会客空间家具搭配的人", "Ethnicraft 官网公开资料", "https://www.ethnicraft.com/"],
    ["MasayaCo", "柚木家具、座椅和空间单品", "关注可持续家具和会客座椅的人", "MasayaCo 官网公开资料", "https://www.masayaco.com/"],
    ["d-Bodhi", "再生柚木家具和家居产品", "关注再生柚木家具资料的人", "d-Bodhi 官网公开资料", "https://dbodhi.com/reclaimed-teak"],
  ],
  furniture: [
    ["Chic Teak", "柚木家具、室内外家具和家居单品", "关注桌椅、柜体和单品组合的人", "Chic Teak 官网公开资料", "https://chicteak.com/"],
    ["Teak Two", "柚木家具和家居产品", "关注柚木桌椅、柜体和居家单品的人", "Teak Two 官网公开资料", "https://teaktwo.com/"],
    ["Tikamoon", "实木家具、柚木家具和材料说明", "关注柚木家具材料和保养表达的人", "Tikamoon 官网公开资料", "https://www.tikamoon.co/ins-our-materials-95/teak-246.htm"],
    ["Ethnicraft", "家具、桌椅、柜体和空间单品", "关注整体家具风格搭配的人", "Ethnicraft 官网公开资料", "https://www.ethnicraft.com/"],
    ["MasayaCo", "手工家具、柚木座椅和空间单品", "关注手作家具和可持续设计的人", "MasayaCo 官网公开资料", "https://www.masayaco.com/"],
  ],
};

// ========== 第三部分：核心页面重写 ==========
async function updateKnowledgeIndex() {
  const html = await readText("knowledge/index.html");
  const main = `
<main class="content-main editorial-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>柚木知识</span></nav>
  <section class="page-hero">
    <p class="eyebrow dark">Teak Knowledge</p>
    <h1>柚木知识</h1>
    <p>第一次了解柚木，不用先记很多名词，先把选材、空间、工艺和保养这几件事看明白。</p>
    <a class="btn btn-primary" href="../index.html#wechat">添加柚喜顾问</a>
  </section>
  ${section("新手先按这个顺序看", "先从五个最容易影响判断的问题开始，读完这组内容，再进入细分问题会更稳。", `<div class="story-list reading-flow">${knowledgeFirst.map((item, index) => storyItem(item, index, { kicker: "新手顺序" })).join("")}</div>`)}
  ${section("继续按问题深入", "六组问题保持五条阅读线索，但改为有序小卡，不再把页面做成纯链接堆叠。", `<div class="ordered-content-grid">${knowledgeGroups.map((group) => `
    <article class="category-intro">
      <h3>${group.title}</h3>
      <p>${group.intro}</p>
      <div class="ordered-mini-list">${group.items.map(([title, href, summary], index) => smallCard({ title, href, summary }, index)).join("")}</div>
    </article>`).join("")}</div>`)}
  <section class="soft-notice">
    <h2>参考资料与阅读边界</h2>
    <p>本页内容主要用于帮助用户建立基础判断，正式选购仍需结合具体产品资料、商家说明和合同服务边界。涉及真实品牌、真实产品参数、真实案例或真实授权时，仍需以后续正式资料和人工核验为准。</p>
  </section>
  <section class="content-cta">
    <a class="btn btn-primary" href="../index.html#wechat">加入社群交流</a>
    <a class="btn btn-secondary" href="../solutions/index.html">按场景看好物方案</a>
  </section>
</main>`;
  await writeText("knowledge/index.html", replaceHeadText(replaceMain(html, main), "柚木知识 - 柚喜饰界", "第一次了解柚木，不用先记很多名词，先把选材、空间、工艺和保养这几件事看明白。"));
}

async function updateSolutionsIndex() {
  const html = await readText("solutions/index.html");
  const main = `
<main class="content-main editorial-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>好物方案</span></nav>
  <section class="page-hero">
    <p class="eyebrow dark">Teak Living Scenes</p>
    <h1>柚木好物方案</h1>
    <p>不是先看产品清单，而是先看你的生活场景。不同空间，对柚木的关注点不一样。</p>
    <a class="btn btn-primary" href="../index.html#wechat">添加柚喜顾问</a>
  </section>
  ${section("先选你的生活场景", "五个方向按阅读顺序展开，每张卡都能直接读到判断重点；标题可继续进入详情页。", `<div class="story-list reading-flow">${solutionScenes.map((item, index) => storyItem(item, index, { kicker: "场景顺序" })).join("")}</div>`)}
  ${section("每个方向先看这 5 件事", "如果已经有明确空间，可以从对应方向的五条小卡继续深入，不需要在长清单里找入口。", `<div class="ordered-content-grid">${solutionGroups.map((group) => `
    <article class="category-intro">
      <h3>${group.title}</h3>
      <p>${group.intro}</p>
      <div class="ordered-mini-list">${group.items.map(([title, href, summary], index) => smallCard({ title, href, summary }, index)).join("")}</div>
    </article>`).join("")}</div>`)}
  <section class="soft-notice">
    <h2>阅读边界</h2>
    <p>这些内容用于帮助用户按生活场景建立判断清单，不是商城页、下单页或交易承诺页。继续查看候选企业资料时，也应理解为公开信息整理，不代表平台认证，也不构成交易担保。</p>
    <p>拿不准从哪个方向看，可以先加入社群交流区，把空间和需求说清楚。</p>
  </section>
  <section class="content-cta">
    <a class="btn btn-primary" href="../index.html#wechat">加入社群交流</a>
    <a class="btn btn-secondary" href="../vendors/index.html">看候选企业资料</a>
  </section>
</main>`;
  await writeText("solutions/index.html", replaceHeadText(replaceMain(html, main), "柚木好物方案 - 柚喜饰界", "不是先看产品清单，而是先看你的生活场景。不同空间，对柚木的关注点不一样。"));
}

async function updateDetailPages() {
  for (const [relativePath, page] of Object.entries(detailPages)) {
    const html = await readText(relativePath);
    const main = `
<main class="content-main editorial-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><a href="index.html">好物方案</a><span>${page.crumb}</span></nav>
  <section class="page-hero">
    <p class="eyebrow dark">Teak Scene Guide</p>
    <h1>${page.title}</h1>
    <p>${page.lead}</p>
    <a class="btn btn-primary" href="../index.html#wechat">添加柚喜顾问</a>
  </section>
  ${section("阅读顺序", "这一页按五件事展开，先读判断逻辑，再决定是否继续查看候选企业资料。", `<div class="story-list reading-flow">${page.items.map(([title, summary, audience, tip], index) => storyItem({ title, summary, audience, tip, visual: page.title, tone: index % 2 === 0 ? "space" : "grain" }, index, { kicker: "实用判断" })).join("")}</div>`)}
  ${section("把这页用起来", `阅读${page.title}时，建议把页面当成沟通前的判断清单，而不是最终答案。`, `<div class="content-body reading-note-stack">
    <p>第一步，先把自己的空间条件写清楚：位置在哪里、日晒和潮湿情况如何、使用频率高不高、是否需要安装或后续维护。很多看起来像材料问题的分歧，最后都会回到真实空间和使用习惯上。</p>
    <p>第二步，把每一条资料拆成“已经确认”和“仍需追问”两栏。已经确认的内容可以继续保留，仍需追问的内容要在社群沟通、企业联系或未来会员站资料确认时逐项补齐，不要因为页面展示得完整就默认服务边界也已经完整。</p>
    <p>第三步，回到本页的五条顺序复核：空间是否合适、材料表达是否清楚、结构或工艺是否有说明、维护方式是否能接受、候选企业资料是否完成确认。五项都清楚之后，再进入下一步沟通会更稳。</p>
    <p>实际记录时，可以把问题写得更具体一些，例如“这个空间是否长期受潮”“是否需要现场测量”“材料表面处理是否说明清楚”“后期维护由谁负责”“展示图片是否已经授权”。这些问题看似琐碎，但它们能帮助你把审美偏好、材料判断和服务责任分开，不会把一张好看的图误读成完整方案。</p>
    <p>如果后续进入候选品牌或企业资料页，也要继续保持这个阅读方式。候选资料只是公开信息整理，不代表企业已经正式合作，也不代表图片、联系方式和案例材料都已完成确认。真正可上线的会员站，还需要在人工沟通后把企业资料、图片授权、联系方式、案例材料和服务边界逐项补齐。</p>
    <p>读完后如果仍然拿不准，可以先回到社群交流区，把空间照片、使用习惯和最担心的问题整理成文字，再决定下一步看哪类资料。</p>
  </div>`)}
  <section class="soft-notice">
    <h2>相关候选企业</h2>
    <p>后续可在<a href="../vendors/candidates/index.html">候选品牌页</a>查看这一方向的公开资料候选企业。正式合作前仍需联系确认、图片授权确认、联系方式确认、案例材料确认和服务边界确认。</p>
  </section>
  <section class="soft-notice">
    <h2>边界说明</h2>
    <p>本页用于帮助用户理解${page.title}的阅读顺序和判断重点，不是交易页面，也不代表任何企业已入驻。公开资料候选不代表平台认证，不构成平台背书或交易担保。</p>
  </section>
  <section class="content-cta">
    <a class="btn btn-primary" href="../index.html#wechat">加入社群交流</a>
    <a class="btn btn-secondary" href="index.html">返回好物方案</a>
  </section>
</main>`;
    await writeText(relativePath, replaceHeadText(replaceMain(html, main), `${page.title} - 柚喜饰界`, page.lead));
  }
}

async function updateVendorsIndex() {
  const html = await readText("vendors/index.html");
  const representative = [
    ...brands.flooring.slice(0, 2).map((brand) => ["柚木地板", ...brand]),
    ...brands.fitout.slice(0, 2).map((brand) => ["柚木整装", ...brand]),
    ...brands.outdoor.slice(0, 1).map((brand) => ["庭院户外", ...brand]),
  ];
  const main = `
<main class="content-main editorial-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>推荐厂商</span></nav>
  <section class="page-hero">
    <p class="eyebrow dark">Candidate Companies</p>
    <h1>按柚木好物方向看企业资料</h1>
    <p>先看你关心的好物方向，再看对应的公开资料候选品牌或企业。这里是资料阅读入口，不是正式会员名单。</p>
    <a class="btn btn-primary" href="candidates/index.html">候选品牌资料页</a>
  </section>
  ${section("先选好物方向", "五类方向按阅读顺序排列，标题可进入候选品牌页对应位置，卡片本身不再堆放按钮。", `<div class="story-list reading-flow">${vendorsDirections.map(([title, href, summary, visual], index) => storyItem({ title, href, summary, visual, audience: "正在按柚木好物方向筛选候选资料的人。", tip: "先看方向是否匹配，再看资料来源和确认状态。", tone: index % 2 ? "brand" : "grain" }, index, { kicker: "候选方向" })).join("")}</div>`)}
  ${section("先看几家代表性公开资料候选", "以下只展示部分候选资料，完整分组请进入候选品牌页继续阅读。", `<div class="brand-grid">${representative.map(([category, name, summary, audience, sourceLabel, sourceHref], index) => `
    <article class="brand-card ordered-brand-card">
      <span class="story-index">${String(index + 1).padStart(2, "0")}</span>
      <p class="story-kicker">${category}</p>
      <h3>${name}</h3>
      <p>${summary}</p>
      <p><strong>适合谁看：</strong>${audience}</p>
      <span class="status-tag">公开资料候选｜待联系确认</span>
      <p class="source-note">来源：<a href="${sourceHref}" rel="nofollow noopener">${sourceLabel}</a></p>
    </article>`).join("")}</div>`)}
  <section class="soft-notice">
    <h2>会员站展示边界</h2>
    <p>柚喜饰界会优先看资料完整度、好物分类匹配度、公开授权状态、联系方式确认情况和服务边界清晰度。这里不是认证排名，也不是交易担保。</p>
  </section>
  <section class="soft-notice">
    <h2>申请建立好物分类会员站</h2>
    <p>如果你是品牌、企业或工坊，可以先整理企业资料、图片授权、服务范围和案例材料，再通过<a href="../forms/vendor-apply.html">申请建立好物分类会员站</a>页面生成申请摘要继续沟通。</p>
  </section>
  <section class="soft-notice">
    <p>公开资料候选不代表已入驻，不代表平台认证，不构成平台背书或交易担保。真实会员站上线前，仍需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。</p>
  </section>
</main>`;
  await writeText("vendors/index.html", replaceHeadText(replaceMain(html, main), "按柚木好物方向看企业资料 - 柚喜饰界", "先看你关心的好物方向，再看对应的公开资料候选品牌或企业。"));
}

async function updateCandidatesIndex() {
  const html = await readText("vendors/candidates/index.html");
  const categoryMeta = [
    ["flooring", "柚木地板候选企业", "适合正在比较地板材料、地面铺装和木材供应资料的人。"],
    ["fitout", "柚木整装候选企业", "适合关注墙面、柜体、木作配套和空间表面材料的人。"],
    ["outdoor", "庭院户外柚木候选品牌", "适合关注庭院、露台、阳台和户外家具资料的人。"],
    ["tea-room", "茶室会客柚木候选品牌", "适合关注茶桌、餐桌、会客桌椅和空间家具资料的人。"],
    ["furniture", "柚木家具好物候选品牌", "适合关注桌椅、柜体、边几、茶几和工坊型家具的人。"],
  ];
  const nav = `<div class="inline-actions category-jump-list">${categoryMeta.map(([id, title]) => `<a class="pill-button" href="#${id}">${title.replace("候选企业", "").replace("候选品牌", "")}</a>`).join("")}</div>`;
  const renderedSections = categoryMeta.map(([id, title, intro]) => `
<section class="category-section" id="${id}">
  <div class="category-heading">
    <h2>${title}</h2>
    <p>${intro}</p>
  </div>
  <div class="brand-grid">${brands[id].map(([name, summary, audience, sourceLabel, sourceHref], index) => `
    <article class="brand-card ordered-brand-card">
      <span class="story-index">${String(index + 1).padStart(2, "0")}</span>
      <p class="story-kicker">${title}</p>
      <h3>${name}</h3>
      <p>${summary}</p>
      <p><strong>适合谁看：</strong>${audience}</p>
      <span class="status-tag">公开资料候选｜待联系确认</span>
      <p class="source-note">来源：<a href="${sourceHref}" rel="nofollow noopener">${sourceLabel}</a></p>
    </article>`).join("")}</div>
</section>`).join("");

  const main = `
<main class="content-main editorial-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../../index.html">首页</a><a href="../index.html">推荐厂商</a><span>公开资料候选品牌</span></nav>
  <section class="page-hero">
    <p class="eyebrow dark">Public Candidate Brands</p>
    <h1>公开资料候选品牌</h1>
    <p>以下资料来自公开信息整理，用于帮助用户先了解不同好物方向下有哪些品牌和企业值得继续查阅。是否合作、是否入驻、是否授权展示，仍需后续联系确认。</p>
    <a class="btn btn-primary" href="../../index.html#wechat">添加柚喜顾问</a>
  </section>
  <section class="category-section">
    <div class="category-heading">
      <h2>按方向阅读</h2>
      <p>先选一个方向，再按 01 到 05 阅读候选资料。来源作为小字说明，不再做成大按钮。</p>
    </div>
    ${nav}
  </section>
  ${renderedSections}
  <section class="soft-notice">
    <h2>候选资料说明</h2>
    <p>本页所有候选资料默认未联系确认、未取得图片授权、未转为真实会员站。正式上线前需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。</p>
    <p>公开资料候选不代表已入驻，不代表平台认证，不构成平台背书或交易担保。真实会员站上线前，仍需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。</p>
  </section>
</main>`;
  await writeText("vendors/candidates/index.html", replaceHeadText(replaceMain(html, main), "公开资料候选品牌 - 柚喜饰界", "公开资料候选品牌按柚木好物方向有序展示，来源为公开信息整理，后续仍需联系确认。"));
}

// ========== 第四部分：样式、预检、文档与版本记录更新 ==========
async function updateStyles() {
  const marker = "/* ========== V1.12：有序图文阅读流 ========== */";
  let css = await readText("styles.css");
  if (css.includes(marker)) {
    return;
  }

  css += `

${marker}
.story-list {
  display: grid;
  gap: 18px;
}

.story-item {
  display: grid;
  grid-template-columns: minmax(220px, 0.86fr) minmax(0, 1.3fr);
  gap: clamp(18px, 3vw, 30px);
  align-items: stretch;
  padding: clamp(18px, 3vw, 26px);
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 250, 242, 0.96), rgba(247, 239, 226, 0.92)),
    radial-gradient(circle at 100% 0%, rgba(154, 103, 54, 0.12), transparent 12rem);
  border: 1px solid rgba(91, 63, 35, 0.15);
  border-radius: 14px;
  box-shadow: 0 16px 42px rgba(67, 45, 23, 0.08);
}

.story-media {
  min-height: 220px;
}

.visual-tile {
  position: relative;
  display: grid;
  min-height: 100%;
  padding: 24px;
  overflow: hidden;
  align-content: space-between;
  color: #fffaf2;
  background:
    linear-gradient(135deg, rgba(57, 40, 25, 0.92), rgba(154, 103, 54, 0.72)),
    repeating-linear-gradient(35deg, rgba(255, 250, 242, 0.12) 0 1px, transparent 1px 16px);
  border-radius: 12px;
}

.visual-tile::after {
  position: absolute;
  right: -44px;
  bottom: -52px;
  width: 160px;
  height: 160px;
  content: "";
  background: radial-gradient(circle, rgba(255, 250, 242, 0.2), transparent 68%);
  border-radius: 50%;
}

.visual-tile span {
  position: relative;
  z-index: 1;
  display: inline-flex;
  width: fit-content;
  min-height: 34px;
  align-items: center;
  padding: 0 12px;
  color: var(--coffee);
  background: rgba(255, 250, 242, 0.88);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
}

.visual-tile strong {
  position: relative;
  z-index: 1;
  max-width: 12em;
  font-size: clamp(25px, 4vw, 38px);
  font-weight: 600;
  line-height: 1.15;
}

.visual-tile-check {
  background: linear-gradient(135deg, #485436, #9a6736);
}

.visual-tile-floor {
  background: linear-gradient(135deg, #6d4a2d, #c89962);
}

.visual-tile-care {
  background: linear-gradient(135deg, #657047, #b88a52);
}

.visual-tile-brand {
  background: linear-gradient(135deg, #392819, #657047);
}

.visual-tile-space {
  background: linear-gradient(135deg, #21170f, #9a6736 58%, #657047);
}

.visual-tile-outdoor {
  background: linear-gradient(135deg, #485436, #9a6736 72%);
}

.visual-tile-tea {
  background: linear-gradient(135deg, #2f2419, #725034 54%, #657047);
}

.visual-tile-furniture {
  background: linear-gradient(135deg, #5b3b22, #c89962);
}

.story-content {
  display: grid;
  align-content: center;
  gap: 10px;
}

.story-kicker {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 !important;
  color: var(--olive-dark) !important;
  font-size: 13px !important;
  font-weight: 700;
}

.story-index {
  display: inline-grid;
  min-width: 42px;
  height: 42px;
  place-items: center;
  color: #fffaf2;
  background: var(--olive);
  border-radius: 50%;
  font-size: 14px;
  font-weight: 700;
}

.story-content h3 {
  margin: 0;
  color: var(--coffee);
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 600;
  line-height: 1.25;
}

.story-title-link {
  color: inherit;
  border-bottom: 1px solid rgba(72, 84, 54, 0.28);
}

.story-content p {
  margin: 0;
  color: var(--muted);
  font-size: 15px;
}

.story-points {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 2px 0;
  list-style: none;
}

.story-points li {
  padding: 4px 10px;
  color: var(--coffee-soft);
  background: rgba(154, 103, 54, 0.08);
  border: 1px solid rgba(154, 103, 54, 0.13);
  border-radius: 999px;
  font-size: 12px;
}

.reading-flow {
  counter-reset: reading-flow;
}

.category-intro {
  padding: 22px;
  background: rgba(255, 250, 242, 0.64);
  border: 1px solid rgba(154, 103, 54, 0.14);
  border-radius: 12px;
}

.category-intro h3 {
  margin: 0;
  color: var(--coffee);
  font-size: 22px;
  font-weight: 600;
}

.category-intro > p {
  margin: 8px 0 16px;
  color: var(--muted);
}

.ordered-content-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.ordered-mini-list {
  display: grid;
  gap: 10px;
}

.ordered-mini-card {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 4px 12px;
  align-items: start;
  padding: 13px;
  background: rgba(255, 250, 242, 0.72);
  border: 1px solid rgba(91, 63, 35, 0.12);
  border-radius: 10px;
}

.ordered-mini-card span {
  grid-row: span 2;
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  color: #fffaf2;
  background: var(--teak);
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}

.ordered-mini-card h3 {
  margin: 0;
  color: var(--coffee);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.35;
}

.ordered-mini-card h3 a {
  border-bottom: 1px solid rgba(72, 84, 54, 0.24);
}

.ordered-mini-card p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.source-note {
  color: var(--muted) !important;
  font-size: 13px !important;
}

.source-note a {
  color: var(--olive-dark);
  border-bottom: 1px solid rgba(72, 84, 54, 0.26);
}

.ordered-brand-card {
  min-height: auto;
}

.ordered-brand-card .story-index {
  margin-bottom: 10px;
}

.category-jump-list {
  align-items: center;
}

@media (max-width: 860px) {
  .story-item {
    grid-template-columns: 1fr;
  }

  .story-media {
    min-height: 180px;
  }

  .ordered-content-grid {
    grid-template-columns: 1fr;
  }
}
`;
  await writeText("styles.css", css);
}

async function updateReleaseReadiness() {
  let script = await readText("custom/check-release-readiness.mjs");
  if (!script.includes("mechanicalButtonTerms")) {
    script = script.replace(
      `const frontendPatchTerms = [`,
      `const mechanicalButtonTerms = [
  "开始阅读",
  "查看公开来源",
  "查看资料",
  "查看这一类",
  "进入这个方向",
  "阅读全文",
  "了解更多",
  "资料入口",
  "内容入口",
];

const frontendPatchTerms = [`
    );

    script = script.replace(
      `      for (const term of frontendPatchTerms) {`,
      `      for (const term of mechanicalButtonTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(\`\${label}:\${index + 1}：发现内页机械按钮或入口文案“\${term}”\`);
          }
        });
      }

      for (const term of frontendPatchTerms) {`
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
  await appendDocSection(
    "custom/client-preview-note.md",
    "## 10. V1.12 新增说明",
    "V1.12 已将子栏目内容从按钮式卡片、资料注释和后台清单，调整为有序图文内容。知识、好物方案、推荐厂商和候选品牌页面以“可直接阅读”为目标，减少机械按钮，把来源、状态和边界说明放到合适位置。"
  );
  await appendDocSection(
    "custom/launch-checklist.md",
    "## V1.12 子栏目图文阅读复核",
    "- 确认知识页、好物方案页、五个方案详情页、推荐厂商页和候选品牌页均为有序图文阅读结构。\n- 确认内页内容卡片不再使用“开始阅读”“查看公开来源”“进入这个方向”等机械按钮文案。\n- 确认来源信息以小字文本链接呈现，候选资料仍不写成正式入驻、认证或平台担保。\n- 确认移动端导航脚本引用仍保持正确，普通用户咨询表单入口未恢复。"
  );
  await appendDocSection(
    "custom/public-review-checklist.md",
    "## V1.12 人工验收新增项",
    "- [ ] 知识页是否像正式新手阅读页，而不是链接索引或注释清单。\n- [ ] 好物方案页是否能按生活场景顺序阅读，且每个方向有图文视觉区。\n- [ ] 五个方案详情页是否直接展示五条实用判断，而不是让用户先点按钮。\n- [ ] 推荐厂商页和候选品牌页是否把来源、状态、边界说明放在自然位置。\n- [ ] 公共页面是否没有“开始阅读”“查看公开来源”“查看资料”“查看这一类”“进入这个方向”等机械按钮语言。"
  );
}

async function writeVersionRecord() {
  const record = `# 版本记录：v1.12-subcategory-ordered-visual-reading-rebuild

## 1. 本轮目标

本轮目标是完成“V1.12 子栏目图文内容重排与去按钮化阅读版”。优先处理知识、好物方案、推荐厂商和候选品牌等子栏目仍像按钮卡片、资料注释和后台清单的问题，让用户不依赖按钮也能直接顺着页面读下去。

本轮属于前台阅读体验重构和可维护性提升，不新增后台、登录、商城、支付或数据库。

## 2. 背景与上下文

本轮承接 V1.11。V1.11 已经把内页从补丁式表达改成编辑型内容页，但核心子栏目仍保留较多“开始阅读”“查看公开来源”“进入这个方向”等机械入口文案。用户反馈这些页面仍像资料索引，不像正式内容站。

V1.8.3 已修复移动端导航全站可用，因此本轮必须保留内容页 Header 和脚本引用关系，不破坏移动端菜单。

## 3. 问题分析

表面问题是页面中有按钮和入口词，真正问题是内容组织仍以“让用户点走”为主，而不是在当前页先给出阅读顺序、摘要、适合人群和阅读提示。候选品牌页还存在来源链接按钮化的问题，容易显得像后台资料表。

本轮主要瓶颈不是内容数量不足，而是已有内容的顺序、视觉层级和阅读语气还不够稳定。

## 4. 候选方案比较

方案 A：逐个页面手工替换文案。
优点是改动直观；缺点是重复度高，容易漏掉相同结构，也不利于后续继承。本轮放弃。

方案 B：新增 V1.12 生成脚本，集中定义数据和渲染结构。
优点是页面结构统一、可追踪、后续可复用；缺点是本轮新增了一个实验生成脚本，需要后续开发者知道最终 HTML 由脚本生成。本轮选择该方案。

方案 C：继续沿用 V1.11 卡片结构，只替换按钮词。
优点是改动最小；缺点是不能解决“像资料索引”的核心体验。本轮放弃。

## 5. 最终决策

本轮采用“有序图文阅读流”方案。核心页面使用 01、02、03 的顺序表达，每条内容包含视觉区、标题、正文摘要、适合谁看和阅读提示。链接保留在标题或普通文本中，不再使用明显的内容按钮。

视觉区优先使用 CSS 视觉图块，不抓取外部图片，也不使用未授权品牌 Logo、产品图或案例图。

## 6. 具体实现

本轮修改：

- \`knowledge/index.html\`：重排为“新手先按这个顺序看”和“继续按问题深入”。
- \`solutions/index.html\`：重排为“先选生活场景”和“每个方向先看这 5 件事”。
- \`solutions/whole-decoration.html\`、\`solutions/flooring.html\`、\`solutions/outdoor.html\`、\`solutions/tea-room.html\`、\`solutions/furniture.html\`：改为五条实用判断的图文阅读页。
- \`vendors/index.html\`：改为按好物方向看候选企业资料的图文目录。
- \`vendors/candidates/index.html\`：改为 5 类候选品牌资料卡片页，来源为小字文本链接。
- \`styles.css\`：新增 V1.12 story、visual tile、ordered grid、source note 等样式。
- \`custom/check-release-readiness.mjs\`：新增机械按钮语言预检。
- \`custom/client-preview-note.md\`、\`custom/launch-checklist.md\`、\`custom/public-review-checklist.md\`：补充 V1.12 说明和验收项。
- \`custom/experiments/v1.12-rebuild-ordered-visual-reading.mjs\`：保留本轮生成脚本，便于追踪结构来源。

## 7. 本轮优点

页面阅读顺序更清楚，用户不点链接也能先获得正文摘要和判断提示。候选品牌来源不再像大按钮，降低了“后台资料表”或“强推荐”的观感。CSS 视觉图块避免了未授权图片风险，同时让每条内容都有图文区域。

发布预检新增机械按钮词检查，可以防止后续又把内页改回按钮堆叠。

## 8. 本轮缺点与代价

本轮仍主要是静态内容重排，没有新增真实品牌确认、真实图片授权或真实案例材料。视觉区使用 CSS 图块，虽然安全可控，但不如真实授权图片有现场感。

生成脚本属于实验性维护资产，最终 HTML 已落地，但后续若手工改页面，脚本数据可能不同步，需要开发者选择以 HTML 为准还是继续维护脚本。

细分页本轮只做抽查和机械词检查，没有整体重写 55 个细分页，原因是当前未命中指定按钮词，且整体重写会超出“最小改动”边界。

## 9. 验证与结果

本轮已执行并通过以下验证：

- \`node --check script.js\`
- \`node --check data\\site-content.js\`
- \`node --check forms\\form.js\`
- \`node custom\\check-home-links.mjs\`
- \`node custom\\check-site-links.mjs\`
- \`node custom\\check-encoding.mjs\`
- \`node custom\\check-content-depth.mjs\`
- \`node custom\\check-release-readiness.mjs\`

其中 \`node custom\\check-content-depth.mjs\` 首次提示五个方案详情页正文偏短，本轮已补充“把这页用起来”的正文说明后复验通过。\`node custom\\check-release-readiness.mjs\` 已能检查机械按钮语言，最终未发现乱码、高风险交易表达、明显占位内容或本轮指定的机械入口文案。

## 10. 本轮结论

V1.12 的关键结论是：子栏目不应继续以“入口按钮”为中心，而应先形成可直接阅读的正文顺序。按钮可以保留在首页 CTA 或功能表单里，但内页内容卡片应减少机械按钮语言，把阅读动作交给标题链接、普通文本链接和页面顺序。

## 11. 下一轮建议

1. 部署后用手机抽查知识页、好物方案页、五个方案详情页、推荐厂商页和候选品牌页的阅读节奏。
2. 若继续优化视觉，可以在取得授权后逐步把 CSS 图块替换为真实空间或材质图片。
3. 候选品牌资料仍需逐条完成人工联系确认、图片授权、联系方式确认、案例材料确认和服务边界确认。

## 12. 公网预览地址

\`https://yinuocheng123-cloud.github.io/youmu/\`

## 13. 未完成项

- 真实电话、真实邮箱、备案信息和最终二维码仍待确认。
- 候选品牌或企业尚未完成联系确认、图片授权确认、联系方式确认、案例材料确认和服务边界确认。
- CSS 视觉图块尚未替换为授权真实图片。

## 14. 资料真实性处理说明

本轮没有新增真实厂商、真实案例、真实认证或真实资质。公开资料候选不代表已入驻，不代表平台认证，不构成平台背书或交易担保。真实会员站上线前，仍需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。

## 15. 后台与交易能力说明

本轮没有新增后台、登录、商城、支付、数据库。没有新增购物车、价格、在线下单或立即购买。没有修改 GitHub Actions workflow、sitemap 或 \`forms/form.js\` 核心摘要逻辑。
`;
  await writeText("custom/notes/v1.12-subcategory-ordered-visual-reading-rebuild.md", record);
}

await updateKnowledgeIndex();
await updateSolutionsIndex();
await updateDetailPages();
await updateVendorsIndex();
await updateCandidatesIndex();
await updateStyles();
await updateReleaseReadiness();
await updateDocs();
await writeVersionRecord();

console.log("V1.12 ordered visual reading rebuild generated.");
