import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const detailFolders = ["articles", "knowledge/topics", "solutions/guides", "solutions/goods"];

function clean(value = "") {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function attr(html, tagPattern, name) {
  const tag = html.match(tagPattern)?.[0] || "";
  return tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1] || "";
}

function readBreadcrumbs(html, canonical, headline) {
  const nav = html.match(/<nav\b[^>]*class=["'][^"']*breadcrumb[^"']*["'][^>]*>([\s\S]*?)<\/nav>/i)?.[1] || "";
  const items = [];
  for (const match of nav.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = attr(match[0], /<a\b[^>]*>/i, "href");
    if (!href) continue;
    items.push({ name: clean(match[2]), item: new URL(href, canonical).href });
  }
  items.push({ name: headline, item: canonical });
  return items.map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    ...entry,
  }));
}

const files = detailFolders.flatMap((folder) => {
  const full = path.join(root, folder);
  return fs
    .readdirSync(full, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html") && entry.name !== "index.html")
    .map((entry) => path.join(full, entry.name));
});

let changed = 0;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  if (/application\/ld\+json/i.test(html)) continue;
  const headline = clean(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]);
  const canonical = attr(html, /<link\b[^>]*rel=["']canonical["'][^>]*>/i, "href");
  const description = attr(html, /<meta\b[^>]*name=["']description["'][^>]*>/i, "content");
  if (!headline || !canonical || !description) {
    throw new Error(`Missing structured-data source fields: ${path.relative(root, file)}`);
  }
  const graph = [
    {
      "@type": "Article",
      "@id": `${canonical}#article`,
      headline,
      description,
      mainEntityOfPage: canonical,
      inLanguage: "zh-CN",
      publisher: {
        "@type": "Organization",
        name: "杭州创始记科技发展有限公司",
        alternateName: "柚喜饰界",
        url: "https://www.zhengmu.cn/",
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: readBreadcrumbs(html, canonical, headline),
    },
  ];
  const jsonLd = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }, null, 2);
  const next = html.replace(
    /\s*<\/head>/i,
    `\n    <script type="application/ld+json">\n${jsonLd
      .split("\n")
      .map((line) => `      ${line}`)
      .join("\n")}\n    </script>\n  </head>`,
  );
  fs.writeFileSync(file, next, "utf8");
  changed += 1;
}

console.log(JSON.stringify({ detailPagesScanned: files.length, structuredDataAdded: changed }, null, 2));
