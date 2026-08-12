import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assetFiles,
  forbiddenPackageSegments,
  packageName,
  publicDirectoryRules,
  rootFiles,
} from "./production-package-config.mjs";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const packageRoot = process.argv[2]
  ? path.resolve(projectRoot, process.argv[2])
  : path.join(projectRoot, "_site", packageName);
const productionOrigin = "https://www.zhengmu.cn";
const retiredOrigin = "https://yinuocheng123-cloud.github.io/youmu";
const problems = [];

function toPosix(relativePath) {
  return relativePath.replaceAll(path.sep, "/");
}

async function collectFiles(root, directory = "") {
  const files = [];
  const absolute = path.join(root, directory);
  for (const child of await fs.readdir(absolute, { withFileTypes: true })) {
    const relativePath = path.join(directory, child.name);
    if (child.isDirectory()) files.push(...(await collectFiles(root, relativePath)));
    else if (child.isFile()) files.push(toPosix(relativePath));
  }
  return files;
}

async function collectExpectedSourceFiles(directory, extensions) {
  const files = [];
  const absolute = path.join(projectRoot, directory);
  for (const child of await fs.readdir(absolute, { withFileTypes: true })) {
    const relativePath = path.join(directory, child.name);
    if (child.isDirectory()) files.push(...(await collectExpectedSourceFiles(relativePath, extensions)));
    else if (child.isFile()) {
      if (!extensions.has(path.extname(child.name).toLowerCase())) {
        problems.push(`source whitelist: unexpected file type ${toPosix(relativePath)}`);
      } else files.push(toPosix(relativePath));
    }
  }
  return files;
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1] ?? "";
}

function resolveLocalReference(htmlFile, reference) {
  const withoutFragment = reference.split("#", 1)[0].split("?", 1)[0];
  if (!withoutFragment || /^(?:https?:|mailto:|tel:|javascript:|data:)/i.test(withoutFragment)) return null;
  if (withoutFragment.startsWith("/")) return withoutFragment.slice(1);
  return toPosix(path.normalize(path.join(path.dirname(htmlFile), withoutFragment)));
}

const expectedFiles = [...rootFiles, ...assetFiles];
for (const [directory, extensions] of publicDirectoryRules) {
  expectedFiles.push(...(await collectExpectedSourceFiles(directory, extensions)));
}
expectedFiles.sort();

let packageFiles = [];
try {
  packageFiles = (await collectFiles(packageRoot)).sort();
} catch (error) {
  console.error(`Production package check failed: cannot read ${packageRoot}`);
  console.error(error.message);
  process.exit(1);
}

const expectedSet = new Set(expectedFiles);
const packageSet = new Set(packageFiles);
for (const relativePath of expectedFiles) {
  if (!packageSet.has(relativePath)) problems.push(`package missing: ${relativePath}`);
}
for (const relativePath of packageFiles) {
  if (!expectedSet.has(relativePath)) problems.push(`package contains non-whitelisted file: ${relativePath}`);
  const segments = relativePath.split("/");
  if (segments.some((segment) => forbiddenPackageSegments.has(segment))) {
    problems.push(`package contains forbidden path: ${relativePath}`);
  }
}

const indexableHtmlFiles = packageFiles.filter((file) => file.endsWith(".html") && file !== "404.html");
if (indexableHtmlFiles.length !== 126) problems.push(`package indexable HTML count is ${indexableHtmlFiles.length}, expected 126`);

const canonicalUrls = [];
for (const relativePath of packageFiles) {
  const absolute = path.join(packageRoot, relativePath);
  const extension = path.extname(relativePath).toLowerCase();
  if (![".html", ".css", ".js", ".txt", ".xml", ".svg"].includes(extension)) continue;
  const text = await fs.readFile(absolute, "utf8");

  if (text.includes(retiredOrigin)) problems.push(`${relativePath}: contains retired GitHub Pages origin`);
  if (/-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/.test(text)) problems.push(`${relativePath}: contains a private key marker`);
  if (/AKIA[0-9A-Z]{16}/.test(text)) problems.push(`${relativePath}: contains an AWS-style access key`);
  if (/(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[:=]\s*["'][^"']{8,}["']/i.test(text)) {
    problems.push(`${relativePath}: contains a possible embedded secret`);
  }

  if (extension !== ".html") continue;
  for (const tag of text.match(/<(?:a|link|script|img)\b[^>]*>/gi) ?? []) {
    const reference = attribute(tag, tag.startsWith("<script") || tag.startsWith("<img") ? "src" : "href");
    const target = resolveLocalReference(relativePath, reference);
    if (!target || target.endsWith("/")) continue;
    if (!packageSet.has(target)) problems.push(`${relativePath}: missing local target ${target}`);
  }

  if (relativePath === "404.html") continue;
  const expectedUrl = relativePath === "index.html" ? `${productionOrigin}/` : `${productionOrigin}/${relativePath}`;
  const canonical = text.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1] ?? "";
  const ogUrl = text.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i)?.[1] ?? "";
  if (canonical !== expectedUrl) problems.push(`${relativePath}: canonical mismatch`);
  if (ogUrl !== expectedUrl) problems.push(`${relativePath}: og:url mismatch`);
  canonicalUrls.push(canonical);
}

if (new Set(canonicalUrls).size !== 126) problems.push("package canonical URLs are missing or duplicated");

const robots = await fs.readFile(path.join(packageRoot, "robots.txt"), "utf8");
if (!robots.includes("User-agent: *") || !robots.includes("Allow: /") || !robots.includes(`Sitemap: ${productionOrigin}/sitemap.xml`)) {
  problems.push("robots.txt production policy is incomplete");
}

const sitemap = await fs.readFile(path.join(packageRoot, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (sitemapUrls.length !== 126 || new Set(sitemapUrls).size !== 126) problems.push("sitemap.xml must contain 126 unique URLs");
for (const canonical of canonicalUrls) {
  if (!sitemapUrls.includes(canonical)) problems.push(`sitemap.xml missing canonical URL: ${canonical}`);
}

const notFound = await fs.readFile(path.join(packageRoot, "404.html"), "utf8");
if (!/<meta\s+name=["']robots["']\s+content=["']noindex,\s*nofollow["']/i.test(notFound)) problems.push("404.html missing noindex, nofollow");
for (const required of ["/assets/favicon.svg", "/assets/images/hero-teak-lifestyle.jpg", "/assets/logo-yuxi-horizontal.svg", "/script.js", 'href="/"']) {
  if (!notFound.includes(required)) problems.push(`404.html missing root-safe reference: ${required}`);
}

if (problems.length) {
  console.error("Production package check failed:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

const totalBytes = (await Promise.all(packageFiles.map(async (file) => (await fs.stat(path.join(packageRoot, file))).size))).reduce((sum, size) => sum + size, 0);
console.log(`Production package check passed: ${packageFiles.length} files, ${indexableHtmlFiles.length} indexable HTML pages, ${totalBytes} bytes.`);
