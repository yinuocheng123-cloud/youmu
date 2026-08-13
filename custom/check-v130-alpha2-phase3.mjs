import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const errors = [];
const ledger = JSON.parse(read("custom/v130-alpha2-migration-audit.json"));
const metadata = JSON.parse(read("custom/v130-alpha2-phase3-metadata-changes.json"));
const p2 = ledger.records.filter((item) => item.priority === "P2");
const phase3Migrated = p2.filter((item) => item.migrationStatus === "MIGRATED" && item.migrationPhase === "phase.3");
const p3 = ledger.records.filter((item) => item.priority === "P3");

if (!/^v1\.30-alpha\.2-phase\.[34]$/.test(ledger.version)) errors.push(`ledger version ${ledger.version}`);
if (p2.length !== 17) errors.push(`P2 count ${p2.length}, expected 17`);
if (phase3Migrated.length !== 17) errors.push(`phase.3 migrated P2 ${phase3Migrated.length}, expected 17`);
if (p2.some((item) => item.imageStatus === "NOT_REVIEWED")) errors.push("P2 still contains NOT_REVIEWED");
if (p2.some((item) => !["MIGRATED", "NO_CHANGE_NEEDED", "BLOCKED_FACT_CHECK", "DEFERRED"].includes(item.migrationStatus))) {
  errors.push("P2 contains invalid phase.3 status");
}
if (p3.length !== 21) errors.push(`P3 count ${p3.length}, expected 21`);
if (p3.some((item) => !["READY_FOR_PHASE4", "NO_CHANGE_NEEDED", "BLOCKED_FACT_CHECK", "DEFERRED", "MIGRATED"].includes(item.migrationStatus))) {
  errors.push("P3 contains invalid readiness status");
}
if (p3.some((item) => item.migrationStatus === "DEFERRED")) errors.push("P3 readiness review still contains DEFERRED");

const summary = ledger.phase3 || {};
const expectedSummary = {
  p2Before: 17,
  p2Migrated: 17,
  p2NoChangeNeeded: 0,
  p2Blocked: 0,
  p2Remaining: 0,
  p3Reviewed: 21,
  p3ReadyForPhase4: 21,
  p3NoChangeNeeded: 0,
  p3Blocked: 0,
  completedTotal: 55,
  noChangeNeededTotal: 0,
  blockedTotal: 0,
  remainingMigrationCount: 21,
};
for (const [key, expected] of Object.entries(expectedSummary)) {
  if (summary[key] !== expected) errors.push(`phase3.${key} ${summary[key]}, expected ${expected}`);
}

const requiredClasses = {
  "Knowledge Editorial": "detail-knowledge",
  "Spatial Editorial": "detail-aesthetic",
  "Lifestyle Editorial": "detail-lifestyle",
  "Brand Profile": "detail-brand",
};
for (const record of phase3Migrated) {
  const html = read(record.path);
  const expectedClass = requiredClasses[record.template];
  if (!html.includes("detail-editorial") || !html.includes(expectedClass)) {
    errors.push(`${record.path}: missing ${record.template} scoped class`);
  }
  if (record.template !== "Lifestyle Editorial" && !html.includes("breadcrumb")) errors.push(`${record.path}: missing breadcrumb`);
  if (!html.includes("#wechat")) errors.push(`${record.path}: missing consultation close`);
  if (!html.includes("content-site-footer") && !html.includes("global-footer")) errors.push(`${record.path}: missing footer`);
}

const templateCounts = phase3Migrated.reduce((counts, item) => {
  counts[item.template] = (counts[item.template] || 0) + 1;
  return counts;
}, {});
const expectedTemplates = {
  "Knowledge Editorial": 6,
  "Spatial Editorial": 4,
  "Lifestyle Editorial": 6,
  "Brand Profile": 1,
};
for (const [template, expected] of Object.entries(expectedTemplates)) {
  if (templateCounts[template] !== expected) errors.push(`${template} ${templateCounts[template]}, expected ${expected}`);
}

const workshopPath = "vendors/workshop-sample.html";
const workshop = read(workshopPath);
const workshopRecord = ledger.records.find((item) => item.path === workshopPath);
if (!workshopRecord || workshopRecord.migrationStatus !== "MIGRATED" || workshopRecord.newCategory !== "生态合作／其他") {
  errors.push("workshop sample ledger decision mismatch");
}
if (!workshop.includes("本页为品牌资料展示样板，不对应真实品牌或企业")) {
  errors.push("workshop sample missing explicit non-real boundary");
}
if (/推荐厂商|官方推荐|认证品牌|立即合作|立即入驻/.test(workshop)) {
  errors.push("workshop sample retains recommendation or conversion language");
}

if (metadata.length !== 5) errors.push(`metadata change count ${metadata.length}, expected 5`);
for (const change of metadata) {
  const html = read(change.path);
  if (!html.includes(`<title>${change.newTitle}</title>`)) errors.push(`${change.path}: new title missing`);
  if (!html.includes(`property="og:title" content="${change.newOgTitle}"`)) errors.push(`${change.path}: new OG title missing`);
  if (html.includes(`<title>${change.oldTitle}</title>`)) errors.push(`${change.path}: old title remains`);
  if (change.newDescription && !html.includes(change.newDescription)) errors.push(`${change.path}: new description missing`);
}

const banned = /永不开裂|永不变形|完全防水|永久耐腐|零维护|越老越值钱|一定升值|100%适合户外|最高等级|最好柚木|官方推荐|认证品牌|优质厂家|最佳品牌/g;
for (const record of phase3Migrated) {
  const matches = read(record.path).match(banned);
  if (matches) errors.push(`${record.path}: high-risk language ${[...new Set(matches)].join("/")}`);
}

const homepage = read("index.html");
const homepageNumbers = [...homepage.matchAll(/value-viewpoint-number[^>]*>(\d{2})</g)].map((match) => match[1]);
if (homepageNumbers.join(",") !== "01,02,03") errors.push(`homepage numbering ${homepageNumbers.join(",")}`);
if (homepage.includes("detail-editorial")) errors.push("homepage received detail template class");

const publicHtml = execFileSync("git", ["ls-files", "*.html"], { cwd: root, encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
let canonicalChangeCount = 0;
let ogUrlChangeCount = 0;
const canonicalPaths = [];
const ogUrlPaths = [];
const extract = (html, pattern) => html.match(pattern)?.[1] || "";
for (const relativePath of publicHtml) {
  const current = read(relativePath);
  const baseline = execFileSync("git", ["show", `HEAD:${relativePath}`], { cwd: root, encoding: "utf8" });
  const currentCanonical = extract(current, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const baselineCanonical = extract(baseline, /<link\s+rel="canonical"\s+href="([^"]+)"/i);
  const currentOgUrl = extract(current, /<meta\s+property="og:url"\s+content="([^"]+)"/i);
  const baselineOgUrl = extract(baseline, /<meta\s+property="og:url"\s+content="([^"]+)"/i);
  if (currentCanonical !== baselineCanonical) {
    canonicalChangeCount += 1;
    canonicalPaths.push(relativePath);
  }
  if (currentOgUrl !== baselineOgUrl) {
    ogUrlChangeCount += 1;
    ogUrlPaths.push(relativePath);
  }
}

const sameAsHead = (relativePath) => read(relativePath) === execFileSync("git", ["show", `HEAD:${relativePath}`], { cwd: root, encoding: "utf8" });
const sitemapChanged = !sameAsHead("sitemap.xml");
const robotsChanged = !sameAsHead("robots.txt");
if (canonicalChangeCount) errors.push(`canonical changed: ${canonicalPaths.join(", ")}`);
if (ogUrlChangeCount) errors.push(`OG URL changed: ${ogUrlPaths.join(", ")}`);
if (sitemapChanged) errors.push("sitemap.xml changed");
if (robotsChanged) errors.push("robots.txt changed");

const result = {
  status: errors.length ? "FAIL" : "PASS",
  p2Before: summary.p2Before,
  p2Migrated: summary.p2Migrated,
  p2NoChangeNeeded: summary.p2NoChangeNeeded,
  p2Blocked: summary.p2Blocked,
  p2Remaining: summary.p2Remaining,
  templates: templateCounts,
  workshopSampleStatus: workshopRecord?.migrationStatus,
  p3Reviewed: summary.p3Reviewed,
  p3ReadyForPhase4: summary.p3ReadyForPhase4,
  p3NoChangeNeeded: summary.p3NoChangeNeeded,
  p3Blocked: summary.p3Blocked,
  remainingMigrationCount: summary.remainingMigrationCount,
  metadataChangeCount: metadata.length,
  imageAssetGapCount: ledger.records.filter((item) => item.imageStatus.startsWith("IMAGE_ASSET_GAP")).length,
  homepageNumbers,
  canonicalChangeCount,
  sitemapChanged,
  robotsChanged,
  ogUrlChangeCount,
  errors,
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
