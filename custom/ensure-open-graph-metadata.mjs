import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const productionOrigin = "https://www.zhengmu.cn";
const fallbackImage = `${productionOrigin}/assets/images/hero-teak-lifestyle.jpg`;
const publicEntries = [
  "index.html",
  "about",
  "articles",
  "cases",
  "cooperation",
  "forms",
  "knowledge",
  "solutions",
  "vendors",
];

async function collectHtml(entry) {
  const absolute = path.join(projectRoot, entry);
  const stat = await fs.stat(absolute);
  if (stat.isFile()) return entry.endsWith(".html") ? [entry] : [];

  const files = [];
  for (const child of await fs.readdir(absolute, { withFileTypes: true })) {
    const relative = path.join(entry, child.name).replaceAll(path.sep, "/");
    if (child.isDirectory()) files.push(...(await collectHtml(relative)));
    else if (child.isFile() && child.name.endsWith(".html")) files.push(relative);
  }
  return files;
}

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function encodeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");
}

function ogTypeFor(relativePath) {
  return /^(articles\/[^/]+|cases\/[^/]+|knowledge\/topics\/|solutions\/(?:goods|guides)\/)/.test(relativePath)
    ? "article"
    : "website";
}

const htmlFiles = (await Promise.all(publicEntries.map(collectHtml))).flat().sort();
let changedCount = 0;

for (const relativePath of htmlFiles) {
  const absolute = path.join(projectRoot, relativePath);
  const html = await fs.readFile(absolute, "utf8");
  if (/<meta\s+property=["']og:url["']/i.test(html)) continue;

  const title = decodeHtml(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1].trim() ?? "");
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)?.[1] ?? "";
  const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']\s*\/?\s*>/i);
  const description = decodeHtml(descriptionMatch?.[1].trim() ?? "");

  if (!title || !canonical || !description || !canonical.startsWith(`${productionOrigin}/`)) {
    throw new Error(`${relativePath}: cannot safely derive Open Graph metadata`);
  }

  const metadata = [
    `<meta property="og:type" content="${ogTypeFor(relativePath)}" />`,
    `<meta property="og:title" content="${encodeAttribute(title)}" />`,
    `<meta property="og:description" content="${encodeAttribute(description)}" />`,
    `<meta property="og:url" content="${encodeAttribute(canonical)}" />`,
    `<meta property="og:image" content="${fallbackImage}" />`,
    `<meta property="og:site_name" content="柚喜饰界" />`,
    `<meta property="og:locale" content="zh_CN" />`,
  ].map((line) => `    ${line}`).join("\n");

  const nextHtml = html.replace(descriptionMatch[0], `${descriptionMatch[0]}\n${metadata}`);
  if (nextHtml === html) throw new Error(`${relativePath}: metadata insertion did not change the document`);

  await fs.writeFile(absolute, nextHtml, "utf8");
  changedCount += 1;
}

console.log(`Open Graph metadata ready: ${htmlFiles.length} pages checked, ${changedCount} pages updated.`);
