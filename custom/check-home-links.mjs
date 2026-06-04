/*
文件说明：该文件用于检查“柚喜饰界”首页链接与锚点是否闭环。
功能说明：读取 index.html，检查空链接、无效锚点、可疑本地页面链接，并输出检查结果。

结构概览：
  第一部分：导入依赖与读取文件
  第二部分：提取 id 与 href
  第三部分：执行链接规则检查
  第四部分：输出检查结果
*/

// ========== 第一部分：导入依赖与读取文件 ==========
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const indexPath = path.join(projectRoot, "index.html");
const html = await fs.readFile(indexPath, "utf8");

// ========== 第二部分：提取 id 与 href ==========
const idMatches = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
const hrefMatches = [...html.matchAll(/\shref=["']([^"']*)["']/g)].map((match) => match[1]);
const ids = new Set(idMatches);

const allowedExternalProtocols = /^(https?:|mailto:|tel:)/i;
const allowedResourcePaths = /^\.\/(assets\/|styles\.css$)/i;

// ========== 第三部分：执行链接规则检查 ==========
const problems = [];

for (const href of hrefMatches) {
  if (href === "" || href === "#" || href.toLowerCase() === "javascript:void(0)") {
    problems.push(`空链接或无效链接：${href || "(empty)"}`);
    continue;
  }

  if (href.startsWith("#")) {
    const targetId = decodeURIComponent(href.slice(1));

    if (!ids.has(targetId)) {
      problems.push(`锚点不存在：${href}`);
    }

    continue;
  }

  if (allowedExternalProtocols.test(href) || allowedResourcePaths.test(href)) {
    continue;
  }

  problems.push(`可疑本地页面链接：${href}`);
}

// ========== 第四部分：输出检查结果 ==========
if (problems.length > 0) {
  console.error("首页链接检查未通过：");
  for (const problem of problems) {
    console.error(`- ${problem}`);
  }
  process.exit(1);
}

console.log(`首页链接检查通过：共检查 ${hrefMatches.length} 个 href，${ids.size} 个页面 id。`);
