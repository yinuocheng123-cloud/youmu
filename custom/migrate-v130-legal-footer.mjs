import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sitemap = await fs.readFile(path.join(projectRoot, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
const legalMarkup = `
      <div class="footer-legal" aria-label="运营与备案信息">
        <span>运营主体：杭州创始记科技发展有限公司</span>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">浙ICP备2021004169号-2</a>
      </div>`;

if (urls.length !== 126 || new Set(urls.map((url) => url.href)).size !== 126) {
  throw new Error(`Expected 126 unique sitemap URLs, received ${urls.length}`);
}

const files = urls.map((url) => (url.pathname === "/" ? "index.html" : url.pathname.replace(/^\//, "")));
let changed = 0;
for (const relativePath of files) {
  const absolutePath = path.join(projectRoot, relativePath);
  const html = await fs.readFile(absolutePath, "utf8");
  if (html.includes("浙ICP备2021004169号-2") || html.includes("杭州创始记科技发展有限公司")) {
    throw new Error(`${relativePath}: legal footer already exists or is partially present`);
  }
  const footerCount = (html.match(/<footer\b/gi) ?? []).length;
  const closingCount = (html.match(/<\/footer>/gi) ?? []).length;
  if (footerCount !== 1 || closingCount !== 1) {
    throw new Error(`${relativePath}: expected exactly one footer, found ${footerCount}/${closingCount}`);
  }
  const updated = html.replace(/\s*<\/footer>/i, `${legalMarkup}\n    </footer>`);
  if (updated === html) throw new Error(`${relativePath}: footer insertion failed`);
  await fs.writeFile(absolutePath, updated, "utf8");
  changed += 1;
}

console.log(`v1.30 legal footer migration complete: ${changed}/${files.length} sitemap pages updated.`);
