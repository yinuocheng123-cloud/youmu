import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const root = path.resolve(path.dirname(currentFile), "..");
const ignoredDirectories = new Set([".git", "_site", "custom"]);

async function collectHtmlFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectHtmlFiles(target)));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(target);
  }

  return files;
}

function updatePublicChrome(fragment) {
  return fragment
    .replaceAll("围绕柚木知识、好物内容、推荐厂商与社群交流，帮助爱好者更从容地理解柚木生活方式。", "围绕柚木认知、空间美学、日常生活与特色品牌，让关于柚木的长期价值被更清楚地看见。")
    .replaceAll("回到柚木知识", "返回探索柚木")
    .replaceAll("返回推荐厂商", "返回特色品牌")
    .replaceAll("柚木知识", "探索柚木")
    .replaceAll("柚木好物", "柚木生活")
    .replaceAll("推荐厂商", "特色品牌")
    .replaceAll("返回首页社群交流", "返回首页咨询柚喜")
    .replaceAll("社群交流", "咨询柚喜")
    .replaceAll("认识柚喜", "关于柚喜")
    .replaceAll("企业合作", "生态合作");
}

function migrateHtml(html) {
  const publicChromePatterns = [
    /<nav\b[^>]*class="[^"]*\bbreadcrumb\b[^"]*"[^>]*>[\s\S]*?<\/nav>/g,
    /<section\b[^>]*class="[^"]*\bcontent-cta\b[^"]*"[^>]*>[\s\S]*?<\/section>/g,
    /<footer\b[\s\S]*?<\/footer>/g,
  ];

  return publicChromePatterns.reduce(
    (result, pattern) => result.replace(pattern, updatePublicChrome),
    html,
  );
}

const htmlFiles = await collectHtmlFiles(root);
let updated = 0;

for (const file of htmlFiles) {
  const original = await fs.readFile(file, "utf8");
  const migrated = migrateHtml(original);
  if (migrated === original) continue;
  await fs.writeFile(file, migrated, "utf8");
  updated += 1;
}

console.log(`v1.30-alpha.1.1 公共界面迁移完成：扫描 ${htmlFiles.length} 个 HTML，更新 ${updated} 个页面。`);
