/*
文件说明：该文件用于生成 V1.13D 厂商申请页正式化与全站前台表达收口内容。
功能说明：重写厂商申请页，轻量复核首页数据、关于页和公开页残留表达，并更新样式、预检、说明文档和版本记录。

结构概览：
  第一部分：导入依赖与通用工具
  第二部分：厂商申请页生成
  第三部分：全站轻量表达收口
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

function bulletCard(title, body) {
  return `<article class="apply-info-card"><h3>${title}</h3><p>${body}</p></article>`;
}

// ========== 第二部分：厂商申请页生成 ==========
async function updateVendorApplyPage() {
  const html = await readText("forms/vendor-apply.html");
  const applyTypes = [
    ["柚木地板品牌、工厂或服务商", "适合希望展示材质、规格、安装、维护和服务区域资料的企业。"],
    ["柚木整装和木作配套企业", "适合有地面、墙面、柜体、木作配套或空间材料资料的企业。"],
    ["户外柚木家具品牌或服务商", "适合能说明户外环境、结构、五金、耐候和维护边界的企业。"],
    ["茶室会客空间相关品牌", "适合围绕茶桌、柜体、地面、灯光、尺度和氛围做资料展示的品牌。"],
    ["柚木家具、工坊和好物品牌", "适合展示桌椅、柜体、边几、收纳、工艺和使用场景的企业或工坊。"],
  ];
  const prepareItems = [
    ["企业资料", "企业名称、所在地、主营方向、服务区域、联系人和可公开的基础介绍。"],
    ["产品资料和主营方向", "重点说明地板、整装、户外、茶室或家具好物中的具体方向，不要只写笼统介绍。"],
    ["图片授权", "确认哪些图片可以公开展示，哪些仍需补充授权，避免后续展示边界不清。"],
    ["案例材料", "如有案例材料，需要确认文字、图片、客户信息和可公开范围。没有案例也可以先说明当前资料状态。"],
    ["联系方式和服务边界", "说明谁负责沟通、覆盖哪些区域、能提供哪些服务，以及哪些内容需要另行确认。"],
  ];
  const main = `
<main class="content-main vendor-apply-layout">
  <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>申请建立好物分类会员站</span></nav>
  <section class="page-hero vendor-apply-hero">
    <p class="eyebrow dark">Vendor Member Site Apply</p>
    <h1>申请建立好物分类会员站</h1>
    <p>适合希望展示柚木地板、整装、户外、茶室或家具好物资料的品牌、企业和工坊。这里不承诺流量、排名或成交，只帮助企业先把可展示资料整理清楚。</p>
    <a class="btn btn-primary" href="#apply-form">填写申请信息</a>
  </section>
  <section class="vendor-apply-section">
    <div class="category-heading">
      <h2>哪些企业适合申请</h2>
      <p>申请前先看自己的资料更接近哪一类好物方向。方向越清楚，后续会员站展示页越容易讲明白。</p>
    </div>
    <div class="apply-info-grid">${applyTypes.map(([title, body]) => bulletCard(title, body)).join("")}</div>
  </section>
  <section class="vendor-apply-section">
    <div class="category-heading">
      <h2>申请前请准备这些资料</h2>
      <p>资料越完整，越适合建立清晰的会员站展示页。暂时不完整也可以先生成摘要，但后续仍要逐项确认。</p>
    </div>
    <div class="apply-prep-list">${prepareItems.map(([title, body]) => bulletCard(title, body)).join("")}</div>
  </section>
  <section class="vendor-apply-section apply-form-shell" id="apply-form">
    <div class="category-heading">
      <h2>填写申请信息</h2>
      <p>当前为静态申请页，只在浏览器中生成申请摘要，不会自动提交到后台。请保留摘要，后续通过社群交流添加柚喜顾问继续沟通。</p>
    </div>
    <form class="summary-form vendor-apply-form" data-summary-form="vendor">
      <fieldset class="apply-fieldset">
        <legend>企业与分类</legend>
        <div class="form-grid">
          <label class="form-field"><span>企业名称</span><input name="company" autocomplete="organization" placeholder="请填写企业、品牌或工坊名称" /></label>
          <label class="form-field"><span>所在地区</span><input name="region" autocomplete="address-level2" placeholder="例如：广东佛山、浙江杭州" /></label>
          <label class="form-field"><span>主营方向</span><select name="business"><option>柚木地板</option><option>柚木整装</option><option>户外柚木</option><option>茶室会客</option><option>柚木家具</option><option>柚木工坊</option><option>其他</option></select></label>
          <label class="form-field"><span>服务区域</span><input name="serviceArea" placeholder="例如：华东、华南、全国或指定城市" /></label>
        </div>
      </fieldset>
      <fieldset class="apply-fieldset">
        <legend>资料与授权</legend>
        <div class="form-grid">
          <label class="form-field"><span>图片授权情况</span><select name="imageAuth"><option>已有可公开图片授权</option><option>有图片但需确认授权</option><option>暂时没有图片材料</option></select></label>
          <label class="form-field"><span>案例材料情况</span><select name="caseMaterial"><option>已有案例材料</option><option>有案例但需补充授权</option><option>暂时没有案例材料</option></select></label>
          <label class="form-field"><span>联系人</span><input name="contactPerson" autocomplete="name" placeholder="请填写联系人姓名或称呼" /></label>
          <label class="form-field"><span>联系方式</span><input name="contact" autocomplete="tel" placeholder="手机号、微信号或其他联系方式" /></label>
          <label class="form-field form-field-wide"><span>企业资料简述</span><textarea name="intro" placeholder="请简单介绍主营内容、可展示产品资料、图片授权状态、服务区域和希望建立的会员站方向。"></textarea></label>
        </div>
      </fieldset>
      <fieldset class="apply-fieldset">
        <legend>生成申请摘要</legend>
        <p class="form-helper">生成摘要后，请复制内容，通过首页社群交流区添加柚喜顾问继续沟通。当前页面不会自动提交到后台，也不代表已经完成会员站上线。</p>
        <div class="form-actions">
          <button class="btn btn-primary" type="button" data-generate-summary>生成申请摘要</button>
          <button class="btn btn-secondary" type="button" data-copy-summary>复制摘要</button>
          <button class="btn btn-ghost form-reset-button" type="button" data-clear-form>清空重填</button>
        </div>
        <label class="form-summary"><span>申请摘要</span><textarea data-summary-output readonly placeholder="生成后，申请摘要会显示在这里。"></textarea></label>
        <p class="copy-status" data-copy-status aria-live="polite"></p>
      </fieldset>
    </form>
  </section>
  <section class="vendor-apply-section apply-next-section">
    <h2>生成摘要后怎么做</h2>
    <p>请复制申请摘要，通过首页社群交流区添加柚喜顾问继续沟通。后续会围绕企业资料、图片授权、联系方式、案例材料和服务边界继续确认。</p>
    <a class="btn btn-primary" href="../index.html#wechat">返回首页社群交流</a>
  </section>
  <section class="vendor-apply-section apply-boundary-section">
    <h2>边界说明</h2>
    <p>申请展示不代表正式入驻，不代表平台认证，也不构成平台担保。真实会员站上线前，仍需完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。</p>
  </section>
</main>`;
  const footer = `
<footer class="content-site-footer">
  <div class="content-footer-inner">
    <span>柚喜饰界 - 申请建立好物分类会员站</span>
    <span>静态申请页只生成摘要，真实展示仍需完成五项确认。</span>
  </div>
</footer>`;
  const next = replaceTitleAndDescription(
    replaceFooter(replaceMain(html, main), footer),
    "申请建立好物分类会员站 - 柚喜饰界",
    "适合希望展示柚木地板、整装、户外、茶室或家具好物资料的品牌、企业和工坊。"
  );
  await writeText("forms/vendor-apply.html", next);
}

// ========== 第三部分：全站轻量表达收口 ==========
async function updateAboutPage() {
  let html = await readText("about/index.html");
  html = html.replace(
    "站点服务的对象包括刚接触柚木的普通用户、正在考虑地板或整装方向的家庭用户、关注庭院和茶室空间的人，以及未来希望展示资料的品牌或企业。不同对象都需要先建立清晰边界：知识页用于理解材料，方案页用于整理空间，“推荐厂商”页当前已经调整为按好物分类展示会员站的入口，案例页目前仍只保留样板结构。</p>",
    "站点服务的对象包括刚接触柚木的普通用户、正在考虑地板或整装方向的家庭用户、关注庭院和茶室空间的人，以及未来希望展示资料的品牌或企业。不同对象都需要先建立清晰边界：知识页用于理解材料，方案页用于整理空间，“推荐厂商”页当前已经调整为公开候选品牌资料导览，案例页目前仍只保留样板结构。</p><p>柚喜饰界现阶段以柚木知识、好物资料、公开候选品牌资料和社群交流为主，后续会逐步完善真实会员站资料确认、图片授权和服务边界说明。</p>"
  );
  html = html.replaceAll("当前版本", "现阶段");
  await writeText("about/index.html", html);
}

async function cleanupPublicWording() {
  const files = [
    "articles/index.html",
    "articles/how-to-choose-teak-flooring.html",
    "articles/teak-outdoor-furniture-care.html",
    "articles/teak-vendor-selection.html",
    "articles/teak-vs-common-wood.html",
    "articles/teak-whole-decoration-guide.html",
    "articles/what-is-teak.html",
    "cases/index.html",
    "cases/courtyard-teak-sample.html",
    "cases/flooring-selection-sample.html",
    "cases/tea-room-teak-sample.html",
  ];
  for (const file of files) {
    let html = await readText(file);
    html = html.replaceAll("当前版本", "现阶段");
    await writeText(file, html);
  }

  let data = await readText("data/site-content.js");
  data = data
    .replaceAll("柚木好物资料入口", "柚木好物资料线索")
    .replaceAll("查看资料入口", "查看资料线索")
    .replaceAll("对应资料入口", "对应资料线索")
    .replaceAll("好物分类进入对应资料入口", "好物分类查看对应资料线索")
    .replaceAll("资料入口、样板案例结构和会员站入口", "资料线索、样板案例结构和会员站展示")
    .replaceAll("资料入口", "资料线索");
  await writeText("data/site-content.js", data);
}

// ========== 第四部分：样式、预检、文档与记录更新 ==========
async function updateStyles() {
  const marker = "/* ========== V1.13D：厂商申请页正式化 ========== */";
  let css = await readText("styles.css");
  if (css.includes(marker)) {
    return;
  }
  css += `

${marker}
.vendor-apply-layout {
  width: min(1040px, calc(100% - 48px));
}

.vendor-apply-hero {
  background:
    linear-gradient(135deg, rgba(255, 250, 242, 0.98), rgba(239, 224, 200, 0.94)),
    radial-gradient(circle at 14% 18%, rgba(101, 112, 71, 0.12), transparent 15rem),
    radial-gradient(circle at 90% 82%, rgba(154, 103, 54, 0.14), transparent 18rem);
}

.vendor-apply-section {
  margin-top: 24px;
  padding: clamp(24px, 4vw, 38px);
  background: rgba(255, 250, 242, 0.92);
  border: 1px solid rgba(91, 63, 35, 0.14);
  border-radius: 18px;
  box-shadow: 0 16px 42px rgba(67, 45, 23, 0.07);
}

.apply-info-grid,
.apply-prep-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.apply-prep-list {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.apply-info-card {
  padding: 18px;
  background:
    linear-gradient(180deg, rgba(255, 250, 242, 0.96), rgba(247, 239, 226, 0.92)),
    radial-gradient(circle at 100% 0%, rgba(154, 103, 54, 0.08), transparent 10rem);
  border: 1px solid rgba(91, 63, 35, 0.13);
  border-radius: 15px;
}

.apply-info-card h3,
.vendor-apply-section h2 {
  margin-top: 0;
  color: var(--coffee);
}

.apply-info-card p,
.vendor-apply-section p {
  color: var(--muted);
  line-height: 1.78;
}

.apply-form-shell {
  background:
    linear-gradient(135deg, rgba(255, 250, 242, 0.96), rgba(244, 235, 220, 0.94)),
    rgba(255, 250, 242, 0.92);
}

.vendor-apply-form {
  display: grid;
  gap: 18px;
}

.apply-fieldset {
  display: grid;
  gap: 16px;
  padding: clamp(18px, 3vw, 26px);
  border: 1px solid rgba(91, 63, 35, 0.14);
  border-radius: 16px;
  background: rgba(255, 250, 242, 0.76);
}

.apply-fieldset legend {
  padding: 0 8px;
  color: var(--coffee);
  font-size: 20px;
  font-weight: 700;
}

.vendor-apply-form .form-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.vendor-apply-form .form-field {
  display: grid;
  gap: 8px;
}

.vendor-apply-form input,
.vendor-apply-form select,
.vendor-apply-form textarea {
  width: 100%;
  min-height: 46px;
  border-radius: 12px;
}

.vendor-apply-form textarea {
  min-height: 132px;
}

.form-helper {
  margin: 0;
  padding: 12px 14px;
  background: rgba(101, 112, 71, 0.08);
  border: 1px solid rgba(101, 112, 71, 0.14);
  border-radius: 12px;
}

.form-summary textarea {
  min-height: 180px;
  background: rgba(255, 255, 255, 0.68);
}

.apply-next-section,
.apply-boundary-section {
  background:
    linear-gradient(135deg, rgba(101, 112, 71, 0.1), rgba(255, 250, 242, 0.92)),
    rgba(255, 250, 242, 0.92);
}

@media (max-width: 980px) {
  .apply-info-grid,
  .apply-prep-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .vendor-apply-layout {
    width: calc(100% - 28px);
  }

  .apply-info-grid,
  .apply-prep-list,
  .vendor-apply-form .form-grid {
    grid-template-columns: 1fr;
  }

  .apply-fieldset {
    padding: 18px;
  }

  .vendor-apply-form .form-actions {
    display: grid;
  }
}
`;
  await writeText("styles.css", css);
}

async function updateReleaseReadiness() {
  let script = await readText("custom/check-release-readiness.mjs");
  script = script
    .replace(`  "备案信息待补",\n];`, `  "备案信息待补",\n  "假电话",\n  "假邮箱",\n  "备案占位",\n];`)
    .replace(`  "权威推荐",\n];`, `  "权威推荐",\n  "平台担保",\n  "正式入驻",\n];`)
    .replace(`  "上线阻塞项",\n];`, `  "上线阻塞项",\n  "版本",\n  "预检",\n];`)
    .replace(
      `  "不构成交易担保",\n  "不代表平台认证",`,
      `  "不构成交易担保",\n  "不构成平台担保",\n  "不构成产品推荐、平台担保",\n  "不构成购买承诺或平台担保",\n  "不代表平台认证",\n  "不代表平台担保",`
    )
    .replace(
      `  "不代表已入驻",\n  "是否为正式会员：否",`,
      `  "不代表已入驻",\n  "不代表正式入驻",\n  "申请展示不代表正式入驻",\n  "会员展示不等于平台担保",\n  "推荐展示不等于平台担保",\n  "是否为正式会员：否",`
    );
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
  const note = "V1.13D 已完成厂商申请页正式化和全站前台表达收口。当前网站仍为静态内容预览站，不含后台、登录、商城、支付或自动提交系统。厂商申请页只生成申请摘要，正式会员站上线仍需五项确认。";
  await appendDocSection("custom/client-preview-note.md", "## 14. V1.13D 新增说明", note);
  await appendDocSection(
    "custom/launch-checklist.md",
    "## V1.13D 厂商申请页与前台表达复核",
    "- 确认 `forms/vendor-apply.html` 已改为正式的好物分类会员站申请页。\n- 确认申请页仍只生成申请摘要，不自动提交到后台。\n- 确认全站公开页面不再出现假电话、假邮箱、备案占位、普通咨询表单入口、立即购买或在线下单表达。\n- 确认会员站上线前仍需企业资料、图片授权、联系方式、案例材料和服务边界五项确认。"
  );
  await appendDocSection(
    "custom/public-review-checklist.md",
    "## V1.13D 人工验收新增项",
    "- [ ] 厂商申请页是否像正式申请页，而不是临时表单页。\n- [ ] 表单在桌面端和移动端是否有清晰分组与留白。\n- [ ] 生成摘要后的承接方式是否明确指向首页社群交流。\n- [ ] Footer、CTA 和公开页面是否没有高风险交易或占位表达。"
  );
}

async function writeRecord() {
  const record = `# 版本记录：v1.13d-vendor-apply-and-final-frontpage-polish

## 1. 本轮修改目标

本轮目标是完成“V1.13D 厂商申请页正式化与全站前台表达收口”。重点处理 \`forms/vendor-apply.html\`，并轻量复核首页数据、关于页、Footer、CTA 和公开页面残留表达。

## 2. 当前基础：V1.13A/B/C 已完成知识、方案和候选品牌重构

当前基础包含 \`5211cfb V1.13A\`、\`302d221 V1.13B\` 和 \`060b0dc V1.13C\`。知识页、方案页和候选品牌资料库已完成质量重构，本轮只做最终收口。

## 3. 厂商申请页正式化

\`forms/vendor-apply.html\` 已改为“申请建立好物分类会员站”。页面新增适合申请的企业类型、申请前资料准备清单、填写申请信息、生成摘要后怎么做和边界说明。

## 4. 表单视觉和摘要流程保留情况

本轮保留 \`forms/form.js\` 核心摘要生成逻辑，继续使用原有字段名与 \`data-summary-form="vendor"\` 钩子。页面只优化字段分组、两列布局、移动端间距、摘要输出区和按钮文案。

## 5. Footer 和 CTA 复核

普通用户承接继续指向首页社群交流区，厂商申请入口继续保留。公开页面中与假电话、假邮箱、备案占位、普通咨询表单、立即购买、在线下单相关的表达已纳入预检。

## 6. 首页和关于页轻量复核

首页数据中的“资料入口”口径已轻量调整为“资料线索”。关于页补充说明：柚喜饰界现阶段以柚木知识、好物资料、公开候选品牌资料和社群交流为主，后续逐步完善真实会员站资料确认、图片授权和服务边界说明。

## 7. 发布预检更新

\`custom/check-release-readiness.mjs\` 已补充假电话、假邮箱、备案占位、平台担保、正式入驻、版本和预检等前台表达检查，同时保留“不代表平台认证”“不构成平台担保”“不构成交易担保”“会员展示不等于平台担保”等否定语境豁免。

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
- 真实会员站上线仍需逐项完成企业资料确认、图片授权、联系方式确认、案例材料确认和服务边界确认。
- 当前申请页仍为静态摘要生成页，不是自动提交系统。

## 11. 资料真实性处理说明

本轮没有新增真实厂商、真实案例、真实认证或真实资质。申请展示不代表正式入驻，不代表平台认证，也不构成平台担保。

## 12. 后台与交易能力说明

本轮没有新增后台、登录、商城、支付、数据库。没有新增购物车、价格、在线下单或立即购买。没有修改 GitHub Actions workflow 或 \`forms/form.js\` 核心摘要逻辑。`;
  await writeText("custom/notes/v1.13d-vendor-apply-and-final-frontpage-polish.md", record);
}

await updateVendorApplyPage();
await updateAboutPage();
await cleanupPublicWording();
await updateStyles();
await updateReleaseReadiness();
await updateDocs();
await writeRecord();

console.log("V1.13D vendor apply page and final frontpage polish generated.");
