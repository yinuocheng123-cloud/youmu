/*
文件说明：该文件用于检查“柚喜饰界”公开静态文件的 UTF-8 编码与乱码风险。
功能说明：扫描公开 HTML、CSS、JS 文件，确认 HTML 包含 UTF-8 声明，并拦截连续问号、替换字符和常见乱码片段。

结构概览：
  第一部分：导入依赖与检查范围
  第二部分：文件收集与读取
  第三部分：编码与乱码规则检查
  第四部分：结果输出
*/

// ========== 第一部分：导入依赖与检查范围 ==========
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TextDecoder } from "node:util";

const currentFile = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(currentFile), "..");

const publicEntries = [
  "index.html",
  "styles.css",
  "script.js",
  "data/site-content.js",
  "knowledge",
  "solutions",
  "vendors",
  "cases",
  "articles",
  "forms",
  "about",
];

const checkedExtensions = new Set([".html", ".css", ".js"]);
const replacementDecoder = new TextDecoder("utf-8", { fatal: true });
const htmlCharsetPattern = /<meta\s+charset=["']?UTF-8["']?\s*\/?>/i;
const repeatedQuestionPattern = /\?{6,}/;
const garbledPatterns = ["锟斤拷", "�"];

const problems = [];

// ========== 第二部分：文件收集与读取 ==========
function toPublicPath(filePath) {
  return path.relative(projectRoot, filePath).replaceAll(path.sep, "/");
}

async function collectFiles(entry) {
  const absoluteEntry = path.join(projectRoot, entry);
  const stat = await fs.stat(absoluteEntry);

  if (stat.isFile()) {
    return checkedExtensions.has(path.extname(absoluteEntry)) ? [absoluteEntry] : [];
  }

  const files = [];
  const children = await fs.readdir(absoluteEntry, { withFileTypes: true });

  for (const child of children) {
    const childPath = path.join(absoluteEntry, child.name);

    if (child.isDirectory()) {
      files.push(...(await collectFiles(path.relative(projectRoot, childPath))));
      continue;
    }

    if (child.isFile() && checkedExtensions.has(path.extname(child.name))) {
      files.push(childPath);
    }
  }

  return files;
}

async function readUtf8Strict(filePath) {
  const buffer = await fs.readFile(filePath);
  return replacementDecoder.decode(buffer);
}

const files = (await Promise.all(publicEntries.map(collectFiles))).flat().sort();

// ========== 第三部分：编码与乱码规则检查 ==========
for (const file of files) {
  const label = toPublicPath(file);
  let text = "";

  try {
    text = await readUtf8Strict(file);
  } catch (error) {
    problems.push(`${label}：无法按 UTF-8 严格解码，${error.message}`);
    continue;
  }

  if (path.extname(file) === ".html" && !htmlCharsetPattern.test(text)) {
    problems.push(`${label}：HTML 缺少 <meta charset="UTF-8">`);
  }

  if (repeatedQuestionPattern.test(text)) {
    problems.push(`${label}：发现 6 个及以上连续问号，疑似中文已被替换为 ??????`);
  }

  for (const pattern of garbledPatterns) {
    if (text.includes(pattern)) {
      problems.push(`${label}：发现明显乱码字符 ${pattern}`);
    }
  }
}

// ========== 第四部分：结果输出 ==========
if (problems.length > 0) {
  console.error("编码检查未通过：");

  for (const problem of problems) {
    console.error(`- ${problem}`);
  }

  process.exit(1);
}

console.log("编码检查通过：公开页面均为 UTF-8，未发现连续问号或明显乱码。");
