/*
文件说明：该文件用于预检“柚喜饰界”当前公开内容是否明显不适合正式发布。
功能说明：扫描公开页面与数据源中的乱码、高风险表达和明显占位内容，帮助发现上线阻塞项。

结构概览：
  第一部分：导入依赖与检查范围
  第二部分：文件收集与文本预处理
  第三部分：乱码、高风险词、占位词与入口路径检查
  第四部分：结果输出
*/

// ========== 第一部分：导入依赖与检查范围 ==========
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");

const checkEntries = [
  "index.html",
  "data/site-content.js",
  "knowledge",
  "solutions",
  "vendors",
  "cases",
  "articles",
  "forms",
  "about",
];

const textExtensions = new Set([".html", ".js"]);
const repeatedQuestionPattern = /\?{6,}/;
const garbledPatterns = [/閿熸枻鎷?/g, /锟/g, /鏌氬/g, /鐢宠/g, /绀剧兢/g];

const riskTerms = [
  "平台认证",
  "官方推荐",
  "交易担保",
  "真实入驻",
  "已入驻",
  "正式会员",
  "成功案例",
  "客户案例",
  "放心购买",
  "立即购买",
  "在线下单",
  "厂家直销",
  "行业第一",
  "权威推荐",
];

const placeholderTerms = [
  "TODO",
  "待替换",
  "示例二维码",
  "示例电话",
  "示例微信",
  "xxx",
  "XXX",
  "400-888-XXXX",
  "hello@yuxishi.com",
  "备案信息待补",
];

const consultEntryTerms = [
  "填写咨询表单",
  "提交咨询",
  "生成咨询摘要",
  "查看咨询表单",
  "填写咨询摘要",
  "咨询入口",
  "在线提交",
  "复制咨询摘要",
  "咨询摘要表",
];

const disclaimerAllowPhrases = [
  "不构成平台背书",
  "不构成认证",
  "不构成交易担保",
  "不代表平台认证",
  "不是交易担保",
  "不是平台担保",
  "不等于平台担保",
  "不承担交易担保",
  "不代表已有真实厂商入驻",
  "不代表真实入驻",
  "不代表已入驻",
  "是否为正式会员：否",
  "不是正式会员",
  "不写成功案例",
  "不是真实成交案例",
  "不含平台担保",
];

const problems = [];

// ========== 第二部分：文件收集与文本预处理 ==========
function toPublicPath(filePath) {
  return path.relative(projectRoot, filePath).replaceAll(path.sep, "/");
}

async function collectFiles(entry) {
  const absoluteEntry = path.join(projectRoot, entry);
  const stat = await fs.stat(absoluteEntry);

  if (stat.isFile()) {
    return textExtensions.has(path.extname(absoluteEntry)) ? [absoluteEntry] : [];
  }

  const files = [];
  const children = await fs.readdir(absoluteEntry, { withFileTypes: true });

  for (const child of children) {
    const childPath = path.join(absoluteEntry, child.name);

    if (child.isDirectory()) {
      files.push(...(await collectFiles(path.relative(projectRoot, childPath))));
      continue;
    }

    if (child.isFile() && textExtensions.has(path.extname(child.name))) {
      files.push(childPath);
    }
  }

  return files;
}

function normalizeText(text) {
  return text.replace(/\r\n/g, "\n");
}

function stripHtmlComments(text, ext) {
  if (ext !== ".html") {
    return text;
  }

  // 发布预检以公开可见内容为主，先忽略 HTML 注释，避免注释里的维护提示误伤。
  return text.replace(/<!--[\s\S]*?-->/g, "");
}

function splitIntoLines(text) {
  return text.split("\n");
}

function expectedAssetPrefix(label) {
  const depth = label.split("/").length - 1;

  if (depth <= 0) {
    return "./";
  }

  return "../".repeat(depth);
}

function hasSafeDisclaimerContext(line, term) {
  if (!line.includes(term)) {
    return false;
  }

  return disclaimerAllowPhrases.some((phrase) => line.includes(phrase));
}

const files = (await Promise.all(checkEntries.map(collectFiles))).flat().sort();

// ========== 第三部分：乱码、高风险词、占位词与入口路径检查 ==========
for (const file of files) {
  const ext = path.extname(file);
  const label = toPublicPath(file);
  const rawText = await fs.readFile(file, "utf8");
  const visibleText = stripHtmlComments(normalizeText(rawText), ext);
  const lines = splitIntoLines(visibleText);

  if (repeatedQuestionPattern.test(visibleText)) {
    problems.push(`${label}：发现 6 个及以上连续问号，疑似存在乱码或未修复内容`);
  }

  for (const pattern of garbledPatterns) {
    if (pattern.test(visibleText)) {
      problems.push(`${label}：发现明显乱码片段 ${pattern}`);
    }
  }

  for (const term of riskTerms) {
    lines.forEach((line, index) => {
      if (!line.includes(term)) {
        return;
      }

      if (hasSafeDisclaimerContext(line, term)) {
        return;
      }

      problems.push(`${label}:${index + 1}：发现高风险表达“${term}”`);
    });
  }

  for (const term of placeholderTerms) {
    lines.forEach((line, index) => {
      if (!line.includes(term)) {
        return;
      }

      problems.push(`${label}:${index + 1}：发现明显占位内容“${term}”`);
    });
  }

  if (ext === ".html") {
    const isSecondLevelHtml = label.includes("/");
    const isBackupContactPage = label === "forms/consult.html";

    if (isSecondLevelHtml) {
      const prefix = expectedAssetPrefix(label);
      const expectedStyles = `href="${prefix}styles.css"`;
      const expectedScript = `src="${prefix}script.js"`;

      if (!visibleText.includes(expectedStyles)) {
        problems.push(`${label}：页面未按目录层级引用 ${prefix}styles.css`);
      }

      if (!visibleText.includes(expectedScript)) {
        problems.push(`${label}：页面未按目录层级引用 ${prefix}script.js，移动端导航可能失效`);
      }

      if (
        (prefix !== "./" && visibleText.includes('src="./script.js"')) ||
        visibleText.includes('src="script.js"')
      ) {
        problems.push(`${label}：页面疑似使用了错误的 script.js 相对路径`);
      }
    }

    if (!isBackupContactPage && visibleText.includes("forms/consult.html")) {
      problems.push(`${label}：前台仍存在普通用户咨询页链接 forms/consult.html`);
    }

    if (!isBackupContactPage) {
      for (const term of consultEntryTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(`${label}:${index + 1}：发现普通用户咨询表入口文案“${term}”`);
          }
        });
      }
    }
  }
}

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("正式发布预检未通过：发现明显上线阻塞项。");

  for (const problem of problems) {
    console.error(`- ${problem}`);
  }

  process.exit(1);
}

console.log("正式发布预检通过：未发现乱码、高风险交易表达或明显占位内容。");
