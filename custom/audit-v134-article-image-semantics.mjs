import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const write = process.argv.includes("--write");
const baseline = JSON.parse(fs.readFileSync(path.join(root, "custom/v133-article-image-audit.json"), "utf8"));

const visualAssets = {
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

function cleanText(value = "") {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
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

function rootAsset(relative, src) {
  if (!src || /^(?:https?:|data:)/i.test(src)) return src;
  return path.posix.normalize(path.posix.join(path.posix.dirname(relative), src)).replace(/^\.\//, "");
}

function cssBackgroundAsset(relative, bodyClass) {
  const visual = bodyClass.match(/(?:^|\s)article-visual-([^\s]+)/)?.[1];
  if (visual && visualAssets[visual]) return visualAssets[visual];
  if (bodyClass.includes("detail-brand")) return "assets/images/vendor-workshop-sample.jpg";
  if (bodyClass.includes("detail-aesthetic-courtyard")) return "assets/images/knowledge-outdoor-wood.jpg";
  if (bodyClass.includes("detail-aesthetic-flooring")) return "assets/images/vendor-showroom-sample.jpg";
  if (bodyClass.includes("detail-aesthetic-furniture") || bodyClass.includes("detail-aesthetic-tea-room")) return "assets/images/product-teak-table.jpg";
  if (bodyClass.includes("detail-aesthetic-tea") || bodyClass.includes("detail-aesthetic-essay")) return "assets/images/hero-teak-lifestyle.jpg";
  if (bodyClass.includes("detail-aesthetic-solution")) return "assets/images/vendor-craft-sample.jpg";
  if (bodyClass.includes("detail-lifestyle-outdoor")) return "assets/images/knowledge-outdoor-wood.jpg";
  if (bodyClass.includes("detail-lifestyle-object")) return "assets/images/product-teak-table.jpg";
  if (bodyClass.includes("detail-lifestyle-archive")) return "assets/images/knowledge-teak-grain.jpg";
  return "UNKNOWN_CSS_BACKGROUND";
}

function articleType(relative, title) {
  const value = `${relative} ${title}`.toLowerCase();
  if (relative.startsWith("vendors/")) return "G_BRAND_INFORMATION";
  if (relative.startsWith("cases/")) return "H_CASE_SCENE_REFERENCE";
  if (/space|room|aesthetic|庭院|茶室|空间|美学|居住|室内|风格/.test(value)) return "F_SPACE_AESTHETICS";
  if (/clean|care|maintenance|aging|crack|warp|scratch|oil|清洁|养护|维护|变色|开裂|变形|划痕|上油|长期/.test(value)) return "D_USE_AND_CARE";
  if (/buy|choose|select|price|quality|grade|fake|true|judge|vendor|怎么买|怎么选|选购|价格|品质|等级|真假|判断|商家|品牌还是/.test(value)) return "C_SELECTION_JUDGMENT";
  if (/dry|craft|join|surface|finish|process|烘干|工艺|榫|拼板|表面|加工|涂装/.test(value)) return "B_CRAFT";
  if (/chair|bench|table|cabinet|floor|tray|pen|phone|incense|speaker|carving|furniture|座椅|椅|凳|桌|柜|地板|托盘|笔|手机|香|音箱|雕刻|家具|木作|器物/.test(value)) return "E_FURNITURE_OBJECTS";
  if (/teak|wood|grain|origin|color|stability|柚木|木材|纹理|产地|油性|稳定性|颜色/.test(value)) return "A_MATERIAL_KNOWLEDGE";
  return "I_OTHER_EXPLANATORY";
}

function semanticTopic(relative, title) {
  const value = `${relative} ${title}`.toLowerCase();
  const rules = [
    ["brand-real-assets", /vendors\//],
    ["color-aging", /aging|color|变色|颜色|色差|灰化|年代/],
    ["maintenance-cleaning", /clean|care|maintenance|oil|scratch|清洁|养护|维护|上油|划痕|污渍/],
    ["material-stability", /crack|warp|stable|开裂|变形|稳定|含水/],
    ["craft-drying", /dry|烘干|干燥/],
    ["craft-joinery", /join|tenon|榫|结构|拼板/],
    ["craft-finishing", /surface|finish|coating|表面|涂装|打磨|油漆/],
    ["selection-price", /price|贵|价格|预算|成本/],
    ["selection-authenticity", /fake|true|真假|是不是柚木|鉴别/],
    ["selection-comparison", /choose|select|quality|grade|buy|judge|怎么选|选购|品质|等级|判断|避坑|比较|区别|差异|确认什么/],
    ["flooring", /floor|地板|地面/],
    ["outdoor", /outdoor|courtyard|patio|garden|pool|yacht|seaside|户外|庭院|露台|泳池|游艇|海边|阳台/],
    ["objects", /tray|pen|phone|incense|speaker|carving|托盘|笔|手机|香|音箱|雕刻|器物/],
    ["furniture-seating", /chair|bench|seat|椅|凳|座椅/],
    ["furniture-table", /table|tea-table|desk|桌|茶台|茶桌|餐桌|书桌/],
    ["furniture-storage", /cabinet|bookcase|storage|sideboard|柜|书架|收纳/],
    ["interior-space", /space|room|home|interior|villa|空间|茶室|客厅|卧室|书房|整装|全屋|室内|居住/],
    ["material-origin", /origin|产地|缅甸|东南亚|来源/],
    ["material-texture", /grain|texture|纹理|触感|木纹/],
    ["material-properties", /oil|weather|durable|油性|耐久|耐候|特性|特点|优点/],
    ["material-basics", /what-is|basics|入门|是什么|基本|柚木知识|常见问题|faq/],
  ];
  return rules.find(([, pattern]) => pattern.test(value))?.[0] ?? "material-basics";
}

function imageDescription(asset) {
  const descriptions = {
    "assets/images/article-teak-material-study.jpg": "窗边材料桌上的柚木板材、端面与叶片",
    "assets/images/article-teak-joinery-craft.jpg": "木作台上的柚木榫卯、直角尺、软布与木屑",
    "assets/images/article-teak-flooring-selection.jpg": "自然光下平铺比较的三块木地板样板",
    "assets/images/article-teak-small-objects.jpg": "亚麻桌面上的木托盘、木笔、支架与浅木碗",
    "assets/images/article-teak-outdoor-care.jpg": "雨后露台上的木质长椅、边桌与维护工具",
    "assets/images/article-teak-aging-tones.jpg": "从蜂蜜色到灰褐色的四块木板与软布",
    "assets/images/hero-teak-lifestyle.jpg": "自然光室内的柚木家具生活场景",
    "assets/images/knowledge-outdoor-wood.jpg": "户外木质家具与自然环境",
    "assets/images/knowledge-teak-grain.jpg": "柚木表面木纹近景",
    "assets/images/knowledge-teak-maintenance.jpg": "柚木表面维护动作",
    "assets/images/product-teak-cabinet.jpg": "木质柜体产品与收纳场景",
    "assets/images/product-teak-chair.jpg": "木质座椅产品",
    "assets/images/product-teak-table.jpg": "木质桌具与空间",
    "assets/images/vendor-craft-sample.jpg": "中性木作工艺场景",
    "assets/images/vendor-showroom-sample.jpg": "中性木作陈列空间",
    "assets/images/vendor-workshop-sample.jpg": "中性木作工坊场景",
  };
  return descriptions[asset] ?? "当前页面背景图";
}

const provisionalScore = (topic, asset, type) => {
  if (type === "G_BRAND_INFORMATION") return 3;
  if (type === "H_CASE_SCENE_REFERENCE") return 3;
  const expected = {
    "material-basics": ["material-study", "knowledge-teak-grain"],
    "material-origin": ["material-study"],
    "material-texture": ["material-study", "knowledge-teak-grain"],
    "material-properties": ["material-study", "knowledge-teak-grain"],
    "material-stability": ["aging-tones", "material-study"],
    "color-aging": ["aging-tones"],
    "craft-drying": ["joinery-craft", "vendor-craft-sample"],
    "craft-joinery": ["joinery-craft", "vendor-craft-sample"],
    "craft-finishing": ["joinery-craft", "knowledge-teak-maintenance"],
    "selection-price": ["flooring-selection", "material-study"],
    "selection-authenticity": ["material-study"],
    "selection-comparison": ["material-study", "flooring-selection"],
    flooring: ["flooring-selection", "vendor-showroom-sample"],
    "maintenance-cleaning": ["aging-tones", "knowledge-teak-maintenance", "outdoor-care"],
    outdoor: ["outdoor-care", "knowledge-outdoor-wood"],
    objects: ["small-objects"],
    "furniture-seating": ["product-teak-chair"],
    "furniture-table": ["product-teak-table"],
    "furniture-storage": ["product-teak-cabinet"],
    "interior-space": ["hero-teak-lifestyle", "product-teak-table", "vendor-showroom-sample"],
  }[topic] ?? [];
  const stem = path.basename(asset, path.extname(asset)).replace(/^article-teak-/, "");
  if (expected.includes(stem)) return 3;
  if (topic.startsWith("material-") && /material-study|knowledge-teak-grain/.test(stem)) return 2;
  if (topic.startsWith("craft-") && /joinery-craft|vendor-craft/.test(stem)) return 2;
  if (topic.startsWith("furniture-") && /product-teak|hero-teak/.test(stem)) return 2;
  return 2;
};

const records = baseline.records.map((source) => {
  const absolute = path.join(root, source.path);
  const html = fs.readFileSync(absolute, "utf8");
  const bodyClass = html.match(/<body\b[^>]*class=["']([^"']*)["']/i)?.[1] ?? "";
  const title = cleanText(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? source.title);
  const articleText = cleanText(html.match(/<(?:main|article)\b[\s\S]*?<\/(?:main|article)>/i)?.[0] ?? html);
  const coverTag = html.match(/<figure\b[^>]*class=["'][^"']*article-cover[^"']*["'][^>]*>[\s\S]*?<img\b[^>]*>/i)?.[0] ?? "";
  const currentMainImage = coverTag ? rootAsset(source.path, attr(coverTag, "src")) : cssBackgroundAsset(source.path, bodyClass);
  const imageTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const contentImages = imageTags
    .map((tag) => ({ src: rootAsset(source.path, attr(tag, "src")), alt: attr(tag, "alt"), tag }))
    .filter(({ src }) => src && !/(?:logo|favicon|qr|brand-mark)/i.test(src));
  const currentInlineImages = contentImages.filter(({ src }) => src !== currentMainImage).map(({ src }) => src);
  const type = articleType(source.path, title);
  const topic = semanticTopic(source.path, title);
  const absoluteAsset = currentMainImage.startsWith("assets/") ? path.join(root, currentMainImage) : null;
  const fileHash = absoluteAsset && fs.existsSync(absoluteAsset)
    ? crypto.createHash("sha256").update(fs.readFileSync(absoluteAsset)).digest("hex")
    : "UNKNOWN";
  return {
    articlePath: source.path,
    url: `https://www.zhengmu.cn/${source.path}`,
    title,
    section: source.path.split("/")[0],
    articleType: type,
    articleLength: articleText.length,
    currentMainImage,
    currentInlineImages,
    currentMainImageAlt: coverTag ? attr(coverTag, "alt") : "CSS_BACKGROUND_NO_ALT",
    imageSourceType: currentMainImage.includes("article-teak-") ? "generated_editorial" : type.startsWith("G_") ? "existing_neutral_brand_context" : "existing_site_asset",
    fileHash,
    semanticTopic: topic,
    semanticImageDescription: imageDescription(currentMainImage),
    semanticMatchScore: provisionalScore(topic, currentMainImage, type),
    misleadingRisk: type === "G_BRAND_INFORMATION" ? "CONTROLLED_BY_EXISTING_CONTEXT_LABEL" : "LOW",
    needsReplacement: false,
    needsInlineImage: articleText.length >= 1400 && currentInlineImages.length === 0,
    recommendedImageConcept: topic,
    recommendedAction: "PENDING_SEMANTIC_REVIEW",
  };
});

const usageByHash = new Map();
for (const record of records) {
  const group = usageByHash.get(record.fileHash) ?? [];
  group.push(record.articlePath);
  usageByHash.set(record.fileHash, group);
}
for (const record of records) {
  const usage = usageByHash.get(record.fileHash) ?? [];
  record.imageUsageCount = records.filter((item) => item.currentMainImage === record.currentMainImage).length;
  record.exactDuplicateUsageCount = usage.length;
  record.perceptualDuplicateGroup = "PENDING_PHASH_SCAN";
}

const usageCounts = [...usageByHash.values()].map((items) => items.length);
const scoreCounts = Object.fromEntries([0, 1, 2, 3, 4].map((score) => [score, records.filter((record) => record.semanticMatchScore === score).length]));
const summary = {
  totalArticlePages: records.length,
  uniqueMainImageCount: usageByHash.size,
  duplicateImageGroupCount: usageCounts.filter((count) => count > 1).length,
  maxSingleImageUsage: Math.max(...usageCounts),
  imagesUsedBy2Articles: usageCounts.filter((count) => count === 2).length,
  imagesUsedBy3To4Articles: usageCounts.filter((count) => count >= 3 && count <= 4).length,
  imagesUsedBy5PlusArticles: usageCounts.filter((count) => count >= 5).length,
  semanticScore4Count: scoreCounts[4],
  semanticScore3Count: scoreCounts[3],
  semanticScore2Count: scoreCounts[2],
  semanticScore1Count: scoreCounts[1],
  semanticScore0Count: scoreCounts[0],
  longArticleInlineCandidates: records.filter((record) => record.needsInlineImage).length,
};

if (write) {
  fs.writeFileSync(path.join(root, "custom/v134-article-image-semantic-audit.json"), `${JSON.stringify({ summary, records }, null, 2)}\n`);
  const columns = Object.keys(records[0]);
  const quote = (value) => `"${(Array.isArray(value) ? value.join(" | ") : String(value)).replaceAll('"', '""')}"`;
  const csv = [columns.map(quote).join(","), ...records.map((record) => columns.map((column) => quote(record[column])).join(","))].join("\n");
  fs.writeFileSync(path.join(root, "custom/v134-article-image-semantic-audit.csv"), `${csv}\n`);
}

console.log(JSON.stringify({ status: "PASS_V134_BASELINE_MAPPING", ...summary, written: write }, null, 2));
for (const record of records) {
  console.log([record.articlePath, record.title, record.articleType, record.semanticTopic, record.currentMainImage, record.semanticMatchScore, record.imageUsageCount, record.articleLength].join("\t"));
}
