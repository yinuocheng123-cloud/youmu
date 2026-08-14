/* v1.31 品牌架构、公开页面与 SEO 保护检查。 */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const problems = [];

async function collect(directory) {
  const result = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if ([".git", "_site", "custom", "release"].includes(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await collect(absolute)));
    if (entry.isFile() && entry.name.endsWith(".html")) result.push(absolute);
  }
  return result;
}

function match(html, expression) {
  return html.match(expression)?.[1]?.trim() ?? "";
}

const htmlFiles = await collect(root);
let indexable = 0;
const canonicals = new Set();

for (const file of htmlFiles) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const html = await fs.readFile(file, "utf8");
  const title = match(html, /<title>([\s\S]*?)<\/title>/i);
  const description = match(html, /<meta\s+name="description"\s+content="([^"]*)"/i);
  const canonical = match(html, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const ogUrl = match(html, /<meta\s+property="og:url"\s+content="([^"]*)"/i);
  const noindex = /<meta\s+name="robots"[^>]*noindex/i.test(html);

  if (!title) problems.push(`${relative}：缺少title`);
  if (relative === "404.html") {
    if (!noindex) problems.push("404.html：必须保持noindex");
    if (!html.includes('href="/"')) problems.push("404.html：缺少生产根路径首页入口");
    continue;
  }

  indexable += 1;
  if (!description) problems.push(`${relative}：缺少description`);
  if (!canonical) problems.push(`${relative}：缺少canonical`);
  if (!ogUrl) problems.push(`${relative}：缺少og:url`);
  if (canonical && ogUrl && canonical !== ogUrl) problems.push(`${relative}：canonical与og:url不一致`);
  if (canonical) {
    if (canonicals.has(canonical)) problems.push(`${relative}：canonical重复 ${canonical}`);
    canonicals.add(canonical);
  }
  if (html.includes("yinuocheng123-cloud.github.io/youmu")) problems.push(`${relative}：仍包含旧GitHub Pages生产地址`);
}

const expectedIdentity = new Map([
  ["index.html", ["发现柚木之美", "为什么是柚木", "特色品牌与生态合作"]],
  ["knowledge/index.html", ["探索柚木", "按主题查找"]],
  ["cases/index.html", ["柚木美学", "空间灵感参考"]],
  ["solutions/index.html", ["柚木生活", "家具日常", "老木与收藏"]],
  ["vendors/index.html", ["特色品牌", "不代表柚喜饰界认证、推荐、保证或交易担保"]],
  ["cooperation/index.html", ["生态合作", "品牌与企业", "设计师", "内容创作者"]],
]);

for (const [relative, required] of expectedIdentity) {
  const html = await fs.readFile(path.join(root, relative), "utf8");
  for (const text of required) if (!html.includes(text)) problems.push(`${relative}：缺少v1.31定位表达“${text}”`);
}

const sitemap = await fs.readFile(path.join(root, "sitemap.xml"), "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
if (sitemapUrls.length !== 126) problems.push(`sitemap应为126个URL，实际${sitemapUrls.length}个`);
for (const canonical of canonicals) if (!sitemapUrls.includes(canonical)) problems.push(`sitemap缺少 ${canonical}`);

const robots = await fs.readFile(path.join(root, "robots.txt"), "utf8");
if (/Disallow:\s*\//i.test(robots)) problems.push("robots.txt：禁止了全站抓取");
if (!robots.includes("Sitemap: https://www.zhengmu.cn/sitemap.xml")) problems.push("robots.txt：缺少正式sitemap地址");

if (htmlFiles.length !== 127) problems.push(`HTML应为127个，实际${htmlFiles.length}个`);
if (indexable !== 126) problems.push(`可索引页面应为126个，实际${indexable}个`);
if (canonicals.size !== 126) problems.push(`唯一canonical应为126个，实际${canonicals.size}个`);

if (problems.length) {
  console.error("v1.31正式发布预检未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("v1.31正式发布预检通过：127个HTML、126个SEO页面、五栏目定位及保护项均符合要求。");
