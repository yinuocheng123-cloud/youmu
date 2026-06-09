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
  "平台担保",
  "正式入驻",
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
  "假电话",
  "假邮箱",
  "备案占位",
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

const mechanicalButtonTerms = [
  "开始阅读",
  "查看公开来源",
  "查看资料",
  "查看这一类",
  "进入这个方向",
  "阅读全文",
  "了解更多",
  "资料入口",
  "内容入口",
];

const knowledgeEditorialTerms = [
  "阅读提示",
  "适合谁看",
  "资料入口",
  "内容入口",
  "当前入口",
  "本轮",
  "版本",
  "已扩展",
  "已补充",
  "预检",
  "上线阻塞项",
  "咨询摘要表",
  "填写咨询表单",
];

const solutionEditorialTerms = [
  "阅读提示",
  "适合谁看",
  "资料入口",
  "内容入口",
  "查看资料",
  "进入这个方向",
  "阅读全文",
  "了解更多",
  "样板结构",
  "待补充说明",
  "按阅读顺序",
  "当前页面",
  "本轮",
  "版本",
  "已扩展",
  "已补充",
];

const vendorEditorialTerms = [
  "适合谁看",
  "阅读提示",
  "资料入口",
  "内容入口",
  "查看公开来源",
  "公开资料候选｜待联系确认",
  "是否已联系确认",
  "是否已图片授权",
  "是否为正式会员",
  "当前入口",
  "本轮",
  "版本",
  "已扩展",
  "已补充",
  "预检",
  "上线阻塞项",
  "页面内核",
  "会员站展示规则说明",
];

const frontendPatchTerms = [
  "从知识继续往哪里走",
  "什么是推荐厂商",
  "推荐厂商不是简单名单",
  "不是外部网站跳转",
  "站内企业会员资料页体系",
  "企业会员资料页体系",
  "用来整理企业介绍",
  "用户可以通过这个板块先了解一个企业资料页应当讲清哪些内容",
  "资料展示不代表平台认证，也不构成交易担保",
  "读完",
  "读完本页后",
  "继续往哪里走",
  "如何使用本页",
  "本页可以帮助你",
  "这个板块用于",
  "这个栏目用于",
  "读完基础问题",
  "继续看空间应用",
  "进入推荐厂商板块了解企业资料如何整理和核对",
  "企业资料如何整理和核对",
  "企业资料如何核对",
  "资料如何整理和核对",
  "栏目承接",
  "本栏目",
  "当前页面",
  "当前入口",
  "页面内核",
  "卡片本身",
  "模板",
  "注释",
  "占位",
  "好物方案",
  "V1.10",
  "V1.9",
  "已扩展",
  "已补充",
  "资料入口",
  "内容入口",
  "栏目介绍",
  "页面内核",
  "当前入口仍保留",
  "本轮",
  "样板结构参考",
  "结构参考",
  "待补充说明",
  "公开资料来源记录",
  "来源记录",
  "上线阻塞项",
  "版本",
  "预检",
  "这里保留必要入口",
  "当前预览版",
  "普通家具展示页",
  "未来重点方向",
  "待补充会员站样板",
  "咨询选购避坑",
  "柚木地板选购咨询",
  "会员站样板资料",
  "查看会员站样板",
  "样板展示方向",
  "外链集合",
  "平台背书",
  "页面按问题组织",
  "不会自动提交到后台",
  "企业企业资料页",
  "资料框架",
  "资料待确认方向",
  "后续按真实授权资料补充",
  "候选会员站",
];

const dataSourceForbiddenTerms = [
  "好物方案",
  "从知识继续往哪里走",
  "什么是推荐厂商",
  "推荐厂商不是简单名单",
  "不是外部网站跳转",
  "站内企业会员资料页体系",
  "企业会员资料页体系",
  "用来整理企业介绍",
  "用户可以通过这个板块先了解一个企业资料页应当讲清哪些内容",
  "资料展示不代表平台认证，也不构成交易担保",
  "读完",
  "读完本页后",
  "继续往哪里走",
  "如何使用本页",
  "本页可以帮助你",
  "这个板块用于",
  "这个栏目用于",
  "企业资料如何整理和核对",
  "资料如何整理和核对",
  "栏目承接",
  "本栏目",
  "当前页面",
  "当前入口",
  "页面内核",
  "资料入口",
  "内容入口",
  "阅读提示",
  "适合谁看",
  "资料框架",
  "资料待确认方向",
  "后续按真实授权资料补充",
  "候选会员站",
  "公开资料候选｜待联系确认",
  "咨询表单",
  "咨询摘要表",
];

const disclaimerAllowPhrases = [
  "不构成平台背书",
  "不构成认证",
  "不构成交易担保",
  "不构成平台担保",
  "也不构成交易担保",
  "不构成产品推荐、平台担保",
  "不构成购买承诺或平台担保",
  "不代表平台认证",
  "不是平台认证",
  "不是平台认证名单",
  "不代表平台担保",
  "不是交易担保",
  "也不是交易担保",
  "不是平台担保",
  "不等于平台担保",
  "不等于平台认证",
  "不等于平台认证或交易担保",
  "推荐展示不等于平台担保",
  "不承担交易担保",
  "不代表已有真实厂商入驻",
  "不代表真实入驻",
  "不代表已入驻",
  "不代表正式入驻",
  "申请展示不代表正式入驻",
  "会员展示不等于平台担保",
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

function collectNavBlocks(text) {
  const blocks = [];
  const navPattern = /<nav\b[^>]*class="[^"]*(?:main-nav|content-nav|mobile-nav)[^"]*"[\s\S]*?<\/nav>/g;
  for (const match of text.matchAll(navPattern)) {
    blocks.push(match[0]);
  }
  return blocks;
}

function stripTags(text) {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
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

  if (label === "data/site-content.js") {
    for (const term of dataSourceForbiddenTerms) {
      lines.forEach((line, index) => {
        if (line.includes(term)) {
          problems.push(`${label}:${index + 1}：数据源仍残留前台旧栏目或说明书式表达“${term}”`);
        }
      });
    }
  }

  if (ext === ".html") {
    const isSecondLevelHtml = label.includes("/");
    const isBackupContactPage = label === "forms/consult.html";
    const navBlocks = collectNavBlocks(visibleText);

    for (const navBlock of navBlocks) {
      const navText = stripTags(navBlock);
      if (navText.includes("会员站")) {
        problems.push(`${label}：主导航或移动导航仍使用“会员站”，应统一为“推荐厂商”`);
      }
    }

    if (!visibleText.includes("data-dropdown") || !visibleText.includes("data-dropdown-menu")) {
      problems.push(`${label}：公开页面缺少统一桌面下拉导航结构`);
    }

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

    if (!isBackupContactPage && label.startsWith("vendors/")) {
      for (const term of vendorEditorialTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(`${label}:${index + 1}：厂商区前台仍存在机械表达“${term}”`);
          }
        });
      }
    }

    if (!isBackupContactPage && label.startsWith("solutions/")) {
      for (const term of solutionEditorialTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(`${label}:${index + 1}：方案区前台仍存在机械表达“${term}”`);
          }
        });
      }
    }

    if (!isBackupContactPage && label.startsWith("knowledge/")) {
      for (const term of knowledgeEditorialTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(`${label}:${index + 1}：知识区前台仍存在程序化或内部说明表达“${term}”`);
          }
        });
      }
    }

    if (!isBackupContactPage) {
      for (const term of consultEntryTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(`${label}:${index + 1}：发现普通用户咨询表入口文案“${term}”`);
          }
        });
      }

      for (const term of mechanicalButtonTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(`${label}:${index + 1}：发现内页机械按钮或入口文案“${term}”`);
          }
        });
      }

      for (const term of frontendPatchTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(`${label}:${index + 1}：发现前台补丁式或版本化表达“${term}”`);
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
