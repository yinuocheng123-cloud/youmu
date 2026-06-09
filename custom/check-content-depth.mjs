/*
文件说明：该文件用于检查“柚喜饰界”公开内容页是否明显退回骨架状态。
功能说明：扫描知识页、方案页、延伸阅读页、厂商页、样板案例页和关于页，检查乱码、连续问号、正文中文长度和入口口径。

结构概览：
  第一部分：导入依赖与检查范围
  第二部分：文件收集与正文提取
  第三部分：内容深度与口径规则检查
  第四部分：结果输出
*/

// ========== 第一部分：导入依赖与检查范围 ==========
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");

const contentEntries = ["knowledge", "solutions", "articles", "vendors", "cases", "about"];
const requiredNavLabelGroups = [["认识柚喜"], ["柚木知识"], ["柚木好物"], ["推荐厂商"], ["社群交流"]];
const forbiddenTopNavLabels = ["咨询表单", "厂商申请", "关于我们"];
const forbiddenToneWords = [
  "厂家直销",
  "官方认证",
  "真实成交案例",
  "成功案例",
  "客户案例",
  "行业第一",
  "权威推荐",
  "放心购买",
  "立即购买",
  "预约成功",
  "提交成功，我们会联系您",
  "在线下单",
  "入驻成功",
];
const forbiddenStructureWords = [
  "下一步可以看",
  "下一步可以把",
  "读完后",
  "读完本页后",
  "先不要急着下结论",
  "更稳妥的做法",
  "逐项标记",
  "整理资料",
  "分成三栏",
  "沟通清单",
  "待确认事项",
  "如何使用本页",
  "本页可以帮助你",
  "不要停留在阅读本身",
  "用同一套问题去看",
  "阅读正文",
  "使用边界",
  "延伸阅读的使用方式",
  "复核提醒",
  "案例展示框架",
  "展示框架",
  "样板说明",
  "授权边界",
  "展示框架的作用",
];
const garbledPatterns = [/\?{6,}/, /锟斤拷/, /�/, /鏌/, /鍜/, /鐭/, /妗/, /绋/, /闂/, /閿/];
const allowedNoticePhrases = [
  "当前为样板案例，用于展示未来真实案例页的内容组织方式，非真实成交案例。真实案例上线前需取得图片、文字和客户授权。",
];

const minChineseChars = {
  knowledgeDetail: 1200,
  solutionDetail: 1200,
  articleDetail: 650,
  vendorOrCaseOrAbout: 350,
  index: 350,
};

const problems = [];

// ========== 第二部分：文件收集与正文提取 ==========
function toPublicPath(filePath) {
  return path.relative(projectRoot, filePath).replaceAll(path.sep, "/");
}

async function collectHtmlFiles(entry) {
  const absoluteEntry = path.join(projectRoot, entry);
  const stat = await fs.stat(absoluteEntry);

  if (stat.isFile()) {
    return absoluteEntry.endsWith(".html") ? [absoluteEntry] : [];
  }

  const files = [];
  const children = await fs.readdir(absoluteEntry, { withFileTypes: true });

  for (const child of children) {
    const childPath = path.join(absoluteEntry, child.name);

    if (child.isDirectory()) {
      files.push(...(await collectHtmlFiles(path.relative(projectRoot, childPath))));
      continue;
    }

    if (child.isFile() && child.name.endsWith(".html")) {
      files.push(childPath);
    }
  }

  return files;
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "");
}

function extractMainText(html) {
  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i);
  return stripTags(mainMatch ? mainMatch[0] : html);
}

function extractHeaderNav(html) {
  const headerMatch = html.match(/<header[\s\S]*?<\/header>/i);

  if (!headerMatch) {
    return "";
  }

  const headerHtml = headerMatch[0];
  const desktopNavMatch = headerHtml.match(/<nav[^>]*class="[^"]*\bdesktop-nav\b[^"]*"[\s\S]*?<\/nav>/i);
  const fallbackNavMatch = headerHtml.match(/<nav[\s\S]*?<\/nav>/i);

  return stripTags(desktopNavMatch ? desktopNavMatch[0] : fallbackNavMatch ? fallbackNavMatch[0] : headerHtml);
}

function countChineseChars(text) {
  return (text.match(/[\u4e00-\u9fff]/g) || []).length;
}

function requiredMinimum(publicPath) {
  if (publicPath.endsWith("/index.html")) {
    if (publicPath.startsWith("vendors/") || publicPath.startsWith("cases/") || publicPath.startsWith("about/")) {
      return minChineseChars.vendorOrCaseOrAbout;
    }

    return minChineseChars.index;
  }

  if (publicPath.startsWith("knowledge/")) {
    return minChineseChars.knowledgeDetail;
  }

  if (publicPath.startsWith("solutions/")) {
    return minChineseChars.solutionDetail;
  }

  if (publicPath.startsWith("articles/")) {
    return minChineseChars.articleDetail;
  }

  return minChineseChars.vendorOrCaseOrAbout;
}

// ========== 第三部分：内容深度与口径规则检查 ==========
const htmlFiles = (await Promise.all(contentEntries.map(collectHtmlFiles))).flat().sort();

for (const file of htmlFiles) {
  const publicPath = toPublicPath(file);
  const html = await fs.readFile(file, "utf8");
  const mainText = extractMainText(html);
  const navText = extractHeaderNav(html);
  const toneText = allowedNoticePhrases.reduce((text, phrase) => text.replaceAll(phrase, ""), html);
  const chineseCount = countChineseChars(mainText);
  const minimum = requiredMinimum(publicPath);

  for (const pattern of garbledPatterns) {
    if (pattern.test(html)) {
      problems.push(`${publicPath}：发现连续问号或明显乱码片段 ${pattern}`);
    }
  }

  if (chineseCount < minimum) {
    problems.push(`${publicPath}：正文中文字符数 ${chineseCount}，低于建议值 ${minimum}`);
  }

  for (const labels of requiredNavLabelGroups) {
    if (!labels.some((label) => navText.includes(label))) {
      problems.push(`${publicPath}：内容页主导航缺少 ${labels.join(" 或 ")}`);
    }
  }

  for (const label of forbiddenTopNavLabels) {
    if (navText.includes(label)) {
      problems.push(`${publicPath}：内容页主导航不应出现 ${label}`);
    }
  }

  for (const word of forbiddenToneWords) {
    if (toneText.includes(word)) {
      problems.push(`${publicPath}：发现禁止或高风险表达 ${word}`);
    }
  }

  for (const word of forbiddenStructureWords) {
    if (toneText.includes(word)) {
      problems.push(`${publicPath}：发现说明书式结构或长说明表达 ${word}`);
    }
  }
}

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("内容深度检查未通过：");

  for (const problem of problems) {
    console.error(`- ${problem}`);
  }

  process.exit(1);
}

console.log("内容深度检查通过：未发现明显骨架页、乱码页或过短详情页。");
