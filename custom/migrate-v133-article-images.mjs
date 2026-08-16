import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const audit = JSON.parse(fs.readFileSync(path.join(root, "custom/v133-article-image-audit.json"), "utf8"));

const visualMeta = {
  "material-study": { alt: "柚木板材、木纹与叶片的材料观察示意", width: 1536, height: 1024 },
  "joinery-craft": { alt: "柚木榫卯结构与表面工艺观察示意", width: 1536, height: 1024 },
  flooring: { alt: "自然光下比较木地板样板的选材示意", width: 1536, height: 1024 },
  "small-objects": { alt: "柚木托盘、笔和小型木器的日常使用示意", width: 1536, height: 1024 },
  "outdoor-care": { alt: "雨后户外木质座椅与日常维护工具示意", width: 1536, height: 1024 },
  "aging-care": { alt: "不同色调木板用于观察颜色变化的示意", width: 1536, height: 1024 },
  "cabinet-woodwork": { alt: "柚木柜体与收纳空间参考", width: 1400, height: 931 },
  seating: { alt: "柚木座椅的结构与使用场景参考", width: 1400, height: 1867 },
  "table-space": { alt: "柚木桌具在室内空间中的使用参考", width: 1400, height: 2487 },
  "interior-space": { alt: "柚木家具与自然光室内空间参考", width: 1800, height: 2700 },
};

function prefixFor(relative) {
  const depth = relative.split("/").length - 1;
  return "../".repeat(depth);
}

function addBodyClass(html, className) {
  if (new RegExp(`\\b${className}\\b`).test(html.match(/<body\b[^>]*>/i)?.[0] ?? "")) return html;
  return html.replace(/<body\b([^>]*?)class=["']([^"']*)["']([^>]*)>/i, `<body$1class="$2 ${className}"$3>`);
}

function coverMarkup(record) {
  const meta = visualMeta[record.plannedTheme];
  const src = `${prefixFor(record.path)}${record.plannedAsset}`;
  const vendorContext = record.pageType === "D_BRAND_PROFILE";
  const caption = vendorContext
    ? "选择参考示意，不对应特定企业、产品或项目。"
    : "主题示意图，用于辅助理解材料与使用场景，不代表具体产品或项目。";
  return `<figure class="article-cover article-cover-${record.plannedTheme}">\n        <img src="${src}" alt="${meta.alt}" width="${meta.width}" height="${meta.height}" loading="lazy" decoding="async" />\n        <figcaption>${caption}</figcaption>\n      </figure>`;
}

function insertCover(html, record) {
  const cover = coverMarkup(record);
  if (html.includes("<figure class=\"article-cover")) return html;

  if (/<header class=["'][^"']*article-hero/.test(html)) {
    return html.replace(/(<header class=["'][^"']*article-hero[^"']*["'][^>]*>[\s\S]*?<\/header>)/i, `$1\n        ${cover}`);
  }

  return html.replace(/(<section class=["'][^"']*content-hero-panel[^"']*["'][^>]*>[\s\S]*?<\/section>)/i, `$1\n      ${cover}`);
}

let coverCount = 0;
let heroMappingCount = 0;
let brandContextCount = 0;

for (const record of audit.records) {
  const absolute = path.join(root, record.path);
  let html = fs.readFileSync(absolute, "utf8");
  const before = html;

  if (record.plannedAction === "ADD_ACCESSIBLE_ARTICLE_COVER") {
    html = insertCover(html, record);
    html = addBodyClass(html, `article-visual-${record.plannedTheme}`);
    if (html !== before) coverCount += 1;
  } else if (record.plannedAction === "REFINE_HERO_ASSET_BY_TOPIC") {
    html = addBodyClass(html, `article-visual-${record.plannedTheme}`);
    if (html !== before) heroMappingCount += 1;
  } else if (record.plannedAction === "KEEP_NEUTRAL_HERO_ADD_CONTEXT_LABEL") {
    if (!html.includes("article-image-context")) {
      html = html.replace(
        /(<section class=["'][^"']*vendor-profile-hero[^"']*["'][^>]*>[\s\S]*?)(<\/section>)/i,
        `$1<p class="article-image-context">主题示意图，不代表品牌实景或项目案例。</p>$2`,
      );
    }
    if (html !== before) brandContextCount += 1;
  }

  if (html === before && record.plannedAction !== "KEEP_EXISTING_VISUAL") {
    throw new Error(`${record.path}: expected migration did not change the file`);
  }
  if (html !== before) fs.writeFileSync(absolute, html);
}

const cssPath = path.join(root, "styles.css");
let css = fs.readFileSync(cssPath, "utf8");
const marker = "/* v1.33 article image coverage */";
if (!css.includes(marker)) {
  css += `\n\n${marker}\n.article-cover {\n  width: min(100%, 1080px);\n  margin: clamp(24px, 3vw, 40px) auto clamp(40px, 5vw, 64px);\n}\n\n.article-cover img {\n  display: block;\n  width: 100%;\n  height: auto;\n  aspect-ratio: 3 / 2;\n  object-fit: cover;\n  border: 1px solid rgba(75, 53, 36, 0.12);\n  border-radius: clamp(18px, 2vw, 28px);\n  box-shadow: 0 24px 64px rgba(49, 35, 24, 0.12);\n}\n\n.article-cover figcaption {\n  max-width: 760px;\n  margin: 12px auto 0;\n  color: var(--brand-muted);\n  font-size: 13px;\n  line-height: 1.7;\n  text-align: center;\n}\n\n.article-layout .article-cover {\n  width: auto;\n  margin-inline: clamp(20px, 5vw, 64px);\n}\n\n.article-image-context {\n  width: fit-content;\n  margin-top: 18px !important;\n  padding: 7px 11px;\n  color: rgba(255, 250, 242, 0.86) !important;\n  font-size: 12px !important;\n  line-height: 1.5 !important;\n  background: rgba(28, 20, 14, 0.44);\n  border: 1px solid rgba(255, 250, 242, 0.24);\n  border-radius: 999px;\n  backdrop-filter: blur(8px);\n}\n\n.article-visual-material-study { --article-cover-image: url("./assets/images/article-teak-material-study.jpg"); }\n.article-visual-joinery-craft { --article-cover-image: url("./assets/images/article-teak-joinery-craft.jpg"); }\n.article-visual-flooring { --article-cover-image: url("./assets/images/article-teak-flooring-selection.jpg"); }\n.article-visual-small-objects { --article-cover-image: url("./assets/images/article-teak-small-objects.jpg"); }\n.article-visual-outdoor-care { --article-cover-image: url("./assets/images/article-teak-outdoor-care.jpg"); }\n.article-visual-aging-care { --article-cover-image: url("./assets/images/article-teak-aging-tones.jpg"); }\n.article-visual-cabinet-woodwork { --article-cover-image: url("./assets/images/product-teak-cabinet.jpg"); }\n.article-visual-seating { --article-cover-image: url("./assets/images/product-teak-chair.jpg"); }\n.article-visual-table-space { --article-cover-image: url("./assets/images/product-teak-table.jpg"); }\n.article-visual-interior-space { --article-cover-image: url("./assets/images/hero-teak-lifestyle.jpg"); }\n\n.detail-lifestyle-object[class*="article-visual-"] .goods-article-hero {\n  background-image: linear-gradient(90deg, rgba(36, 25, 17, 0.86) 0%, rgba(36, 25, 17, 0.62) 48%, rgba(36, 25, 17, 0.12) 76%), var(--article-cover-image);\n}\n\n.detail-lifestyle-archive[class*="article-visual-"] .goods-article-hero {\n  background-image: linear-gradient(110deg, rgba(38, 27, 18, 0.94), rgba(38, 27, 18, 0.58) 58%, rgba(38, 27, 18, 0.24)), var(--article-cover-image);\n}\n\n@media (max-width: 720px) {\n  .article-cover,\n  .article-layout .article-cover {\n    width: auto;\n    margin: 18px 0 36px;\n  }\n\n  .article-cover img {\n    border-radius: 18px;\n  }\n\n  .article-cover figcaption {\n    padding-inline: 8px;\n    font-size: 12px;\n  }\n\n  .detail-lifestyle-object[class*="article-visual-"] .goods-article-hero,\n  .detail-lifestyle-archive[class*="article-visual-"] .goods-article-hero {\n    background-image: linear-gradient(180deg, rgba(38, 27, 18, 0.22), rgba(38, 27, 18, 0.88)), var(--article-cover-image);\n  }\n}\n`;
  fs.writeFileSync(cssPath, css);
}

console.log(JSON.stringify({ status: "PASS_MIGRATION_COMPLETED", coverCount, heroMappingCount, brandContextCount }, null, 2));
