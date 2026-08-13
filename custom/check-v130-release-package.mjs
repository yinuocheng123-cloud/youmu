import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { packageDirectory, packageName } from "./production-package-config.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(projectRoot, packageDirectory, packageName);
const productionOrigin = "https://www.zhengmu.cn";
const errors = [];

const posix = (value) => value.replaceAll(path.sep, "/");

async function collectFiles(directory, prefix = "") {
  const output = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const relative = posix(path.join(prefix, entry.name));
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await collectFiles(absolute, relative)));
    else if (entry.isFile()) output.push(relative);
  }
  return output;
}

function attr(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1] ?? "";
}

function withoutQuery(value) {
  return value.split("#", 1)[0].split("?", 1)[0];
}

function targetFor(sourceFile, reference) {
  if (!reference || /^(?:mailto:|tel:|javascript:|data:)/i.test(reference)) return null;
  let pathname = reference;
  if (/^https?:\/\//i.test(reference)) {
    const parsed = new URL(reference);
    if (parsed.origin !== productionOrigin) return null;
    pathname = `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } else if (/^\/\//.test(reference)) return null;
  pathname = withoutQuery(pathname);
  if (!pathname) return null;
  const decoded = decodeURIComponent(pathname);
  const relative = decoded.startsWith("/")
    ? decoded.slice(1)
    : posix(path.normalize(path.join(path.dirname(sourceFile), decoded)));
  return relative.endsWith("/") || !path.extname(relative) ? `${relative}index.html` : relative;
}

function fragmentFor(reference) {
  const index = reference.indexOf("#");
  return index < 0 ? "" : decodeURIComponent(reference.slice(index + 1).split("?", 1)[0]);
}

async function sha256(relative) {
  const content = await fs.readFile(path.join(packageRoot, relative));
  return crypto.createHash("sha256").update(content).digest("hex");
}

const files = (await collectFiles(packageRoot)).sort();
const fileSet = new Set(files);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const indexableHtml = htmlFiles.filter((file) => file !== "404.html");
const imageFiles = files.filter((file) => /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(file));
const cssFiles = files.filter((file) => file.endsWith(".css"));
const jsFiles = files.filter((file) => file.endsWith(".js"));
let linksChecked = 0;
let brokenLinkCount = 0;
let missingAssetCount = 0;
let forbiddenReferenceCount = 0;
let seoIssueCount = 0;

for (const file of files) {
  if (/^(?:custom|\.git|screenshots|node_modules|__pycache__)(?:\/|$)/i.test(file) || /(?:\.log|\.bak|\.tmp|\.ps1|\.mjs)$/i.test(file)) {
    errors.push(`${file}: development file pollution`);
  }
}

for (const file of htmlFiles) {
  const html = await fs.readFile(path.join(packageRoot, file), "utf8");
  if (/(?:D:\/ceshi\/|file:\/\/|127\.0\.0\.1|localhost|yinuocheng123-cloud\.github\.io\/youmu)/i.test(html)) {
    forbiddenReferenceCount += 1;
    errors.push(`${file}: forbidden development or retired host reference`);
  }
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]));
  for (const tag of html.match(/<(?:a|link|script|img|source)\b[^>]*>/gi) ?? []) {
    const isAsset = /^<(?:link|script|img|source)\b/i.test(tag);
    const reference = attr(tag, /^<(?:script|img|source)\b/i.test(tag) ? "src" : "href");
    if (!reference) continue;
    linksChecked += 1;
    const target = targetFor(file, reference);
    if (target && !fileSet.has(target)) {
      brokenLinkCount += 1;
      if (isAsset) missingAssetCount += 1;
      errors.push(`${file}: missing ${target}`);
      continue;
    }
    const fragment = fragmentFor(reference);
    if (fragment && (!target || target === file)) {
      const targetHtml = target && target !== file ? await fs.readFile(path.join(packageRoot, target), "utf8") : html;
      const targetIds = target === file || !target ? ids : new Set([...targetHtml.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]));
      if (!targetIds.has(fragment)) {
        brokenLinkCount += 1;
        errors.push(`${file}: missing fragment #${fragment}`);
      }
    }
  }
  for (const reference of [...html.matchAll(/\b(?:srcset)=["']([^"']+)["']/gi)].flatMap((match) => match[1].split(",").map((part) => part.trim().split(/\s+/, 1)[0]))) {
    const target = targetFor(file, reference);
    if (target && !fileSet.has(target)) {
      missingAssetCount += 1;
      errors.push(`${file}: missing srcset asset ${target}`);
    }
  }

  if (file === "404.html") continue;
  const expectedUrl = file === "index.html" ? `${productionOrigin}/` : `${productionOrigin}/${file}`;
  const title = html.match(/<title>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
  const description = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] ?? "";
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1] ?? "";
  const ogUrl = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i)?.[1] ?? "";
  const h1Count = (html.match(/<h1\b/gi) ?? []).length;
  if (!title || !description || canonical !== expectedUrl || ogUrl !== expectedUrl || h1Count !== 1) {
    seoIssueCount += 1;
    errors.push(`${file}: SEO metadata mismatch`);
  }
}

for (const file of cssFiles) {
  const css = await fs.readFile(path.join(packageRoot, file), "utf8");
  for (const match of css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    const reference = match[1];
    if (/^(?:data:|https?:|\/\/)/i.test(reference)) continue;
    const target = targetFor(file, reference);
    if (target && !fileSet.has(target)) {
      missingAssetCount += 1;
      errors.push(`${file}: missing CSS asset ${target}`);
    }
  }
}

const robots = await fs.readFile(path.join(packageRoot, "robots.txt"), "utf8");
const sitemap = await fs.readFile(path.join(packageRoot, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const robotsAllowsIndexing = /User-agent:\s*\*/i.test(robots) && /Allow:\s*\//i.test(robots) && !/Disallow:\s*\//i.test(robots);
const canonicalHosts = new Set();
const ogHosts = new Set();
for (const file of indexableHtml) {
  const html = await fs.readFile(path.join(packageRoot, file), "utf8");
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1];
  const og = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i)?.[1];
  if (canonical) canonicalHosts.add(new URL(canonical).hostname);
  if (og) ogHosts.add(new URL(og).hostname);
}
const sitemapHosts = new Set(sitemapUrls.map((url) => new URL(url).hostname));
if (files.length !== 151) errors.push(`file count ${files.length}, expected 151`);
if (htmlFiles.length !== 127 || indexableHtml.length !== 126) errors.push(`HTML count ${htmlFiles.length}/${indexableHtml.length}, expected 127/126`);
if (sitemapUrls.length !== 126 || new Set(sitemapUrls).size !== 126) errors.push("sitemap must contain 126 unique URLs");
if (!robotsAllowsIndexing || !robots.includes(`${productionOrigin}/sitemap.xml`)) errors.push("robots production indexing policy mismatch");
if ([...canonicalHosts, ...ogHosts, ...sitemapHosts].some((host) => host !== "www.zhengmu.cn")) errors.push("production SEO host mismatch");

const result = {
  status: errors.length ? "FAIL" : "PASS",
  package: `${packageDirectory}/${packageName}`,
  fileCount: files.length,
  htmlCount: htmlFiles.length,
  indexableHtmlCount: indexableHtml.length,
  imageCount: imageFiles.length,
  cssCount: cssFiles.length,
  jsCount: jsFiles.length,
  linksChecked,
  brokenLinkCount,
  missingAssetCount,
  forbiddenReferenceCount,
  seoIssueCount,
  canonicalHosts: [...canonicalHosts],
  ogHosts: [...ogHosts],
  sitemapHosts: [...sitemapHosts],
  sitemapUrlCount: sitemapUrls.length,
  robotsAllowsIndexing,
  hashes: {
    index: await sha256("index.html"),
    styles: await sha256("styles.css"),
    robots: await sha256("robots.txt"),
    sitemap: await sha256("sitemap.xml"),
    siteContent: await sha256("data/site-content.js"),
  },
  errors,
};

if (process.argv.includes("--write-json")) {
  await fs.writeFile(path.join(projectRoot, "custom", "v130-release-package-audit.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
