import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const customDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.dirname(customDir);
const base = "https://www.zhengmu.cn/";
const read = (p) => fs.readFile(path.join(root, p), "utf8");
const exists = async (p) => { try { await fs.access(p); return true; } catch { return false; } };
const slash = (s) => s.replaceAll("\\", "/");
const decode = (s) => { try { return decodeURIComponent(s); } catch { return s; } };
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m ? (m[1] ?? m[2] ?? m[3] ?? "") : null;
};
const one = (html, re) => html.match(re)?.[1]?.trim() ?? "";
const strip = (html) => html.replace(/<!--[\s\S]*?-->/g, " ").replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&nbsp;|&#160;/gi, " ").replace(/&amp;/gi, "&").replace(/\s+/g, " ").trim();
const expected = (p) => p === "index.html" ? base : `${base}${p}`;
const publicPath = (url) => {
  const parsed = new URL(url, base);
  let p = decode(parsed.pathname.replace(/^\/+/, ""));
  if (!p || p.endsWith("/")) p += "index.html";
  return slash(p);
};
const duplicates = (rows, field) => {
  const grouped = new Map();
  for (const row of rows) {
    if (!row[field]) continue;
    if (!grouped.has(row[field])) grouped.set(row[field], []);
    grouped.get(row[field]).push(row.path);
  }
  return [...grouped.entries()].filter(([, pages]) => pages.length > 1).map(([value, pages]) => ({ value, pages })).sort((a, b) => b.pages.length - a.pages.length);
};
const contexts = (files, terms) => files.flatMap(({ path: p, text }) => terms.flatMap((term) => {
  const found = [];
  for (let from = 0; ;) {
    const at = text.indexOf(term, from);
    if (at < 0) break;
    found.push({ path: p, term, context: text.slice(Math.max(0, at - 42), Math.min(text.length, at + term.length + 60)).trim() });
    from = at + term.length;
  }
  return found;
}));

const sitemapXml = await read("sitemap.xml");
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
const sitemapPaths = sitemapUrls.map(publicPath);
const sitemapSet = new Set(sitemapPaths);
const architecture = JSON.parse(await read("custom/v130-page-architecture.json"));
const migration = JSON.parse(await read("custom/v130-alpha2-migration-audit.json"));
const architecturePaths = architecture.pages.map((p) => p.path);
const architectureSet = new Set(architecturePaths);
const requiredFields = ["path", "pageType", "section", "template", "migrationStatus"];
const duplicatePaths = [...new Set(architecturePaths.filter((p, i) => architecturePaths.indexOf(p) !== i))];
const missingFields = architecture.pages.flatMap((p) => requiredFields.filter((f) => p[f] === undefined || p[f] === null || p[f] === "").map((field) => ({ path: p.path ?? "(missing)", field })));
const missingFiles = (await Promise.all(architecturePaths.map(async (p) => await exists(path.join(root, p)) ? null : p))).filter(Boolean);

const htmlRows = [];
const textFiles = [];
for (const p of sitemapPaths) {
  const html = await read(p);
  textFiles.push({ path: p, text: strip(html) });
  const meta = (key, value) => one(html, new RegExp(`<meta\\s+[^>]*${key}=["']${value}["'][^>]*content=["']([^"']*)["'][^>]*>`, "i")) || one(html, new RegExp(`<meta\\s+[^>]*content=["']([^"']*)["'][^>]*${key}=["']${value}["'][^>]*>`, "i"));
  const canonical = one(html, /<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i) || one(html, /<link\s+[^>]*href=["']([^"']*)["'][^>]*rel=["']canonical["'][^>]*>/i);
  htmlRows.push({
    path: p,
    title: one(html, /<title>([\s\S]*?)<\/title>/i),
    description: meta("name", "description"), canonical,
    ogTitle: meta("property", "og:title"), ogDescription: meta("property", "og:description"), ogUrl: meta("property", "og:url"),
    h1Count: [...html.matchAll(/<h1\b/gi)].length,
    lang: one(html, /<html\s+[^>]*lang=["']([^"']+)["']/i),
    charset: one(html, /<meta\s+[^>]*charset=["']?([^"'\s>]+)/i),
    robots: meta("name", "robots"), bytes: Buffer.byteLength(html),
    legalOperator: html.includes("杭州创始记科技发展有限公司"),
    icpNumber: html.includes("浙ICP备2021004169号-2"),
    icpLink: /<a\b[^>]*href=["']https:\/\/beian\.miit\.gov\.cn\/["'][^>]*>\s*浙ICP备2021004169号-2\s*<\/a>/i.test(html),
  });
}
const seoIssues = [];
const legalIssues = [];
for (const row of htmlRows) {
  for (const f of ["title", "description", "canonical", "ogTitle", "ogDescription", "ogUrl", "lang", "charset"]) if (!row[f]) seoIssues.push({ path: row.path, issue: `missing-${f}` });
  if (row.h1Count !== 1) seoIssues.push({ path: row.path, issue: `h1Count=${row.h1Count}` });
  if (row.canonical && row.canonical !== expected(row.path)) seoIssues.push({ path: row.path, issue: `canonical=${row.canonical}` });
  if (row.ogUrl && row.ogUrl !== expected(row.path)) seoIssues.push({ path: row.path, issue: `ogUrl=${row.ogUrl}` });
  if (row.robots && /noindex|none/i.test(row.robots)) seoIssues.push({ path: row.path, issue: `robots=${row.robots}` });
  if (!row.legalOperator || !row.icpNumber || !row.icpLink) legalIssues.push({ path: row.path, issue: "missing-confirmed-legal-footer" });
}

const ids = new Map();
for (const p of sitemapPaths) {
  const html = await read(p);
  ids.set(p, new Set([...html.matchAll(/\s(?:id|name)=["']([^"']+)["']/gi)].map((m) => m[1])));
}
let linksChecked = 0;
const linkIssues = [];
for (const p of sitemapPaths) {
  const html = await read(p);
  for (const m of html.matchAll(/<(?:a|area)\b[^>]*\shref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))[^>]*>/gi)) {
    const href = (m[1] ?? m[2] ?? m[3] ?? "").trim();
    linksChecked += 1;
    if (!href || href === "#") { linkIssues.push({ path: p, href, issue: "placeholder" }); continue; }
    if (/^javascript:/i.test(href)) { linkIssues.push({ path: p, href, issue: "javascript-url" }); continue; }
    if (/^[a-zA-Z]:[\\/]/.test(href)) { linkIssues.push({ path: p, href, issue: "windows-path" }); continue; }
    if (/^(mailto:|tel:|weixin:)/i.test(href)) continue;
    let u;
    try { u = new URL(href, expected(p)); } catch { linkIssues.push({ path: p, href, issue: "invalid-url" }); continue; }
    if (u.hostname && u.hostname !== "www.zhengmu.cn") {
      if (/localhost|127\.0\.0\.1/i.test(u.hostname)) linkIssues.push({ path: p, href, issue: "local-host" });
      if (/github\.io$/i.test(u.hostname)) linkIssues.push({ path: p, href, issue: "legacy-github-pages" });
      continue;
    }
    const target = publicPath(u.href);
    if (!(await exists(path.join(root, target)))) { linkIssues.push({ path: p, href, issue: `missing-target:${target}` }); continue; }
    if (u.hash && !(ids.get(target) ?? new Set()).has(decode(u.hash.slice(1)))) linkIssues.push({ path: p, href, issue: `missing-anchor:${target}${u.hash}` });
  }
}

const imageRefs = [];
const imageIssues = [];
let imageTagCount = 0;
let imageMissingDimensions = 0;
let lazyImageCount = 0;
const resolveAsset = (source, value, css = false) => {
  if (!value || /^data:/i.test(value)) return null;
  if (/^https?:\/\//i.test(value)) {
    const parsed = new URL(value);
    return parsed.hostname === "www.zhengmu.cn" ? publicPath(value) : null;
  }
  const clean = decode(value.split(/[?#]/)[0]);
  return slash(path.normalize(css ? clean.replace(/^\.\//, "") : path.join(path.dirname(source), clean)));
};
for (const p of sitemapPaths) {
  const html = await read(p);
  for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
    imageTagCount += 1;
    const src = attr(tag, "src");
    if (!src) imageIssues.push({ path: p, issue: "empty-src" });
    if (attr(tag, "alt") === null) imageIssues.push({ path: p, src, issue: "missing-alt" });
    if (!attr(tag, "width") || !attr(tag, "height")) imageMissingDimensions += 1;
    if ((attr(tag, "loading") ?? "").toLowerCase() === "lazy") lazyImageCount += 1;
    const asset = resolveAsset(p, src); if (asset) imageRefs.push({ path: p, asset, kind: "img" });
  }
  for (const tag of html.match(/<(?:img|source)\b[^>]*>/gi) ?? []) {
    const srcset = attr(tag, "srcset");
    if (srcset) for (const src of srcset.split(",").map((s) => s.trim().split(/\s+/)[0])) { const asset = resolveAsset(p, src); if (asset) imageRefs.push({ path: p, asset, kind: "srcset" }); }
  }
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if ((attr(tag, "property") ?? "").toLowerCase() !== "og:image") continue;
    const asset = resolveAsset(p, attr(tag, "content"));
    if (asset) imageRefs.push({ path: p, asset, kind: "og:image" });
  }
}
for (const m of (await read("styles.css")).matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) { const asset = resolveAsset("styles.css", m[1], true); if (asset) imageRefs.push({ path: "styles.css", asset, kind: "background" }); }
for (const ref of imageRefs) if (!(await exists(path.join(root, ref.asset)))) imageIssues.push({ path: ref.path, src: ref.asset, issue: "missing-image" });

const assets = [];
const walk = async (dir) => {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    if ([".git", "_site", "custom", "release"].includes(entry.name)) continue;
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(absolute);
    else if (/\.(?:jpe?g|png|webp|gif|svg)$/i.test(entry.name)) { const stat = await fs.stat(absolute); assets.push({ path: slash(path.relative(root, absolute)), bytes: stat.size }); }
  }
};
await walk(root); assets.sort((a, b) => b.bytes - a.bytes);

const a11yIssues = imageIssues.filter((x) => x.issue === "missing-alt");
for (const p of sitemapPaths) {
  const html = await read(p);
  for (const tag of html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? []) if (!(strip(tag) || attr(tag, "aria-label") || attr(tag, "title"))) a11yIssues.push({ path: p, issue: "unlabelled-button" });
  const labels = new Set([...html.matchAll(/<label\b[^>]*for=["']([^"']+)["']/gi)].map((m) => m[1]));
  for (const match of html.matchAll(/<(?:input|select|textarea)\b[^>]*>/gi)) {
    const tag = match[0];
    if ((attr(tag, "type") ?? "").toLowerCase() === "hidden") continue;
    const id = attr(tag, "id");
    const before = html.slice(0, match.index);
    const wrappedByLabel = before.lastIndexOf("<label") > before.lastIndexOf("</label>");
    if (!(wrappedByLabel || (id && labels.has(id)) || attr(tag, "aria-label") || attr(tag, "aria-labelledby") || attr(tag, "title"))) a11yIssues.push({ path: p, id, issue: "unlabelled-control" });
  }
}

const legacyTerms = ["推荐厂商", "推荐厂家", "厂家推荐", "优质厂家", "供应商推荐", "供应商平台", "企业库", "企业集合", "品牌数据库", "木材数据库", "资料库", "产品中心", "解决方案", "柚木好物", "社群交流", "立即购买", "立即下单", "免费入驻", "立即入驻", "招商加盟", "抢占名额", "平台赋能", "认证品牌", "官方推荐", "品质保证", "交易担保"];
const positioningTerms = ["木作平台", "高端木作平台", "家居平台", "产业平台", "供应商平台", "企业平台", "交易平台", "行业门户"];
const factTerms = ["柚木最好", "顶级", "最高级", "唯一", "100%", "完全", "永远", "永久", "永不开裂", "永不变形", "完全防水", "完全防腐", "零维护", "一定升值", "一定保值", "收藏级", "百年", "千年", "缅甸柚木", "泰国柚木", "印尼柚木", "天然林", "老料", "旧料", "回收料", "珍藏", "认证", "官方", "检测", "等级", "价格"];
const demoTerms = ["demo", "sample", "示例", "样板", "概念", "灵感", "非真实", "模拟", "虚构", "占位", "案例"];
const records = Array.isArray(migration) ? migration : (migration.records ?? migration.pages ?? []);
const sectionCounts = Object.fromEntries([...new Set(architecture.pages.map((p) => p.section))].map((s) => [s, architecture.pages.filter((p) => p.section === s).length]));
const templateCounts = Object.fromEntries([...new Set(architecture.pages.map((p) => p.template))].map((t) => [t, architecture.pages.filter((p) => p.template === t).length]));
const robots = await read("robots.txt");
const output = {
  generatedAt: new Date().toISOString(), repositoryPath: root,
  architecture: { declaredCount: architecture.pageCount, actualCount: architecture.pages.length, sitemapCount: sitemapPaths.length, duplicatePaths, missingFields, missingFiles, sitemapMissingFromArchitecture: sitemapPaths.filter((p) => !architectureSet.has(p)), architectureMissingFromSitemap: architecturePaths.filter((p) => !sitemapSet.has(p)), sectionCounts, templateCounts },
  migration: { recordCount: records.length, migratedCount: records.filter((x) => x.migrationStatus === "MIGRATED" || x.status === "MIGRATED").length, nonMigrated: records.filter((x) => ![x.migrationStatus, x.status].includes("MIGRATED")) },
  seo: { pageCount: htmlRows.length, issues: seoIssues, duplicateTitles: duplicates(htmlRows, "title"), duplicateDescriptions: duplicates(htmlRows, "description"), canonicalHosts: [...new Set(htmlRows.map((x) => x.canonical && new URL(x.canonical).hostname))], ogUrlHosts: [...new Set(htmlRows.map((x) => x.ogUrl && new URL(x.ogUrl).hostname))], sitemapHosts: [...new Set(sitemapUrls.map((x) => new URL(x).hostname))] },
  links: { checked: linksChecked, issues: linkIssues },
  images: { referencedCount: imageRefs.length, uniqueReferencedCount: new Set(imageRefs.map((x) => x.asset)).size, imageTagCount, imageMissingDimensions, lazyImageCount, issues: imageIssues, productionAssetCount: assets.length, over1Mb: assets.filter((x) => x.bytes > 1024 ** 2), over2Mb: assets.filter((x) => x.bytes > 2 * 1024 ** 2), over5Mb: assets.filter((x) => x.bytes > 5 * 1024 ** 2), largest: assets.slice(0, 10) },
  performance: { htmlBytes: htmlRows.reduce((n, x) => n + x.bytes, 0), largestHtml: [...htmlRows].sort((a, b) => b.bytes - a.bytes).slice(0, 10).map(({ path, bytes }) => ({ path, bytes })), cssBytes: (await fs.stat(path.join(root, "styles.css"))).size, scriptBytes: (await fs.stat(path.join(root, "script.js"))).size, imageBytes: assets.reduce((n, x) => n + x.bytes, 0), imageTagCount, imageMissingDimensions, lazyImageCount },
  accessibility: { issues: a11yIssues, focusStylePresent: /:focus(?:-visible)?/i.test(await read("styles.css")) },
  legal: { operator: "杭州创始记科技发展有限公司", icpNumber: "浙ICP备2021004169号-2", issues: legalIssues },
  semantics: { legacyMatches: contexts(textFiles, legacyTerms), positioningMatches: contexts(textFiles, positioningTerms) },
  facts: { matches: contexts(textFiles, factTerms) }, demoAndCases: { matches: contexts(textFiles, demoTerms) },
  robots: { content: robots, productionAllowsIndexing: /Allow:\s*\//i.test(robots) && !/Disallow:\s*\/(?:\s|$)/im.test(robots) },
};
if (process.argv.includes("--write-json")) await fs.writeFile(path.join(customDir, "v130-release-closeout-audit.json"), `${JSON.stringify(output, null, 2)}\n`, "utf8");
const architectureIssueCount = duplicatePaths.length + missingFields.length + missingFiles.length + output.architecture.sitemapMissingFromArchitecture.length + output.architecture.architectureMissingFromSitemap.length;
const hardFailures = [];
if (output.architecture.actualCount !== 126 || output.architecture.sitemapCount !== 126 || architectureIssueCount) hardFailures.push("architecture");
if (output.migration.recordCount !== 76 || output.migration.migratedCount !== 76 || output.migration.nonMigrated.length) hardFailures.push("migration");
if (seoIssues.length) hardFailures.push("seo");
if (legalIssues.length) hardFailures.push("legal");
if (linkIssues.length) hardFailures.push("links");
if (imageIssues.some((x) => ["missing-image", "empty-src"].includes(x.issue))) hardFailures.push("images");
console.log(JSON.stringify({ status: hardFailures.length ? "FAIL" : "PASS", hardFailures, pages: output.architecture.actualCount, candidates: `${output.migration.migratedCount}/${output.migration.recordCount}`, architectureIssues: architectureIssueCount, seoIssues: seoIssues.length, legalIssues: legalIssues.length, duplicateTitleGroups: output.seo.duplicateTitles.length, duplicateDescriptionGroups: output.seo.duplicateDescriptions.length, linksChecked, linkIssues: linkIssues.length, missingImageIssues: imageIssues.filter((x) => ["missing-image", "empty-src"].includes(x.issue)).length, accessibilityIssues: a11yIssues.length, legacyMatches: output.semantics.legacyMatches.length, positioningMatches: output.semantics.positioningMatches.length, factMatches: output.facts.matches.length, demoMatches: output.demoAndCases.matches.length, productionAllowsIndexing: output.robots.productionAllowsIndexing, jsonWritten: process.argv.includes("--write-json") }, null, 2));
if (hardFailures.length) process.exitCode = 1;
