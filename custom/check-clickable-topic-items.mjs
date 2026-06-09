/*
文件说明：该文件用于检查首页知识条目是否保持真实可点击。
功能说明：扫描首页柚木知识卡片中的关键条目，确认每个看起来像问题的条目都链接到已有知识页，避免前台出现“能看不能点”的假入口。

结构概览：
  第一部分：导入依赖与基础配置
  第二部分：首页知识条目链接检查
  第三部分：知识卡片列表结构检查
  第四部分：结果输出
*/

// ========== 第一部分：导入依赖与基础配置 ==========
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");
const homePath = path.join(projectRoot, "index.html");

const requiredHomeTopicLinks = [
  ["什么是柚木", "./knowledge/topics/what-is-teak.html"],
  ["柚木为什么适合生活空间", "./knowledge/topics/why-teak-for-home.html"],
  ["庭院、阳台、茶室怎么入门", "./knowledge/topics/teak-home-spaces.html"],
  ["真假柚木怎么初步判断", "./knowledge/topics/teak-authenticity-basic.html"],
  ["为什么报价差很多", "./knowledge/topics/teak-price-difference.html"],
  ["下单前必须问清的细节", "./knowledge/topics/questions-before-vendor.html"],
  ["木纹与油性怎么看", "./knowledge/topics/teak-oil-stability.html"],
  ["拼板和结构有什么差别", "./knowledge/topics/teak-joinery-surface.html"],
  ["表面处理会影响什么", "./knowledge/topics/teak-joinery-surface.html"],
  ["户外空间怎么用柚木", "./knowledge/topics/outdoor-teak-judgement.html"],
  ["茶室会客如何保留温润感", "./knowledge/topics/tea-room-teak-space.html"],
  ["地板、家具和墙面怎么协调", "./knowledge/topics/whole-decoration-fit-home.html"],
  ["日常清洁怎么做", "./knowledge/topics/teak-daily-cleaning.html#daily-cleaning"],
  ["户外风化要不要处理", "./knowledge/topics/teak-daily-cleaning.html#outdoor-care"],
  ["上油和打磨的边界", "./knowledge/topics/teak-daily-cleaning.html#oil-care"],
  ["柚木适合南方潮湿环境吗", "./knowledge/topics/teak-bathroom-balcony.html"],
  ["柚木地板和普通木地板怎么比", "./knowledge/topics/teak-vs-common-wood-basic.html"],
  ["整装空间是不是一定很贵", "./knowledge/topics/is-teak-always-expensive.html"],
];

const problems = [];

// ========== 第二部分：首页知识条目链接检查 ==========
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function splitHref(href) {
  const [filePart, hashPart = ""] = href.split("#");
  return {
    filePart,
    anchorId: hashPart ? decodeURIComponent(hashPart) : "",
  };
}

async function hasAnchor(filePath, anchorId) {
  if (!anchorId) {
    return true;
  }

  const targetHtml = await fs.readFile(filePath, "utf8");
  const idPattern = new RegExp(`\\sid=["']${escapeRegExp(anchorId)}["']`, "u");
  return idPattern.test(targetHtml);
}

function hasExpectedAnchor(html, label, href) {
  const pattern = new RegExp(`<a\\b[^>]*href=["']${escapeRegExp(href)}["'][^>]*>\\s*${escapeRegExp(label)}\\s*<\\/a>`, "u");
  return pattern.test(html);
}

function hasBareListItem(html, label) {
  const pattern = new RegExp(`<li>\\s*${escapeRegExp(label)}\\s*<\\/li>`, "u");
  return pattern.test(html);
}

const homeHtml = await fs.readFile(homePath, "utf8");

for (const [label, href] of requiredHomeTopicLinks) {
  if (hasBareListItem(homeHtml, label)) {
    problems.push(`index.html：首页知识条目“${label}”仍是静态 li，没有链接`);
  }

  if (!hasExpectedAnchor(homeHtml, label, href)) {
    problems.push(`index.html：首页知识条目“${label}”缺少目标链接 ${href}`);
    continue;
  }

  const { filePart, anchorId } = splitHref(href);
  const targetPath = path.resolve(projectRoot, filePart.replace(/^\.\//, ""));

  if (!(await pathExists(targetPath))) {
    problems.push(`index.html：首页知识条目“${label}”指向的页面不存在：${href}`);
    continue;
  }

  if (!(await hasAnchor(targetPath, anchorId))) {
    problems.push(`index.html：首页知识条目“${label}”指向的锚点不存在：${href}`);
  }
}

// ========== 第三部分：知识卡片列表结构检查 ==========
const knowledgeSectionMatch = homeHtml.match(/<section class="section" id="knowledge"[\s\S]*?<\/section>/i);

if (!knowledgeSectionMatch) {
  problems.push("index.html：未找到首页柚木知识模块");
} else {
  const knowledgeSectionHtml = knowledgeSectionMatch[0];
  const cardMatches = [...knowledgeSectionHtml.matchAll(/<article class="knowledge-topic-card[\s\S]*?<\/article>/gi)];

  for (const [index, match] of cardMatches.entries()) {
    const cardHtml = match[0];
    const listItemMatches = [...cardHtml.matchAll(/<li>([\s\S]*?)<\/li>/gi)];

    for (const itemMatch of listItemMatches) {
      if (!/<a\b[^>]*href=["'][^"']+["'][^>]*>/i.test(itemMatch[1])) {
        problems.push(`index.html：首页第 ${index + 1} 张知识卡片存在不可点击条目：${itemMatch[1].replace(/<[^>]+>/g, "").trim()}`);
      }
    }
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
