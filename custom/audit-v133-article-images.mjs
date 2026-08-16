import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const write = process.argv.includes("--write");

function collectHtml(directory) {
  return fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) return collectHtml(relative);
    return entry.name.endsWith(".html") ? [relative] : [];
  });
}

const contentPages = collectHtml("articles")
  .concat(collectHtml("cases"), collectHtml("knowledge"), collectHtml("solutions"), collectHtml("vendors"))
  .filter((relative) => {
    if (relative.endsWith("/index.html")) return false;
    if (relative === "vendors/candidates/index.html") return false;
    return true;
  })
  .sort();

function text(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
}

function classify(relative, bodyClass) {
  if (relative.startsWith("vendors/")) return "D_BRAND_PROFILE";
  if (relative.startsWith("cases/") || bodyClass.includes("detail-aesthetic")) return "B_AESTHETICS_SPACE";
  if (relative.startsWith("solutions/goods/") || relative === "solutions/outdoor.html") return "C_LIFESTYLE_USE";
  if (relative.startsWith("solutions/guides/") || /^knowledge\/teak-[^/]+\.html$/.test(relative)) return "E_FUNCTIONAL_EXPLAINER";
  return "A_KNOWLEDGE_ARTICLE";
}

function themeFor(relative, title) {
  const haystack = `${relative} ${title}`.toLowerCase();
  if (/outdoor|courtyard|patio|garden|pool|yacht|seaside|sunroom|balcony|户外|庭院|露台|泳池|游艇|海边|阳台/.test(haystack)) return "outdoor-care";
  if (/aging|color|clean|care|maintenance|cracking|warping|aged|养护|维护|清洁|开裂|变形|颜色|变色|年代/.test(haystack)) return "aging-care";
  if (/floor|地板|地面/.test(haystack)) return "flooring";
  if (/joinery|craft|drying|surface|factory|vendor|榫|工艺|干燥|表面|工厂|商家/.test(haystack)) return "joinery-craft";
  if (/tray|pen|phone|incense|speaker|carving|托盘|笔|手机|香|音箱|雕刻|器物/.test(haystack)) return "small-objects";
  if (/cabinet|bookcase|wall-panel|door|window|柜|书架|墙板|木门|窗/.test(haystack)) return "cabinet-woodwork";
  if (/chair|bench|座椅|椅|长凳/.test(haystack)) return "seating";
  if (/table|tea-room|茶桌|餐桌|茶室|会客/.test(haystack)) return "table-space";
  if (/home|living-room|bedroom|study-room|whole-decoration|villa|家具|空间|家居|客厅|卧室|书房|整装|全屋/.test(haystack)) return "interior-space";
  return "material-study";
}

const assetMap = {
  "material-study": "assets/images/article-teak-material-study.jpg",
  "joinery-craft": "assets/images/article-teak-joinery-craft.jpg",
  flooring: "assets/images/article-teak-flooring-selection.jpg",
  "small-objects": "assets/images/article-teak-small-objects.jpg",
  "outdoor-care": "assets/images/article-teak-outdoor-care.jpg",
  "aging-care": "assets/images/article-teak-aging-tones.jpg",
  "cabinet-woodwork": "assets/images/product-teak-cabinet.jpg",
  seating: "assets/images/product-teak-chair.jpg",
  "table-space": "assets/images/product-teak-table.jpg",
  "interior-space": "assets/images/hero-teak-lifestyle.jpg",
};

const records = contentPages.map((relative) => {
  const html = fs.readFileSync(path.join(root, relative), "utf8");
  const bodyClass = html.match(/<body\b[^>]*class=["']([^"']*)["']/i)?.[1] ?? "";
  const title = text(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]);
  const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const contentImages = imageTags
    .map((tag) => ({ tag, src: attr(tag, "src") }))
    .filter(({ src }) => src && !/(?:logo|favicon|qr|brand-mark)/i.test(src));
  const hasHeroBackground = /\bdetail-(?:aesthetic|lifestyle|brand)(?:\s|$)/.test(bodyClass);
  const noImage = contentImages.length === 0 && !hasHeroBackground;
  const weakReason = relative.startsWith("solutions/goods/")
    ? "GENERIC_SHARED_HERO_NEEDS_TOPIC_MAPPING"
    : relative.startsWith("vendors/")
      ? "GENERIC_BRAND_CONTEXT_NEEDS_EXPLICIT_DISCLAIMER"
      : "NONE";
  const theme = themeFor(relative, title);
  const plannedAsset = assetMap[theme];
  const newlyAddedAsset = plannedAsset.includes("article-teak-");

  return {
    path: relative,
    title,
    pageType: classify(relative, bodyClass),
    heroImage: hasHeroBackground ? "CSS_BACKGROUND_PRESENT" : "NONE",
    firstInlineImage: contentImages[0]?.src ?? "NONE",
    contentImageCount: contentImages.length,
    imageCoverageBefore: noImage ? "NO_CONTENT_IMAGE" : weakReason === "NONE" ? "MAIN_VISUAL_PRESENT" : "WEAK_OR_GENERIC",
    weakReason,
    needsMainImage: noImage,
    needsInlineImage: false,
    plannedTheme: theme,
    plannedAsset,
    sourceStrategy: newlyAddedAsset ? "NEW_NEUTRAL_EDITORIAL_ASSET" : "REUSE_VERIFIED_EXISTING_ASSET",
    plannedAction: noImage
      ? "ADD_ACCESSIBLE_ARTICLE_COVER"
      : weakReason === "GENERIC_SHARED_HERO_NEEDS_TOPIC_MAPPING"
        ? "REFINE_HERO_ASSET_BY_TOPIC"
        : weakReason === "GENERIC_BRAND_CONTEXT_NEEDS_EXPLICIT_DISCLAIMER"
          ? "KEEP_NEUTRAL_HERO_ADD_CONTEXT_LABEL"
          : "KEEP_EXISTING_VISUAL",
  };
});

const summary = {
  totalContentPages: records.length,
  pagesWithNoImage: records.filter((record) => record.imageCoverageBefore === "NO_CONTENT_IMAGE").length,
  pagesWithWeakImage: records.filter((record) => record.imageCoverageBefore === "WEAK_OR_GENERIC").length,
  pagesNeedingMainImage: records.filter((record) => record.needsMainImage).length,
  pagesNeedingInlineImage: records.filter((record) => record.needsInlineImage).length,
  reusableExistingImagePageCount: records.filter((record) => record.sourceStrategy === "REUSE_VERIFIED_EXISTING_ASSET").length,
  newImageAssetPageCount: records.filter((record) => record.sourceStrategy === "NEW_NEUTRAL_EDITORIAL_ASSET").length,
  uniquePlannedAssets: new Set(records.map((record) => record.plannedAsset)).size,
  newlyAddedAssets: new Set(records.filter((record) => record.sourceStrategy === "NEW_NEUTRAL_EDITORIAL_ASSET").map((record) => record.plannedAsset)).size,
  byPageType: Object.fromEntries(
    [...new Set(records.map((record) => record.pageType))].sort().map((type) => [type, records.filter((record) => record.pageType === type).length]),
  ),
};

if (write) {
  fs.writeFileSync(path.join(root, "custom/v133-article-image-audit.json"), `${JSON.stringify({ summary, records }, null, 2)}\n`);
  const columns = Object.keys(records[0]);
  const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = [columns.map(quote).join(","), ...records.map((record) => columns.map((column) => quote(record[column])).join(","))].join("\n");
  fs.writeFileSync(path.join(root, "custom/v133-article-image-audit.csv"), `${csv}\n`);
}

console.log(JSON.stringify({ status: "PASS_AUDIT_COMPLETED", ...summary, written: write }, null, 2));
