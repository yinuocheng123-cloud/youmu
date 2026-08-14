import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const pages = {
  "knowledge/teak-basics.html": {
    sectionTitle: "先回答这五个入门问题",
    title: "柚木入门｜基础知识与常见用途｜柚喜饰界",
    description: "了解柚木是什么、常见用途、与普通木材的差异，以及买前需要弄清的基础问题。",
  },
  "knowledge/teak-material-craft.html": {
    sectionTitle: "材料和工艺从哪里看",
    title: "柚木材质与工艺｜含油性、干燥与表面处理｜柚喜饰界",
    description: "了解柚木含油性、干燥、拼接、结构、表面处理和颜色变化等材质与工艺问题。",
  },
  "knowledge/teak-buying-guide.html": {
    sectionTitle: "买之前先问清什么",
    title: "柚木选购避坑｜报价、材料与商家沟通｜柚喜饰界",
    description: "从材料说明、报价差异、图片真实性和服务范围入手，整理购买柚木前需要确认的问题。",
  },
  "knowledge/teak-space-use.html": {
    sectionTitle: "不同空间怎么判断",
    title: "柚木空间应用｜地板、整装、茶室与户外｜柚喜饰界",
    description: "查看柚木用于地板、整装、茶室、家具和户外空间时需要考虑的环境与维护条件。",
  },
  "knowledge/teak-care.html": {
    sectionTitle: "使用后怎么清洁和维护",
    title: "柚木保养维护｜清洁、变色与户外使用｜柚喜饰界",
    description: "了解柚木家具、地板和户外用品的清洁、颜色变化、日晒防护与日常维护。",
  },
  "knowledge/teak-faq.html": {
    sectionTitle: "大家常问的五个问题",
    title: "柚木常见问题｜价格、家庭使用与品牌选择｜柚喜饰界",
    description: "回答柚木价格、家庭使用、潮湿空间、木材比较和品牌选择等常见问题。",
  },
};

function replaceOnce(source, expression, replacement, label) {
  const matches = source.match(expression);
  if (!matches) throw new Error(`${label}: expected content not found`);
  const updated = source.replace(expression, replacement);
  if (updated === source) throw new Error(`${label}: replacement made no change`);
  return updated;
}

for (const [relative, config] of Object.entries(pages)) {
  const absolute = path.join(root, relative);
  let html = await fs.readFile(absolute, "utf8");
  const relatedStart = html.indexOf('<section class="related-links">');
  const relatedEnd = html.indexOf("</section>", relatedStart) + "</section>".length;
  const ctaStart = html.indexOf('<section class="content-cta">', relatedEnd);
  const ctaEnd = html.indexOf("</section>", ctaStart) + "</section>".length;
  if ([relatedStart, relatedEnd, ctaStart, ctaEnd].some((value) => value < 0)) {
    throw new Error(`${relative}: expected channel sections not found`);
  }

  const related = replaceOnce(
    html.slice(relatedStart, relatedEnd),
    /<h2>[^]*?<\/h2>/,
    `<h2>${config.sectionTitle}</h2>`,
    `${relative} section heading`,
  );
  const cta = `        <section class="content-cta knowledge-channel-cta">\n` +
    `          <a class="btn btn-primary" href="index.html">查看全部柚木知识</a>\n` +
    `          <a class="btn btn-secondary" href="../index.html#wechat">咨询柚木问题</a>\n` +
    `        </section>`;
  html = `${html.slice(0, relatedStart)}${related}\n${cta}${html.slice(ctaEnd)}`;

  html = replaceOnce(html, /<title>[^]*?<\/title>/, `<title>${config.title}</title>`, `${relative} title`);
  html = replaceOnce(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${config.description}" />`,
    `${relative} description`,
  );
  html = replaceOnce(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${config.title}" />`,
    `${relative} og:title`,
  );
  html = replaceOnce(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${config.description}" />`,
    `${relative} og:description`,
  );
  html = html.replace(
    "知识分类页整理了五条以上可点击阅读入口。",
    "柚木知识与使用参考。",
  );
  await fs.writeFile(absolute, html, "utf8");
}

console.log(`Updated ${Object.keys(pages).length} knowledge channel pages.`);
