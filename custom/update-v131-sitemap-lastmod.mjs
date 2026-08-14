import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const releaseDate = "2026-08-14";
const changedHtml = execFileSync("git", ["diff", "--name-only", "--", "*.html"], {
  cwd: root,
  encoding: "utf8",
})
  .split(/\r?\n/)
  .map((entry) => entry.trim().replaceAll("\\", "/"))
  .filter((entry) => entry.endsWith(".html") && entry !== "404.html");

let sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
let updated = 0;
for (const relative of changedHtml) {
  const url = relative === "index.html" ? "https://www.zhengmu.cn/" : `https://www.zhengmu.cn/${relative}`;
  const escaped = url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(<loc>${escaped}<\\/loc><lastmod>)[^<]+(<\\/lastmod>)`);
  if (!pattern.test(sitemap)) throw new Error(`Changed public page missing from sitemap: ${relative}`);
  sitemap = sitemap.replace(pattern, `$1${releaseDate}$2`);
  updated += 1;
}

fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap, "utf8");
console.log(JSON.stringify({ releaseDate, changedPageLastmodsUpdated: updated }, null, 2));
