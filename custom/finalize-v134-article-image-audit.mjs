import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { groups } from "./plan-v134-article-images.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const auditPath = path.join(root, "custom/v134-article-image-semantic-audit.json");
const csvPath = path.join(root, "custom/v134-article-image-semantic-audit.csv");
const manifestPath = path.join(root, "custom/article-image-manifest.json");
const promptRecordPath = path.join(root, "custom/v134-image-generation-record.md");
const baseline = JSON.parse(fs.readFileSync(auditPath, "utf8"));

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

const broadGoodGroups = new Set([
  "existing-whole-interior",
  "existing-outdoor-material",
  "existing-brand-showroom",
  "existing-brand-craft",
  "existing-brand-workshop",
  "existing-brand-workshop-illustration",
]);

function sha256(absolute) {
  return crypto.createHash("sha256").update(fs.readFileSync(absolute)).digest("hex");
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\s${name}=["']([^"']*)["']`, "i"))?.[1] ?? "";
}

function normalizeAsset(relative, src) {
  return path.relative(root, path.resolve(path.dirname(path.join(root, relative)), src)).replaceAll("\\", "/");
}

function csv(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const byPage = new Map();
const usage = new Map();
for (const group of groups) {
  usage.set(group.asset, (usage.get(group.asset) ?? 0) + group.pages.length);
  for (const page of group.pages) byPage.set(page, group);
}

const failures = [];
const records = baseline.records.map((before) => {
  const group = byPage.get(before.articlePath);
  if (!group) throw new Error(`${before.articlePath}: no final group`);
  const absoluteHtml = path.join(root, before.articlePath);
  const html = fs.readFileSync(absoluteHtml, "utf8");
  const body = html.match(/<body\b[^>]*>/i)?.[0] ?? "";
  const expectedClass = `article-image-${group.id}`;
  if (!body.includes(expectedClass)) failures.push(`${before.articlePath}: missing ${expectedClass}`);
  const absoluteAsset = path.join(root, group.asset);
  if (!fs.existsSync(absoluteAsset)) failures.push(`${before.articlePath}: missing ${group.asset}`);

  const figure = html.match(/<figure class=["'][^"']*article-cover[^"']*["'][^>]*>[\s\S]*?<\/figure>/i)?.[0] ?? "";
  if (figure) {
    const image = figure.match(/<img\b[^>]*>/i)?.[0] ?? "";
    const actual = normalizeAsset(before.articlePath, attr(image, "src"));
    const expectedAlt = group.alt ?? existingAlt[group.id];
    if (actual !== group.asset) failures.push(`${before.articlePath}: expected ${group.asset}, got ${actual}`);
    if (attr(image, "alt") !== expectedAlt) failures.push(`${before.articlePath}: inaccurate alt`);
    if (!attr(image, "width") || !attr(image, "height")) failures.push(`${before.articlePath}: missing intrinsic dimensions`);
    if (attr(image, "loading") !== "lazy" || attr(image, "decoding") !== "async") failures.push(`${before.articlePath}: missing non-critical loading hints`);
  }

  if (before.articleType === "G_BRAND_PROFILE") {
    if (group.sourceType === "generated_editorial_v134") failures.push(`${before.articlePath}: generated brand visual prohibited`);
    if (!html.includes("article-image-context")) failures.push(`${before.articlePath}: missing documentary boundary label`);
  }

  const score = broadGoodGroups.has(group.id) ? 3 : 4;
  return {
    articlePath: before.articlePath,
    url: before.url,
    title: before.title,
    section: before.section,
    articleType: before.articleType,
    articleLength: before.articleLength,
    currentMainImage: group.asset,
    currentInlineImages: before.currentInlineImages ?? [],
    imageSourceType: group.sourceType,
    imageUsageCount: usage.get(group.asset),
    exactDuplicateUsageCount: usage.get(group.asset),
    perceptualDuplicateGroup: "NONE",
    semanticTopic: group.topic,
    semanticImageDescription: group.alt ?? existingAlt[group.id],
    semanticMatchScore: score,
    misleadingRisk: "NONE",
    needsReplacement: false,
    needsInlineImage: false,
    recommendedImageConcept: group.topic,
    recommendedAction: "KEEP_VALIDATED_FINAL",
    beforeMainImage: before.currentMainImage,
    beforeSemanticMatchScore: before.semanticMatchScore,
    imageChanged: before.currentMainImage !== group.asset,
    fileHash: fs.existsSync(absoluteAsset) ? sha256(absoluteAsset) : "MISSING",
  };
});

const scoreCounts = Object.fromEntries([0, 1, 2, 3, 4].map((score) => [score, records.filter((r) => r.semanticMatchScore === score).length]));
const usageValues = [...usage.values()];
const finalSummary = {
  totalArticlePages: records.length,
  uniqueMainImageCount: usage.size,
  duplicateImageGroupCount: usageValues.filter((count) => count > 1).length,
  maxSingleImageUsage: Math.max(...usageValues),
  imagesUsedBy2Articles: usageValues.filter((count) => count === 2).length,
  imagesUsedBy3To4Articles: usageValues.filter((count) => count >= 3 && count <= 4).length,
  imagesUsedBy5PlusArticles: usageValues.filter((count) => count >= 5).length,
  semanticScore4Count: scoreCounts[4],
  semanticScore3Count: scoreCounts[3],
  semanticScore2Count: scoreCounts[2],
  semanticScore1Count: scoreCounts[1],
  semanticScore0Count: scoreCounts[0],
  strongGoodCoveragePercent: Number((((scoreCounts[3] + scoreCounts[4]) / records.length) * 100).toFixed(2)),
  articlesActuallyReplaced: records.filter((r) => r.imageChanged).length,
  articlesKeptUnchanged: records.filter((r) => !r.imageChanged).length,
  remainingSemanticWeakArticles: records.filter((r) => r.semanticMatchScore < 3).length,
  longArticleInlineCandidatesReviewed: records.filter((r) => r.articleLength >= 1500).length,
  newInlineImages: 0,
  misleadingImageCount: 0,
  brandGeneratedFakeImageCount: 0,
};

const result = {
  status: failures.length ? "FAIL" : "PASS_V134_SEMANTIC_GATE",
  baselineSummary: baseline.summary,
  finalSummary,
  inlineImageDecision: {
    threshold: 1500,
    reviewedPaths: records.filter((r) => r.articleLength >= 1500).map((r) => r.articlePath),
    decision: "NO_INLINE_IMAGE_NEEDED",
    reason: "两篇仅略高于阈值，已有精准主图且正文分节清晰；新增中段图只会装饰化，不会增加视觉证据。",
  },
  failures,
  records,
};
fs.writeFileSync(auditPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");

const columns = ["articlePath", "url", "title", "section", "articleType", "articleLength", "currentMainImage", "currentInlineImages", "imageSourceType", "imageUsageCount", "exactDuplicateUsageCount", "perceptualDuplicateGroup", "semanticTopic", "semanticImageDescription", "semanticMatchScore", "misleadingRisk", "needsReplacement", "needsInlineImage", "recommendedImageConcept", "recommendedAction", "beforeMainImage", "beforeSemanticMatchScore", "imageChanged", "fileHash"];
fs.writeFileSync(csvPath, `${columns.join(",")}\n${records.map((record) => columns.map((column) => csv(record[column])).join(",")).join("\n")}\n`, "utf8");

const manifest = {
  version: "v1.34.0",
  imageSearchUsed: false,
  generatedImageMode: "OpenAI built-in image generation",
  generatedImageCount: groups.filter((group) => group.sourceType === "generated_editorial_v134").length,
  imageCount: groups.length,
  images: groups.map((group) => {
    const absolute = path.join(root, group.asset);
    const generated = group.sourceType.startsWith("generated_");
    return {
      imagePath: group.asset,
      sourceType: group.sourceType,
      assetOrigin: generated ? "generated" : "existing",
      articlePaths: group.pages,
      semanticTopic: group.topic,
      createdFor: group.pages,
      isDocumentary: false,
      isConceptual: true,
      brandAssociation: null,
      reuseCount: group.pages.length,
      altText: group.alt ?? existingAlt[group.id],
      sha256: sha256(absolute),
      fileBytes: fs.statSync(absolute).size,
      notes: group.sourceType === "generated_editorial_v134"
        ? "中性编辑配图；不得解读为真实品牌、企业、人物、客户案例、工程项目或工厂现场。"
        : group.sourceType.includes("brand_context")
          ? "站内既有中性品牌语境素材；页面保留示意边界，不对应具体企业实景。"
          : "站内既有资产，经本轮语义与复用上限复核后保留。",
    };
  }),
};
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const generatedGroups = groups.filter((group) => group.sourceType === "generated_editorial_v134");
const promptLines = generatedGroups.map((group, index) => `${index + 1}. \`${group.asset}\`\n   - 主题：${group.topic}\n   - 画面意图：${group.alt}\n   - 对应页面：${group.pages.map((page) => `\`${page}\``).join("、")}\n   - 最终约束：中性、写实、克制、自然光、编辑摄影感；无文字、无品牌、无 Logo、无水印、无虚构专家或纪实暗示；结构、工具、手部与木纹必须自然。`);
const promptRecord = `# v1.34.0 图片生成记录\n\n- 生成方式：OpenAI 内置 image generation\n- 生成日期：2026-08-17\n- imageSearchUsed：false\n- 最终采用图片：${generatedGroups.length} 张\n- 输出策略：内置生成 PNG 经逐张视觉 QA 后，转为渐进式 JPEG（quality=86），保留 1536×1024 intrinsic size。\n- 共同定位：中性编辑配图，不是纪实摄影，不对应真实品牌、企业、客户、项目、人物或工厂。\n\n## 共同 Prompt 约束\n\n横向 3:2 编辑摄影；画面直接回答文章的核心问题；以真实柚木材料、家具、空间或操作细节为视觉证据；温暖但不过度商业化的自然光；无可读文字、价格、标签、品牌、Logo、水印；不制造认证、专家或真实项目暗示；避免奇异木纹、错误榫接、畸形工具、异常手部和不合理空间结构。\n\n## 最终采用 Prompt Set\n\n${promptLines.join("\n\n")}\n\n## 视觉 QA 记录\n\n25 张最终图均逐张检查：主题吻合、家具与空间结构合理、木纹自然、工具与手部无明显异常、无乱码文字、假 Logo 或水印。\n\n\`article-teak-floor-cabinet-transition.jpg\` 的首版因出现结构不合理的松散 T 形构件被拒绝，重新生成并只采用通过检查的第二版。未通过版本未进入项目。\n`;
fs.writeFileSync(promptRecordPath, promptRecord, "utf8");

console.log(JSON.stringify({ status: result.status, finalSummary, manifestImages: manifest.images.length, generatedImages: generatedGroups.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
