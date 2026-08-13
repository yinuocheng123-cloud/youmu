import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const errors = [];
const ledger = JSON.parse(read("custom/v130-alpha2-migration-audit.json"));
const metadata = JSON.parse(read("custom/v130-alpha2-phase4-metadata-changes.json"));
const architecture = JSON.parse(read("custom/v130-page-architecture.json"));
const summary = read("custom/V130_ALPHA2_MIGRATION_SUMMARY.md");
const records = ledger.records;
const phase4 = records.filter((item) => item.migrationPhase === "phase.4");

if (ledger.version !== "v1.30-alpha.2-phase.4") errors.push(`ledger version ${ledger.version}`);
if (records.length !== 76) errors.push(`candidate records ${records.length}, expected 76`);
if (new Set(records.map((item) => item.path)).size !== 76) errors.push("candidate ledger contains duplicate paths");
const allowedFinalStatuses = new Set(["MIGRATED", "NO_CHANGE_NEEDED", "BLOCKED_FACT_CHECK", "DEFERRED"]);
for (const record of records) {
  if (!record.migrationStatus || !allowedFinalStatuses.has(record.migrationStatus)) errors.push(`${record.path}: invalid final status ${record.migrationStatus}`);
}
const statusCounts = records.reduce((counts, item) => ((counts[item.migrationStatus] = (counts[item.migrationStatus] || 0) + 1), counts), {});
if ((statusCounts.MIGRATED || 0) !== 76) errors.push(`MIGRATED ${statusCounts.MIGRATED || 0}, expected 76`);
if (phase4.length !== 21) errors.push(`phase.4 migrated ${phase4.length}, expected 21`);
if (phase4.filter((item) => item.template === "Knowledge Editorial").length !== 9) errors.push("phase.4 Knowledge count mismatch");
if (phase4.filter((item) => item.template === "Lifestyle Editorial").length !== 12) errors.push("phase.4 Lifestyle count mismatch");

const expectedPhase4 = {
  readyBefore: 21,
  migratedThisPhase: 21,
  noChangeNeededThisPhase: 0,
  blockedThisPhase: 0,
  readyAfter: 0,
  knowledgeProcessed: 9,
  lifestyleProcessed: 12,
  totalMigrated: 76,
  totalNoChangeNeeded: 0,
  totalBlocked: 0,
  totalDeferred: 0,
  notReviewedCount: 0,
};
for (const [key, expected] of Object.entries(expectedPhase4)) {
  if (ledger.phase4?.[key] !== expected) errors.push(`phase4.${key} ${ledger.phase4?.[key]}, expected ${expected}`);
}

for (const record of phase4) {
  const html = read(record.path);
  const expectedClass = record.template === "Knowledge Editorial" ? "detail-knowledge" : "detail-lifestyle";
  if (!html.includes("detail-editorial") || !html.includes(expectedClass)) errors.push(`${record.path}: missing scoped template class`);
  if (!html.includes("detail-boundary-note")) errors.push(`${record.path}: missing boundary note`);
  if (!html.includes("#wechat")) errors.push(`${record.path}: missing consultation CTA`);
  if (!html.includes("footer")) errors.push(`${record.path}: missing footer`);
  const expectedRelated = record.template === "Knowledge Editorial" ? "继续探索柚木" : "继续了解柚木生活";
  if (!html.includes(expectedRelated)) errors.push(`${record.path}: missing ${expectedRelated}`);
}

const bannedPromises = /永不开裂|永不变形|完全防水|永久耐腐|零维护|100%适合|一定升值|保证升值|官方推荐|认证品牌|优质厂家|最佳品牌|立即购买|加入购物车|马上下单|免费报价|领取方案/g;
for (const record of phase4) {
  const matches = read(record.path).match(bannedPromises);
  if (matches) errors.push(`${record.path}: high-risk phrase ${[...new Set(matches)].join("/")}`);
}

const legacyPattern = /推荐厂商|优质厂家|供应商推荐|企业库|数据库|资料库|产品中心|解决方案|社群交流|立即购买|立即入驻|招商|免费入驻|平台赋能|认证品牌|官方推荐/g;
const positioningPattern = /高端木作平台|木作平台|供应商平台|木材数据库|品牌数据库|企业集合|交易平台|木作门户/g;
const trackedHtml = execFileSync("git", ["ls-files", "*.html"], { cwd: root, encoding: "utf8" }).trim().split(/\r?\n/).filter(Boolean);
const legacyCandidates = [];
const positioningCandidates = [];
for (const relativePath of trackedHtml) {
  const html = read(relativePath);
  for (const match of html.matchAll(legacyPattern)) legacyCandidates.push({ path: relativePath, phrase: match[0] });
  for (const match of html.matchAll(positioningPattern)) positioningCandidates.push({ path: relativePath, phrase: match[0] });
}
if (legacyCandidates.length) errors.push(`legacy semantic candidates remain: ${JSON.stringify(legacyCandidates)}`);
if (positioningCandidates.length) errors.push(`brand positioning candidates remain: ${JSON.stringify(positioningCandidates)}`);

if (metadata.length !== 0) errors.push(`phase.4 metadata changes ${metadata.length}, expected 0`);
if (!summary.includes("候选总数：76") || !summary.includes("MIGRATED：76") || !summary.includes("IMAGE_ASSET_GAP：4")) errors.push("migration summary headline mismatch");
if (architecture.pageCount !== 126 || architecture.pages?.length !== 126) errors.push(`architecture page count ${architecture.pageCount}/${architecture.pages?.length}, expected 126`);
if (new Set(architecture.pages.map((item) => item.path)).size !== 126) errors.push("architecture contains duplicate paths");
const candidateArchitecture = architecture.pages.filter((item) => item.pageType === "candidate-detail");
if (candidateArchitecture.length !== 76) errors.push(`architecture candidate count ${candidateArchitecture.length}, expected 76`);
for (const record of records) {
  const page = architecture.pages.find((item) => item.path === record.path);
  if (!page) errors.push(`${record.path}: absent from architecture`);
  else if (page.template !== record.template || page.migrationStatus !== record.migrationStatus) errors.push(`${record.path}: architecture mismatch`);
}

const homepage = read("index.html");
const homepageNumbers = [...homepage.matchAll(/value-viewpoint-number[^>]*>(\d{2})</g)].map((match) => match[1]);
if (homepageNumbers.join(",") !== "01,02,03") errors.push(`homepage numbering ${homepageNumbers.join(",")}`);
if (homepage.includes("detail-editorial")) errors.push("homepage received detail template class");

const extract = (html, pattern) => html.match(pattern)?.[1] || "";
let canonicalChangeCount = 0;
let ogUrlChangeCount = 0;
for (const relativePath of trackedHtml) {
  const current = read(relativePath);
  const baseline = execFileSync("git", ["show", `HEAD:${relativePath}`], { cwd: root, encoding: "utf8" });
  if (extract(current, /<link\s+rel="canonical"\s+href="([^"]+)"/i) !== extract(baseline, /<link\s+rel="canonical"\s+href="([^"]+)"/i)) canonicalChangeCount++;
  if (extract(current, /<meta\s+property="og:url"\s+content="([^"]+)"/i) !== extract(baseline, /<meta\s+property="og:url"\s+content="([^"]+)"/i)) ogUrlChangeCount++;
}
const sameAsHead = (p) => read(p) === execFileSync("git", ["show", `HEAD:${p}`], { cwd: root, encoding: "utf8" });
const sitemapChanged = !sameAsHead("sitemap.xml");
const robotsChanged = !sameAsHead("robots.txt");
const sitemapUrlCount = [...read("sitemap.xml").matchAll(/<loc>/g)].length;
const baselineTrackedHtml = execFileSync("git", ["ls-tree", "-r", "--name-only", "HEAD"], { cwd: root, encoding: "utf8" }).split(/\r?\n/).filter((p) => p.endsWith(".html"));
const urlChangeCount = trackedHtml.length === baselineTrackedHtml.length && trackedHtml.every((p) => baselineTrackedHtml.includes(p)) ? 0 : Math.abs(trackedHtml.length - baselineTrackedHtml.length) || 1;
if (urlChangeCount) errors.push(`URL set changed: ${urlChangeCount}`);
if (canonicalChangeCount) errors.push(`canonical changes ${canonicalChangeCount}`);
if (ogUrlChangeCount) errors.push(`OG URL changes ${ogUrlChangeCount}`);
if (sitemapChanged) errors.push("sitemap.xml changed");
if (robotsChanged) errors.push("robots.txt changed");
if (sitemapUrlCount !== 126) errors.push(`sitemap URL count ${sitemapUrlCount}, expected 126`);

const result = {
  status: errors.length ? "FAIL" : "PASS",
  readyBefore: ledger.phase4?.readyBefore,
  migratedThisPhase: phase4.length,
  readyAfter: records.filter((item) => item.migrationStatus === "READY_FOR_PHASE4").length,
  knowledgeProcessed: phase4.filter((item) => item.template === "Knowledge Editorial").length,
  lifestyleProcessed: phase4.filter((item) => item.template === "Lifestyle Editorial").length,
  totalCandidatePages: records.length,
  statusCounts,
  notReviewedCount: records.filter((item) => item.migrationStatus === "NOT_REVIEWED").length,
  legacyCandidates,
  positioningCandidates,
  metadataChangeCountThisPhase: metadata.length,
  metadataChangeCountTotal: 17,
  imageAssetGap: records.filter((item) => item.imageStatus.startsWith("IMAGE_ASSET_GAP")).length,
  architecturePageCount: architecture.pageCount,
  homepageNumbers,
  urlChangeCount,
  canonicalChangeCount,
  ogUrlChangeCount,
  sitemapChanged,
  robotsChanged,
  sitemapUrlCount,
  errors,
};
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
