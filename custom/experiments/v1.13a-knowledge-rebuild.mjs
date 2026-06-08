/*
文件说明：该文件用于生成 V1.13A 柚木知识页与核心文章质量重构内容。
功能说明：重写知识首页和核心知识文章，补充知识区文章样式、发布预检规则、说明文件和版本记录。

结构概览：
  第一部分：导入依赖与通用工具
  第二部分：知识首页与文章数据
  第三部分：页面生成逻辑
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

function sectionHtml(title, intro, body, className = "knowledge-editorial-section") {
  return `
<section class="${className}">
  <div class="knowledge-section-heading">
    <h2>${title}</h2>
    ${intro ? `<p>${intro}</p>` : ""}
  </div>
  ${body}
</section>`;
}

function articleCard(item, index) {
  const number = String(index + 1).padStart(2, "0");
  return `
<article class="knowledge-feature-card">
  <span>${number}</span>
  <h3><a href="${item.href}">${item.title}</a></h3>
  <p>${item.summary}</p>
</article>`;
}

function topicCard(item) {
  return `
<a class="knowledge-topic-link" href="${item.href}">
  <strong>${item.title}</strong>
  <span>${item.summary}</span>
</a>`;
}

function faqItem(question, answer) {
  return `
<article class="knowledge-faq-item">
  <h3>${question}</h3>
  <p>${answer}</p>
</article>`;
}

function articleSection(title, paragraphs) {
  return `
<section class="article-section">
  <h2>${title}</h2>
  ${paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("\n  ")}
</section>`;
}

function questionList(title, questions) {
  return `
<section class="article-section">
  <h2>${title}</h2>
  <ol class="article-question-list">
    ${questions.map((question) => `<li>${question}</li>`).join("\n    ")}
  </ol>
</section>`;
}

function relatedLinks(items) {
  return `
<section class="article-section article-related">
  <h2>继续看</h2>
  <ul>
    ${items.map((item) => `<li><a href="${item.href}">${item.title}</a><span>${item.summary}</span></li>`).join("\n    ")}
  </ul>
</section>`;
}

function articleMain(article) {
  const table = article.table
    ? `
<section class="article-section">
  <h2>${article.table.title}</h2>
  <div class="article-table-wrap">
    <table class="article-compare-table">
      <thead>
        <tr>${article.table.headers.map((header) => `<th>${header}</th>`).join("")}</tr>
      </thead>
      <tbody>
        ${article.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("\n        ")}
      </tbody>
    </table>
  </div>
</section>`
    : "";

  return `
<main class="content-main article-layout">
  <nav class="breadcrumb" aria-label="面包屑">
    <a href="../../index.html">首页</a><a href="../index.html">柚木知识</a><span>${article.title}</span>
  </nav>
  <article class="article-shell">
    <header class="article-hero">
      <p class="eyebrow dark">${article.kicker}</p>
      <h1>${article.title}</h1>
      <p>${article.lead}</p>
    </header>
    <div class="article-body">
      ${article.sections.map((section) => articleSection(section.title, section.paragraphs)).join("\n")}
      ${articleSection("读完后怎么用", [
        `读完“${article.title}”之后，先不要急着下结论。更稳妥的做法，是把自己正在看的产品、空间或商家页面拿出来，对照文章里的问题逐项标记：哪些已经说明清楚，哪些还只是图片、形容词或口头说法。`,
        "如果你还没有具体产品，也可以先写下自己的使用场景。比如放在客厅、卧室、茶室、庭院还是阳台，是否长期日晒，是否容易接触水，家里是否有孩子或宠物，自己能接受什么样的颜色变化和维护频率。这些信息会决定后面该看哪类资料。",
        "接着，把想问商家的问题整理成一小段文字，而不是只问“多少钱”“是不是柚木”。一个更有用的问题通常会包含空间、规格、服务和责任边界，例如材料用在哪里、规格是多少、是否包含安装、后续维护谁负责。问题越具体，得到的回答越能用于判断。",
        "整理资料时，可以把信息分成三栏：已经确认、需要商家补充、自己仍然拿不准。已经确认的内容继续保留，缺少来源、规格、授权或服务说明的内容先不要当作结论。这样看文章不会停留在阅读本身，而是能转化成后续沟通清单。",
        "如果后续要对比多个页面，也建议用同一套问题去看，不要一页看颜色，另一页看价格，最后反而失去比较基础。",
        "最后，再回到合同、产品资料和服务说明。知识文章只能帮助你建立判断框架，不能替代真实产品资料和正式约定。凡是没有写清楚的内容，都应该先列为待确认事项，而不是默认已经包含在报价或服务里。",
      ])}
      ${table}
      ${article.questions ? questionList(article.questions.title, article.questions.items) : ""}
      ${article.related ? relatedLinks(article.related) : ""}
      <section class="article-note">
        <p>${article.note}</p>
      </section>
    </div>
  </article>
</main>`;
}

// ========== 第二部分：知识首页与文章数据 ==========
const featuredArticles = [
  {
    title: "什么是柚木？",
    href: "topics/what-is-teak.html",
    summary: "很多人一听柚木，先想到贵。其实真正需要先弄明白的，不是价格，而是它为什么常被用在地板、家具、户外和空间木作里。",
  },
  {
    title: "同样叫柚木，价格为什么会差很多？",
    href: "topics/teak-price-difference.html",
    summary: "同样写着柚木，背后的原料、规格、干燥处理、表面工艺和服务边界可能完全不同。先看清这些，再谈值不值。",
  },
  {
    title: "买柚木最容易踩的坑",
    href: "topics/teak-buying-pitfalls.html",
    summary: "只看颜色、只看图片、只听一句宣传语，都容易把复杂的材料判断简化成感觉。买之前先学会问问题。",
  },
  {
    title: "柚木地板怎么选？",
    href: "topics/flooring-fit-space.html",
    summary: "地板面积大、使用时间长，不能只看铺出来的颜色。空间条件、安装方式、维护习惯和服务责任都要一起看。",
  },
  {
    title: "柚木日常怎么保养？",
    href: "topics/teak-daily-cleaning.html",
    summary: "柚木维护不需要神秘化，但也不能完全不管。先分清室内、户外、地板和家具，再决定清洁和养护方式。",
  },
];

const topicGroups = [
  {
    title: "先认识柚木",
    intro: "不急着比较品牌，先把柚木是什么、为什么常见、和普通木材有什么不同弄清楚。",
    items: [
      ["什么是柚木？", "topics/what-is-teak.html", "从树种、油性、稳定性和常见用途讲起。"],
      ["柚木常见产地与基础认知", "topics/teak-origin-basic.html", "产地可以参考，但不能直接等同最终品质。"],
      ["柚木和普通木材有什么不同", "topics/teak-vs-common-wood-basic.html", "差异不只在颜色，也在稳定性、触感和使用场景。"],
      ["柚木为什么适合家居空间", "topics/why-teak-for-home.html", "从地板、家具、茶室和户外空间理解它的常见用途。"],
    ],
  },
  {
    title: "买之前先避坑",
    intro: "当你开始看报价、图片和商家页面时，最重要的是知道哪些地方需要继续追问。",
    items: [
      ["同样叫柚木，价格为什么会差很多？", "topics/teak-price-difference.html", "把价格放回原料、规格、工艺和服务里看。"],
      ["买柚木最容易踩的坑", "topics/teak-buying-pitfalls.html", "别让颜色、图片和口号替你做判断。"],
      ["怎么判断柚木表达是否清楚", "topics/clear-teak-description.html", "看页面有没有讲清材料、工艺、维护和服务范围。"],
      ["为什么不能只看颜色和图片", "topics/not-only-color-photo.html", "光线、修图和表面处理都会影响第一眼判断。"],
      ["品牌和工厂怎么判断", "topics/brand-or-factory.html", "品牌和工厂都不是答案，资料完整度和服务边界更重要。"],
    ],
  },
  {
    title: "用起来怎么判断",
    intro: "柚木最终要放进空间里使用，地板、整装、户外、茶室和保养的判断重点并不一样。",
    items: [
      ["柚木地板怎么选？", "topics/flooring-fit-space.html", "先看空间条件，再看材质、安装和维护。"],
      ["柚木整装适合什么样的家", "topics/whole-decoration-fit-home.html", "整装要看空间比例、木作范围和长期维护。"],
      ["庭院户外柚木怎么判断", "topics/outdoor-teak-judgement.html", "户外要把日晒、雨水、结构和保养周期放在一起看。"],
      ["茶室会客空间为什么适合柚木", "topics/tea-room-teak-space.html", "茶室看的是触感、尺度、氛围和整体协调。"],
      ["柚木日常怎么保养？", "topics/teak-daily-cleaning.html", "清洁方式要跟表面处理和使用环境匹配。"],
    ],
  },
];

const faqs = [
  ["柚木是不是一定很贵？", "不一定。价格要看原料、规格、工艺、表面处理、安装服务和售后边界，不能只看名称。"],
  ["颜色越深就越好吗？", "不建议这样判断。颜色会受光线、表面处理、氧化和拍摄影响，材料说明比颜色更可靠。"],
  ["柚木适合户外吗？", "柚木常被用于户外，但仍要看结构、五金、日晒雨淋条件和后续维护方式。"],
  ["买地板和买家具的判断一样吗？", "不一样。地板更依赖空间条件、安装和长期维护，家具还要看结构、触感和尺寸比例。"],
  ["选品牌还是选工厂？", "二者都只是入口。真正要看资料是否完整、联系方式是否清楚、服务范围和售后边界是否写明。"],
  ["看完文章还拿不准怎么办？", "可以先把空间、预算、使用习惯和担心的问题整理出来，再到社群交流区继续沟通。"],
];

const articles = {
  "knowledge/topics/teak-price-difference.html": {
    title: "同样叫柚木，价格为什么会差很多？",
    kicker: "Buying Guide",
    description: "同样叫柚木，价格差异可能来自原料、规格、干燥处理、表面工艺、安装服务和责任边界。",
    lead: "很多人看柚木产品时，会发现同样叫柚木，价格可能差很多。有的按普通木材卖，有的却明显高出一截。真正的差异，不只在名字，也不只在颜色，而在原料、规格、处理工艺、安装服务和后续责任边界里。",
    sections: [
      {
        title: "价格差异首先来自原料本身",
        paragraphs: [
          "柚木不是一个只看名称就能判断的材料。不同来源、等级、采伐和加工方式，都会影响原料本身的稳定性和可用范围。即使都叫柚木，用在地板、家具、户外和整装板材里，材料状态也可能完全不同。",
          "买之前要先看资料有没有讲清木材来源、等级、含水率控制和适用空间。如果这些基础信息说不清，价格再低也不一定便宜；如果资料能把材料状态讲清楚，后面比较才有意义。",
        ],
      },
      {
        title: "规格和厚度会明显影响成本",
        paragraphs: [
          "同样是一平方米地板，厚度、宽度、长度、拼接方式和结构层次不同，成本会差很多。家具和整装板材也是一样，不能只看表面面积或单价。",
          "有些报价看起来低，是因为规格更薄、结构更简单，或者只包含基础材料；有些报价高，是因为尺寸稳定、选料更严格、损耗更高。比较时要把规格写在同一张表里，才不会被数字带偏。",
        ],
      },
      {
        title: "干燥处理和结构工艺不能忽略",
        paragraphs: [
          "木材后期是否稳定，跟干燥处理和结构工艺关系很大。处理不到位，后面可能出现变形、开裂、缝隙变化、表面起翘等问题，这些问题往往不是刚买时能一眼看出来的。",
          "看价格时，要问清楚是否做过合适的干燥处理，结构是实木、拼板还是复合结构，适合什么环境。尤其是地板、门板、柜体和户外家具，结构工艺比宣传词更重要。",
        ],
      },
      {
        title: "表面处理决定的不只是颜色",
        paragraphs: [
          "很多人看柚木，先看颜色深浅和照片质感。可是表面处理影响的不只是颜色，还包括触感、防污、维护方式、后期变化和整体审美一致性。",
          "同一块木材，开放涂装、油养、清漆或其他处理方式，会带来不同的手感和维护要求。不要只问“是不是这个颜色”，更要问表面怎么处理、以后怎么清洁、局部磨损后怎么维护。",
        ],
      },
      {
        title: "安装、交付和售后也在价格里",
        paragraphs: [
          "柚木地板、整装木作和大件家具，都不只是材料本身。测量、运输、安装、收边、现场保护、后期维护建议和售后沟通，都可能包含在价格里，也可能完全不包含。",
          "便宜报价如果只包含材料，不包含安装和后续服务，最后的实际成本可能并不低。比较时要问清报价包含哪些服务、哪些需要另算、出现问题由谁负责。",
        ],
      },
      {
        title: "资料完整度也是判断成本的一部分",
        paragraphs: [
          "一个能把来源、规格、工艺、案例材料和服务边界说清楚的商家，通常在前期整理和后续沟通上投入更多。资料完整度本身不是溢价理由，但它能降低用户理解成本和沟通风险。",
          "如果页面只给图片和情绪化描述，却不讲材料、工艺和服务边界，价格再好看也要谨慎。真正值得比较的，不是单一数字，而是完整价值。",
        ],
      },
    ],
    table: {
      title: "只看价格，和看完整价值，有什么不同？",
      headers: ["比较维度", "只看价格", "看完整价值"],
      rows: [
        ["材料说明", "只问是不是柚木", "看来源、等级、含水率和适用空间"],
        ["规格厚度", "只比单价", "把厚度、宽度、结构和损耗一起比较"],
        ["工艺处理", "只看颜色", "看干燥、拼接、表面处理和长期稳定性"],
        ["安装服务", "默认都包含", "确认测量、运输、安装、收边和现场责任"],
        ["后期维护", "买完再说", "提前了解清洁、保养、局部修复和颜色变化"],
        ["服务边界", "只听口头承诺", "看合同、说明和售后责任怎么写"],
      ],
    },
    questions: {
      title: "买前要问的 8 个问题",
      items: [
        "这是什么柚木？",
        "用于哪个空间？",
        "规格厚度是多少？",
        "是否做过干燥处理？",
        "安装和维护谁负责？",
        "报价包含哪些服务？",
        "有没有真实案例材料？",
        "售后边界怎么写？",
      ],
    },
    related: [
      { title: "买柚木最容易踩的坑", href: "teak-buying-pitfalls.html", summary: "先把常见误区排掉，再进入具体比较。" },
      { title: "品牌和工厂怎么判断", href: "brand-or-factory.html", summary: "不要只看名称，重点看资料和服务边界。" },
    ],
    note: "本文为基础选购参考，具体判断仍需结合实际产品资料、合同和服务说明。",
  },
  "knowledge/topics/what-is-teak.html": {
    title: "什么是柚木？",
    kicker: "Teak Basics",
    description: "从树种、油性、稳定性和常见用途理解柚木，不把柚木只看成一种颜色或风格。",
    lead: "第一次了解柚木，不必先背一堆名词。更重要的是先知道它为什么常被放进地板、家具、户外和空间木作里，以及哪些说法需要继续追问。",
    sections: [
      {
        title: "柚木先是一种材料，不是一种颜色",
        paragraphs: [
          "很多人第一次看柚木，是从图片里的金黄、深褐或温润木纹开始。但柚木不能只按颜色理解，颜色会受光线、表面处理、氧化时间和拍摄方式影响。",
          "真正需要先看的是材料说明：树种名称、来源、干燥状态、表面处理和适用场景。如果这些信息没有讲清楚，只凭一张图片很难判断它是不是适合你的空间。",
        ],
      },
      {
        title: "为什么柚木常被用于家居和户外",
        paragraphs: [
          "柚木被反复讨论，通常和稳定性、含油性、触感、耐用性和空间气质有关。这些特点让它常出现在地板、户外家具、茶室、柜体和整装木作里。",
          "但“常被使用”不等于哪里都适合。室内地板、半户外露台、茶桌和柜体的使用条件不同，判断时要把空间、维护和服务边界一起看。",
        ],
      },
      {
        title: "入门时最容易误解什么",
        paragraphs: [
          "第一个误解，是把柚木当成绝对高级的代名词。材料有优点，也有适用条件，不同等级、不同处理方式和不同使用空间，结果会差很多。",
          "第二个误解，是把产地、颜色或商家一句话当作最终答案。产地可以参考，颜色可以观察，但最终仍要回到材料资料、工艺说明和售后责任。",
        ],
      },
      {
        title: "普通用户应该先看哪些信息",
        paragraphs: [
          "先看这个材料准备用在哪里：地板、家具、户外还是整装。再看它的规格、结构、表面处理和维护建议。最后看商家能不能讲清服务边界。",
          "如果资料里只有风格形容，没有材料和服务说明，可以先把它当作灵感，而不是购买判断。柚木入门的重点，是让自己会问问题。",
        ],
      },
    ],
    questions: {
      title: "入门时可以先问什么",
      items: [
        "这块材料准备用在哪个空间？",
        "资料里有没有写清树种和来源？",
        "是否说明了干燥和表面处理方式？",
        "后期清洁和维护怎么做？",
        "如果用于户外，结构和五金是否适合？",
      ],
    },
    related: [
      { title: "同样叫柚木，价格为什么会差很多？", href: "teak-price-difference.html", summary: "理解名称背后的成本差异。" },
      { title: "买柚木最容易踩的坑", href: "teak-buying-pitfalls.html", summary: "把常见误区提前排掉。" },
    ],
    note: "本文为基础认知参考，具体判断仍需结合实际产品资料、合同和服务说明。",
  },
  "knowledge/topics/teak-buying-pitfalls.html": {
    title: "买柚木最容易踩的坑",
    kicker: "Buying Guide",
    description: "买柚木不要只看颜色、图片和口号，要把材料、工艺、维护和服务边界问清楚。",
    lead: "买柚木最容易踩坑的地方，不是完全看不懂，而是以为自己已经看懂了。颜色好看、图片高级、话术漂亮，都不能替代材料和服务说明。",
    sections: [
      {
        title: "只看颜色，很容易误判",
        paragraphs: [
          "柚木的颜色会因为光线、氧化、表面处理和拍摄方式变化。深一点不一定更好，浅一点也不一定差。只看颜色，容易忽略材料等级、结构和维护方式。",
          "更稳妥的做法，是把颜色当成视觉参考，同时追问树种、规格、表面处理和使用环境。颜色可以喜欢，但不能只靠颜色下判断。",
        ],
      },
      {
        title: "只看图片，会忽略使用条件",
        paragraphs: [
          "图片能呈现氛围，但很难告诉你基层条件、安装方式、结构强度和售后责任。尤其是地板、整装和户外家具，现场条件往往比图片更重要。",
          "看到漂亮图片时，可以继续问：这个空间多大、日晒如何、是否长期潮湿、材料厚度是多少、后期怎么维护。问题越具体，越不容易被图片带偏。",
        ],
      },
      {
        title: "只听一句宣传语，不够",
        paragraphs: [
          "“稳定”“耐用”“高级”“适合户外”这类词，都需要资料支撑。没有说明来源、工艺、结构和服务范围的宣传语，只能算初步印象。",
          "真正有用的信息，应该能回答材料是什么、适合哪里、怎么安装、怎么维护、出现问题谁负责。问不清这些，就先不要把宣传语当结论。",
        ],
      },
      {
        title: "忽略维护，后面容易失望",
        paragraphs: [
          "柚木不是买回去就永远不变的材料。室内会有使用痕迹，户外会有风化和颜色变化，地板还要面对清洁、家具脚垫和局部磨损。",
          "买之前要先确认自己能不能接受这种变化，以及维护频率是否适合生活习惯。如果你希望完全不用维护，就要更谨慎地选择使用位置和表面处理。",
        ],
      },
      {
        title: "服务边界说不清，是大问题",
        paragraphs: [
          "材料、安装、运输、保养和售后是否包含在报价里，直接影响最终体验。有些低价只包含材料，有些报价包含测量、安装和后续沟通。",
          "不要只问多少钱，还要问清楚包含什么、不包含什么、出了问题怎么处理。服务边界越清楚，后续争议越少。",
        ],
      },
    ],
    questions: {
      title: "买前可以问什么",
      items: [
        "这款材料适合我的空间吗？",
        "颜色来自自然氧化还是表面处理？",
        "规格、厚度和结构有没有说明？",
        "安装、运输和维护是否包含在报价里？",
        "售后责任写在哪里？",
      ],
    },
    related: [
      { title: "同样叫柚木，价格为什么会差很多？", href: "teak-price-difference.html", summary: "把报价放回完整价值里看。" },
      { title: "为什么不能只看颜色和图片", href: "not-only-color-photo.html", summary: "继续拆解视觉误区。" },
    ],
    note: "本文为基础选购参考，具体判断仍需结合实际产品资料、合同和服务说明。",
  },
  "knowledge/topics/flooring-fit-space.html": {
    title: "柚木地板怎么选？先看空间和使用方式",
    kicker: "Flooring Guide",
    description: "选柚木地板不要只看颜色，要先看空间条件、脚感、安装、维护和服务边界。",
    lead: "柚木地板铺下去以后，会长期影响脚感、清洁、光线和整个家的木色基调。选它之前，先不要急着看色卡，而要把空间和使用方式想清楚。",
    sections: [
      {
        title: "先判断空间是否适合",
        paragraphs: [
          "客厅、卧室、茶室、走廊和半户外区域，对地板的要求不同。客厅和走廊使用频率高，卧室更重脚感，茶室可能更重氛围，半户外则要看通风和潮湿风险。",
          "如果空间长期潮湿、日晒强烈或清洁方式比较粗放，就要特别谨慎。地板不是单件家具，出问题时影响面积大，前期判断要更细。",
        ],
      },
      {
        title: "不要只看颜色和铺装图",
        paragraphs: [
          "铺装图能让人快速产生想象，但颜色会受光线、拍摄和后期影响。真正要比较的是规格、厚度、结构、表面处理和安装方式。",
          "同样色调的地板，脚感、稳定性和维护方式可能不同。看图之后，下一步应该是看资料，而不是只收藏更多图片。",
        ],
      },
      {
        title: "安装条件要提前问清",
        paragraphs: [
          "地板安装涉及基层、平整度、地暖、伸缩缝、门口高度、收边方式和现场保护。任何一个环节说不清，都可能影响最终效果。",
          "买前可以先问：是否需要现场测量，是否适合地暖，是否包含安装，收边怎么处理，后期局部维修怎么沟通。地板越早把安装边界说清楚，越不容易后期扯皮。",
        ],
      },
      {
        title: "维护习惯会影响选择",
        paragraphs: [
          "柚木地板日常清洁通常不需要复杂仪式，但拖地湿度、家具脚垫、局部污渍处理和表面磨损都要有预期。家里有孩子、宠物或高频走动时，更要看耐用和维护。",
          "如果你很介意颜色变化和使用痕迹，就要提前了解表面处理和保养方式。地板是生活的一部分，不是永远静止的展示面。",
        ],
      },
      {
        title: "服务边界比一句承诺更重要",
        paragraphs: [
          "地板不是只买材料。运输、安装、损耗、辅料、收边、维护建议和售后责任，都可能影响实际成本和体验。",
          "选择时不要只问单价，要问清报价包含哪些服务，哪些需要另算，出现问题怎么处理。能把边界写清楚，才适合继续比较。",
        ],
      },
    ],
    questions: {
      title: "选地板前可以问什么",
      items: [
        "这个空间是否适合铺柚木地板？",
        "规格、厚度和结构是什么？",
        "是否适合地暖或潮湿环境？",
        "安装和收边是否包含在报价里？",
        "日常清洁和局部维护怎么做？",
      ],
    },
    related: [
      { title: "柚木地板日常使用注意事项", href: "teak-flooring-daily-care.html", summary: "继续看地板使用后的维护问题。" },
      { title: "同样叫柚木，价格为什么会差很多？", href: "teak-price-difference.html", summary: "理解价格背后的规格和服务差异。" },
    ],
    note: "本文为基础选购参考，具体判断仍需结合实际产品资料、合同和服务说明。",
  },
  "knowledge/topics/teak-daily-cleaning.html": {
    title: "柚木日常怎么保养？",
    kicker: "Care Guide",
    description: "柚木日常保养要按室内、户外、地板和家具区分，不要粗暴清洁，也不必过度神秘化。",
    lead: "柚木保养常被说得很复杂，也常被说得过于轻松。更现实的做法，是先看它用在哪里、表面怎么处理、你能接受怎样的颜色和使用痕迹。",
    sections: [
      {
        title: "先分清使用环境",
        paragraphs: [
          "室内家具、地板、茶桌、户外椅和露台家具，维护方式不应该完全一样。室内更关注灰尘、水渍和局部磨损，户外更关注日晒、雨水、通风和自然风化。",
          "同样是柚木，放在不同环境里变化速度不同。保养前先判断使用位置，比直接套用某个方法更重要。",
        ],
      },
      {
        title: "日常清洁要温和",
        paragraphs: [
          "大多数日常清洁，先从干布、微湿布和温和清洁开始。不要长期让水停留在表面，也不要频繁使用强酸、强碱或粗糙工具。",
          "如果是地板，要注意拖布湿度和家具脚垫；如果是桌面，要注意水杯、热物和油污；如果是户外家具，要关注雨后通风和积水。",
        ],
      },
      {
        title: "颜色变化不一定是坏事",
        paragraphs: [
          "柚木会因为氧化、日晒和使用产生颜色变化。户外柚木还可能逐渐变灰，这不一定代表材料坏了，但需要提前知道自己是否能接受。",
          "如果希望颜色保持更稳定，就要了解表面处理和维护频率。如果能接受自然变化，维护重点可以放在清洁、通风和结构状态上。",
        ],
      },
      {
        title: "油养不是越频繁越好",
        paragraphs: [
          "有些柚木产品会建议油养，有些表面处理并不适合频繁上油。是否需要油养，要看原本的表面处理、使用环境和商家说明。",
          "不确定时，不要自己随意混用不同养护产品。先在不显眼位置测试，或向商家确认维护方式，避免表面发黏、色差或清洁困难。",
        ],
      },
      {
        title: "维护责任也要提前问",
        paragraphs: [
          "如果购买的是地板、整装或大件家具，后续维护不只是用户自己的事。材料说明、保养建议、局部修补和售后边界，都应该在购买前问清楚。",
          "能把维护方式讲清楚的商家，更容易帮助用户建立合理预期。买之前就知道怎么用，后面才不容易因为自然变化产生误解。",
        ],
      },
    ],
    questions: {
      title: "保养前可以问什么",
      items: [
        "这个产品是室内还是户外使用？",
        "表面做过什么处理？",
        "日常可以用湿布吗？",
        "是否需要油养，多久一次？",
        "局部磨损或水渍怎么处理？",
      ],
    },
    related: [
      { title: "柚木变色是不是问题", href: "teak-aging-color.html", summary: "继续理解颜色变化和使用痕迹。" },
      { title: "户外使用怎么维护", href: "outdoor-teak-maintenance.html", summary: "看户外日晒雨水下的维护方式。" },
    ],
    note: "本文为基础保养参考，具体判断仍需结合实际产品资料、合同和服务说明。",
  },
  "knowledge/topics/brand-or-factory.html": {
    title: "柚木产品选品牌还是选工厂？",
    kicker: "Vendor Basics",
    description: "选柚木产品时，品牌和工厂都只是入口，关键仍是资料完整度、授权状态和服务边界。",
    lead: "很多人买柚木时会纠结：到底选品牌，还是选工厂？这个问题没有绝对答案。品牌和工厂都只是入口，真正要看的是谁能把材料、工艺、服务和责任讲清楚。",
    sections: [
      {
        title: "品牌的优势是表达和服务体系",
        paragraphs: [
          "成熟品牌通常更重视页面表达、产品系列、售后流程和用户沟通。对普通用户来说，资料更完整、服务路径更清楚，理解成本会低一些。",
          "但品牌名称本身不等于所有问题都解决。仍然要看材料说明、规格、表面处理、授权图片、案例材料和售后边界是否清楚。",
        ],
      },
      {
        title: "工厂的优势是材料和加工细节",
        paragraphs: [
          "工厂可能更接近材料、工艺和定制细节，能讲清加工方式、规格变化和生产边界。对于整装、定制家具或特殊尺寸需求，这类信息很重要。",
          "但工厂也不等于一定更适合普通用户。沟通、设计、安装、售后和服务区域如果说不清，后续体验仍可能不稳定。",
        ],
      },
      {
        title: "不要只比较名称，要比较资料",
        paragraphs: [
          "无论品牌还是工厂，页面资料都应该回答几个基本问题：材料是什么，用在哪里，规格如何，怎么维护，服务包含什么，出现问题怎么处理。",
          "如果一个页面只强调自己是谁，却不讲清材料和服务边界，就还不能作为完整判断。名称可以帮助你找到线索，资料才是继续比较的基础。",
        ],
      },
      {
        title: "联系方式和授权状态不能忽略",
        paragraphs: [
          "真实展示需要确认联系方式、图片授权、案例材料和企业资料。没有授权的图片和未经确认的案例，不应该被当成真实合作背书。",
          "如果你是在看候选品牌资料，更要理解它只是公开信息整理。是否合作、是否展示、是否能提供服务，都需要后续联系确认。",
        ],
      },
      {
        title: "最终看服务边界是否清楚",
        paragraphs: [
          "选品牌还是选工厂，最后都要回到服务边界。谁负责测量，谁负责安装，谁负责维护建议，售后怎么写，服务区域到哪里，这些问题比称呼更实际。",
          "如果能把边界写进合同或正式说明，后续沟通会更稳。没有边界的低价或漂亮页面，都要谨慎。",
        ],
      },
    ],
    questions: {
      title: "判断品牌或工厂前可以问什么",
      items: [
        "企业资料是否完整？",
        "材料和工艺说明是否清楚？",
        "图片和案例是否有授权？",
        "联系方式是否能确认？",
        "服务范围和售后边界怎么写？",
      ],
    },
    related: [
      { title: "买柚木最容易踩的坑", href: "teak-buying-pitfalls.html", summary: "先避开常见判断误区。" },
      { title: "同样叫柚木，价格为什么会差很多？", href: "teak-price-difference.html", summary: "继续看报价背后的真实差异。" },
    ],
    note: "本文为基础判断参考，具体合作仍需结合企业资料、合同和服务说明。",
  },
};

// ========== 第三部分：页面生成逻辑 ==========
async function updateKnowledgeIndex() {
  const html = await readText("knowledge/index.html");
  const main = `
<main class="content-main editorial-layout knowledge-library">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>柚木知识</span></nav>
  <section class="page-hero knowledge-hero">
    <p class="eyebrow dark">Teak Knowledge</p>
    <h1>柚木知识</h1>
    <p>第一次了解柚木，不用先记一堆名词，先把材质、价格、选购、空间和保养看明白。</p>
    <a class="btn btn-primary" href="../index.html#wechat">添加柚喜顾问</a>
  </section>
  ${sectionHtml("新手先读这 5 篇", "先读这几篇，就能把最常见的材料、价格、选购、地板和保养问题串起来。", `<div class="knowledge-feature-list">${featuredArticles.map(articleCard).join("")}</div>`)}
  ${sectionHtml("按问题查找", "如果已经有明确问题，可以从下面三组继续看。这里保留必要入口，不再把所有内容一口气堆出来。", `<div class="knowledge-topic-groups">${topicGroups.map((group) => `
    <article class="knowledge-topic-group">
      <h3>${group.title}</h3>
      <p>${group.intro}</p>
      <div class="knowledge-topic-list">${group.items.map(([title, href, summary]) => topicCard({ title, href, summary })).join("")}</div>
    </article>`).join("")}</div>`)}
  ${sectionHtml("常见问题", "", `<div class="knowledge-faq-grid">${faqs.map(([question, answer]) => faqItem(question, answer)).join("")}</div>`)}
  <section class="soft-notice knowledge-note">
    <p>本页内容主要用于帮助用户建立基础判断，正式选购仍需结合具体产品资料、商家说明和合同服务边界。</p>
  </section>
  <section class="content-cta">
    <a class="btn btn-primary" href="../index.html#wechat">加入社群交流</a>
    <a class="btn btn-secondary" href="../solutions/index.html">按生活场景看好物方案</a>
  </section>
</main>`;
  const next = replaceTitleAndDescription(
    replaceMain(html, main),
    "柚木知识 - 柚喜饰界",
    "第一次了解柚木，不用先记一堆名词，先把材质、价格、选购、空间和保养看明白。"
  );
  await writeText("knowledge/index.html", next);
}

async function updateArticles() {
  for (const [relativePath, article] of Object.entries(articles)) {
    const html = await readText(relativePath);
    const next = replaceTitleAndDescription(
      replaceMain(html, articleMain(article)),
      `${article.title} - 柚喜饰界`,
      article.description
    );
    await writeText(relativePath, next);
  }
}

// ========== 第四部分：样式、预检、文档与记录更新 ==========
async function updateStyles() {
  const marker = "/* ========== V1.13A：知识库与文章质量优化 ========== */";
  let css = await readText("styles.css");
  if (css.includes(marker)) {
    return;
  }

  css += `

${marker}
.knowledge-library {
  width: min(1040px, calc(100% - 48px));
}

.knowledge-hero {
  background:
    linear-gradient(135deg, rgba(255, 250, 242, 0.98), rgba(239, 216, 185, 0.92)),
    radial-gradient(circle at 88% 18%, rgba(154, 103, 54, 0.16), transparent 17rem),
    radial-gradient(circle at 8% 86%, rgba(101, 112, 71, 0.12), transparent 15rem);
}

.knowledge-editorial-section {
  margin-top: 24px;
  padding: clamp(24px, 4vw, 36px);
  background: rgba(255, 250, 242, 0.9);
  border: 1px solid rgba(91, 63, 35, 0.14);
  border-radius: 16px;
  box-shadow: 0 16px 42px rgba(67, 45, 23, 0.07);
}

.knowledge-section-heading {
  max-width: 760px;
  margin-bottom: 20px;
}

.knowledge-section-heading h2 {
  margin: 0;
  color: var(--coffee);
  font-size: clamp(25px, 3vw, 36px);
  font-weight: 600;
  line-height: 1.25;
}

.knowledge-section-heading p {
  margin: 9px 0 0;
  color: var(--muted);
}

.knowledge-feature-list {
  display: grid;
  gap: 14px;
}

.knowledge-feature-card {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 10px 18px;
  padding: 20px;
  background:
    linear-gradient(180deg, rgba(255, 250, 242, 0.96), rgba(247, 239, 226, 0.92)),
    radial-gradient(circle at 100% 0%, rgba(154, 103, 54, 0.09), transparent 10rem);
  border: 1px solid rgba(91, 63, 35, 0.13);
  border-radius: 14px;
}

.knowledge-feature-card > span {
  grid-row: span 2;
  display: grid;
  width: 46px;
  height: 46px;
  place-items: center;
  color: #fffaf2;
  background: var(--olive);
  border-radius: 50%;
  font-weight: 700;
}

.knowledge-feature-card h3,
.knowledge-topic-group h3,
.knowledge-faq-item h3 {
  margin: 0;
  color: var(--coffee);
  font-weight: 600;
  line-height: 1.35;
}

.knowledge-feature-card h3 {
  font-size: 23px;
}

.knowledge-feature-card h3 a,
.knowledge-topic-link strong {
  border-bottom: 1px solid rgba(72, 84, 54, 0.24);
}

.knowledge-feature-card p,
.knowledge-topic-group p,
.knowledge-topic-link span,
.knowledge-faq-item p {
  margin: 0;
  color: var(--muted);
}

.knowledge-topic-groups {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.knowledge-topic-group {
  padding: 20px;
  background: rgba(255, 250, 242, 0.62);
  border: 1px solid rgba(154, 103, 54, 0.13);
  border-radius: 14px;
}

.knowledge-topic-group > p {
  margin-top: 8px;
  font-size: 14px;
}

.knowledge-topic-list {
  display: grid;
  gap: 10px;
  margin-top: 16px;
}

.knowledge-topic-link {
  display: grid;
  gap: 6px;
  padding: 12px;
  background: rgba(255, 250, 242, 0.72);
  border: 1px solid rgba(91, 63, 35, 0.11);
  border-radius: 10px;
}

.knowledge-topic-link strong {
  color: var(--coffee);
  font-size: 16px;
}

.knowledge-topic-link span {
  font-size: 13px;
}

.knowledge-faq-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.knowledge-faq-item {
  padding: 18px;
  background: rgba(255, 250, 242, 0.66);
  border: 1px solid rgba(101, 112, 71, 0.16);
  border-radius: 12px;
}

.knowledge-faq-item h3 {
  font-size: 18px;
}

.knowledge-faq-item p {
  margin-top: 8px;
  font-size: 14px;
}

.knowledge-note {
  padding: 22px;
}

.article-layout {
  width: min(880px, calc(100% - 48px));
}

.article-shell {
  display: grid;
  gap: 20px;
}

.article-hero,
.article-section,
.article-note {
  background: rgba(255, 250, 242, 0.92);
  border: 1px solid rgba(91, 63, 35, 0.14);
  border-radius: 16px;
  box-shadow: 0 16px 42px rgba(67, 45, 23, 0.07);
}

.article-hero {
  padding: clamp(30px, 5vw, 54px);
  background:
    linear-gradient(135deg, rgba(255, 250, 242, 0.98), rgba(239, 216, 185, 0.9)),
    radial-gradient(circle at 92% 12%, rgba(101, 112, 71, 0.14), transparent 15rem);
}

.article-hero h1 {
  max-width: 760px;
  margin: 0;
  color: var(--coffee);
  font-size: clamp(34px, 5vw, 54px);
  font-weight: 600;
  line-height: 1.16;
}

.article-hero p:last-child {
  max-width: 760px;
  margin: 16px 0 0;
  color: var(--muted);
  font-size: 18px;
}

.article-body {
  display: grid;
  gap: 18px;
}

.article-section,
.article-note {
  padding: clamp(22px, 4vw, 32px);
}

.article-section h2 {
  margin: 0 0 12px;
  color: var(--coffee);
  font-size: clamp(23px, 3vw, 30px);
  font-weight: 600;
  line-height: 1.3;
}

.article-section p,
.article-note p {
  margin: 0;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.9;
}

.article-section p + p {
  margin-top: 12px;
}

.article-table-wrap {
  overflow-x: auto;
}

.article-compare-table {
  width: 100%;
  min-width: 620px;
  border-collapse: collapse;
  color: var(--coffee-soft);
  font-size: 14px;
}

.article-compare-table th,
.article-compare-table td {
  padding: 12px 14px;
  text-align: left;
  border: 1px solid rgba(91, 63, 35, 0.14);
  vertical-align: top;
}

.article-compare-table th {
  color: var(--coffee);
  background: rgba(200, 153, 98, 0.14);
  font-weight: 700;
}

.article-question-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  padding-left: 1.4em;
  margin: 0;
  color: var(--coffee-soft);
}

.article-question-list li {
  padding-left: 4px;
}

.article-related ul {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.article-related li {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  background: rgba(255, 250, 242, 0.68);
  border: 1px solid rgba(91, 63, 35, 0.12);
  border-radius: 10px;
}

.article-related a {
  color: var(--coffee);
  font-weight: 700;
}

.article-related span {
  color: var(--muted);
  font-size: 14px;
}

.article-note {
  color: var(--coffee-soft);
  background:
    linear-gradient(180deg, rgba(255, 250, 242, 0.9), rgba(242, 232, 216, 0.88)),
    radial-gradient(circle at 0% 0%, rgba(101, 112, 71, 0.08), transparent 12rem);
}

@media (max-width: 820px) {
  .knowledge-topic-groups,
  .knowledge-faq-grid,
  .article-question-list {
    grid-template-columns: 1fr;
  }

  .knowledge-feature-card {
    grid-template-columns: 1fr;
  }

  .knowledge-feature-card > span {
    grid-row: auto;
  }

  .article-layout,
  .knowledge-library {
    width: calc(100% - 28px);
  }
}
`;
  await writeText("styles.css", css);
}

async function updateReleaseReadiness() {
  let script = await readText("custom/check-release-readiness.mjs");
  if (!script.includes("knowledgeEditorialTerms")) {
    script = script.replace(
      `const frontendPatchTerms = [`,
      `const knowledgeEditorialTerms = [
  "阅读提示",
  "适合谁看",
  "资料入口",
  "内容入口",
  "当前入口",
  "本轮",
  "版本",
  "已扩展",
  "已补充",
  "预检",
  "上线阻塞项",
  "咨询摘要表",
  "填写咨询表单",
];

const frontendPatchTerms = [`
    );

    script = script.replace(
      `    if (!isBackupContactPage) {`,
      `    if (!isBackupContactPage && label.startsWith("knowledge/")) {
      for (const term of knowledgeEditorialTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(\`\${label}:\${index + 1}：知识区前台仍存在程序化或内部说明表达“\${term}”\`);
          }
        });
      }
    }

    if (!isBackupContactPage) {`
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
  const note = "V1.13A 已先完成柚木知识页和核心知识文章的质量重构。知识页从程序生成式索引改为新手知识库，核心文章改为可直接阅读的短文章。";
  await appendDocSection("custom/client-preview-note.md", "## 11. V1.13A 新增说明", note);
  await appendDocSection(
    "custom/launch-checklist.md",
    "## V1.13A 知识区复核",
    "- 确认 `knowledge/index.html` 已改为新手知识库，而不是 30 条索引堆叠。\n- 确认价格差异、什么是柚木、避坑、地板、保养、品牌工厂等核心文章可直接阅读。\n- 确认知识区公开页面不再出现“阅读提示”“适合谁看”“资料入口”“内容入口”等程序化表达。\n- 确认本轮没有修改方案、厂商、表单逻辑、数据源、workflow 或 sitemap。"
  );
  await appendDocSection(
    "custom/public-review-checklist.md",
    "## V1.13A 人工验收新增项",
    "- [ ] 柚木知识首页是否像新手知识库，而不是程序生成式索引页。\n- [ ] `teak-price-difference.html` 是否像完整文章，并包含对比表和买前问题。\n- [ ] 核心知识文章是否有自然导语、正文小节和判断清单。\n- [ ] 知识区是否没有“阅读提示”“适合谁看”“资料入口”“内容入口”等前台不自然表达。"
  );
}

async function writeRecord() {
  const record = `# 版本记录：v1.13a-knowledge-page-and-core-articles-rebuild

## 1. 本轮修改目标

本轮目标是单独完成“V1.13A 柚木知识页与核心文章质量重构”。只处理知识首页和核心知识文章，不改好物方案、推荐厂商、候选品牌、厂商申请页、表单逻辑或数据源。

## 2. 当前问题：知识页和文章页仍像程序生成结构

V1.12 让知识页有了顺序和图文结构，但仍然保留“适合谁看”“阅读提示”等统一模板痕迹。核心文章也更像同一模板批量生成出来的说明页，不像可以直接阅读的短文章。

## 3. 知识首页重构

\`knowledge/index.html\` 改为新手知识库结构：

- 第一屏说明先理解材质、价格、选购、空间和保养。
- “新手先读这 5 篇”只保留五篇核心内容。
- “按问题查找”缩减为三组问题。
- 新增常见问题区。
- 底部只保留一段简短参考说明。

## 4. 价格差异文章重写

\`knowledge/topics/teak-price-difference.html\` 改为“同样叫柚木，价格为什么会差很多？”完整文章，包含六个正文小节、一个对比表和“买前要问的 8 个问题”。

## 5. 其他核心知识文章重写

本轮同步重写：

- \`knowledge/topics/what-is-teak.html\`
- \`knowledge/topics/teak-buying-pitfalls.html\`
- \`knowledge/topics/flooring-fit-space.html\`
- \`knowledge/topics/teak-daily-cleaning.html\`
- \`knowledge/topics/brand-or-factory.html\`

这些文章都改为自然导语、正文小节、判断问题和相关文章链接。

## 6. 样式轻量优化

\`styles.css\` 新增 V1.13A 知识库、文章页、FAQ、对比表、问题清单等样式。没有大改首页，也没有改移动端导航脚本。

## 7. 发布预检结果

\`custom/check-release-readiness.mjs\` 增加知识区前台表达检查，用于拦截知识页面中的“阅读提示”“适合谁看”“资料入口”“内容入口”等程序化表达。

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

其中 \`node custom\\check-content-depth.mjs\` 首次提示部分核心文章正文偏短，本轮补充“读完后怎么用”的自然正文后复验通过。\`node custom\\check-release-readiness.mjs\` 已新增知识区前台表达检查，最终未发现乱码、高风险交易表达、明显占位内容或知识区程序化表达。

## 9. 公网预览地址

\`https://yinuocheng123-cloud.github.io/youmu/\`

## 10. 未完成项

- 好物方案、推荐厂商、候选品牌和厂商申请页仍保留 V1.12 阶段结构，留待后续分轮处理。
- 真实电话、真实邮箱、备案信息、最终二维码、真实企业资料、图片授权、案例材料和服务边界仍待确认。

## 11. 资料真实性处理说明

本轮没有新增真实厂商、真实案例、真实认证或真实资质。知识文章只作为基础阅读和选购判断参考，不替代实际产品资料、合同和服务说明。

## 12. 后台与交易能力说明

本轮没有新增后台、登录、商城、支付、数据库。没有新增购物车、价格、在线下单或立即购买。没有修改 GitHub Actions workflow、sitemap、\`forms/form.js\` 或 \`data/site-content.js\`。
`;
  await writeText("custom/notes/v1.13a-knowledge-page-and-core-articles-rebuild.md", record);
}

await updateKnowledgeIndex();
await updateArticles();
await updateStyles();
await updateReleaseReadiness();
await updateDocs();
await writeRecord();

console.log("V1.13A knowledge page and core articles generated.");
