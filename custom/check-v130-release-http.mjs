import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { packageDirectory, packageName } from "./production-package-config.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageRoot = path.join(projectRoot, packageDirectory, packageName);
const localOrigin = process.argv.find((value) => value.startsWith("http://")) ?? "http://127.0.0.1:8090";
const errors = [];

const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const sitemap = await fs.readFile(path.join(packageRoot, "sitemap.xml"), "utf8");
const productionUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
let sitemapPagesPassed = 0;

for (const productionUrl of productionUrls) {
  const pathname = new URL(productionUrl).pathname;
  const response = await fetch(`${localOrigin}${pathname}`, { redirect: "manual" });
  if (response.status !== 200) {
    errors.push(`${pathname}: HTTP ${response.status}, expected 200`);
    continue;
  }
  const body = Buffer.from(await response.arrayBuffer());
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\//, "");
  const expected = await fs.readFile(path.join(packageRoot, relative));
  if (hash(body) !== hash(expected)) {
    errors.push(`${pathname}: served bytes differ from release package`);
    continue;
  }
  sitemapPagesPassed += 1;
}

const assets = [
  "/styles.css",
  "/script.js",
  "/data/site-content.js",
  "/assets/favicon.svg",
  "/assets/logo-yuxi-horizontal.svg",
  "/assets/wecom-qr.jpg",
  "/assets/official-account-qr.jpg",
  "/assets/images/hero-teak-lifestyle.jpg",
  "/robots.txt",
  "/sitemap.xml",
];
let assetsPassed = 0;
for (const pathname of assets) {
  const response = await fetch(`${localOrigin}${pathname}`);
  if (response.status !== 200 || !(await response.arrayBuffer()).byteLength) errors.push(`${pathname}: asset HTTP/empty failure`);
  else assetsPassed += 1;
}

const normalDirectories = ["/knowledge/", "/cases/", "/solutions/", "/vendors/", "/cooperation/"];
let normalDirectoriesPassed = 0;
for (const pathname of normalDirectories) {
  const response = await fetch(`${localOrigin}${pathname}`);
  if (response.status !== 200) errors.push(`${pathname}: HTTP ${response.status}, expected 200`);
  else normalDirectoriesPassed += 1;
}

const missingPaths = [
  "/this-page-does-not-exist",
  "/missing-document.html",
  "/missing-directory/",
  "/Knowledge/",
  "/articles/retired-old-path.html",
];
let real404Passed = 0;
const expected404 = await fs.readFile(path.join(packageRoot, "404.html"));
for (const pathname of missingPaths) {
  const response = await fetch(`${localOrigin}${pathname}`);
  const body = Buffer.from(await response.arrayBuffer());
  if (response.status !== 404 || hash(body) !== hash(expected404)) errors.push(`${pathname}: expected real 404 with packaged 404.html`);
  else real404Passed += 1;
}

const result = {
  status: errors.length ? "FAIL" : "PASS",
  localOrigin,
  sitemapPages: productionUrls.length,
  sitemapPagesPassed,
  assetsChecked: assets.length,
  assetsPassed,
  normalDirectoriesChecked: normalDirectories.length,
  normalDirectoriesPassed,
  real404PathsChecked: missingPaths.length,
  real404Passed,
  errors,
};

if (process.argv.includes("--write-json")) {
  await fs.writeFile(path.join(projectRoot, "custom", "v130-release-http-audit.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
}
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
