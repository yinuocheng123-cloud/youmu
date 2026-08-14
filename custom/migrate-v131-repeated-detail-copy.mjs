import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const exactParagraphs = [
  "第一，确认使用空间和环境条件，例如室内、半户外、潮湿区、日晒区或高频使用区。第二，确认材料表达是否清楚，包括树种、结构、表面处理和维护建议。第三，确认尺寸、搭配和动线，不要只看单品本身。第四，确认具体还需要哪些说明。第五，确认服务说明，不把资料展示误解成承诺。",
  "你可以从具体空间的使用需求开始判断；选择产品和服务时，仍需核对产品资料、合同、交付和售后说明。",
  "光照、湿度和清洁习惯都会让柚木逐渐变化。轻微色差、光泽变化和使用痕迹通常属于正常现象，具体仍要结合材料状态判断。",
  "柚木可以用于东方院落或现代公寓，也能和棉麻、石材、藤编、金属或玻璃一起搭配。",
  "判断时，可以先看使用环境，再看材料状态、表面处理、维护方式和售后说明。没有解释清楚的地方，可以留到沟通时继续问清。",
  "判断柚木时，颜色、产地、结构、表面处理、使用环境和维护方式要结合起来看，单独一项不能说明全部情况。",
  "如果继续查看特色品牌资料，也建议把产品说明、服务范围、合同条款和售后责任放在一起确认。",
  "如果继续查看品牌资料，也建议把产品说明、服务范围、合同条款和售后责任放在一起确认。",
  "继续比较资料时，可以把问题拆成三层：第一层看空间是否适合，第二层看材料、规格、结构和表面处理是否说清楚，第三层看测量、安装、维护、售后和服务区域由谁负责。这样做的好处，是把“喜欢这个感觉”变成“知道还要确认什么”。",
  "和不同企业沟通时，可以围绕适用空间、材料做法、交付范围和维护责任比较回答质量。只停留在风格形容和图片展示的内容，更适合作为灵感参考。",
];

const targetRoots = ["knowledge/topics", "solutions/guides", "solutions/goods", "solutions"];
const files = targetRoots.flatMap((folder) => {
  const full = path.join(root, folder);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => path.join(full, entry.name));
});

let changedFiles = 0;
let removedParagraphs = 0;
for (const file of files) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;
  for (const paragraph of exactParagraphs) {
    const escaped = paragraph.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\s*<p>${escaped}<\\/p>`, "g");
    after = after.replace(pattern, () => {
      removedParagraphs += 1;
      return "";
    });
  }
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changedFiles += 1;
  }
}

const articleDir = path.join(root, "articles");
for (const name of fs.readdirSync(articleDir)) {
  if (!name.endsWith(".html")) continue;
  const file = path.join(articleDir, name);
  const before = fs.readFileSync(file, "utf8");
  const after = before.replace("更多资料会随内容持续完善。", "继续查看相关柚木知识与使用参考。");
  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    changedFiles += 1;
  }
}

console.log(JSON.stringify({ changedFiles, removedParagraphs }, null, 2));
