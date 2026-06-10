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
  "cooperation",
];

const textExtensions = new Set([".html", ".js"]);
const repeatedQuestionPattern = /\?{6,}/;
const garbledPatterns = [/閿熸枻鎷?/g, /锟/g, /鏌氬/g, /鐢宠/g, /绀剧兢/g];

const riskTerms = [
  "已认证",
  "平台认证",
  "官方推荐",
  "平台背书",
  "交易担保",
  "真实合作",
  "真实入驻",
  "已入驻",
  "入驻企业",
  "正式会员",
  "成功案例",
  "客户案例",
  "放心购买",
  "立即购买",
  "在线下单",
  "厂家直销",
  "保证成交",
  "行业第一",
  "权威推荐",
  "平台担保",
  "正式入驻",
  "审核通过",
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
  "样板",
  "示例",
  "演示",
  "占位",
  "待补",
  "待确认",
  "建设中",
  "未来计划",
  "阅读路径",
  "继续阅读",
  "下一步可以看",
  "读完后",
  "资料框架",
  "展示框架",
  "审核",
  "人工确认",
  "会员站",
  "授权后上线",
  "沟通清单",
  "阅读底稿",
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
  "柚木柚木好物",
  "好物方案",
  "进入方案目录",
  "问问入门问题",
  "交流空间应用",
  "交流保养维护",
  "添加顾问提问",
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
  "待确认",
  "待补充",
  "后续按真实授权资料补充",
  "候选会员站",
  "下一步可以看",
  "下一步可以把",
  "先不要急着下结论",
  "更稳妥的做法",
  "逐项标记",
  "整理资料",
  "分成三栏",
  "沟通清单",
  "待确认事项",
  "自己仍然拿不出",
  "对照文章里的问题",
  "转化成后续",
  "不要停留在阅读本身",
  "用同一套问题去看",
  "阅读正文",
  "使用边界",
  "延伸阅读的使用方式",
  "复核提醒",
  "案例样板结构",
  "案例展示框架",
  "资料展示框架",
  "展示框架",
  "样板结构",
  "资料说明",
  "资料边界",
  "样板说明",
  "授权边界",
  "展示框架的作用",
  "站内企业会员资料页",
  "会员站申请页",
  "正式联系方式将在人工确认后补充",
  "正式联系方式待补",
  "人工核验",
  "资料核验",
  "核验人",
  "核验日期",
  "阅读底稿",
  "授权后上线",
  "真实资料确认后上线",
  "当前预览版",
  "预览版",
  "建设期",
  "公开资料候选",
  "公开资料候选品牌",
  "资料阅读",
  "Vendor Member Site",
  "Member Site",
];

const dataSourceForbiddenTerms = [
  "样板",
  "示例",
  "演示",
  "占位",
  "待补",
  "待确认",
  "建设中",
  "未来计划",
  "阅读路径",
  "继续阅读",
  "下一步可以看",
  "读完后",
  "资料框架",
  "展示框架",
  "审核",
  "人工确认",
  "会员站",
  "授权后上线",
  "沟通清单",
  "阅读底稿",
  "柚木柚木好物",
  "好物方案",
  "进入方案目录",
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
  "待确认",
  "待补充",
  "后续按真实授权资料补充",
  "候选会员站",
  "公开资料候选｜待联系确认",
  "咨询表单",
  "咨询摘要表",
  "站内企业会员资料页",
  "会员站申请页",
  "正式联系方式将在人工确认后补充",
  "正式联系方式待补",
  "人工核验",
  "资料核验",
  "核验人",
  "核验日期",
  "阅读底稿",
  "授权后上线",
  "真实资料确认后上线",
  "当前预览版",
  "预览版",
  "建设期",
  "公开资料候选",
  "公开资料候选品牌",
  "资料说明",
  "资料边界",
  "资料展示框架",
  "样板结构",
  "资料阅读",
  "Vendor Member Site",
  "Member Site",
];

const teakDailyCleaningForbiddenTerms = [
  "可以先放慢判断",
  "把自己正在看的产品、空间或商家页面拿出来",
  "整理成一小段文字",
  "把信息按几个方面",
  "已经确认、需要商家补充、自己仍然拿不准",
  "这样看文章不会停留在阅读本身",
  "带入后续交流要点",
  "如果后续要对比多个页面",
  "继续看",
];

const teakOriginForbiddenTerms = [
  "先把问题放回真实场景",
  "建立阅读顺序",
  "样板页或社群沟通",
  "沟通前的准备清单",
  "人工验收",
  "三类记录",
  "核验日期",
  "核验人",
  "阅读底稿",
];

const naturalLongformArticlePaths = new Set([
  "knowledge/topics/teak-daily-cleaning.html",
  "knowledge/topics/teak-origin-basic.html",
]);
const naturalLongformForbiddenTerms = ["本篇目录", "保养主题目录", "文章内目录"];
const goodThingsIndexPath = "solutions/index.html";
const requiredGoodThingsCategories = ["柚木家具", "柚木地板", "柚木整装", "柚木户外", "柚木收藏", "柚木文创"];
const requiredGoodThingsSectionIds = [
  "good-furniture",
  "good-flooring",
  "good-whole-decoration",
  "good-outdoor",
  "good-collection",
  "good-creative",
];
const minimumGoodThingsItemsPerSection = 12;
const minimumGoodThingsItemsTotal = 72;
const forbiddenGoodThingsIndexTerms = [
  "Teak Project Gallery",
  "柚木家具精选",
  "柚木地板精选",
  "柚木茶室精选",
  "柚木户外精选",
  "柚木收藏精选",
  "柚木文创精选",
  "精选库",
  "精选内容流",
  "五个应用场景",
  "方案目录",
  "项目判断",
  "资料框架",
  "好物方案",
  "good-tea-room",
  "从整装、地板、庭院、茶室到家具好物",
  "柚木不是孤立的产品标签",
  "先看空间需要解决什么",
  "再看材料和企业资料是否能支撑这个方向",
  "从好物到推荐厂商",
  "购买",
  "价格",
  "库存",
  "下单",
  "立即购买",
  "平台认证",
  "官方推荐",
  "已认证",
  "会员站",
  "审核",
];
const requiredGoodThingsDropdownLabels = [
  "柚木好物首页",
  "柚木家具",
  "柚木地板",
  "柚木整装",
  "柚木户外",
  "柚木收藏",
  "柚木文创",
];
const forbiddenGoodThingsDropdownLabels = ["庭院户外", "茶室会客", "家具好物", "柚木茶室空间"];
const requiredVendorPages = [
  "vendors/wachen-teak.html",
  "vendors/shanghai-zhuangxin-teak.html",
  "vendors/zhenzang-teak-life.html",
  "vendors/yuebaijia-teak-flooring.html",
  "vendors/xuelianhua-teak-furniture.html",
  "vendors/yixin-teak.html",
];
const vendorStrongFactTerms = [
  "案例数量",
  "工厂规模",
  "认证资质",
  "获奖信息",
  "合作客户",
  "厂家直销",
  "保证成交",
  "已认证",
  "审核通过",
];
const fakeContactPatterns = [
  /400-?888-?XXXX/i,
  /hello@yuxishi\.com/i,
  /1380{8}/,
  /1[3-9]0{9}/,
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
  "不构成平台认证或交易担保",
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

function shouldCheckFile(filePath) {
  const publicPath = toPublicPath(filePath);
  return path.extname(filePath) === ".html" || publicPath === "data/site-content.js";
}

async function collectFiles(entry) {
  const absoluteEntry = path.join(projectRoot, entry);
  const stat = await fs.stat(absoluteEntry);

  if (stat.isFile()) {
    return shouldCheckFile(absoluteEntry) ? [absoluteEntry] : [];
  }

  const files = [];
  const children = await fs.readdir(absoluteEntry, { withFileTypes: true });

  for (const child of children) {
    const childPath = path.join(absoluteEntry, child.name);

    if (child.isDirectory()) {
      files.push(...(await collectFiles(path.relative(projectRoot, childPath))));
      continue;
    }

    if (child.isFile() && shouldCheckFile(childPath)) {
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

function extractHeaderBlock(text) {
  return text.match(/<header[\s\S]*?<\/header>/i)?.[0] ?? "";
}

function extractGoodThingsDesktopMenu(text) {
  return (
    text.match(
      /<button[^>]*aria-controls="solutions-menu-\d+"[^>]*>\s*柚木好物\s*<\/button>\s*<div class="nav-dropdown-menu" id="solutions-menu-\d+" data-dropdown-menu>([\s\S]*?)<\/div>/i,
    )?.[1] ?? ""
  );
}

function extractGoodThingsMobileMenu(text) {
  return text.match(/<details>\s*<summary>\s*柚木好物\s*<\/summary>([\s\S]*?)<\/details>/i)?.[1] ?? "";
}

function expectedGoodThingsDropdownHrefs(publicPath) {
  const depth = publicPath.split("/").length - 1;
  const prefix = depth === 0 ? "./" : "../".repeat(depth);
  const baseHref = `${prefix}solutions/index.html`;
  return [
    baseHref,
    `${baseHref}#good-furniture`,
    `${baseHref}#good-flooring`,
    `${baseHref}#good-whole-decoration`,
    `${baseHref}#good-outdoor`,
    `${baseHref}#good-collection`,
    `${baseHref}#good-creative`,
  ];
}

function checkGoodThingsDropdown(label, menuLabel, block) {
  if (!block) {
    problems.push(`${label}：${menuLabel}缺少“柚木好物”下拉内容`);
    return;
  }

  const menuText = stripTags(block);
  const hrefs = [...block.matchAll(/\shref="([^"]+)"/g)].map((match) => match[1]);

  for (const item of requiredGoodThingsDropdownLabels) {
    if (!menuText.includes(item)) {
      problems.push(`${label}：${menuLabel}“柚木好物”下拉缺少“${item}”`);
    }
  }

  for (const item of forbiddenGoodThingsDropdownLabels) {
    if (menuText.includes(item)) {
      problems.push(`${label}：${menuLabel}“柚木好物”下拉仍出现旧项“${item}”`);
    }
  }

  if (menuText.includes("精选")) {
    problems.push(`${label}：${menuLabel}“柚木好物”下拉不应出现“精选”作为二级栏目名`);
  }

  for (const href of expectedGoodThingsDropdownHrefs(label)) {
    if (!hrefs.includes(href)) {
      problems.push(`${label}：${menuLabel}“柚木好物”下拉缺少路径 ${href}`);
    }
  }
}

function stripTags(text) {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

const files = (await Promise.all(checkEntries.map(collectFiles))).flat().sort();
const fileLabelSet = new Set(files.map(toPublicPath));

for (const vendorPage of requiredVendorPages) {
  if (!fileLabelSet.has(vendorPage)) {
    problems.push(`缺少 V1.16.1 推荐厂商资料页 ${vendorPage}`);
  }
}

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
    const headerBlock = extractHeaderBlock(visibleText);

    for (const navBlock of navBlocks) {
      const navText = stripTags(navBlock);
      if (navText.includes("会员站")) {
        problems.push(`${label}：主导航或移动导航仍使用“会员站”，应统一为“推荐厂商”`);
      }
    }

    checkGoodThingsDropdown(label, "桌面端", extractGoodThingsDesktopMenu(headerBlock));
    checkGoodThingsDropdown(label, "移动端", extractGoodThingsMobileMenu(headerBlock));

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

      if (requiredVendorPages.includes(label)) {
        if (!visibleText.includes("来源说明") && !visibleText.includes("公开资料来源")) {
          problems.push(`${label}：推荐厂商资料页缺少“来源说明”或“公开资料来源”`);
        }

        for (const term of vendorStrongFactTerms) {
          lines.forEach((line, index) => {
            if (line.includes(term) && !hasSafeDisclaimerContext(line, term)) {
              problems.push(`${label}:${index + 1}：推荐厂商资料页存在未经来源支撑的强事实风险词“${term}”`);
            }
          });
        }

        for (const pattern of fakeContactPatterns) {
          if (pattern.test(visibleText)) {
            problems.push(`${label}：推荐厂商资料页存在疑似虚假联系方式 ${pattern}`);
          }
        }
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

    if (label === goodThingsIndexPath) {
      for (const category of requiredGoodThingsCategories) {
        if (!visibleText.includes(category)) {
          problems.push(`${label}：柚木好物页缺少 V1.17.2 二级分类“${category}”`);
        }
      }

      if (
        /<section class="good-things-section good-things-stream-section" id="good-tea-room"/i.test(rawText)
        || /<h2>柚木茶室<\/h2>/i.test(rawText)
        || /href="#good-tea-room"/i.test(rawText)
      ) {
        problems.push(`${label}：柚木茶室仍被当作六大主分类之一，未完成并入柚木整装`);
      }

      const totalCardCount = countMatches(rawText, /class="good-item-card\b/g);
      if (totalCardCount < minimumGoodThingsItemsTotal) {
        problems.push(`${label}：柚木好物内容卡数量 ${totalCardCount}，少于要求的 ${minimumGoodThingsItemsTotal} 条`);
      }

      for (const sectionId of requiredGoodThingsSectionIds) {
        if (!rawText.includes(`id="${sectionId}"`)) {
          problems.push(`${label}：柚木好物页缺少内容分区 ${sectionId}`);
          continue;
        }

        const sectionPattern = new RegExp(
          `<section class="good-things-section good-things-stream-section" id="${sectionId}"[\\s\\S]*?<\\/section>`,
          "i",
        );
        const sectionMatch = rawText.match(sectionPattern);
        if (!sectionMatch) {
          problems.push(`${label}：无法解析内容分区 ${sectionId}`);
          continue;
        }

        const sectionCardCount = countMatches(sectionMatch[0], /class="good-item-card\b/g);
        if (sectionCardCount < minimumGoodThingsItemsPerSection) {
          problems.push(
            `${label}：内容分区 ${sectionId} 仅有 ${sectionCardCount} 条好物卡，少于要求的 ${minimumGoodThingsItemsPerSection} 条`,
          );
        }
      }

      for (const term of forbiddenGoodThingsIndexTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term) && !hasSafeDisclaimerContext(line, term)) {
            problems.push(`${label}:${index + 1}：柚木好物页仍存在旧方案页或交易化表达“${term}”`);
          }
        });
      }

      const mainText = stripTags(visibleText);
      if (/柚木好物[^。；\n]{0,30}方案/.test(mainText)) {
        problems.push(`${label}：柚木好物页仍把栏目定义为“方案”口径`);
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

    if (label === "knowledge/topics/teak-daily-cleaning.html") {
      for (const term of teakDailyCleaningForbiddenTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(`${label}:${index + 1}：保养主文档仍存在说明书式或拆分阅读表达“${term}”`);
          }
        });
      }
    }

    if (label === "knowledge/topics/teak-origin-basic.html") {
      for (const term of teakOriginForbiddenTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(`${label}:${index + 1}：产地基础文章仍存在内部阅读指导或核验话术“${term}”`);
          }
        });
      }
    }

    if (naturalLongformArticlePaths.has(label)) {
      for (const term of naturalLongformForbiddenTerms) {
        lines.forEach((line, index) => {
          if (line.includes(term)) {
            problems.push(`${label}:${index + 1}：自然长文体知识文章不应出现目录式阅读结构“${term}”`);
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
