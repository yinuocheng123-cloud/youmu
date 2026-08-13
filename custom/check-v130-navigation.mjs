/* 检查 v1.30 柚木品牌架构的全站导航一致性。 */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const problems = [];
const primaryLabels = ["探索柚木", "柚木美学", "柚木生活", "特色品牌", "生态合作"];
const oldLabels = ["认识柚喜", "柚木知识", "柚木好物", "推荐厂商", "社群交流", "先问清楚"];

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

function prefixFor(relativePath) {
  const depth = relativePath.split("/").length - 1;
  return depth === 0 ? "./" : "../".repeat(depth);
}

function textOf(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function hrefs(html) {
  return [...html.matchAll(/\shref\s*=\s*(["'])(.*?)\1/gi)].map((match) => match[2]);
}

function menuBlock(header, kind, label) {
  if (kind === "desktop") {
    const button = [...header.matchAll(/<button[^>]*>[\s\S]*?<\/button>\s*<div class="nav-dropdown-menu"[^>]*>([\s\S]*?)<\/div>/gi)]
      .find((match) => textOf(match[0]).includes(label));
    return button?.[1] ?? "";
  }
  const details = [...header.matchAll(/<details>[\s\S]*?<\/details>/gi)].find((match) => textOf(match[0]).startsWith(label));
  return details?.[0] ?? "";
}

const menus = [
  ["探索柚木", ["探索柚木首页", "初识柚木", "材质与工艺", "选购与判断", "使用与养护"], ["knowledge/index.html", "knowledge/teak-basics.html", "knowledge/teak-material-craft.html", "knowledge/teak-buying-guide.html", "knowledge/teak-care.html"]],
  ["柚木美学", ["柚木美学首页", "茶空间", "客厅与家具", "地面空间", "庭院户外", "整体木作"], ["cases/index.html", "solutions/tea-room.html", "solutions/furniture.html", "solutions/flooring.html", "solutions/outdoor.html", "solutions/whole-decoration.html"]],
  ["柚木生活", ["柚木生活首页", "家具日常", "地面生活", "空间木作", "户外生活", "老木与收藏", "文创器物"], ["solutions/index.html", "solutions/index.html#good-furniture", "solutions/index.html#good-flooring", "solutions/index.html#good-whole-decoration", "solutions/index.html#good-outdoor", "solutions/index.html#good-collection", "solutions/index.html#good-cultural"]],
];

const allHtml = await collect(root);
const standardPages = allHtml.filter((file) => path.relative(root, file).replaceAll("\\", "/") !== "404.html");

for (const file of standardPages) {
  const relativePath = path.relative(root, file).replaceAll("\\", "/");
  const html = await fs.readFile(file, "utf8");
  const header = html.match(/<header[\s\S]*?<\/header>/i)?.[0] ?? "";
  const headerText = textOf(header);
  const headerHrefs = hrefs(header);
  const prefix = prefixFor(relativePath);

  if (!header) {
    problems.push(`${relativePath}：缺少Header`);
    continue;
  }
  for (const label of primaryLabels) if (!headerText.includes(label)) problems.push(`${relativePath}：缺少一级导航“${label}”`);
  if (!headerText.includes("咨询柚喜")) problems.push(`${relativePath}：缺少“咨询柚喜”CTA`);
  for (const old of oldLabels) if (headerText.includes(old)) problems.push(`${relativePath}：Header仍包含旧导航“${old}”`);

  for (const [menuLabel, labels, targets] of menus) {
    for (const kind of ["desktop", "mobile"]) {
      const block = menuBlock(header, kind, menuLabel);
      const blockText = textOf(block);
      const blockHrefs = hrefs(block);
      if (!block) {
        problems.push(`${relativePath}：${kind}缺少“${menuLabel}”下拉`);
        continue;
      }
      for (const label of labels) if (!blockText.includes(label)) problems.push(`${relativePath}：${kind}“${menuLabel}”缺少“${label}”`);
      for (const target of targets.map((item) => `${prefix}${item}`)) if (!blockHrefs.includes(target)) problems.push(`${relativePath}：${kind}“${menuLabel}”缺少路径 ${target}`);
    }
  }

  for (const target of ["vendors/index.html", "cooperation/index.html"]) if (!headerHrefs.includes(`${prefix}${target}`)) problems.push(`${relativePath}：缺少单入口 ${prefix}${target}`);
  if (!headerHrefs.includes(`${prefix}index.html#wechat`)) problems.push(`${relativePath}：缺少咨询路径 ${prefix}index.html#wechat`);
}

const notFound = await fs.readFile(path.join(root, "404.html"), "utf8");
for (const label of [...primaryLabels, "咨询柚喜"]) if (!textOf(notFound).includes(label)) problems.push(`404.html：缺少品牌恢复入口“${label}”`);

if (allHtml.length !== 127) problems.push(`公开HTML应为127个，实际${allHtml.length}个`);
if (standardPages.length !== 126) problems.push(`标准导航页面应为126个，实际${standardPages.length}个`);

if (problems.length) {
  console.error("v1.30全站导航一致性检查未通过：");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("v1.30全站导航一致性检查通过：126个标准页面与404页均使用五栏目品牌架构。");
