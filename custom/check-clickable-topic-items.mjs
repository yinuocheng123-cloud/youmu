/*
文件说明：该文件用于检查首页柚木知识条目是否保持真实可点击。
功能说明：扫描首页知识卡片中的列表项，确认每个看起来像知识问题的条目都包含有效链接，并拦截旧口径重新出现在首页知识模块。

结构概览：
  第一部分：导入依赖与基础配置
  第二部分：首页知识模块链接检查
  第三部分：旧口径回潮检查
  第四部分：结果输出
*/

// ========== 第一部分：导入依赖与基础配置 ==========
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const homePath = path.join(projectRoot, "index.html");
const problems = [];

// ========== 第二部分：首页知识模块链接检查 ==========
async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function idsOf(html) {
  return new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]));
}

function extractHref(block) {
  return block.match(/\shref=["']([^"']+)["']/i)?.[1] ?? "";
}

const homeHtml = await fs.readFile(homePath, "utf8");
const knowledgeSection = homeHtml.match(/<section class="section" id="knowledge"[\s\S]*?<\/section>/i)?.[0] ?? "";

if (!knowledgeSection) {
  problems.push("index.html：未找到首页柚木知识模块");
} else {
  const cardMatches = [...knowledgeSection.matchAll(/<article class="knowledge-topic-card[\s\S]*?<\/article>/gi)];

  for (const [cardIndex, cardMatch] of cardMatches.entries()) {
    const listItemMatches = [...cardMatch[0].matchAll(/<li>([\s\S]*?)<\/li>/gi)];

    for (const itemMatch of listItemMatches) {
      const itemHtml = itemMatch[1];
      const itemText = itemHtml.replace(/<[^>]+>/g, "").trim();
      const href = extractHref(itemHtml);

      if (!href) {
        problems.push(`index.html：第 ${cardIndex + 1} 张知识卡存在不可点击条目“${itemText}”`);
        continue;
      }

      if (!href.startsWith("./knowledge/")) {
        problems.push(`index.html：知识条目“${itemText}”链接不在 knowledge 目录下：${href}`);
        continue;
      }

      const [filePart, hashPart = ""] = href.split("#");
      const targetPath = path.resolve(projectRoot, filePart.replace(/^\.\//, ""));

      if (!targetPath.startsWith(projectRoot)) {
        problems.push(`index.html：知识条目“${itemText}”链接越界：${href}`);
        continue;
      }

      if (!(await pathExists(targetPath))) {
        problems.push(`index.html：知识条目“${itemText}”指向不存在页面：${href}`);
        continue;
      }

      if (hashPart) {
        const targetHtml = await fs.readFile(targetPath, "utf8");
        if (!idsOf(targetHtml).has(decodeURIComponent(hashPart))) {
          problems.push(`index.html：知识条目“${itemText}”指向不存在锚点：${href}`);
        }
      }
    }
  }
}

// ========== 第三部分：旧口径回潮检查 ==========
const forbiddenHomeTopicTerms = [
  "庭院户外",
  "茶室会客",
  "家具好物",
  "下单",
  "价格",
  "阅读路径",
  "继续看",
  "下一步可以看",
];

for (const term of forbiddenHomeTopicTerms) {
  if (knowledgeSection.includes(term)) {
    problems.push(`index.html：首页柚木知识模块仍出现旧口径“${term}”`);
  }
}

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("知识条目可点击检查未通过：");

  for (const problem of problems) {
    console.error(`- ${problem}`);
  }

  process.exit(1);
}

console.log("知识条目可点击检查通过：首页知识卡片条目均已链接到真实页面。");
