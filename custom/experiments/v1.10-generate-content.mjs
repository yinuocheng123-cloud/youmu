/*
文件说明：该文件用于批量生成 V1.10 知识、好物和候选会员站静态内容。
功能说明：生成新增公开 HTML 页面，重写核心索引页，并同步来源记录、sitemap 和版本说明文档。

结构概览：
  第一部分：导入依赖与通用工具
  第二部分：知识与好物内容数据
  第三部分：候选会员站公开资料数据
  第四部分：HTML 模板与页面生成
  第五部分：文档、sitemap 与预检脚本更新
*/

// ========== 第一部分：导入依赖与通用工具 ==========
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "../..");
const today = "2026-06-08";
const siteBaseUrl = "https://yinuocheng123-cloud.github.io/youmu/";

async function ensureDir(dirPath) {
  await fs.mkdir(path.join(projectRoot, dirPath), { recursive: true });
}

async function writeProjectFile(relativePath, content) {
  await ensureDir(path.dirname(relativePath));
  await fs.writeFile(path.join(projectRoot, relativePath), `${content.trim()}\n`, "utf8");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function contentHeader(prefix) {
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

function contentFooter(prefix, title, note) {
  return `
    <footer class="content-site-footer">
      <div class="content-footer-inner">
        <span>柚喜饰界 - ${escapeHtml(title)}</span>
        <span>${escapeHtml(note)}</span>
      </div>
    </footer>
    <script src="${prefix}script.js"></script>`;
}

function pageShell({ title, description, prefix, bodyClass = "content-page", body, note }) {
  return `<!--
文件说明：该文件为 V1.10 生成的静态内容页。
功能说明：提供可公开预览的知识、好物或候选会员站资料入口。
结构概览：第一部分为页面元信息；第二部分为 Header；第三部分为主体内容；第四部分为 Footer。
-->
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)} - 柚喜饰界</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="${prefix}styles.css" />
  </head>
  <body class="${bodyClass}">
${contentHeader(prefix)}
${body}
${contentFooter(prefix, title, note)}
  </body>
</html>`;
}

function listItems(items, prefix = "") {
  return items
    .map(
      (item) =>
        `          <li><a href="${prefix}${item.slug}.html">${escapeHtml(item.title)}</a>：${escapeHtml(item.summary)}</li>`,
    )
    .join("\n");
}

function longKnowledgeParagraph(topic, category) {
  return `阅读“${topic.title}”时，可以先把它当成一个判断问题，而不是一个标准答案。柚木之所以容易被讨论，是因为它同时涉及树种认知、材料稳定性、空间使用、维护方式和商家表达。对普通用户来说，最重要的不是背概念，而是知道继续沟通时应该问什么、哪些说法需要资料支撑、哪些结论不能只凭单张图片判断。${category.name}这一组内容会尽量把问题拆开，帮助你先建立阅读顺序，再进入方案页、样板页或社群沟通。`;
}

function knowledgeArticleBody(topic, category, related) {
  const relatedLinks = related
    .filter((item) => item.slug !== topic.slug)
    .slice(0, 4)
    .map((item) => `          <li><a href="${item.slug}.html">${escapeHtml(item.title)}</a>：${escapeHtml(item.summary)}</li>`)
    .join("\n");

  return `
    <main class="content-main">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../../index.html">首页</a><a href="../index.html">柚木知识</a><span>${escapeHtml(topic.title)}</span>
      </nav>
      <section class="content-hero-panel">
        <p class="eyebrow dark">${escapeHtml(category.en)}</p>
        <h1>${escapeHtml(topic.title)}</h1>
        <p class="content-lead">${escapeHtml(topic.summary)}</p>
      </section>
      <section class="content-body">
        <h2>先把问题放回真实场景</h2>
        <p>${longKnowledgeParagraph(topic, category)}</p>
        <p>${escapeHtml(topic.angle)} 这类问题看起来很基础，但它会影响后面几乎所有判断：看知识文章时会影响你关注哪些概念，看好物方案时会影响你如何理解适用空间，看候选会员站时会影响你是否能分辨“资料展示”和“服务承诺”的边界。</p>
      </section>
      <section class="content-body">
        <h2>普通用户可以这样判断</h2>
        <p>第一步，先看资料有没有说明使用环境。柚木用于地板、整装、户外、茶室或家具单品时，关注点并不完全一样。第二步，看资料有没有讲清材料状态、表面处理、维护方式和服务边界。第三步，把没有解释清楚的地方列成问题，不要因为图片好看就默认材料、工艺和售后都已经清楚。</p>
        <p>${escapeHtml(topic.check)} 如果某个页面只给出情绪化形容，却没有说明判断依据，可以先把它当成参考，不要直接当成结论。柚喜饰界当前更强调“帮助你会问问题”，而不是替任何品牌或产品作最终判断。</p>
      </section>
      <section class="content-body">
        <h2>容易误解的地方</h2>
        <p>很多关于柚木的误解，都来自把一个维度放大成全部结论。比如只看颜色，就可能忽略树种、干燥、结构和表面处理；只看产地，就可能忽略实际材料等级和加工方式；只看宣传语，又可能忽略后续维护和服务范围。更稳妥的做法，是把“材料是什么、适合哪里、怎么维护、谁来说明边界”四件事放在一起看。</p>
        <p>如果后续进入候选会员站页面，也要记住：公开资料候选只是资料线索，不代表平台认证，不构成交易担保。真实会员站上线前仍要完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。</p>
        <p>实际阅读时，可以把这篇文章当成沟通前的准备清单：先记录自己已经确认的信息，再标出仍然模糊的地方。比如空间位置、使用频率、是否接触水、是否长期日晒、是否需要安装服务、是否接受颜色随时间变化，这些问题都会影响后续判断。把问题写清楚之后，再去看方案页或候选资料页，就不容易被单个卖点带偏。</p>
      </section>
      <section class="content-body">
        <h2>继续阅读</h2>
        <ul>
${relatedLinks}
          <li><a href="../../solutions/index.html">进入好物方案索引</a>：把知识问题放回具体空间和好物类别中继续看。</li>
        </ul>
      </section>
      <section class="content-body">
        <h2>参考资料与说明</h2>
        <p>本文为柚喜饰界基于公开木材知识、常见使用场景和既有站内资料整理的阅读说明，当前未绑定单一检测报告，也不替代专业检测、合同确认或现场服务判断。若涉及真实品牌、真实产品参数或真实案例，仍需以品牌 / 企业正式资料和人工核验结果为准。</p>
        <p>为了后续人工验收更方便，建议把本文结论拆成三类记录：已经能从公开资料中确认的内容、仍然需要品牌或企业补充的内容、只能在真实沟通或现场条件确认后判断的内容。这样既能保留阅读价值，也不会把未确认资料提前写成确定结论。</p>
        <p>如果将来某条知识内容需要绑定更具体来源，应优先补充公开木材资料、材料实验资料或品牌正式说明，并记录核验日期和核验人。在没有完成这些动作前，本文只作为柚木爱好者的阅读底稿，不作为购买建议、检测结论或服务承诺。</p>
      </section>
      <section class="content-cta">
        <a class="btn btn-primary" href="../../index.html#wechat">添加柚喜顾问</a>
        <a class="btn btn-secondary" href="../index.html">返回知识索引</a>
      </section>
    </main>`;
}

function solutionGuideBody(topic, category, related) {
  const relatedLinks = related
    .filter((item) => item.slug !== topic.slug)
    .slice(0, 4)
    .map((item) => `          <li><a href="${item.slug}.html">${escapeHtml(item.title)}</a>：${escapeHtml(item.summary)}</li>`)
    .join("\n");

  return `
    <main class="content-main">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../../index.html">首页</a><a href="../index.html">好物方案</a><a href="../${category.page}">${escapeHtml(category.name)}</a><span>${escapeHtml(topic.title)}</span>
      </nav>
      <section class="content-hero-panel">
        <p class="eyebrow dark">${escapeHtml(category.en)}</p>
        <h1>${escapeHtml(topic.title)}</h1>
        <p class="content-lead">${escapeHtml(topic.summary)}</p>
      </section>
      <section class="content-body">
        <h2>这条资料解决什么问题</h2>
        <p>${escapeHtml(topic.opening)} ${category.name}不是单纯看一件物品，而是看空间、材料、维护和沟通边界能不能合在一起。用户真正需要的是能继续追问的资料入口，而不是一张漂亮图片或一句笼统介绍。</p>
        <p>把这条资料单独拆出来，是为了让你在进入样板案例结构、候选会员站或社群沟通前，先知道自己要核实什么。它仍然是静态资料页，不包含后台、下单、支付或交易承诺。</p>
      </section>
      <section class="content-body">
        <h2>建议优先确认的五件事</h2>
        <p>第一，确认使用空间和环境条件，例如室内、半户外、潮湿区、日晒区或高频使用区。第二，确认材料表达是否清楚，包括树种、结构、表面处理和维护建议。第三，确认尺寸、搭配和动线，不要只看单品本身。第四，确认后续沟通需要哪些资料。第五，确认服务边界，不把资料展示误解成承诺。</p>
        <p>${escapeHtml(topic.check)} 如果页面后续补入真实品牌或企业资料，也必须先完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。</p>
      </section>
      <section class="content-body">
        <h2>样板案例结构怎么用</h2>
        <p>样板案例结构不是为了制造真实成交背书，而是为了说明未来一个完整页面应该包含哪些信息。对用户来说，它可以帮助你判断页面是否说明了空间条件、材料选择、维护方式和沟通边界；对项目方来说，它也能提示后续真实资料需要补哪些字段。</p>
        <p>如果你正在看${category.name}，可以把样板案例理解成“问题清单的示范”。当前站点不会把未授权图片、未确认联系方式或未核实案例写成正式内容，也不会把公开资料候选写成真实会员站资料。</p>
        <p>继续比较资料时，建议把页面拆成三个层次看：第一层是空间和用途，它决定这类好物是否适合你；第二层是材料和工艺，它决定后续需要追问哪些细节；第三层是服务和授权，它决定页面能否从候选资料进入真实展示。三个层次都清楚，才适合继续沟通。</p>
        <p>这也是 V1.10 选择新增资料页而不是新增后台的原因。当前项目更需要先把静态阅读路径补完整，让用户能看、能点、能形成问题清单；至于真实企业资料、图片授权、联系方式和服务边界，仍应在人工确认后再进入下一步。</p>
      </section>
      <section class="content-body">
        <h2>继续查看本类资料</h2>
        <ul>
${relatedLinks}
          <li><a href="../${category.page}">返回${escapeHtml(category.name)}资料入口</a>：继续查看本类别的五条资料。</li>
        </ul>
      </section>
      <section class="content-body">
        <h2>参考资料与说明</h2>
        <p>本文为柚喜饰界根据站内知识体系、样板案例结构和公开资料整理方式改写的资料入口，不构成平台认证，不构成交易担保。涉及真实产品、真实企业、真实案例和真实授权时，应以后续人工确认材料为准。</p>
        <p>后续人工验收时，建议把这类资料页分成“用户可直接阅读的判断内容”和“仍需品牌或企业补充的真实资料”两部分。前者可以帮助普通用户建立方向感，后者则必须依赖企业资料、授权图片、联系方式、案例材料和服务边界确认。</p>
        <p>如果将来把某个候选品牌放入这类页面，也应先确认其公开资料是否允许展示、是否有可追溯图片授权、是否愿意公开联系方式，以及服务区域和交付边界是否明确。没有完成这些动作前，页面只保留资料入口和问题清单，不做确定性背书。</p>
      </section>
      <section class="content-cta">
        <a class="btn btn-primary" href="../../index.html#wechat">添加柚喜顾问</a>
        <a class="btn btn-secondary" href="../index.html">返回好物方案</a>
      </section>
    </main>`;
}

// ========== 第二部分：知识与好物内容数据 ==========
const knowledgeCategories = [
  {
    name: "柚木入门",
    en: "Teak Basics",
    page: "teak-basics.html",
    desc: "先理解柚木是什么、为什么被用于家居空间，以及买前应该先问哪些基础问题。",
    topics: [
      ["what-is-teak", "什么是柚木", "从树种、常见用途和材料特征入手，先建立最基础的柚木认知。", "不要把“柚木”只理解成一种颜色或风格，它首先是一类需要被材料资料说明清楚的木材。", "建议先确认资料是否说明树种名称、材料来源、使用位置和基础维护方式。"],
      ["why-teak-for-home", "柚木为什么适合家居空间", "把稳定性、触感、耐用性和空间气质放在一起看，而不是只看图片。", "家居空间重视长期使用，柚木的讨论也应回到耐用、维护和搭配，而不是单纯的视觉偏好。", "建议同时查看空间位置、使用频率和维护接受度。"],
      ["teak-vs-common-wood-basic", "柚木和普通木材有什么不同", "用普通用户能理解的方式比较材料差异，不把差异写成绝对优劣。", "比较木材时最怕只说“更好”，更应该说明不同木材适合的空间和维护方式。", "建议把稳定性、纹理、触感、维护和预算沟通分开问。"],
      ["teak-origin-basic", "柚木常见产地与基础认知", "了解产地只是起点，不能把产地直接等同于最终品质。", "产地信息有参考价值，但材料等级、加工方式和资料真实性同样重要。", "建议确认资料是否说明来源、加工状态和可追溯边界。"],
      ["before-buying-teak-basics", "买柚木前应该先弄懂哪些基本问题", "在看品牌、报价或样板前，先整理空间、用途、维护和沟通问题。", "很多选购分歧不是审美差异，而是前期问题没有被拆清楚。", "建议先列出空间条件、使用人群、维护方式和必须确认的服务边界。"],
    ],
  },
  {
    name: "选购避坑",
    en: "Buying Guide",
    page: "teak-buying-guide.html",
    desc: "围绕表达是否清楚、差异从哪里来、商家前期沟通该问什么，减少只看图下判断。",
    topics: [
      ["teak-buying-pitfalls", "买柚木最容易踩的坑", "梳理只看颜色、只听口号、忽略维护和服务边界等常见误区。", "选柚木最容易出错的地方，是把宣传词当成完整资料。", "建议对每个关键说法追问对应依据。"],
      ["clear-teak-description", "怎么看柚木是不是表达清楚", "看页面是否讲清材料、结构、适用空间、维护和服务范围。", "表达清楚的资料不一定华丽，但一定会让用户知道下一步该问什么。", "建议检查是否同时说明材料、工艺、用途和限制。"],
      ["teak-price-difference", "柚木价格差异到底看什么", "把价格差异放回材料、规格、工艺、服务和授权资料中理解。", "不同报价背后可能是材料、结构、服务范围或沟通边界不同，不能只看数字。", "建议要求对方说明报价包含和不包含的内容。"],
      ["not-only-color-photo", "为什么不能只看颜色和图片", "解释颜色、光线、后期处理和表面状态对判断的影响。", "图片能提供第一印象，但不能替代材料和服务说明。", "建议把图片作为线索，再继续核实材料状态和维护方式。"],
      ["questions-before-vendor", "选柚木品牌或商家前要问哪些问题", "整理沟通前的基础问题清单，让后续交流更聚焦。", "问对问题比过早比较品牌更重要，尤其是当前仍需人工确认资料的阶段。", "建议先问材料来源、授权图片、联系方式、案例材料和服务边界。"],
    ],
  },
  {
    name: "材质与工艺",
    en: "Material Craft",
    page: "teak-material-craft.html",
    desc: "从含油性、干燥、拼接、结构、表面处理和颜色变化理解柚木资料。",
    topics: [
      ["teak-oil-stability", "柚木含油性与稳定性怎么理解", "用普通用户能理解的方式解释含油性、耐用性和稳定性之间的关系。", "含油性常被拿来宣传，但它不是跳过结构和维护判断的理由。", "建议同时查看使用环境、表面处理和维护说明。"],
      ["teak-drying-process", "干燥处理为什么重要", "说明干燥处理对后续开裂、变形和使用稳定性的影响。", "木材不是砍下来就能直接用，处理过程会影响长期表现。", "建议追问是否说明含水率控制、适用地区和安装条件。"],
      ["teak-joinery-surface", "拼接、结构和表面处理怎么看", "帮助用户理解单板、拼接、涂装和触感差异。", "结构和表面处理决定了使用体验，也决定后续维护方式。", "建议不要只看正面效果，也要看边口、背面、连接和维护说明。"],
      ["flooring-vs-furniture-craft", "柚木地板和柚木家具的工艺差异", "比较地板与家具在结构、受力、安装和维护上的不同。", "地板和家具都叫柚木，但使用条件完全不同，不能用同一套问题判断。", "建议按用途分别确认结构、安装、承重和维护。"],
      ["teak-color-change", "柚木表面颜色变化是否正常", "解释氧化、日晒、清洁和维护对表面颜色的影响。", "颜色变化不一定是质量问题，但也不能被简单忽略。", "建议确认变色情况是否有维护建议和使用边界说明。"],
    ],
  },
  {
    name: "空间应用",
    en: "Space Use",
    page: "teak-space-use.html",
    desc: "把柚木放回整装、地板、庭院户外、茶室会客等空间中判断。",
    topics: [
      ["teak-home-spaces", "柚木适合哪些家居空间", "从客厅、餐厅、茶室、卧室、阳台和庭院等场景看适配逻辑。", "空间适配不是简单说能不能用，而是看环境和维护能不能匹配。", "建议先确认空间湿度、日晒、使用频率和搭配目标。"],
      ["whole-decoration-fit-home", "柚木整装适合什么样的家", "说明整装场景中柚木更适合哪些风格、预算和沟通方式。", "整装不是单品堆叠，需要材料、柜体、地面和软装一起考虑。", "建议先整理整体风格、固定木作范围和维护接受度。"],
      ["flooring-fit-space", "柚木地板适合什么空间", "围绕脚感、维护、光线和使用强度判断地板适配。", "地板面积大、使用频率高，判断时要比单品更谨慎。", "建议核实基层、地暖、潮湿风险和安装边界。"],
      ["outdoor-teak-judgement", "庭院户外柚木怎么判断", "从日晒、雨水、通风、维护周期和结构安全看户外使用。", "户外柚木常见，但不是所有户外环境都可以不维护。", "建议确认是否接受自然变灰、清洁周期和存放方式。"],
      ["tea-room-teak-space", "茶室会客空间为什么适合柚木", "说明柚木在茶桌、地面、柜体和会客氛围中的作用。", "茶室看重触感和安定感，但也要考虑水渍、清洁和动线。", "建议把茶桌、地面、收纳和照明一起看。"],
    ],
  },
  {
    name: "保养维护",
    en: "Care Guide",
    page: "teak-care.html",
    desc: "围绕清洁、户外维护、颜色变化、防开裂和地板日常注意事项整理入口。",
    topics: [
      ["teak-daily-cleaning", "柚木日常怎么清洁", "整理日常清洁的温和原则和不建议使用的粗暴方式。", "维护不应被写成复杂仪式，但也不能完全不管。", "建议先确认表面处理，再选择清洁方式。"],
      ["outdoor-teak-maintenance", "柚木户外使用怎么维护", "说明户外日晒、雨水和自然变灰下的维护思路。", "户外维护的重点是预期管理，而不是承诺永远不变。", "建议确认清洁周期、遮蔽条件和是否接受银灰色变化。"],
      ["teak-aging-color", "柚木变色是不是问题", "解释自然氧化、紫外线、清洁和油养对颜色的影响。", "变色可能正常，也可能与使用环境和维护方式有关。", "建议看具体表面处理和使用位置，不要只凭照片判断。"],
      ["avoid-cracking-warping", "柚木家具如何避免开裂和变形", "围绕湿度、日晒、受力和清洁方式说明日常注意。", "木家具稳定不代表完全不会受环境影响。", "建议避免极端干湿变化，注意通风和热源距离。"],
      ["teak-flooring-daily-care", "柚木地板日常使用注意事项", "整理地板清洁、拖地、家具脚垫和局部维护重点。", "地板是高频使用面，需要把维护写成可执行的习惯。", "建议确认拖地方式、家具移动和局部污渍处理。"],
    ],
  },
  {
    name: "常见问答",
    en: "FAQ",
    page: "teak-faq.html",
    desc: "集中回答用户反复会问到的价格、家庭使用、潮湿空间和品牌选择问题。",
    topics: [
      ["is-teak-always-expensive", "柚木一定贵吗", "用更完整的变量理解价格，不把贵或便宜写成绝对结论。", "价格讨论如果脱离材料、结构和服务范围，容易变成无效比较。", "建议先看报价包含哪些资料和服务。"],
      ["teak-kids-pets-home", "柚木适合有孩子和宠物的家庭吗", "从耐用、清洁、安全边角和维护接受度看家庭场景。", "孩子和宠物家庭不是不能用柚木，而是要更重视使用方式。", "建议确认表面处理、边角、清洁和耐刮预期。"],
      ["teak-bathroom-balcony", "柚木可以用在卫生间或阳台吗", "解释潮湿空间与半户外空间的判断边界。", "潮湿空间不能只靠材料名判断，还要看通风、防水和安装方式。", "建议把排水、通风、日晒和维护周期一起问清楚。"],
      ["teak-vs-walnut", "柚木和黑胡桃木怎么选", "从风格、触感、维护和空间气质比较两类常见木材。", "不同木材不是简单谁更高级，而是谁更适合当前空间。", "建议先确定空间气质、使用频率和维护方式。"],
      ["brand-or-factory", "柚木产品选品牌还是选工厂", "帮助用户理解品牌、工厂、服务和资料完整度的关系。", "品牌和工厂都只是入口，最终仍要看资料和服务边界。", "建议确认资料完整度、授权状态、联系方式和后续服务范围。"],
    ],
  },
].map((category) => ({
  ...category,
  topics: category.topics.map(([slug, title, summary, angle, check]) => ({ slug, title, summary, angle, check })),
}));

const solutionCategories = [
  {
    name: "柚木整装",
    en: "Whole Decoration",
    page: "whole-decoration.html",
    desc: "围绕整体空间、木作搭配、选材和样板案例结构整理资料入口。",
    topics: [
      ["whole-decoration-fit-home", "柚木整装适合什么样的家", "判断整装是否匹配空间、预算、维护和风格预期。", "柚木整装适合先明确整体风格、木作范围和长期维护预期的人群。", "如果整装资料没有说明固定木作、活动家具和地面之间的关系，需要继续追问。"],
      ["whole-decoration-vs-custom", "柚木整装和普通定制有什么不同", "比较整装视角与单项定制在材料、设计和沟通上的区别。", "普通定制更偏单项解决，整装更强调材料和空间整体协同。", "建议确认设计、材料、安装和维护由谁负责说明。"],
      ["whole-decoration-material-check", "柚木整装选材注意事项", "从材料来源、板材结构、表面处理和空间适用性看选材。", "整装面积较大，材料表达不清会放大后续风险。", "建议确认木作、地面、柜体和台面是否分别说明。"],
      ["whole-decoration-matching", "柚木整装空间搭配建议", "关注地面、柜体、墙面、灯光和软装之间的协调。", "搭配不是把所有地方都做成柚木，而是控制主次和留白。", "建议先确定主视觉、辅助材质和空间明暗关系。"],
      ["whole-decoration-sample-structure", "柚木整装样板案例结构", "说明未来整装样板页应如何组织空间、材料和授权信息。", "样板结构用于提示资料完整度，不用于替代真实项目。", "建议把空间条件、材料清单、授权状态和服务边界一起列出。"],
    ],
  },
  {
    name: "柚木地板",
    en: "Teak Flooring",
    page: "flooring.html",
    desc: "围绕地板选购、适用空间、安装前确认和维护建议整理入口。",
    topics: [
      ["flooring-how-to-choose", "柚木地板怎么选", "从材料、结构、脚感、安装和维护五个维度看地板。", "地板选择不能只看色卡，因为它影响整个家的长期使用。", "建议确认结构、尺寸、表面处理和铺装条件。"],
      ["flooring-fit-spaces", "柚木地板适合哪些空间", "判断客厅、卧室、茶室、过道等空间是否适合铺设。", "不同空间对耐磨、脚感、采光和维护的要求不同。", "建议把高频使用区和潮湿风险区分开看。"],
      ["flooring-before-install", "柚木地板安装前要确认什么", "整理基层、地暖、伸缩缝、门口高差和现场条件。", "安装前确认不足，后续很难靠单纯维护弥补。", "建议提前确认基层平整、含水情况和安装责任边界。"],
      ["flooring-care-guide", "柚木地板日常维护建议", "从清洁、拖地、家具脚垫和局部污渍处理整理维护。", "地板维护要可执行，不能只写成笼统提醒。", "建议明确清洁工具、频率和不建议的处理方式。"],
      ["flooring-sample-structure", "柚木地板样板案例结构", "说明地板样板页应展示哪些空间条件和资料字段。", "样板结构帮助用户知道要看什么，不代表真实成交内容。", "建议保留材料说明、现场条件、授权状态和服务边界。"],
    ],
  },
  {
    name: "庭院户外柚木",
    en: "Outdoor Teak",
    page: "outdoor.html",
    desc: "围绕户外场景、庭院家具、露台阳台和维护周期整理资料。",
    topics: [
      ["outdoor-why-teak", "户外为什么常见柚木", "理解柚木在户外家具和庭院空间中常被讨论的原因。", "户外常见柚木，不等于所有户外条件都能无维护使用。", "建议同时确认日晒、雨水、通风和维护预期。"],
      ["outdoor-furniture-choose", "庭院柚木家具怎么选", "从结构、坐感、摆放、收纳和维护看庭院家具。", "庭院家具要适应环境，也要符合家庭使用习惯。", "建议确认是否需要遮蔽、搬动和定期清洁。"],
      ["terrace-balcony-teak", "露台阳台柚木使用注意事项", "判断小户外空间中的日晒、排水、承重和邻里边界。", "阳台露台不是缩小版庭院，需要额外关注排水和安全。", "建议提前确认排水坡度、防滑和收纳方式。"],
      ["outdoor-maintenance-cycle", "户外柚木维护周期怎么理解", "说明清洁、自然变灰、油养和季节维护的预期管理。", "维护周期不是固定答案，要看气候和使用方式。", "建议记录日晒雨淋强度和家庭维护接受度。"],
      ["outdoor-sample-structure", "庭院户外柚木样板案例结构", "说明户外样板页应如何展示环境条件和授权资料。", "户外样板结构尤其需要说明环境，而不是只放成品图。", "建议记录日晒、雨水、通风、收纳和服务边界。"],
    ],
  },
  {
    name: "茶室会客柚木",
    en: "Tea Room",
    page: "tea-room.html",
    desc: "围绕茶桌、地面、柜体、会客氛围和样板结构整理入口。",
    topics: [
      ["tea-room-why-teak", "茶室为什么适合柚木", "从触感、温润感、稳定感和空间氛围理解茶室场景。", "茶室适合柚木，核心是触感和气质，但仍要考虑水渍和清洁。", "建议把桌面、地面、收纳和灯光一起看。"],
      ["teak-tea-table-choose", "柚木茶桌怎么选", "从尺寸、结构、桌面处理、坐姿和使用频率看茶桌。", "茶桌不是只看厚重感，还要看实际使用动线。", "建议确认高度、边角、排水和表面维护方式。"],
      ["tea-room-floor-cabinet", "茶室地面和柜体如何搭配", "整理地面、柜体、茶具收纳和墙面之间的搭配方式。", "茶室搭配要避免木色堆满，而是让材质形成层次。", "建议先确定主木色，再控制辅助材质。"],
      ["teak-reception-atmosphere", "柚木会客空间氛围怎么做", "从尺度、光线、座椅、茶桌和留白理解会客氛围。", "会客空间看重舒适和稳定，不是越满越好。", "建议关注坐感、视线、动线和收纳。"],
      ["tea-room-sample-structure", "茶室会客柚木样板案例结构", "说明茶室样板页应如何组织空间、材料和授权信息。", "茶室样板结构可以帮助后续真实资料逐项补齐。", "建议记录茶桌、地面、柜体、授权状态和服务边界。"],
    ],
  },
  {
    name: "柚木家具好物",
    en: "Furniture Goods",
    page: "furniture.html",
    desc: "围绕桌椅、柜体、边几茶几、跨木材搭配和样板结构整理资料。",
    topics: [
      ["teak-table-chair-choose", "柚木桌椅怎么选", "从尺寸、坐感、结构、边角和家庭使用场景看桌椅。", "桌椅是高频接触单品，触感和结构比照片更重要。", "建议确认尺寸、承重、表面处理和清洁方式。"],
      ["teak-cabinet-storage", "柚木柜体和收纳怎么搭配", "整理柜体尺寸、收纳方式、开合动线和空间比例。", "柜体要解决收纳，而不是只成为木色背景。", "建议先列物品类型，再看柜体结构。"],
      ["teak-side-coffee-table", "柚木边几、茶几、单品如何选", "从移动频率、尺度、表面维护和组合方式看小件好物。", "小件单品最容易冲动选择，但也最考验比例。", "建议确认使用位置、清洁频率和与现有家具关系。"],
      ["teak-with-other-wood", "柚木家具和其他木材家具怎么搭", "说明柚木与黑胡桃、橡木、藤编、金属等材质的搭配。", "混搭不是材料越多越好，而是控制主次和色温。", "建议先确定主木色，再选择过渡材质。"],
      ["furniture-sample-structure", "柚木家具好物样板案例结构", "说明家具好物样板页如何组织单品、空间和授权资料。", "样板结构用于未来补真实资料，不用于制造成交背书。", "建议保留单品信息、使用场景、授权状态和服务边界。"],
    ],
  },
].map((category) => ({
  ...category,
  topics: category.topics.map(([slug, title, summary, opening, check]) => ({ slug, title, summary, opening, check })),
}));

// ========== 第三部分：候选会员站公开资料数据 ==========
const candidateCategories = [
  {
    name: "柚木地板候选品牌 / 企业",
    key: "柚木地板",
    entries: [
      ["Indoteak Design", "https://www.indoteakdesign.com/", "官网展示再生柚木地板、饰面板、台面和定制方向，适合观察再生柚木在地面和室内材料中的资料组织方式。", "再生柚木地板、墙面材料、台面与定制构件", "正在比较再生柚木地板和室内木材资料的人"],
      ["Arc Wood & Timbers", "https://arcwoodandtimbers.com/products/reclaimed-teak-flooring/", "公开产品页围绕再生柚木地板展开，可作为地板类候选资料来源之一，后续需人工复核产品参数和供货边界。", "再生柚木地板与木材产品", "关注地板材料来源和产品页结构的人"],
      ["Luxury Wood Flooring", "https://www.luxurywoodflooring.com/", "官网以木地板产品和地板服务为核心，公开资料可用于观察专业地板企业如何组织材质、安装和服务信息。", "实木与工程木地板资料", "希望比较地板服务表达方式的人"],
      ["Havwoods", "https://www.havwoods.com/", "公开网站围绕木地板和木质表面材料展开，适合用作地板资料展示结构参考，是否包含具体柚木产品需继续人工核验。", "木地板、木质表面材料与项目资料", "关注地板资料体系和规格表达的人"],
      ["East Teak Fine Hardwoods", "https://www.eastteak.com/teak/", "公开资料围绕柚木等硬木材料展开，可作为地板和材料供应方向的候选来源，需继续核实具体产品范围。", "柚木硬木材料与供应资料", "需要从原材料角度理解地板候选资料的人"],
    ],
  },
  {
    name: "柚木整装 / 木作 / 空间类候选品牌 / 企业",
    key: "柚木整装 / 木作 / 空间",
    entries: [
      ["Noblewood Reclaimed Teak", "https://noblewood.com/products/reclaimed-teak-panels/", "公开产品页围绕再生柚木墙板和饰面材料展开，可作为整装木作和空间表面材料候选资料来源。", "再生柚木墙板、饰面板和空间材料", "关注墙面、柜体和整装木作材料的人"],
      ["Anthology Woods", "https://anthologywoods.com/products/pearly-teak", "公开产品页展示再生柚木墙面和天花板包覆材料，适合观察整装空间中的表面材料资料组织。", "再生柚木墙面、天花和定制材料", "关注整装表面材料和空间气质的人"],
      ["WoodCo", "https://www.woodco.com/wallboard-danube-3d-reclaimed-teak/", "公开页面围绕 3D 再生柚木墙板资料展开，可作为空间墙面和木作配套的候选来源。", "再生柚木墙板和空间饰面材料", "正在寻找墙面木作资料结构的人"],
      ["Wonderwall Studios", "https://www.wonderwallstudios.com/", "公开网站展示木质墙面和表面材料方向，适合作为整装木作材料展示方式的候选参考，具体柚木相关内容需人工复核。", "木质墙面材料和空间表面产品", "关注空间表面材料和设计表达的人"],
      ["Indoteak Design", "https://www.indoteakdesign.com/", "官网除地板外也展示墙面、台面和定制方向，可跨类作为整装木作候选资料，但需确认展示授权和服务范围。", "再生柚木地板、墙面、台面与定制", "关注同一材料在整装多位置应用的人"],
    ],
  },
  {
    name: "庭院户外柚木候选品牌 / 企业",
    key: "庭院户外柚木",
    entries: [
      ["Westminster Teak", "https://westminsterteak.com/", "公开网站围绕户外柚木家具和庭院生活场景组织内容，可作为庭院户外柚木候选资料来源。", "户外柚木家具与庭院空间产品", "关注庭院、露台和户外家具的人"],
      ["Barlow Tyrie", "https://www.teak.com/", "官网资料显示其长期围绕户外家具和柚木家具传统展开，可作为户外柚木家具候选来源。", "户外家具、柚木家具和家具维护资料", "关注经典户外柚木家具品牌资料的人"],
      ["Gloster", "https://www.gloster.com/", "公开页面强调户外家具、柚木工艺和室外生活场景，可作为高端户外家具资料结构参考。", "户外家具和柚木工艺资料", "关注户外空间品质表达的人"],
      ["Royal Botania", "https://www.royalbotania.com/", "官网围绕户外家具、户外照明和庭院生活方式组织内容，适合观察户外家具品牌如何组织公开资料。", "户外家具、庭院生活方式和相关产品", "关注户外家具体系化资料的人"],
      ["Kingsley Bate", "https://www.kingsleybate.com/", "公开网站为户外家具企业入口，适合作为庭院户外柚木候选资料来源，具体材料与系列需继续人工复核。", "户外家具与庭院产品", "关注户外家具企业资料入口的人"],
    ],
  },
  {
    name: "茶室会客柚木候选品牌 / 企业",
    key: "茶室会客柚木",
    entries: [
      ["Hati Home", "https://www.hatihome.com/products/hollis-dining-table-reclaimed-teak", "公开产品页围绕再生柚木餐桌资料展开，可作为茶室、餐叙和会客桌类候选资料来源。", "再生柚木餐桌和家居单品", "关注茶桌、餐桌和会客桌资料的人"],
      ["Teak Two", "https://teaktwo.com/", "公开网站围绕柚木家具和家居产品组织内容，可作为茶室会客和家具好物的跨类候选资料。", "柚木家具和家居产品", "关注茶室会客桌椅组合的人"],
      ["Ethnicraft", "https://www.ethnicraft.com/", "官网为家具品牌入口，公开资料中可观察餐桌、桌椅和空间家具的组织方式，具体柚木系列需人工复核。", "家具、餐桌和空间单品资料", "关注会客空间家具搭配的人"],
      ["MasayaCo", "https://www.masayaco.com/", "公开网站展示手工家具和再造林柚木相关表述，可作为会客座椅、餐椅和家具资料候选来源。", "柚木家具、座椅和空间单品", "关注可持续家具和会客座椅的人"],
      ["d-Bodhi", "https://dbodhi.com/reclaimed-teak", "公开资料围绕再生柚木家具和材料来源展开，可作为茶室会客桌柜类候选资料。", "再生柚木家具和家居产品", "关注再生柚木家具资料的人"],
    ],
  },
  {
    name: "柚木家具好物 / 柚木工坊候选品牌 / 企业",
    key: "柚木家具好物 / 柚木工坊",
    entries: [
      ["Chic Teak", "https://chicteak.com/", "公开网站围绕柚木家具、室内外家具和家居好物组织内容，可作为家具好物方向候选资料。", "柚木家具、室内外家具和家居单品", "关注桌椅、柜体和单品组合的人"],
      ["Teak Two", "https://teaktwo.com/", "公开网站可作为柚木家具好物方向资料入口，后续需确认具体产品、授权状态和服务范围。", "柚木家具和家居产品", "关注柚木桌椅、柜体和居家单品的人"],
      ["Tikamoon", "https://www.tikamoon.co/ins-our-materials-95/teak-246.htm", "公开资料介绍柚木材料和实木家具方向，可作为家具好物材料说明与产品组织方式参考。", "实木家具、柚木家具和材料说明", "关注柚木家具材料和保养表达的人"],
      ["Ethnicraft", "https://www.ethnicraft.com/", "官网为家具品牌入口，适合观察桌椅、柜体和空间家具的公开资料组织方式，是否作为会员站需后续联系确认。", "家具、桌椅、柜体和空间单品", "关注整体家具风格搭配的人"],
      ["MasayaCo", "https://www.masayaco.com/", "公开网站展示手工家具和柚木相关家具方向，可作为工坊型家具好物候选资料。", "手工家具、柚木座椅和空间单品", "关注手作家具和可持续设计的人"],
    ],
  },
];

// ========== 第四部分：HTML 模板与页面生成 ==========
async function generateKnowledgePages() {
  await ensureDir("knowledge/topics");

  for (const category of knowledgeCategories) {
    for (const topic of category.topics) {
      await writeProjectFile(
        `knowledge/topics/${topic.slug}.html`,
        pageShell({
          title: topic.title,
          description: topic.summary,
          prefix: "../../",
          body: knowledgeArticleBody(topic, category, category.topics),
          note: "知识内容用于建立判断路径，真实资料仍需以后续人工核验为准。",
        }),
      );
    }

    const body = `
    <main class="content-main">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><a href="index.html">柚木知识</a><span>${escapeHtml(category.name)}</span></nav>
      <section class="content-hero-panel">
        <p class="eyebrow dark">${escapeHtml(category.en)}</p>
        <h1>${escapeHtml(category.name)}</h1>
        <p class="content-lead">${escapeHtml(category.desc)}</p>
      </section>
      <section class="related-links">
        <h2>${escapeHtml(category.name)}五条细分阅读</h2>
        <ul>
${listItems(category.topics, "topics/")}
        </ul>
      </section>
      <section class="content-body">
        <h2>阅读建议</h2>
        <p>${escapeHtml(category.desc)} 这一页不是把栏目再解释一遍，而是把可点击的内容入口集中放在前面。建议先按自己最关心的问题进入细分阅读，再回到好物方案页，把知识放进具体空间和品类中继续判断。</p>
        <p>如果你正在比较候选会员站或样板案例，先读本类内容可以减少误解：公开资料候选不是正式会员，样板案例结构也不是成交证明。后续所有真实资料都必须继续完成企业资料、图片授权、联系方式、案例材料和服务边界确认。</p>
        <p>阅读本类内容时，可以先不要急着判断“哪一种最好”，而是把问题拆成几张清单：材料清单、空间清单、维护清单、沟通清单。材料清单帮助你确认页面是否说明树种、结构和表面处理；空间清单帮助你判断它适合地板、整装、户外、茶室还是家具；维护清单帮助你提前接受真实使用中的变化；沟通清单则提醒你后续要核实企业资料、授权资料和服务边界。</p>
        <p>这些内容也为后续会员站资料打底。一个好的会员站页面，不应该只展示好看的图片，还应该说明材料、适用场景、服务范围和不能承诺的部分。当前页面先把这些判断点写清楚，是为了让未来真实资料补入时能沿用同一套结构，而不是重新制造一批难以核验的宣传页。</p>
        <p>如果你是普通用户，建议读完五条细分内容后再去看好物方案；如果你是品牌或企业，可以把这些问题当作未来会员站资料准备方向。两种路径都不需要恢复普通咨询表单，也不需要引入后台系统，仍然通过社群交流和资料确认继续推进。</p>
      </section>
      <section class="content-body">
        <h2>继续延伸</h2>
        <p>读完本类内容后，可以继续查看 <a href="../solutions/index.html">好物方案</a>，也可以进入 <a href="../vendors/index.html">推荐厂商</a> 查看公开资料候选会员站样板。普通用户沟通仍回到 <a href="../index.html#wechat">社群交流 / 添加柚喜顾问</a>。</p>
      </section>
      <section class="content-body">
        <h2>本类资料如何验收</h2>
        <p>验收本类知识时，不只看有没有五个链接，还要看每个链接是否能帮助用户形成一个更清楚的问题。比如入门类要能解释基本概念，选购类要能提醒风险，工艺类要能说明判断维度，空间类要能回到使用场景，维护类要能给出日常注意，问答类要能回应真实疑问。</p>
        <p>如果后续继续补真实资料，建议优先补“可复核来源”和“人工核验记录”。知识页不需要伪造检测报告，也不需要假装完成专家背书；它更适合做成可阅读、可追问、可继续扩展的底层资料库。</p>
        <p>这也是本轮保留静态页面方式的原因。当前项目最需要的是让用户进入后有足够内容可看，而不是把网站变成后台系统、商城系统或自动提交系统。内容丰满以后，真实资料确认和会员站授权才有更清晰的落点。</p>
        <p>人工复核时还可以抽查页面底部链接、移动端菜单和返回入口，确认用户不会在深层页面迷路。知识页的价值不在于一次性给出所有答案，而在于让每个问题都有继续阅读、继续沟通和继续核验的路径。只要这些路径稳定，后续补充真实来源和授权资料时就不需要再次推翻结构。</p>
      </section>
      <section class="content-cta">
        <a class="btn btn-primary" href="../index.html#wechat">添加柚喜顾问</a>
        <a class="btn btn-secondary" href="index.html">返回知识索引</a>
      </section>
    </main>`;

    await writeProjectFile(
      `knowledge/${category.page}`,
      pageShell({
        title: category.name,
        description: category.desc,
        prefix: "../",
        body,
        note: "知识分类页已补充五条以上可点击内容入口。",
      }),
    );
  }

  const sections = knowledgeCategories
    .map(
      (category) => `
      <section class="related-links">
        <h2>${escapeHtml(category.name)}</h2>
        <p>${escapeHtml(category.desc)}</p>
        <ul>
${listItems(category.topics, "topics/")}
        </ul>
      </section>`,
    )
    .join("\n");

  await writeProjectFile(
    "knowledge/index.html",
    pageShell({
      title: "柚木知识",
      description: "柚喜饰界 V1.10 柚木知识索引页，六类知识各提供五条以上可点击阅读入口。",
      prefix: "../",
      body: `
    <main class="content-main">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>柚木知识</span></nav>
      <section class="content-hero-panel">
        <p class="eyebrow dark">Knowledge Index</p>
        <h1>柚木知识内容索引</h1>
        <p class="content-lead">V1.10 已把六类知识扩展为 30 条可点击内容入口，先看懂问题，再进入好物方案和候选会员站。</p>
      </section>
${sections}
      <section class="content-body">
        <h2>阅读边界</h2>
        <p>这里的知识内容用于帮助普通用户建立判断路径，不代表平台认证，也不构成交易担保。涉及真实品牌、真实产品参数、真实案例或真实授权时，仍需以后续正式资料和人工核验为准。</p>
      </section>
      <section class="content-cta">
        <a class="btn btn-primary" href="../index.html#wechat">添加柚喜顾问</a>
        <a class="btn btn-secondary" href="../solutions/index.html">继续看好物方案</a>
      </section>
    </main>`,
      note: "知识索引用于帮助阅读和判断，具体资料仍需人工复核。",
    }),
  );
}

async function generateSolutionPages() {
  await ensureDir("solutions/guides");

  for (const category of solutionCategories) {
    for (const topic of category.topics) {
      await writeProjectFile(
        `solutions/guides/${topic.slug}.html`,
        pageShell({
          title: topic.title,
          description: topic.summary,
          prefix: "../../",
          body: solutionGuideBody(topic, category, category.topics),
          note: "好物资料页用于建立判断路径，不提供下单、支付或交易承诺。",
        }),
      );
    }

    const body = `
    <main class="content-main">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><a href="index.html">好物方案</a><span>${escapeHtml(category.name)}</span></nav>
      <section class="content-hero-panel">
        <p class="eyebrow dark">${escapeHtml(category.en)}</p>
        <h1>${escapeHtml(category.name)}资料入口</h1>
        <p class="content-lead">${escapeHtml(category.desc)}</p>
      </section>
      <section class="related-links">
        <h2>本类五条资料入口</h2>
        <ul>
${listItems(category.topics, "guides/")}
        </ul>
      </section>
      <section class="content-body">
        <h2>怎么使用这页</h2>
        <p>${escapeHtml(category.name)}这一页已经从单篇说明改成资料索引。你可以先点进五条资料，分别看适用空间、材料判断、维护边界和样板案例结构，再回到候选会员站页查看公开资料候选品牌 / 企业会员站样板。</p>
        <p>当前页面不提供购买、下单、支付或交易承诺。样板案例结构只说明未来真实资料应该如何组织，不代表真实成交内容。候选会员站也必须继续完成五项确认后，才能转为真实展示资料。</p>
        <p>使用这页时，建议先从自己的实际空间出发，而不是从某个品牌或某张图片出发。比如整装要先看整体木作范围，地板要先看基层和安装条件，户外要先看日晒雨淋和维护周期，茶室要先看桌面、地面和收纳关系，家具好物则要看尺寸、触感和现有空间搭配。</p>
        <p>每一条资料入口都可以视为一个小型检查点。读完之后，你应该能得到一组更具体的问题：需要什么材料说明，需要什么授权说明，需要什么联系方式，需要什么服务边界。只有这些问题能被后续资料回应，页面才算真正进入可验收状态。</p>
        <p>本轮没有把这些页面改成交易页，也没有把候选品牌写成真实合作。这样做的代价是页面仍然需要后续人工复核，但好处是公开预览时不会越过当前项目能力边界。</p>
      </section>
      <section class="content-body">
        <h2>相关入口</h2>
        <p>你也可以继续查看 <a href="../knowledge/index.html">柚木知识索引</a>、<a href="../vendors/index.html">推荐厂商入口</a> 或 <a href="../index.html#wechat">社群交流区</a>。如果是品牌或企业希望整理会员站资料，请使用 <a href="../forms/vendor-apply.html">申请建立好物分类会员站</a>。</p>
      </section>
      <section class="content-body">
        <h2>本类资料如何验收</h2>
        <p>验收这类好物资料时，不能只看页面是否好看，还要看它是否能回答用户的实际问题。整装页要能说明空间和木作关系，地板页要能说明安装和维护，户外页要能说明日晒雨淋和维护周期，茶室页要能说明氛围、桌面和收纳，家具好物页要能说明尺寸、触感和搭配。</p>
        <p>如果未来补入真实会员站资料，应先检查五项确认是否完成，再决定是否替换样板内容。这样做虽然比直接填充宣传文案慢，但能避免公开页面出现未经授权图片、未经确认联系方式或过度承诺服务能力的问题。</p>
        <p>当前页面的目标是让用户能从一个入口继续点开五条资料，并在阅读后知道该问什么。只要这个路径成立，好物方案就不再只是栏目介绍，而是能支撑公开预览和人工验收的资料库。</p>
        <p>人工复核时还应确认每条资料都能回到本类别入口、好物总入口和社群交流区。这样即使用户从搜索、sitemap 或候选会员站反向进入，也能继续沿着知识、方案和候选资料三条路径浏览，不会误以为这里提供下单、支付或自动提交能力。</p>
        <p>这类入口页还承担一个交接作用：后续如果补充真实品牌资料，维护者可以先看本页五条资料是否已经覆盖用户最常问的问题，再决定真实资料放在哪个位置。比如某个品牌更适合地板，就应补在地板路径；更适合户外，就应补在户外路径；不要为了增加数量把资料塞进不匹配的分类。</p>
        <p>因此，本页的验收标准不是文案越多越好，而是入口明确、问题完整、边界清楚。用户能从这里继续读资料，品牌能从这里理解需要准备什么，后续代理也能从这里接续工作，这才是 V1.10 内容丰满的真正目标。</p>
      </section>
      <section class="content-cta">
        <a class="btn btn-primary" href="../index.html#wechat">添加柚喜顾问</a>
        <a class="btn btn-secondary" href="index.html">返回好物方案</a>
      </section>
    </main>`;

    await writeProjectFile(
      `solutions/${category.page}`,
      pageShell({
        title: category.name,
        description: category.desc,
        prefix: "../",
        body,
        note: "好物分类页已补充五条以上可点击资料入口。",
      }),
    );
  }

  const sections = solutionCategories
    .map(
      (category) => `
      <section class="related-links">
        <h2>${escapeHtml(category.name)}</h2>
        <p>${escapeHtml(category.desc)}</p>
        <ul>
${listItems(category.topics, "guides/")}
        </ul>
      </section>`,
    )
    .join("\n");

  await writeProjectFile(
    "solutions/index.html",
    pageShell({
      title: "好物方案",
      description: "柚喜饰界 V1.10 好物方案索引页，五类柚木好物各提供五条以上资料入口。",
      prefix: "../",
      body: `
    <main class="content-main">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>好物方案</span></nav>
      <section class="content-hero-panel">
        <p class="eyebrow dark">Solution Index</p>
        <h1>柚木好物资料库</h1>
        <p class="content-lead">V1.10 已把五类好物扩展为 25 条资料入口，直接按整装、地板、户外、茶室会客和家具好物继续阅读。</p>
      </section>
${sections}
      <section class="content-body">
        <h2>阅读边界</h2>
        <p>这些资料页用于帮助用户建立判断清单，不是商城页、下单页或交易承诺页。继续查看会员站样板或候选品牌资料时，也应理解为资料入口和展示结构，不代表平台认证，也不构成交易担保。</p>
      </section>
      <section class="content-cta">
        <a class="btn btn-primary" href="../index.html#wechat">添加柚喜顾问</a>
        <a class="btn btn-secondary" href="../vendors/index.html">查看候选会员站</a>
      </section>
    </main>`,
      note: "好物方案索引用于帮助用户按类别查资料，真实产品与服务仍需人工确认。",
    }),
  );
}

function candidateCard(entry, categoryName) {
  const [name, url, summary, direction, audience] = entry;
  return `          <li>
            <strong>${escapeHtml(name)}</strong>
            <br />
            所属好物分类：${escapeHtml(categoryName)}
            <br />
            公开资料摘要：${escapeHtml(summary)}
            <br />
            主营方向：${escapeHtml(direction)}
            <br />
            适合查看的人群：${escapeHtml(audience)}
            <br />
            来源：<a href="${escapeHtml(url)}" rel="nofollow noopener">${escapeHtml(url)}</a>
            <br />
            待确认事项：企业资料、图片授权、联系方式、案例材料、服务边界。
            <br />
            是否已联系确认：否；是否已图片授权：否；是否为正式会员：否。
            <br />
            状态：公开资料候选，待联系确认。
          </li>`;
}

async function generateCandidatePages() {
  const categoryBlocks = candidateCategories
    .map(
      (category) => `
      <section class="related-links">
        <h2>${escapeHtml(category.name)}</h2>
        <ul>
${category.entries.map((entry) => candidateCard(entry, category.key)).join("\n")}
        </ul>
      </section>`,
    )
    .join("\n");

  await writeProjectFile(
    "vendors/candidates/index.html",
    pageShell({
      title: "公开资料候选品牌 / 企业会员站样板",
      description: "按五类柚木好物整理公开资料候选品牌或企业，每类至少五条候选资料。",
      prefix: "../../",
      body: `
    <main class="content-main">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../../index.html">首页</a><a href="../index.html">推荐厂商</a><span>公开资料候选品牌</span></nav>
      <section class="content-hero-panel">
        <p class="eyebrow dark">Candidate Member Sites</p>
        <h1>公开资料候选品牌 / 企业会员站样板</h1>
        <p class="content-lead">V1.10 已按五类柚木好物整理 25 条公开资料候选，每条都保留来源链接和待确认事项。</p>
      </section>
      <section class="content-body">
        <h2>阅读边界</h2>
        <p>以下为公开资料候选品牌 / 企业会员站样板，不代表已入驻，不代表平台认证，不构成交易担保，也不构成平台背书。真实会员站上线前，需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。</p>
        <p>本页只使用文字卡片和公开来源链接，不使用未授权品牌 Logo、产品图或案例图。公开资料摘要均为重新整理的说明，后续仍需人工联系确认。</p>
      </section>
${categoryBlocks}
      <section class="content-cta">
        <a class="btn btn-primary" href="../index.html">返回会员站入口</a>
        <a class="btn btn-secondary" href="../../index.html#wechat">添加柚喜顾问</a>
      </section>
    </main>`,
      note: "候选资料仅为公开资料整理，正式转为会员站前仍需五项确认。",
    }),
  );

  const vendorBody = `
    <main class="content-main">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>推荐厂商</span></nav>
      <section class="content-hero-panel">
        <p class="eyebrow dark">Member Site Index</p>
        <h1>按柚木好物分类查看会员站</h1>
        <p class="content-lead">推荐厂商入口保留，但页面内核是好物分类会员站和公开资料候选品牌 / 企业会员站样板。</p>
      </section>
      <section class="related-links">
        <h2>五类候选会员站入口</h2>
        <ul>
          <li><a href="flooring-sample.html">柚木地板会员站样板</a>：查看地板方向资料组织方式。</li>
          <li><a href="whole-decoration-sample.html">柚木整装会员站样板</a>：查看整装 / 木作方向资料组织方式。</li>
          <li><a href="candidates/index.html">庭院户外柚木候选资料</a>：查看户外方向公开资料候选品牌 / 企业。</li>
          <li><a href="candidates/index.html">茶室会客柚木候选资料</a>：查看茶室会客方向公开资料候选品牌 / 企业。</li>
          <li><a href="workshop-sample.html">柚木家具好物 / 柚木工坊样板</a>：查看家具好物方向资料组织方式。</li>
        </ul>
      </section>
      <section class="content-body">
        <h2>V1.10 候选资料补充</h2>
        <p>当前已整理五类柚木好物方向的公开资料候选品牌 / 企业会员站样板，每类不少于五条。它们用于补充未来会员站资料结构和人工验收线索，不是已确认展示名单，也不是平台背书。</p>
        <p>进入 <a href="candidates/index.html">公开资料候选品牌 / 企业会员站样板</a> 可以查看 25 条候选卡片。每条都保留来源链接、主营方向、适合查看的人群、待确认事项和三项状态：是否已联系确认、是否已图片授权、是否已完成会员站确认。</p>
        <p>五类候选资料分别对应柚木地板、柚木整装 / 木作 / 空间、庭院户外柚木、茶室会客柚木和柚木家具好物 / 柚木工坊。用户可以先按自己的空间方向进入候选页，再查看每条公开来源。项目方后续则可以按来源记录逐条联系确认，决定哪些候选资料值得继续推进。</p>
      </section>
      <section class="content-body">
        <h2>展示边界</h2>
        <p>会员展示不等于平台担保。真实会员站上线前，仍需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。没有完成确认前，不使用品牌 Logo、产品图或案例图，也不把公开资料候选写成真实会员站资料。</p>
        <p>当前入口仍保留“推荐厂商”这个导航名称，是为了延续用户已经熟悉的路径；但页面内部不再做名单式推荐，而是按好物分类整理会员站样板和公开候选资料。这个处理方式可以让用户继续找到地板、整装、户外、茶室和家具方向的资料，同时避免把未确认内容写成平台背书。</p>
        <p>如果品牌或企业希望后续进入真实会员站展示，应优先使用厂商申请页整理资料，再按五项确认补齐授权。普通用户则继续通过社群交流和添加柚喜顾问沟通，不通过普通咨询表单承接。</p>
        <p>人工验收候选资料时，建议按分类逐条打开来源链接，确认名称真实存在、页面可访问、摘要没有复制长段原文，并记录是否需要替换来源。若某条来源后续不可访问，应及时从公开候选页移除或更换为新的可核验来源。</p>
      </section>
      <section class="content-cta">
        <a class="btn btn-primary" href="candidates/index.html">查看候选品牌资料</a>
        <a class="btn btn-secondary" href="../forms/vendor-apply.html">申请建立好物分类会员站</a>
      </section>
    </main>`;

  await writeProjectFile(
    "vendors/index.html",
    pageShell({
      title: "推荐厂商",
      description: "按柚木好物分类查看会员站和公开资料候选品牌 / 企业会员站样板。",
      prefix: "../",
      body: vendorBody,
      note: "推荐厂商入口保留，内核为好物分类会员站与公开候选资料。",
    }),
  );
}

// ========== 第五部分：文档、sitemap 与预检脚本更新 ==========
async function updateArticleIndex() {
  await writeProjectFile(
    "articles/index.html",
    pageShell({
      title: "延伸阅读",
      description: "柚喜饰界延伸阅读目录，连接既有文章、V1.10 知识细分阅读和好物资料入口。",
      prefix: "../",
      body: `
    <main class="content-main">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>延伸阅读</span></nav>
      <section class="content-hero-panel">
        <p class="eyebrow dark">Articles</p>
        <h1>延伸阅读目录</h1>
        <p class="content-lead">文章仍作为辅助入口，不回到一级导航；V1.10 已补充更多知识细分页和好物资料页。</p>
      </section>
      <section class="related-links">
        <h2>既有文章</h2>
        <ul>
          <li><a href="what-is-teak.html">什么是柚木</a>：适合刚接触柚木时先补背景。</li>
          <li><a href="how-to-choose-teak-flooring.html">如何选择柚木地板</a>：适合已经开始看地板的人。</li>
          <li><a href="teak-vs-common-wood.html">柚木与常见木材对比</a>：适合做横向判断时参考。</li>
          <li><a href="teak-whole-decoration-guide.html">柚木整装入门</a>：适合继续看整装资料。</li>
          <li><a href="teak-outdoor-furniture-care.html">柚木户外家具维护</a>：适合庭院和露台方向。</li>
          <li><a href="teak-vendor-selection.html">如何看会员站资料</a>：适合查看候选资料前阅读。</li>
        </ul>
      </section>
      <section class="related-links">
        <h2>V1.10 新增入口</h2>
        <ul>
          <li><a href="../knowledge/index.html">柚木知识 30 条细分阅读</a>：六类知识各五条。</li>
          <li><a href="../solutions/index.html">好物方案 25 条资料入口</a>：五类好物各五条。</li>
          <li><a href="../vendors/candidates/index.html">公开资料候选品牌 / 企业会员站样板</a>：五类候选资料各五条。</li>
        </ul>
      </section>
      <section class="content-body">
        <h2>阅读说明</h2>
        <p>延伸阅读不会重新放回一级导航，也不会恢复普通咨询表单入口。它只是帮助用户从文章路径继续进入知识、好物和候选会员站资料。所有真实资料仍需人工核验，公开候选资料不代表平台认证，也不构成交易担保。</p>
        <p>如果你只是想快速查资料，建议优先进入知识索引或好物方案索引；如果你想看未来会员站会如何组织资料，可以继续进入候选品牌页。文章目录本身保持辅助定位，不承担平台背书、交易承诺或表单收集功能。</p>
      </section>
      <section class="content-cta">
        <a class="btn btn-primary" href="../knowledge/index.html">进入知识索引</a>
        <a class="btn btn-secondary" href="../index.html#wechat">添加柚喜顾问</a>
      </section>
    </main>`,
      note: "文章目录作为辅助入口，不扩张一级导航。",
    }),
  );
}

async function updateSourceLogs() {
  const allKnowledge = knowledgeCategories.flatMap((category) =>
    category.topics.map((topic) => `| \`knowledge/topics/${topic.slug}.html\` | ${topic.title} | V1.10 新增知识细分页 | 站内知识体系、公开木材基础资料方向 | 待人工核验 | 不绑定单一检测报告 |`),
  );
  const allSolutions = solutionCategories.flatMap((category) =>
    category.topics.map((topic) => `| \`solutions/guides/${topic.slug}.html\` | ${topic.title} | V1.10 新增好物资料页 | 站内知识体系、样板案例结构、公开资料整理方向 | 待人工核验 | 不作为真实产品承诺 |`),
  );
  const allCandidates = candidateCategories.flatMap((category) =>
    category.entries.map((entry) => `| \`vendors/candidates/index.html\` | ${entry[0]} | 公开资料候选 | ${entry[1]} | 待人工核验 | 未联系确认、未图片授权、不是正式会员 |`),
  );

  await writeProjectFile(
    "custom/source-binding-checklist.md",
    `# 来源绑定清单

文件说明：本文件用于把公开资料来源与具体页面做一对一绑定。  
功能说明：帮助后续执行者知道哪些页面已有来源方向，哪些页面仍需逐页人工核验。  
结构概览：
  第一部分：使用说明
  第二部分：重点页面来源绑定表

## 1. 使用说明

- 当前文件只整理“建议绑定来源”或“公开来源链接”，不代表已经完成联网人工核验。
- 如无进一步人工核验结果，“是否已人工核验”统一保持“待人工核验”。
- 同一页面可以绑定多个公开来源，但不要把通用来源误写成平台认证结论。
- V1.10 新增知识、好物资料和候选会员站均已登记，后续应逐条补核验日期、核验人和最终采用链接。

## 2. 重点页面来源绑定表

| 页面路径 | 页面主题 | 当前来源状态 | 建议绑定来源 | 是否已人工核验 | 备注 |
| --- | --- | --- | --- | --- | --- |
| \`knowledge/index.html\` | 柚木知识索引 | V1.10 已扩展为 30 条入口 | The Wood Database、USDA Forest Products Laboratory、站内知识体系 | 待人工核验 | 索引页本身不绑定单一报告 |
| \`solutions/index.html\` | 好物方案索引 | V1.10 已扩展为 25 条入口 | 站内知识体系、样板案例结构、公开资料整理方向 | 待人工核验 | 资料页不作为真实产品承诺 |
| \`vendors/candidates/index.html\` | 公开资料候选品牌 / 企业会员站样板 | V1.10 已扩展为 25 条候选 | 候选品牌官网或公开产品页 | 待人工核验 | 未联系确认、未图片授权、不是正式会员 |
${allKnowledge.join("\n")}
${allSolutions.join("\n")}
${allCandidates.join("\n")}

## 3. 后续处理建议

- 知识页后续应补充更明确的公开木材资料来源，例如树种资料、木材稳定性资料和维护资料。
- 好物资料页后续应在真实产品资料确认后再补品牌、参数和授权信息。
- 候选会员站条目转为真实会员站前，必须完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。
`,
  );

  const sourceEntries = candidateCategories
    .flatMap((category) =>
      category.entries.map((entry, index) => {
        const [name, url, summary, direction, audience] = entry;
        return `### ${category.key} ${index + 1}. ${name}

- 所属分类：${category.key}
- 来源链接：${url}
- 来源类型：品牌 / 企业官网或公开产品页
- 整理日期：${today}
- 公开资料摘要：${summary}
- 主营方向：${direction}
- 适合查看的人群：${audience}
- 是否已联系确认：否
- 是否已图片授权：否
- 是否为正式会员：否
- 是否可公开展示：仅作为文字卡片和来源链接展示，不使用未授权 Logo、产品图或案例图。
- 后续处理建议：如需转为真实会员站，必须完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。`;
      }),
    )
    .join("\n\n");

  await writeProjectFile(
    "custom/public-candidate-brand-source-log.md",
    `# 公开资料候选品牌来源记录

文件说明：本文件记录 V1.10 整理的公开资料候选品牌 / 企业信息。  
功能说明：用于为未来好物分类会员站补充候选资料来源，所有条目均不代表已联系确认、不代表已图片授权、不代表正式会员。  
结构概览：
  第一部分：整理边界
  第二部分：候选品牌资料
  第三部分：后续处理建议

## 1. 整理边界

本轮资料只来自公开网页的简要整理，用于完善未来会员站展示结构。

- 是否联系确认：否。
- 是否图片授权：否。
- 是否为正式会员：否。
- 是否可直接使用品牌 Logo / 产品图 / 案例图：否。
- 展示边界：公开资料候选不代表已入驻，不代表平台认证，不构成交易担保，也不构成平台背书。

## 2. 候选品牌资料

${sourceEntries}

## 3. 后续处理建议

1. 优先联系候选品牌或企业，确认是否允许在柚喜饰界作为真实会员站展示。
2. 未取得图片授权前，公开页面只保留文字卡片和来源链接。
3. 转为真实会员站前，必须完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。
4. 如某候选资料来源无法长期访问，应从公开候选页中移除或替换为新的可核验来源。
`,
  );
}

async function appendSectionIfMissing(relativePath, heading, content) {
  const absolutePath = path.join(projectRoot, relativePath);
  let text = await fs.readFile(absolutePath, "utf8");

  if (text.includes(heading)) {
    return;
  }

  text = `${text.trim()}\n\n${content.trim()}\n`;
  await fs.writeFile(absolutePath, text, "utf8");
}

async function updateDocs() {
  await appendSectionIfMissing(
    "custom/client-preview-note.md",
    "## 8. V1.10 新增说明",
    `## 8. V1.10 新增说明

V1.10 的重点是把“结构可验收”推进到“内容丰满可验收”。当前已完成：

- 柚木知识扩展为六类、共 30 条可点击细分阅读入口。
- 好物方案扩展为五类、共 25 条可点击资料入口。
- 公开资料候选品牌 / 企业会员站样板扩展为五类、共 25 条候选卡片。
- 候选品牌来源记录、来源绑定清单和 sitemap 已同步更新。

重要边界：

- 候选资料仍为公开资料整理，不代表正式入驻、不代表平台认证、不构成平台担保或交易担保。
- 正式转为会员站前，仍必须完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。
- 本轮没有新增后台、登录、商城、支付、数据库，也没有恢复普通用户咨询表单入口。`,
  );

  await appendSectionIfMissing(
    "custom/launch-checklist.md",
    "## V1.10 内容丰满复核",
    `## V1.10 内容丰满复核

- 确认 \`knowledge/index.html\` 六类知识均已有五条以上可点击入口。
- 确认 \`solutions/index.html\` 五类好物均已有五条以上可点击资料入口。
- 确认 \`vendors/candidates/index.html\` 五类候选资料均不少于五条，总数不少于 25 条。
- 确认新增公开页面均已加入 \`sitemap.xml\`。
- 确认候选资料仍写成公开资料候选，未写成正式会员、平台认证或交易担保。
- 确认普通用户 CTA 仍回到社群交流 / 添加柚喜顾问。`,
  );

  await appendSectionIfMissing(
    "custom/release-materials-needed.md",
    "## V1.10 后仍需补齐的资料",
    `## V1.10 后仍需补齐的资料

V1.10 已补充知识、好物和公开候选会员站内容，但以下资料仍不能假装完成：

- 候选品牌 / 企业是否愿意转为真实会员站展示。
- 候选品牌 / 企业 Logo、产品图、案例图授权。
- 候选品牌 / 企业可公开联系方式。
- 真实案例材料、图片授权和客户授权。
- 服务区域、交付范围、售后边界和不承接范围。

没有完成五项确认前，候选资料只能继续作为公开资料候选和展示结构参考。`,
  );

  await appendSectionIfMissing(
    "custom/public-review-checklist.md",
    "## V1.10 人工验收新增项",
    `## V1.10 人工验收新增项

- [ ] 抽查 30 条知识细分页是否能正常打开。
- [ ] 抽查 25 条好物资料页是否能正常打开。
- [ ] 抽查候选会员站页五类分组是否每类至少五条。
- [ ] 抽查候选来源链接是否为公开官网或公开产品页。
- [ ] 抽查公开候选资料是否没有使用未授权 Logo、产品图或案例图。
- [ ] 抽查新增页面是否没有购物车、价格、在线下单或立即购买入口。`,
  );

  await appendSectionIfMissing(
    "custom/vendor-member-site-material-template.md",
    "## 9. V1.10 候选资料转正前补充核验",
    `## 9. V1.10 候选资料转正前补充核验

V1.10 已补充五类公开资料候选品牌 / 企业会员站样板。候选条目转为真实会员站前，除原有五项确认外，还应补充：

- 候选来源链接是否仍可访问：
- 企业是否同意被展示为真实会员站：
- 是否允许展示品牌 / 企业名称：
- 是否允许展示 Logo：
- 是否允许展示产品图：
- 是否允许展示案例图：
- 是否允许展示联系方式：
- 是否确认公开资料摘要可用于会员站：

说明：未联系确认、未取得图片授权或未确认联系方式前，只能作为公开资料候选，不应写成正式会员、认证或平台担保。`,
  );
}

async function updateReleaseReadiness() {
  const filePath = path.join(projectRoot, "custom/check-release-readiness.mjs");
  let text = await fs.readFile(filePath, "utf8");

  if (!text.includes('"已入驻"')) {
    text = text.replace('"真实入驻",\n', '"真实入驻",\n  "已入驻",\n  "正式会员",\n');
  }

  if (!text.includes('"不代表已入驻"')) {
    text = text.replace(
      '"不代表真实入驻",\n',
      '"不代表真实入驻",\n  "不代表已入驻",\n  "是否为正式会员：否",\n  "不是正式会员",\n',
    );
  }

  await fs.writeFile(filePath, text, "utf8");
}

async function updateSitemap() {
  const publicEntries = ["index.html", "knowledge", "solutions", "vendors", "cases", "articles", "forms", "about"];
  const htmlFiles = [];

  async function collect(entry) {
    const absolute = path.join(projectRoot, entry);
    const stat = await fs.stat(absolute);

    if (stat.isFile()) {
      if (entry.endsWith(".html")) {
        htmlFiles.push(entry.replaceAll(path.sep, "/"));
      }
      return;
    }

    const children = await fs.readdir(absolute, { withFileTypes: true });
    for (const child of children) {
      await collect(path.join(entry, child.name));
    }
  }

  for (const entry of publicEntries) {
    await collect(entry);
  }

  const sorted = htmlFiles
    .map((file) => file.replaceAll("\\", "/"))
    .sort((a, b) => (a === "index.html" ? -1 : b === "index.html" ? 1 : a.localeCompare(b)));
  const urls = sorted
    .map((file) => {
      const loc = file === "index.html" ? siteBaseUrl : `${siteBaseUrl}${file}`;
      return `  <url><loc>${loc}</loc><lastmod>${today}</lastmod></url>`;
    })
    .join("\n");

  await writeProjectFile("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`);
}

async function writeVersionRecord() {
  await writeProjectFile(
    "custom/notes/v1.10-content-and-candidate-member-site-full-fill.md",
    `# 版本记录：v1.10-content-and-candidate-member-site-full-fill

## 1. 本轮目标

本轮目标是完成“V1.10 知识、好物、候选会员站内容全面填充版”，把站点从结构可验收推进到内容丰满可验收。

本轮属于：

- 内容补充
- 静态页面扩展
- 来源记录补齐
- 发布预检维护

## 2. 背景与上下文

当前基础承接 V1.9。V1.9 已经新增公开资料候选会员站入口，并清理了占位电话、占位邮箱和备案占位，使发布预检能够通过。

但 V1.9 仍偏“入口可用”，知识、好物和候选会员站内容量不足。本轮重点不再重构结构，而是把三个核心板块填满到可人工验收的程度。

## 3. 柚木知识内容填充情况

本轮将 \`knowledge/index.html\` 扩展为六类知识索引：

- 柚木入门
- 选购避坑
- 材质与工艺
- 空间应用
- 保养维护
- 常见问答

每类新增五条细分阅读，共新增 30 个 \`knowledge/topics/\` 下的可点击知识页。六个原分类页也同步改为本类五条入口页。

## 4. 好物方案内容填充情况

本轮将 \`solutions/index.html\` 扩展为五类好物资料库：

- 柚木整装
- 柚木地板
- 庭院户外柚木
- 茶室会客柚木
- 柚木家具好物

每类新增五条资料入口，共新增 25 个 \`solutions/guides/\` 下的资料页。五个原方案页同步改为类别资料索引页。

## 5. 推荐厂商 / 候选会员站填充情况

本轮将 \`vendors/candidates/index.html\` 从 11 条候选扩展为 25 条候选，覆盖五类好物方向，每类不少于五条。

候选卡片包含：

- 品牌 / 企业名称
- 所属好物分类
- 公开资料摘要
- 主营方向
- 适合查看的人群
- 来源链接
- 待确认事项
- 是否已联系确认
- 是否已图片授权
- 是否为正式会员
- 状态：公开资料候选，待联系确认

## 6. 候选品牌来源记录

已更新 \`custom/public-candidate-brand-source-log.md\`，记录 25 条候选资料来源。

已更新 \`custom/source-binding-checklist.md\`，登记新增知识页、好物资料页和候选会员站来源状态，全部保持“待人工核验”。

## 7. 新增页面与 sitemap 更新

本轮新增公开页面：

- 30 个知识细分页
- 25 个好物资料页

已更新 \`sitemap.xml\`，所有新增公开 HTML 页面均已加入 sitemap。未将 \`custom/\`、截图、记录文件或预览包加入 sitemap。

## 8. 发布预检结果

本轮维护 \`custom/check-release-readiness.mjs\`，补充对“已入驻”和“正式会员”的风险检查，同时放行合理否定语境，例如“不代表已入驻”和“是否为正式会员：否”。

预期发布预检应继续通过，确保没有乱码、明显占位内容、普通用户咨询入口回流或正向高风险表达。

## 9. 本地验证结果

本轮需要执行并通过：

- \`node --check script.js\`
- \`node --check data\\site-content.js\`
- \`node --check forms\\form.js\`
- \`node custom\\check-home-links.mjs\`
- \`node custom\\check-site-links.mjs\`
- \`node custom\\check-encoding.mjs\`
- \`node custom\\check-content-depth.mjs\`
- \`node custom\\check-release-readiness.mjs\`

## 10. 公网预览地址

\`https://yinuocheng123-cloud.github.io/youmu/\`

## 11. 未完成项

本轮仍未完成：

- 候选品牌 / 企业联系确认
- 候选品牌 / 企业图片授权
- 候选品牌 / 企业联系方式确认
- 候选品牌 / 企业案例材料确认
- 候选品牌 / 企业服务边界确认
- 真实电话、真实邮箱、最终二维码和备案信息确认

## 12. 资料真实性处理说明

本轮没有新增真实厂商、真实案例、真实认证或真实资质。

公开候选资料只代表从公开来源整理到的候选资料结构，不代表正式入驻、不代表平台认证、不构成平台担保或交易担保。

## 13. 后台与交易能力说明

本轮没有新增后台、登录、商城、支付、数据库。

本轮没有新增购物车、价格、在线下单、立即购买或支付流程。

本轮没有修改 GitHub Actions workflow，也没有重新启用普通用户咨询表单。

## 14. 下一轮建议

1. 部署完成后按手机端抽查知识索引、好物索引、候选会员站页和若干新增详情页。
2. 对 25 条候选来源逐条人工复核，补充核验日期、核验人和是否可继续展示。
3. 优先联系最可能转为真实会员站的候选品牌 / 企业，按五项确认模板补齐授权资料。
`,
  );
}

async function main() {
  await generateKnowledgePages();
  await generateSolutionPages();
  await generateCandidatePages();
  await updateArticleIndex();
  await updateSourceLogs();
  await updateDocs();
  await updateReleaseReadiness();
  await updateSitemap();
  await writeVersionRecord();
}

await main();
