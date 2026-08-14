import fs from "node:fs/promises";
import path from "node:path";

const file = path.join(process.cwd(), "vendors", "index.html");
let html = await fs.readFile(file, "utf8");

const title = "特色品牌｜柚木品牌资料与产品参考｜柚喜饰界";
const description = "查看柚木家具、地板、整装和空间服务相关品牌的公开资料；信息不足的字段不在主列表展示。";

html = html.replace(/<title>[^]*?<\/title>/, `<title>${title}</title>`);
html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`);
html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`);
html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`);

html = html.replace(
  "这里按家具、地板、整装和空间服务类别整理品牌公开资料。",
  "这里整理已能确认主营类别的柚木品牌资料。",
);
html = html.replace(
  "同一品牌可能涉及多个产品类别或服务类型，具体信息仍以品牌正式资料为准。",
  "主列表只展示已能确认的主营类别；具体产品和服务以品牌正式资料为准。",
);

const cards = [...html.matchAll(/<article class="vendor-card"[^>]*>[^]*?<\/article>/g)].map((match) => match[0]);
const cardsBefore = cards.length;
const incompleteCard = cards.find((card) => card.includes("<h3>上海庄信柚木</h3>"));
if (!incompleteCard) throw new Error("Incomplete vendor card not found");
html = html.replace(incompleteCard, "");
html = html.replace(/\s*<dl class="vendor-meta">[^]*?<\/dl>/g, "");
html = html.replace(/\s*<p class="vendor-status">[^]*?<\/p>/g, "");
const cardsAfter = [...html.matchAll(/<article class="vendor-card"[^>]*>[^]*?<\/article>/g)].length;
if (cardsBefore !== 6 || cardsAfter !== 5) throw new Error(`Unexpected vendor card count ${cardsBefore} -> ${cardsAfter}`);
if (html.includes("公开信息持续完善中")) throw new Error("Vendor placeholder text remains");

await fs.writeFile(file, html, "utf8");
console.log(`Vendor directory reduced from ${cardsBefore} to ${cardsAfter} primary cards; empty fields removed.`);
