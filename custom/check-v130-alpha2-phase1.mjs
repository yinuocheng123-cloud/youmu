import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relativePath) => fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
const errors = [];

const pilotPages = {
  "knowledge/topics/what-is-teak.html": "detail-knowledge",
  "knowledge/topics/outdoor-teak-maintenance.html": "detail-knowledge",
  "cases/tea-room-teak-sample.html": "detail-aesthetic",
  "cases/courtyard-teak-sample.html": "detail-aesthetic",
  "solutions/outdoor.html": "detail-lifestyle",
  "solutions/goods/teak-dining-table.html": "detail-lifestyle",
  "vendors/shanghai-zhuangxin-teak.html": "detail-brand",
  "vendors/zhenzang-teak-life.html": "detail-brand",
};

for (const [relativePath, templateClass] of Object.entries(pilotPages)) {
  const html = read(relativePath);
  if (!html.includes("detail-editorial") || !html.includes(templateClass)) {
    errors.push(`${relativePath}: missing scoped detail template class`);
  }
  if (!html.includes("咨询") || !html.includes("#wechat")) {
    errors.push(`${relativePath}: missing consultation close`);
  }
}

const homepageNumbers = [...read("index.html").matchAll(/value-viewpoint-number[^>]*>(\d{2})</g)].map((match) => match[1]);
if (homepageNumbers.join(",") !== "01,02,03") {
  errors.push(`homepage viewpoint numbering is ${homepageNumbers.join(",") || "missing"}`);
}

const auditRows = read("custom/v130-alpha2-phase1-audit.csv").trim().split(/\r?\n/).slice(1);
if (auditRows.length !== 76) errors.push(`audit row count is ${auditRows.length}, expected 76`);
const auditClassification = auditRows.reduce((summary, row) => {
  const columns = row.split(",");
  const suggested = columns[2];
  summary[suggested] = (summary[suggested] || 0) + 1;
  return summary;
}, {});

const styles = read("styles.css");
for (const requiredClass of ["detail-editorial", "detail-knowledge", "detail-aesthetic", "detail-lifestyle", "detail-brand"]) {
  if (!styles.includes(`.${requiredClass}`)) errors.push(`styles.css: missing .${requiredClass}`);
}

const publicHtml = execFileSync("git", ["ls-files", "*.html"], { cwd: projectRoot, encoding: "utf8" })
  .trim()
  .split(/\r?\n/)
  .filter(Boolean);
let canonicalChangeCount = 0;
const canonicalChanges = [];
for (const relativePath of publicHtml) {
  const current = read(relativePath).match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || "";
  let baseline = "";
  try {
    const headHtml = execFileSync("git", ["show", `HEAD:${relativePath}`], { cwd: projectRoot, encoding: "utf8" });
    baseline = headHtml.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1] || "";
  } catch {
    baseline = current;
  }
  if (current !== baseline) {
    canonicalChangeCount += 1;
    canonicalChanges.push(relativePath);
  }
}

const sameAsHead = (relativePath) => {
  const headContent = execFileSync("git", ["show", `HEAD:${relativePath}`], { cwd: projectRoot, encoding: "utf8" });
  return read(relativePath) === headContent;
};
const sitemapChanged = !sameAsHead("sitemap.xml");
const robotsChanged = !sameAsHead("robots.txt");
if (canonicalChangeCount) errors.push(`canonical changed on ${canonicalChanges.join(", ")}`);
if (sitemapChanged) errors.push("sitemap.xml changed");
if (robotsChanged) errors.push("robots.txt changed");

const outdoor = read("solutions/outdoor.html");
if (outdoor.includes("solution-topic-hero\">\n          <a class=\"btn")) {
  errors.push("solutions/outdoor.html: hero CTA remains");
}
if (!outdoor.includes("继续了解户外维护")) errors.push("solutions/outdoor.html: related maintenance close missing");

const metadataChanges = [
  {
    path: "vendors/shanghai-zhuangxin-teak.html",
    old: "上海庄信柚木 - 柚喜饰界推荐厂商",
    next: "上海庄信柚木｜品牌资料｜柚喜饰界",
  },
  {
    path: "vendors/zhenzang-teak-life.html",
    old: "臻藏柚木生活 - 柚喜饰界推荐厂商",
    next: "臻藏柚木生活｜品牌资料｜柚喜饰界",
  },
];
for (const change of metadataChanges) {
  const html = read(change.path);
  if (!html.includes(change.next) || html.includes(change.old)) {
    errors.push(`${change.path}: expected metadata migration missing`);
  }
}

const result = {
  status: errors.length ? "FAIL" : "PASS",
  homepageNumbers,
  auditCandidateCount: auditRows.length,
  auditClassification,
  pilotPageCount: Object.keys(pilotPages).length,
  pilotPages: Object.keys(pilotPages),
  canonicalChangeCount,
  sitemapChanged,
  robotsChanged,
  metadataChanges,
  errors,
};

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exitCode = 1;
