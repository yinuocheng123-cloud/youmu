import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { groups } from "./plan-v134-article-images.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseline = JSON.parse(fs.readFileSync(path.join(root, "custom/v134-article-image-semantic-audit.json"), "utf8"));

const existingAlt = {
  "existing-material-basics": "柚木板材、木纹与叶片的材料观察示意",
  "existing-material-comparison": "不同木材纹理与端面特征的比较示意",
  "existing-color-aging": "不同色调柚木表面用于观察颜色变化的示意",
  "existing-joinery": "柚木榫卯结构与表面工艺观察示意",
  "existing-floor-selection": "自然光下比较木地板样板的选材示意",
  "existing-outdoor-care": "雨后户外木质座椅与日常维护工具示意",
  "existing-small-objects": "柚木托盘、笔和小型木器的日常使用示意",
  "existing-whole-interior": "木质家具与自然光室内空间参考",
  "existing-outdoor-material": "户外木材在自然环境中的使用参考",
  "existing-surface-cleaning": "柚木表面的清洁与维护参考",
  "existing-storage": "木质柜体与收纳空间参考",
  "existing-seating": "木质座椅的结构与使用场景参考",
  "existing-tables": "木质桌具在室内空间中的使用参考",
  "existing-brand-showroom": "中性展厅与材料陈列环境示意",
  "existing-brand-craft": "中性木作工艺与样板环境示意",
  "existing-brand-workshop": "中性木作空间与材料环境示意",
  "existing-brand-workshop-illustration": "中性木作空间插画示意",
};

const dimensions = {
  "assets/images/hero-teak-lifestyle.jpg": [1800, 2700],
  "assets/images/knowledge-outdoor-wood.jpg": [1400, 2100],
  "assets/images/knowledge-teak-grain.jpg": [1400, 933],
  "assets/images/knowledge-teak-maintenance.jpg": [1400, 2100],
  "assets/images/product-teak-cabinet.jpg": [1400, 931],
  "assets/images/product-teak-chair.jpg": [1400, 1867],
  "assets/images/product-teak-table.jpg": [1400, 2487],
  "assets/images/vendor-craft-sample.jpg": [1400, 933],
  "assets/images/vendor-showroom-sample.jpg": [1400, 1400],
  "assets/images/vendor-workshop-sample.jpg": [1400, 2100],
};

function prefixFor(relative) {
  return "../".repeat(relative.split("/").length - 1);
}

function addBodyClass(html, className) {
  const body = html.match(/<body\b[^>]*>/i)?.[0] ?? "";
  if (new RegExp(`\\b${className}\\b`).test(body)) return html;
  if (/\bclass=["'][^"']*["']/.test(body)) {
    return html.replace(/<body\b([^>]*?)class=["']([^"']*)["']([^>]*)>/i, `<body$1class="$2 ${className}"$3>`);
  }
  return html.replace(/<body\b([^>]*)>/i, `<body class="${className}"$1>`);
}

function replaceCoverImage(html, relative, group) {
  const figurePattern = /<figure class=["'][^"']*article-cover[^"']*["'][^>]*>[\s\S]*?<\/figure>/i;
  const figure = html.match(figurePattern)?.[0];
  if (!figure) return { html, changed: false, hasCover: false };
  const src = `${prefixFor(relative)}${group.asset}`;
  const alt = group.alt ?? existingAlt[group.id];
  if (!alt) throw new Error(`${group.id}: missing alt text`);
  const [width, height] = dimensions[group.asset] ?? [1536, 1024];
  const image = `<img src="${src}" alt="${alt}" width="${width}" height="${height}" loading="lazy" decoding="async" />`;
  if (!/<img\b[^>]*>/i.test(figure)) throw new Error(`${relative}: article cover has no image`);
  const updated = figure.replace(/<img\b[^>]*>/i, image);
  return { html: html.replace(figurePattern, updated), changed: updated !== figure, hasCover: true };
}

const byPage = new Map();
for (const group of groups) for (const page of group.pages) byPage.set(page, group);

let coverUpdatedCount = 0;
let heroMappedCount = 0;
let unchangedImageCount = 0;
let changedFileCount = 0;
const changedPages = [];

for (const record of baseline.records) {
  const group = byPage.get(record.articlePath);
  if (!group) throw new Error(`${record.articlePath}: missing semantic group`);
  const absolute = path.join(root, record.articlePath);
  const before = fs.readFileSync(absolute, "utf8");
  let html = addBodyClass(before, `article-image-${group.id}`);
  const coverResult = replaceCoverImage(html, record.articlePath, group);
  html = coverResult.html;
  if (coverResult.hasCover) coverUpdatedCount += 1;
  else heroMappedCount += 1;
  if (record.currentMainImage === group.asset) unchangedImageCount += 1;
  if (html !== before) {
    fs.writeFileSync(absolute, html, "utf8");
    changedFileCount += 1;
    changedPages.push(record.articlePath);
  }
}

const cssPath = path.join(root, "styles.css");
let css = fs.readFileSync(cssPath, "utf8");
const marker = "/* v1.34 article image semantic pools */";
if (!css.includes(marker)) {
  const rules = groups.map((group) => `.article-image-${group.id} { --article-cover-image: url("./${group.asset}"); }`).join("\n");
  css += `\n\n${marker}\n${rules}\n\n.detail-lifestyle-object[class*="article-image-"] .goods-article-hero {\n  background-image: linear-gradient(90deg, rgba(36, 25, 17, 0.86) 0%, rgba(36, 25, 17, 0.62) 48%, rgba(36, 25, 17, 0.12) 76%), var(--article-cover-image);\n}\n\n.detail-lifestyle-archive[class*="article-image-"] .goods-article-hero {\n  background-image: linear-gradient(110deg, rgba(38, 27, 18, 0.94), rgba(38, 27, 18, 0.58) 58%, rgba(38, 27, 18, 0.24)), var(--article-cover-image);\n}\n\n.detail-aesthetic[class*="article-image-"] .case-hero,\n.detail-aesthetic-essay[class*="article-image-"] .content-hero-panel,\n.detail-aesthetic-solution[class*="article-image-"] .solution-topic-hero,\n.detail-lifestyle-outdoor[class*="article-image-"] .solution-topic-hero {\n  background-image: linear-gradient(180deg, rgba(27, 19, 13, 0.06), rgba(27, 19, 13, 0.82)), var(--article-cover-image);\n}\n\n.detail-brand[class*="article-image-"] .vendor-profile-hero {\n  background-image: linear-gradient(90deg, rgba(30, 22, 16, 0.9), rgba(30, 22, 16, 0.58)), var(--article-cover-image);\n}\n\n@media (max-width: 720px) {\n  .detail-lifestyle-object[class*="article-image-"] .goods-article-hero,\n  .detail-lifestyle-archive[class*="article-image-"] .goods-article-hero,\n  .detail-aesthetic[class*="article-image-"] .case-hero,\n  .detail-aesthetic-essay[class*="article-image-"] .content-hero-panel,\n  .detail-aesthetic-solution[class*="article-image-"] .solution-topic-hero,\n  .detail-lifestyle-outdoor[class*="article-image-"] .solution-topic-hero,\n  .detail-brand[class*="article-image-"] .vendor-profile-hero {\n    background-image: linear-gradient(180deg, rgba(38, 27, 18, 0.2), rgba(38, 27, 18, 0.88)), var(--article-cover-image);\n  }\n}\n`;
  fs.writeFileSync(cssPath, css, "utf8");
  changedFileCount += 1;
}

const articlesActuallyReplaced = baseline.records.filter((record) => byPage.get(record.articlePath)?.asset !== record.currentMainImage).length;
console.log(JSON.stringify({
  status: "PASS_V134_IMAGE_MIGRATION_COMPLETED",
  totalArticlePages: baseline.records.length,
  semanticGroupCount: groups.length,
  coverUpdatedCount,
  heroMappedCount,
  articlesActuallyReplaced,
  articlesKeptUnchanged: unchangedImageCount,
  changedFileCount,
  changedPages,
}, null, 2));
