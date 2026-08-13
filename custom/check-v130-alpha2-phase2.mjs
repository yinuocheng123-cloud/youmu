import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const errors = [];
const ledger = JSON.parse(read("custom/v130-alpha2-migration-audit.json"));
const metadata = JSON.parse(read("custom/v130-alpha2-phase2-metadata-changes.json"));
// phase.3 继续复用同一台账；本检查只回归 phase.2 的历史 30 页。
const migrated = ledger.records.filter((item) => item.migrationStatus === "MIGRATED" && item.migrationPhase === "phase.2");

if (ledger.remainingBefore !== 68 || ledger.migratedThisPhase !== 30 || ledger.remainingAfter !== 38) {
  errors.push("migration ledger headline counts mismatch");
}
if (migrated.length !== 30) errors.push(`migrated count ${migrated.length}, expected 30`);
if (metadata.length !== 10) errors.push(`metadata change count ${metadata.length}, expected 10`);

const requiredClasses = {
  "Knowledge Editorial": "detail-knowledge",
  "Spatial Editorial": "detail-aesthetic",
  "Lifestyle Editorial": "detail-lifestyle",
  "Brand Profile": "detail-brand",
};
for (const record of migrated) {
  const html = read(record.path);
  const expectedClass = requiredClasses[record.template];
  if (!html.includes("detail-editorial") || !html.includes(expectedClass)) {
    errors.push(`${record.path}: missing ${record.template} scoped class`);
  }
  if (!html.includes("#wechat")) errors.push(`${record.path}: missing consultation close`);
}

const counts = migrated.reduce((result, item) => {
  result.template[item.template] = (result.template[item.template] || 0) + 1;
  result.priority[item.priority] = (result.priority[item.priority] || 0) + 1;
  return result;
}, { template: {}, priority: {} });
const expectedTemplates = { "Knowledge Editorial": 11, "Spatial Editorial": 4, "Lifestyle Editorial": 11, "Brand Profile": 4 };
for (const [template, expected] of Object.entries(expectedTemplates)) {
  if (counts.template[template] !== expected) errors.push(`${template} count ${counts.template[template]}, expected ${expected}`);
}
if (counts.priority.P0 !== 22 || counts.priority.P1 !== 8 || (counts.priority.P2 || 0) !== 0) {
  errors.push(`priority counts mismatch: ${JSON.stringify(counts.priority)}`);
}

const banned = /永不开裂|永不变形|完全防水|永久耐腐|零维护|越老越值钱|一定升值|100%适合户外|最高等级|最好柚木/g;
for (const record of migrated) {
  const matches = read(record.path).match(banned);
  if (matches) errors.push(`${record.path}: banned absolute language ${[...new Set(matches)].join("/")}`);
}

for (const change of metadata) {
  const html = read(change.path);
  if (!html.includes(`<title>${change.newTitle}</title>`)) errors.push(`${change.path}: new title missing`);
  if (!html.includes(`property="og:title" content="${change.newTitle}"`)) errors.push(`${change.path}: synced OG title missing`);
  if (html.includes(`<title>${change.oldTitle}</title>`)) errors.push(`${change.path}: old title remains`);
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
  remainingBefore: ledger.remainingBefore,
  migratedThisPhase: migrated.length,
  remainingAfter: ledger.remainingAfter,
  priority: counts.priority,
  templates: counts.template,
  reclassifiedPages: migrated.filter((item) => item.oldCategory !== item.newCategory).map((item) => item.path),
  metadataChangeCount: metadata.length,
  blockedFactCheckCount: ledger.records.filter((item) => item.migrationStatus === "BLOCKED_FACT_CHECK").length,
  blockedImageCount: ledger.records.filter((item) => item.migrationStatus === "BLOCKED_IMAGE").length,
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
