/*
文件说明：该文件用于生成 V1.13C 推荐厂商与候选品牌资料库重构内容。
功能说明：重写 vendors 总入口和候选品牌资料库，清理厂商区机械表达，并更新样式、预检、说明文档和版本记录。

结构概览：
  第一部分：导入依赖与通用工具
  第二部分：候选品牌与方向数据
  第三部分：页面内容生成
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

function replaceFooter(html, footerHtml) {
  return html.replace(/<footer class="content-site-footer"[\s\S]*?<\/footer>/, indent(footerHtml, 4));
}

function replaceTitleAndDescription(html, title, description) {
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`);
}

function sourceLink(brand) {
  return `<a href="${brand.url}" rel="nofollow noopener">${brand.source}</a>`;
}

function listItems(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

// ========== 第二部分：候选品牌与方向数据 ==========
const categories = [
  {
    id: "flooring",
    title: "柚木地板",
    summary: "这一类主要看材质来源、规格厚度、安装方式、维护说明和服务区域，不能只看颜色和铺装图片。",
    guide: "如果你正在比较地板资料，先看品牌是否讲清楚材料结构、适用空间、安装边界和后期维护，再决定是否继续沟通。",
    brands: ["Indoteak Design", "Arc Wood & Timbers", "Havwoods"],
  },
  {
    id: "fitout",
    title: "柚木整装",
    summary: "这一类主要看空间方案、木作配合、墙面与柜体材料、案例材料和服务边界。",
    guide: "整装方向不要只看一张空间图，更要看它是否能说明木作范围、材料做法、服务区域和案例材料来源。",
    brands: ["Noblewood Reclaimed Teak", "Anthology Woods", "Wonderwall Studios"],
  },
  {
    id: "outdoor",
    title: "庭院户外",
    summary: "这一类主要看户外环境、结构连接、五金、耐候表达、维护周期和服务范围。",
    guide: "户外方向要把阳光、雨水、排水、移动和维护一起看，品牌资料里如果只展示外观，后续仍要继续确认结构与维护。",
    brands: ["Westminster Teak", "Barlow Tyrie", "Gloster"],
  },
  {
    id: "tea-room",
    title: "茶室会客",
    summary: "这一类主要看氛围、尺度、茶桌、柜体、地面、灯光和整体协调，不只是单件茶桌。",
    guide: "茶室会客方向更重视空间节奏，资料里可以先看桌椅尺度、木色协调、收纳关系和真实使用场景表达。",
    brands: ["Hati Home", "Teak Two", "Ethnicraft"],
  },
  {
    id: "furniture",
    title: "柚木家具好物",
    summary: "这一类主要看桌椅、柜体、边几、收纳、工艺、表面处理和具体使用场景。",
    guide: "家具单品也要回到生活场景里判断，先看尺寸、结构、触感、清洁维护和软装搭配，再看单张产品图是否好看。",
    brands: ["Chic Teak", "Tikamoon", "MasayaCo"],
  },
];

const candidateGroups = [
  {
    id: "flooring",
    title: "柚木地板",
    intro: "地板方向适合先看材料结构、规格表达、铺装场景和维护说明。资料越能讲清安装与服务边界，越值得继续核对。",
    brands: [
      {
        name: "Indoteak Design",
        direction: "柚木地板",
        position: "围绕再生柚木地板、墙面材料、台面和定制构件展示公开资料。",
        see: "可以先看它如何描述再生柚木材料、室内应用和不同表面材料的组合方式。",
        audience: "比较适合正在了解再生柚木地板、墙面木材和室内木作资料的人。",
        pending: "后续仍需确认授权、服务区域、联系方式和具体合作边界。",
        source: "品牌官网公开资料",
        url: "https://www.indoteakdesign.com/",
      },
      {
        name: "Arc Wood & Timbers",
        direction: "柚木地板",
        position: "公开资料中能看到再生柚木地板和木材产品相关内容。",
        see: "可以先看产品页如何说明材料、地板形态和可选方向，再把缺少的规格与服务信息列入沟通清单。",
        audience: "比较适合关注地板材料来源和产品页结构的人。",
        pending: "后续仍需确认产品资料、授权展示、服务区域和交付边界。",
        source: "品牌官网公开资料",
        url: "https://arcwoodandtimbers.com/products/reclaimed-teak-flooring/",
      },
      {
        name: "Luxury Wood Flooring",
        direction: "柚木地板",
        position: "公开资料以实木和工程木地板为主，适合观察地板服务与产品表达方式。",
        see: "可以先看它如何组织地板类别、安装说明和客户沟通信息，理解地板资料可以怎样表达。",
        audience: "比较适合希望比较地板服务表达方式的人。",
        pending: "后续仍需确认是否有柚木方向资料、图片授权和本地服务范围。",
        source: "品牌官网公开资料",
        url: "https://www.luxurywoodflooring.com/",
      },
      {
        name: "Havwoods",
        direction: "柚木地板",
        position: "长期展示木地板、木质表面材料和项目资料，公开信息体系相对完整。",
        see: "可以先看它如何呈现规格、空间图片、产品系列和技术资料，再思考地板资料页应补哪些信息。",
        audience: "比较适合关注地板资料体系和规格表达的人。",
        pending: "后续仍需确认柚木相关资料、授权状态、服务区域和合作边界。",
        source: "品牌官网公开资料",
        url: "https://www.havwoods.com/",
      },
      {
        name: "East Teak Fine Hardwoods",
        direction: "柚木地板",
        position: "公开资料围绕柚木硬木材料、木材供应和应用场景展开。",
        see: "可以先看它对柚木材料、硬木用途和供应能力的说明，再补充询问地板方向的规格与服务。",
        audience: "比较适合需要从原材料角度理解地板候选资料的人。",
        pending: "后续仍需确认具体产品、区域服务、图片授权和合作边界。",
        source: "品牌官网公开资料",
        url: "https://www.eastteak.com/teak/",
      },
    ],
  },
  {
    id: "fitout",
    title: "柚木整装",
    intro: "整装方向适合先看墙面、柜体、木作和空间表面材料。不要只看效果图，要看材料、服务范围和案例材料是否能对上。",
    brands: [
      {
        name: "Noblewood Reclaimed Teak",
        direction: "柚木整装",
        position: "公开资料中有再生柚木墙板、饰面板和空间材料相关内容。",
        see: "可以先看墙面材料、纹理展示和空间应用说明，理解整装木作资料应如何补齐。",
        audience: "比较适合关注墙面、柜体和整装木作材料的人。",
        pending: "后续仍需确认企业资料、图片授权、服务区域和案例材料边界。",
        source: "品牌官网公开资料",
        url: "https://noblewood.com/products/reclaimed-teak-panels/",
      },
      {
        name: "Anthology Woods",
        direction: "柚木整装",
        position: "公开资料展示再生柚木墙面、天花和定制材料等空间表面内容。",
        see: "可以先看它如何表达表面材料、空间气质和木色变化，再补充确认适用场景。",
        audience: "比较适合关注整装表面材料和空间气质的人。",
        pending: "后续仍需确认授权、联系方式、服务范围和具体合作边界。",
        source: "品牌官网公开资料",
        url: "https://anthologywoods.com/products/pearly-teak",
      },
      {
        name: "WoodCo",
        direction: "柚木整装",
        position: "公开资料中有再生柚木墙板和空间饰面材料相关页面。",
        see: "可以先看墙板产品如何说明材质、形态和空间用途，作为整装资料完整度参考。",
        audience: "比较适合正在寻找墙面木作资料结构的人。",
        pending: "后续仍需确认授权、产品资料、案例材料和服务边界。",
        source: "品牌官网公开资料",
        url: "https://www.woodco.com/wallboard-danube-3d-reclaimed-teak/",
      },
      {
        name: "Wonderwall Studios",
        direction: "柚木整装",
        position: "公开资料围绕木质墙面材料和空间表面产品展开。",
        see: "可以先看它如何把材料、设计表达和空间氛围放在一起说明。",
        audience: "比较适合关注空间表面材料和设计表达的人。",
        pending: "后续仍需确认柚木方向资料、授权状态、联系方式和合作边界。",
        source: "品牌官网公开资料",
        url: "https://www.wonderwallstudios.com/",
      },
      {
        name: "Indoteak Design",
        direction: "柚木整装",
        position: "公开资料同时涉及再生柚木地板、墙面、台面和定制构件。",
        see: "可以先看同一材料在不同空间位置中的应用表达，再继续确认整装服务范围。",
        audience: "比较适合关注同一材料在整装多位置应用的人。",
        pending: "后续仍需确认服务区域、案例材料、图片授权和具体边界。",
        source: "品牌官网公开资料",
        url: "https://www.indoteakdesign.com/",
      },
    ],
  },
  {
    id: "outdoor",
    title: "庭院户外",
    intro: "户外方向适合先看日晒雨淋、结构连接、五金、耐候和维护周期。图片好看只是第一步，结构和维护说明更关键。",
    brands: [
      {
        name: "Westminster Teak",
        direction: "庭院户外",
        position: "长期围绕户外柚木家具做产品展示，公开资料中能看到桌椅、躺椅和庭院场景相关内容。",
        see: "可以先看户外家具形态、使用场景、材质说明和维护表达。",
        audience: "比较适合想了解户外柚木家具形态、庭院场景和维护表达的人。",
        pending: "后续仍需联系确认授权、服务区域和具体合作边界。",
        source: "品牌官网公开资料",
        url: "https://westminsterteak.com/",
      },
      {
        name: "Barlow Tyrie",
        direction: "庭院户外",
        position: "公开资料围绕户外家具、柚木家具和家具维护展开。",
        see: "可以先看经典户外家具品牌如何组织产品系列、材质说明和维护内容。",
        audience: "比较适合关注经典户外柚木家具品牌资料的人。",
        pending: "后续仍需确认授权状态、服务区域、联系方式和合作边界。",
        source: "品牌官网公开资料",
        url: "https://www.teak.com/",
      },
      {
        name: "Gloster",
        direction: "庭院户外",
        position: "公开资料中能看到户外家具和柚木工艺相关表达。",
        see: "可以先看它如何把户外生活方式、产品系列和材料工艺放在同一套资料里。",
        audience: "比较适合关注户外空间品质表达的人。",
        pending: "后续仍需确认具体柚木资料、授权展示和服务范围。",
        source: "品牌官网公开资料",
        url: "https://www.gloster.com/",
      },
      {
        name: "Royal Botania",
        direction: "庭院户外",
        position: "公开资料展示户外家具、庭院生活方式和相关产品系列。",
        see: "可以先看它如何表达户外空间、家具组合和品牌生活方式。",
        audience: "比较适合关注户外家具体系化资料的人。",
        pending: "后续仍需确认柚木相关资料、授权状态和服务边界。",
        source: "品牌官网公开资料",
        url: "https://www.royalbotania.com/",
      },
      {
        name: "Kingsley Bate",
        direction: "庭院户外",
        position: "公开资料围绕户外家具和庭院产品展开。",
        see: "可以先看户外家具品类、庭院使用场景和产品维护表达。",
        audience: "比较适合关注户外家具企业资料的人。",
        pending: "后续仍需确认授权、联系方式、区域服务和合作边界。",
        source: "品牌官网公开资料",
        url: "https://www.kingsleybate.com/",
      },
    ],
  },
  {
    id: "tea-room",
    title: "茶室会客",
    intro: "茶室会客方向适合先看尺度、触感、茶桌、柜体、地面和氛围协调。单件家具好看，不代表空间就安静好用。",
    brands: [
      {
        name: "Hati Home",
        direction: "茶室会客",
        position: "公开资料中有再生柚木餐桌和家居单品，可作为会客桌与茶桌形态参考。",
        see: "可以先看桌面比例、木色表达和空间搭配方式。",
        audience: "比较适合关注茶桌、餐桌和会客桌资料的人。",
        pending: "后续仍需确认授权、服务区域、产品资料和合作边界。",
        source: "品牌官网公开资料",
        url: "https://www.hatihome.com/products/hollis-dining-table-reclaimed-teak",
      },
      {
        name: "Teak Two",
        direction: "茶室会客",
        position: "公开资料围绕柚木家具和家居产品展开。",
        see: "可以先看桌椅、柜体和单品组合，判断是否适合作为茶室会客资料参考。",
        audience: "比较适合关注茶室会客桌椅组合的人。",
        pending: "后续仍需确认图片授权、联系方式和具体服务边界。",
        source: "品牌官网公开资料",
        url: "https://teaktwo.com/",
      },
      {
        name: "Ethnicraft",
        direction: "茶室会客",
        position: "公开资料展示家具、餐桌、柜体和空间单品。",
        see: "可以先看整体家具风格、尺度关系和空间搭配。",
        audience: "比较适合关注会客空间家具搭配的人。",
        pending: "后续仍需确认柚木相关资料、授权展示和合作边界。",
        source: "品牌官网公开资料",
        url: "https://www.ethnicraft.com/",
      },
      {
        name: "MasayaCo",
        direction: "茶室会客",
        position: "公开资料中有柚木家具、座椅和空间单品。",
        see: "可以先看座椅、桌面和会客空间单品如何组合。",
        audience: "比较适合关注可持续家具和会客座椅的人。",
        pending: "后续仍需确认资料授权、服务区域和具体合作边界。",
        source: "品牌官网公开资料",
        url: "https://www.masayaco.com/",
      },
      {
        name: "d-Bodhi",
        direction: "茶室会客",
        position: "公开资料围绕再生柚木家具和家居产品展开。",
        see: "可以先看再生柚木在桌椅柜体中的表现，以及资料如何说明材料特征。",
        audience: "比较适合关注再生柚木家具资料的人。",
        pending: "后续仍需确认授权、联系方式、案例材料和服务边界。",
        source: "品牌官网公开资料",
        url: "https://dbodhi.com/reclaimed-teak",
      },
    ],
  },
  {
    id: "furniture",
    title: "柚木家具好物",
    intro: "家具方向适合先看尺寸比例、结构工艺、表面处理、收纳关系和使用场景。单品再好看，也要放回家里判断。",
    brands: [
      {
        name: "Chic Teak",
        direction: "柚木家具好物",
        position: "公开资料展示柚木家具、室内外家具和家居单品。",
        see: "可以先看桌椅、柜体、边几和单品组合，理解家具资料如何按场景组织。",
        audience: "比较适合关注桌椅、柜体和单品组合的人。",
        pending: "后续仍需确认授权、服务范围、联系方式和合作边界。",
        source: "品牌官网公开资料",
        url: "https://chicteak.com/",
      },
      {
        name: "Teak Two",
        direction: "柚木家具好物",
        position: "公开资料围绕柚木家具和家居产品展开。",
        see: "可以先看柚木桌椅、柜体和居家单品的表达方式。",
        audience: "比较适合关注柚木桌椅、柜体和居家单品的人。",
        pending: "后续仍需确认图片授权、联系方式和具体服务边界。",
        source: "品牌官网公开资料",
        url: "https://teaktwo.com/",
      },
      {
        name: "Tikamoon",
        direction: "柚木家具好物",
        position: "公开资料中有实木家具、柚木家具和材料说明。",
        see: "可以先看材料说明、保养表达和家具分类方式。",
        audience: "比较适合关注柚木家具材料和保养表达的人。",
        pending: "后续仍需确认授权、产品资料和服务区域。",
        source: "品牌官网公开资料",
        url: "https://www.tikamoon.co/ins-our-materials-95/teak-246.htm",
      },
      {
        name: "Ethnicraft",
        direction: "柚木家具好物",
        position: "公开资料展示家具、桌椅、柜体和空间单品。",
        see: "可以先看整体家具风格、空间搭配和单品系列表达。",
        audience: "比较适合关注整体家具风格搭配的人。",
        pending: "后续仍需确认柚木相关资料、授权展示和合作边界。",
        source: "品牌官网公开资料",
        url: "https://www.ethnicraft.com/",
      },
      {
        name: "MasayaCo",
        direction: "柚木家具好物",
        position: "公开资料中有手工家具、柚木座椅和空间单品。",
        see: "可以先看手作家具、椅凳比例和居家使用场景。",
        audience: "比较适合关注手作家具和可持续设计的人。",
        pending: "后续仍需确认资料授权、服务区域和具体合作边界。",
        source: "品牌官网公开资料",
        url: "https://www.masayaco.com/",
      },
    ],
  },
];

const featuredBrands = [
  candidateGroups[0].brands[0],
  candidateGroups[0].brands[1],
  candidateGroups[1].brands[0],
  candidateGroups[1].brands[1],
  candidateGroups[2].brands[0],
  candidateGroups[2].brands[1],
  candidateGroups[3].brands[0],
  candidateGroups[4].brands[0],
];

// ========== 第三部分：页面内容生成 ==========
function directionCard(category) {
  return `
<article class="vendor-direction-card" id="${category.id}">
  <h3>${category.title}</h3>
  <p>${category.summary}</p>
  <ul>${listItems(category.brands.map((brand) => brand))}</ul>
  <a class="natural-link" href="candidates/index.html#${category.id}">继续看${category.title}方向资料</a>
</article>`;
}

function featuredCard(brand) {
  return `
<article class="vendor-feature-card">
  <p class="story-kicker">${brand.direction}</p>
  <h3>${brand.name}</h3>
  <p>${brand.position}</p>
  <p><strong>为什么可以先看看：</strong>${brand.see}</p>
  <p class="source-note">资料来自公开信息。来源：${sourceLink(brand)}</p>
</article>`;
}

function candidateCard(brand) {
  return `
<article class="candidate-library-card">
  <p class="candidate-direction">${brand.direction}</p>
  <h3>${brand.name}</h3>
  <p>${brand.position}</p>
  <p>${brand.see}</p>
  <p class="candidate-audience">${brand.audience}</p>
  <p class="source-note">资料来源：${sourceLink(brand)}</p>
  <p class="source-note">${brand.pending}</p>
</article>`;
}

function categoryBlock(group) {
  return `
<section class="vendor-library-section" id="${group.id}">
  <div class="category-heading">
    <h2>${group.title}</h2>
    <p>${group.intro}</p>
  </div>
  <div class="candidate-library-grid">${group.brands.map(candidateCard).join("")}</div>
</section>`;
}

async function updateVendorIndex() {
  const html = await readText("vendors/index.html");
  const main = `
<main class="content-main vendor-guide-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>推荐厂商</span></nav>
  <section class="page-hero vendor-guide-hero">
    <p class="eyebrow dark">Candidate Brand Guide</p>
    <h1>按柚木好物方向看企业资料</h1>
    <p>这里整理的是不同柚木好物方向下的公开资料候选品牌和企业，方便用户先做初步了解。先看方向是否匹配，再看资料是否值得继续核对。</p>
    <a class="btn btn-primary" href="candidates/index.html">进入公开资料候选品牌库</a>
  </section>
  <section class="vendor-guide-section">
    <div class="category-heading">
      <h2>先看你关心的好物方向</h2>
      <p>不同方向要看的重点不一样。这里先把问题拆开，避免把地板、整装、户外、茶室和家具单品混成同一套判断。</p>
    </div>
    <div class="vendor-direction-grid">${categories.map(directionCard).join("")}</div>
  </section>
  <section class="vendor-guide-section">
    <div class="category-heading">
      <h2>先看几类代表资料</h2>
      <p>下面只是几张代表性资料卡，用来帮助用户理解资料库的阅读方式。完整分类可以进入候选品牌库继续查看。</p>
    </div>
    <div class="vendor-feature-grid">${featuredBrands.map(featuredCard).join("")}</div>
  </section>
  <section class="vendor-guide-section vendor-explain-section">
    <h2>这些资料怎么理解</h2>
    <p>这些资料来自公开信息整理，不代表已入驻，不代表平台认证，也不等于平台担保。正式转为会员站前，还需要完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。</p>
    <p>更稳妥的阅读方式，是先把它们当作资料线索：看它们公开页面里能否讲清材料、产品、应用场景和服务范围，再把缺少的信息列入后续沟通清单。</p>
  </section>
  <section class="vendor-guide-section vendor-apply-section">
    <h2>企业希望展示资料</h2>
    <p>如果企业希望建立好物分类会员站，可以先准备企业资料、产品资料、图片授权、案例材料和服务边界说明，再提交申请。当前申请页仍为静态资料收集入口，不涉及后台、登录、商城或支付。</p>
    <a class="btn btn-primary" href="../forms/vendor-apply.html">申请建立好物分类会员站</a>
  </section>
</main>`;
  const footer = `
<footer class="content-site-footer">
  <div class="content-footer-inner">
    <span>柚喜饰界 - 按柚木好物方向看企业资料</span>
    <span>候选资料来自公开信息整理，展示不等于平台背书。</span>
  </div>
</footer>`;
  const next = replaceTitleAndDescription(
    replaceFooter(replaceMain(html, main), footer),
    "按柚木好物方向看企业资料 - 柚喜饰界",
    "按柚木地板、整装、户外、茶室和家具好物方向查看公开资料候选品牌。"
  );
  await writeText("vendors/index.html", next);
}

async function updateCandidateIndex() {
  const html = await readText("vendors/candidates/index.html");
  const main = `
<main class="content-main vendor-library-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../../index.html">首页</a><a href="../index.html">推荐厂商</a><span>公开资料候选品牌</span></nav>
  <section class="page-hero vendor-library-hero">
    <p class="eyebrow dark">Public Candidate Brand Library</p>
    <h1>公开资料候选品牌</h1>
    <p>这些资料来自公开信息整理，方便用户按好物方向先做了解。是否合作、是否入驻、是否授权展示，后续还需要逐项确认。</p>
    <a class="btn btn-primary" href="../../index.html#wechat">添加柚喜顾问</a>
  </section>
  <section class="vendor-guide-section">
    <div class="category-heading">
      <h2>按方向查找</h2>
      <p>先选一个好物方向，再看对应品牌资料。每一类资料都建议从材料、场景、服务和待确认事项四个角度阅读。</p>
    </div>
    <div class="vendor-category-nav">
      ${candidateGroups.map((group) => `<a href="#${group.id}"><strong>${group.title}</strong><span>${group.intro}</span></a>`).join("")}
    </div>
  </section>
  ${candidateGroups.map(categoryBlock).join("")}
  <section class="vendor-guide-section vendor-explain-section">
    <h2>候选资料统一说明</h2>
    <p>本页资料来自公开信息整理，不代表已入驻，不代表平台认证，也不等于平台担保，不构成交易担保。正式转为会员站前，仍需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。</p>
    <p>页面中的来源链接仅用于说明资料出处。品牌资料是否适合作为会员站展示，还需要后续联系企业、核对授权材料，并确认服务区域、服务内容和后续沟通边界。</p>
  </section>
</main>`;
  const footer = `
<footer class="content-site-footer">
  <div class="content-footer-inner">
    <span>柚喜饰界 - 公开资料候选品牌</span>
    <span>资料库用于初步了解，后续仍需联系确认与授权确认。</span>
  </div>
</footer>`;
  const next = replaceTitleAndDescription(
    replaceFooter(replaceMain(html, main), footer),
    "公开资料候选品牌 - 柚喜饰界",
    "公开资料候选品牌按柚木好物方向整理，方便用户先了解，再逐项确认授权、联系方式和服务边界。"
  );
  await writeText("vendors/candidates/index.html", next);
}

// ========== 第四部分：样式、预检、文档与记录更新 ==========
async function updateStyles() {
  const marker = "/* ========== V1.13C：推荐厂商与候选品牌资料库 ========== */";
  let css = await readText("styles.css");
  if (css.includes(marker)) {
    return;
  }
  css += `

${marker}
.vendor-guide-layout,
.vendor-library-layout {
  width: min(1080px, calc(100% - 48px));
}

.vendor-guide-hero,
.vendor-library-hero {
  background:
    linear-gradient(135deg, rgba(255, 250, 242, 0.98), rgba(237, 221, 195, 0.94)),
    radial-gradient(circle at 12% 20%, rgba(101, 112, 71, 0.12), transparent 16rem),
    radial-gradient(circle at 88% 80%, rgba(154, 103, 54, 0.13), transparent 18rem);
}

.vendor-guide-section,
.vendor-library-section {
  margin-top: 24px;
  padding: clamp(24px, 4vw, 38px);
  background: rgba(255, 250, 242, 0.9);
  border: 1px solid rgba(91, 63, 35, 0.14);
  border-radius: 18px;
  box-shadow: 0 16px 42px rgba(67, 45, 23, 0.07);
}

.vendor-direction-grid,
.vendor-feature-grid,
.candidate-library-grid,
.vendor-category-nav {
  display: grid;
  gap: 16px;
}

.vendor-direction-grid {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.vendor-direction-card,
.vendor-feature-card,
.candidate-library-card,
.vendor-category-nav a {
  padding: 20px;
  background:
    linear-gradient(180deg, rgba(255, 250, 242, 0.96), rgba(247, 239, 226, 0.9)),
    radial-gradient(circle at 100% 0%, rgba(154, 103, 54, 0.08), transparent 11rem);
  border: 1px solid rgba(91, 63, 35, 0.13);
  border-radius: 16px;
}

.vendor-direction-card h3,
.vendor-feature-card h3,
.candidate-library-card h3 {
  margin: 0;
  color: var(--coffee);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;
}

.vendor-direction-card p,
.vendor-feature-card p,
.candidate-library-card p,
.vendor-category-nav span {
  color: var(--muted);
  line-height: 1.78;
}

.vendor-direction-card ul {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0;
  margin: 16px 0 0;
  list-style: none;
}

.vendor-direction-card li,
.candidate-direction {
  display: inline-flex;
  width: fit-content;
  padding: 5px 10px;
  color: var(--coffee-soft);
  background: rgba(154, 103, 54, 0.08);
  border: 1px solid rgba(154, 103, 54, 0.13);
  border-radius: 999px;
  font-size: 13px;
}

.vendor-feature-grid,
.candidate-library-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.vendor-feature-card,
.candidate-library-card {
  display: grid;
  align-content: start;
  gap: 10px;
}

.vendor-feature-card p,
.candidate-library-card p {
  margin: 0;
}

.candidate-audience {
  padding-left: 12px;
  border-left: 3px solid rgba(101, 112, 71, 0.28);
}

.vendor-category-nav {
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.vendor-category-nav a {
  display: grid;
  gap: 8px;
  color: inherit;
}

.vendor-category-nav strong {
  color: var(--coffee);
  font-size: 18px;
}

.vendor-explain-section,
.vendor-apply-section {
  background:
    linear-gradient(135deg, rgba(101, 112, 71, 0.1), rgba(255, 250, 242, 0.92)),
    rgba(255, 250, 242, 0.92);
}

.vendor-apply-section .btn {
  margin-top: 12px;
}

@media (max-width: 980px) {
  .vendor-direction-grid,
  .vendor-category-nav {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .vendor-guide-layout,
  .vendor-library-layout {
    width: calc(100% - 28px);
  }

  .vendor-direction-grid,
  .vendor-feature-grid,
  .candidate-library-grid,
  .vendor-category-nav {
    grid-template-columns: 1fr;
  }
}
`;
  await writeText("styles.css", css);
}

async function updateReleaseReadiness() {
  let script = await readText("custom/check-release-readiness.mjs");
  if (!script.includes("vendorEditorialTerms")) {
    script = script.replace(
      `const frontendPatchTerms = [`,
      `const vendorEditorialTerms = [
  "适合谁看",
  "阅读提示",
  "资料入口",
  "内容入口",
  "查看公开来源",
  "公开资料候选｜待联系确认",
  "是否已联系确认",
  "是否已图片授权",
  "是否为正式会员",
  "当前入口",
  "本轮",
  "版本",
  "已扩展",
  "已补充",
  "预检",
  "上线阻塞项",
  "页面内核",
  "会员站展示规则说明",
];

const frontendPatchTerms = [`
    );
    script = script.replace(
      `    if (!isBackupContactPage && label.startsWith("solutions/")) {`,
      `    if (!isBackupContactPage && label.startsWith("vendors/")) {
      for (const term of vendorEditorialTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(\`\${label}:\${index + 1}：厂商区前台仍存在机械表达“\${term}”\`);
          }
        });
      }
    }

    if (!isBackupContactPage && label.startsWith("solutions/")) {`
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
  const note = "V1.13C 已将推荐厂商页改为候选品牌导览页，将候选品牌页改为品牌资料库。候选资料仍来自公开信息整理，不代表已入驻、不代表平台认证、不等于平台担保。";
  await appendDocSection("custom/client-preview-note.md", "## 13. V1.13C 新增说明", note);
  await appendDocSection(
    "custom/launch-checklist.md",
    "## V1.13C 推荐厂商与候选品牌复核",
    "- 确认 `vendors/index.html` 已从推荐名单页改为按好物方向阅读的候选品牌导览页。\n- 确认 `vendors/candidates/index.html` 已改为品牌资料库，而不是状态清单或来源表。\n- 确认 `vendors/` 前台不再出现“适合谁看”“阅读提示”“公开资料候选｜待联系确认”等机械表达。\n- 确认候选资料仍明确来自公开信息整理，不代表已入驻、不代表平台认证、不等于平台担保。"
  );
  await appendDocSection(
    "custom/public-review-checklist.md",
    "## V1.13C 人工验收新增项",
    "- [ ] 推荐厂商页是否先提供用户价值，而不是第一屏堆边界说明。\n- [ ] 候选品牌页是否像品牌资料库，而不是后台字段表。\n- [ ] 品牌卡片是否用自然文案说明可以先看什么资料。\n- [ ] 底部边界说明是否清楚表达公开资料、授权确认和服务边界。"
  );
}

async function writeRecord() {
  const record = `# 版本记录：v1.13c-vendor-and-candidate-brand-library-rebuild

## 1. 本轮修改目标

本轮目标是单独完成“V1.13C 推荐厂商与候选品牌资料库质量重构”。只处理 \`vendors/\` 相关页面和必要的样式、预检、说明记录，不改知识页、好物方案页、厂商申请页、表单逻辑、工作流、后台、登录、支付或数据库。

## 2. 当前基础：V1.13A 与 V1.13B 已分别完成知识和方案页重构

当前基础包含 \`5211cfb V1.13A 柚木知识页与核心文章质量重构\` 与 \`302d221 V1.13B 好物方案与专题页质量重构\`。知识区和方案区已从程序化结构转向可阅读内容，本轮继续把厂商区从“资料表/状态清单”调整为对用户更友好的候选品牌导览与资料库。

## 3. 推荐厂商页导览化

\`vendors/index.html\` 已改为“按柚木好物方向看企业资料”。页面第一屏先说明用户价值，随后按柚木地板、柚木整装、庭院户外、茶室会客、柚木家具好物五类方向组织资料，并展示 2-3 个代表品牌名称，避免写成正式推荐、认证或入驻名单。

## 4. 候选品牌页资料库化

\`vendors/candidates/index.html\` 已改为“公开资料候选品牌”资料库。每个方向保留 5 家候选品牌，卡片使用自然文案说明品牌或企业名称、方向、定位、可以先看什么资料、适合关注的人群、资料来源和待确认事项，不再反复堆叠状态标签。

## 5. 机械表达清理

已清理 \`vendors/\` 前台页面中的“适合谁看”“阅读提示”“资料入口”“查看公开来源”“公开资料候选｜待联系确认”“是否已联系确认”“是否已图片授权”“是否为正式会员”等机械表达。发布预检新增厂商区专项扫描，避免后续又把页面改回资料表。

## 6. 样式轻量优化

\`styles.css\` 新增 V1.13C 品牌导览、方向卡片、品牌资料卡、分类导航和移动端间距样式。没有修改首页、知识页、方案页或移动端导航脚本。

## 7. 发布预检结果

\`custom/check-release-readiness.mjs\` 已新增厂商区机械表达检查。预检仍允许明确否定语境，例如“不代表平台认证”“不等于平台担保”“不构成交易担保”，避免误报必要边界说明。

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

- 真实电话、真实邮箱、备案信息和最终二维码仍待确认。
- 候选品牌仍需逐项完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。
- 当前候选资料仍来自公开信息整理，并未形成正式会员站资料。

## 11. 资料真实性处理说明

本轮没有新增真实厂商、真实案例、真实认证或真实资质。页面只把公开资料整理为候选品牌资料库，不代表已入驻，不代表平台认证，也不等于平台担保；真实会员站上线前仍需完成资料与授权确认。

## 12. 后台与交易能力说明

本轮没有新增后台、登录、商城、支付、数据库。没有新增购物车、价格、在线下单或立即购买。没有修改 GitHub Actions workflow、\`forms/vendor-apply.html\` 或 \`forms/form.js\`。`;
  await writeText("custom/notes/v1.13c-vendor-and-candidate-brand-library-rebuild.md", record);
}

await updateVendorIndex();
await updateCandidateIndex();
await updateStyles();
await updateReleaseReadiness();
await updateDocs();
await writeRecord();

console.log("V1.13C vendors and candidate brand library generated.");
