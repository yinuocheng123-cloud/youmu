import fs from "node:fs/promises";
import path from "node:path";

const file = path.join(process.cwd(), "cooperation", "index.html");
let html = await fs.readFile(file, "utf8");

const title = "生态合作｜提交柚木品牌、案例与内容资料｜柚喜饰界";
const description = "品牌、设计师和内容创作者可提交柚木产品、工艺、空间案例和经验资料；收录前会核对内容与授权。";
const main = `    <main class="content-main editorial-layout cooperation-page">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>生态合作</span></nav>
      <section class="page-hero cooperation-hero">
        <p class="eyebrow dark">Submit &amp; Collaborate</p>
        <h1>生态合作</h1>
        <p>品牌、设计师和内容创作者可以提交与柚木有关的资料。是否收录，取决于内容是否真实、清楚，并适合本站栏目。</p>
        <a class="btn btn-primary" href="#materials">查看可提交资料</a>
      </section>

      <section class="vendor-guide-section cooperation-section" id="materials">
        <div class="category-heading"><h2>可以提交什么</h2><p>请提供可公开或已获授权的文字、图片和来源说明。</p></div>
        <div class="vendor-direction-grid cooperation-audience-grid">
          <article class="vendor-direction-card">
            <h3>品牌与企业</h3>
            <p>品牌介绍、产品资料、工艺说明、柚木案例、空间图片和服务范围。</p>
          </article>
          <article class="vendor-direction-card">
            <h3>设计师</h3>
            <p>柚木空间、设计案例、材料应用经验和设计观察。</p>
          </article>
          <article class="vendor-direction-card">
            <h3>内容创作者与行业从业者</h3>
            <p>采访线索、专题建议、实践经验和可核实的行业资料。</p>
          </article>
        </div>
      </section>

      <section class="vendor-guide-section cooperation-section">
        <div class="category-heading"><h2>资料会怎么处理</h2><p>提交不等于刊登，我们会先核对来源、授权和内容完整度。</p></div>
        <div class="trust-grid cooperation-process-grid">
          <article><span>01</span><h3>核对</h3><p>确认资料来源、图片授权和必要的事实说明。</p></article>
          <article><span>02</span><h3>整理</h3><p>删去无法核实的信息，并按适合的栏目编辑内容。</p></article>
          <article><span>03</span><h3>收录</h3><p>合适的内容可能进入品牌资料、柚木知识、柚木生活、空间案例或专题。</p></article>
        </div>
      </section>

      <section class="vendor-guide-section cooperation-section cooperation-prep">
        <div class="category-heading"><h2>提交前请准备</h2></div>
        <div class="good-things-example-grid cooperation-content-grid">
          <span>资料名称</span><span>内容来源</span><span>图片授权</span><span>联系信息</span><span>服务范围</span><span>需要说明的边界</span>
        </div>
      </section>

      <section class="vendor-guide-section cooperation-section cooperation-final" id="cooperation-way">
        <div class="category-heading"><h2>提交或联系</h2><p>资料不完整时可以先联系柚喜，确认需要补充什么。</p></div>
        <div class="content-cta"><a class="btn btn-primary" href="../forms/vendor-apply.html">提交资料</a><a class="btn btn-secondary" href="../index.html#wechat">联系柚喜</a></div>
      </section>

      <section class="soft-notice vendor-boundary-note">
        <p>页面收录不代表认证、推荐、质量保证或交易担保；产品与服务仍以品牌正式资料、合同、交付和售后说明为准。</p>
      </section>
    </main>`;

const mainMatches = html.match(/<main\b[^>]*>[^]*?<\/main>/gi) ?? [];
if (mainMatches.length !== 1) throw new Error(`Expected one main element, found ${mainMatches.length}`);
html = html.replace(mainMatches[0], main);
html = html.replace(/<title>[^]*?<\/title>/, `<title>${title}</title>`);
html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`);
html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`);
html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`);
html = html.replace("用户、品牌、设计师和内容伙伴可通过本页联系柚喜。", "提交柚木品牌、案例与内容资料。 ");

await fs.writeFile(file, html, "utf8");
console.log("Rebuilt cooperation/index.html with concrete submission guidance.");
