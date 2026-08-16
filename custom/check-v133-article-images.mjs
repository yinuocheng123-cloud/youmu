import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const audit = JSON.parse(fs.readFileSync(path.join(root, "custom/v133-article-image-audit.json"), "utf8"));
const failures = [];
const usedAssets = new Set();
let coverCount = 0;
let heroMappingCount = 0;
let brandContextCount = 0;
let missingAltCount = 0;
let missingDimensionsCount = 0;
let missingLazyCount = 0;

function attr(tag, name) {
  return tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
}

function resolveAsset(relative, src) {
  return path.resolve(path.dirname(path.join(root, relative)), src);
}

for (const record of audit.records) {
  const html = fs.readFileSync(path.join(root, record.path), "utf8");
  const body = html.match(/<body\b[^>]*>/i)?.[0] ?? "";
  const figures = html.match(/<figure class=["'][^"']*article-cover[^"']*["'][^>]*>[\s\S]*?<\/figure>/gi) ?? [];

  if (record.plannedAction === "ADD_ACCESSIBLE_ARTICLE_COVER") {
    if (figures.length !== 1) failures.push(`${record.path}: expected exactly one article cover, found ${figures.length}`);
    if (!body.includes(`article-visual-${record.plannedTheme}`)) failures.push(`${record.path}: missing theme class`);
  }

  if (record.plannedAction === "REFINE_HERO_ASSET_BY_TOPIC") {
    if (!body.includes(`article-visual-${record.plannedTheme}`)) failures.push(`${record.path}: missing mapped hero theme class`);
    else heroMappingCount += 1;
  }

  if (record.plannedAction === "KEEP_NEUTRAL_HERO_ADD_CONTEXT_LABEL") {
    if (!html.includes("article-image-context")) failures.push(`${record.path}: missing generic-image context label`);
    else brandContextCount += 1;
  }

  for (const figure of figures) {
    coverCount += 1;
    const imageTag = figure.match(/<img\b[^>]*>/i)?.[0] ?? "";
    const src = attr(imageTag, "src");
    const alt = attr(imageTag, "alt");
    if (!src || !fs.existsSync(resolveAsset(record.path, src))) failures.push(`${record.path}: cover image is missing: ${src || "EMPTY"}`);
    else usedAssets.add(path.relative(root, resolveAsset(record.path, src)).replaceAll("\\", "/"));
    if (!alt) missingAltCount += 1;
    if (!attr(imageTag, "width") || !attr(imageTag, "height")) missingDimensionsCount += 1;
    if (attr(imageTag, "loading") !== "lazy") missingLazyCount += 1;
    if (!figure.includes("<figcaption>")) failures.push(`${record.path}: cover is missing editorial context caption`);
  }
}

const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
for (const required of [
  "/* v1.33 article image coverage */",
  ".article-cover img",
  ".article-image-context",
  ".detail-lifestyle-object[class*=\"article-visual-\"] .goods-article-hero",
  "@media (max-width: 720px)",
]) {
  if (!css.includes(required)) failures.push(`styles.css: missing ${required}`);
}

if (coverCount !== audit.summary.pagesNeedingMainImage) failures.push(`cover count expected ${audit.summary.pagesNeedingMainImage}, found ${coverCount}`);
if (missingAltCount) failures.push(`cover images missing alt: ${missingAltCount}`);
if (missingDimensionsCount) failures.push(`cover images missing dimensions: ${missingDimensionsCount}`);
if (missingLazyCount) failures.push(`cover images missing lazy loading: ${missingLazyCount}`);

const summary = {
  status: failures.length ? "FAIL" : "PASS",
  totalContentPages: audit.summary.totalContentPages,
  articleImageMissingBefore: audit.summary.pagesWithNoImage,
  articleImageWeakBefore: audit.summary.pagesWithWeakImage,
  articleImageMissingAfter: Math.max(0, audit.summary.pagesWithNoImage - coverCount),
  newMainImages: coverCount,
  newInlineImages: 0,
  heroMappingsRefined: heroMappingCount,
  brandContextLabelsAdded: brandContextCount,
  reusedExistingImages: [...usedAssets].filter((asset) => !asset.includes("article-teak-")).length,
  newlyAddedImages: [...usedAssets].filter((asset) => asset.includes("article-teak-")).length,
  uniqueCoverAssetsUsed: usedAssets.size,
  missingAltCount,
  missingDimensionsCount,
  missingLazyCount,
  remainingContentImageGaps: failures.length ? failures.length : 0,
  failures,
};

console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
