import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function collectHtmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if ([".git", "_site", "custom"].includes(entry.name)) return [];
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectHtmlFiles(absolutePath);
    return entry.isFile() && entry.name.endsWith(".html") ? [absolutePath] : [];
  });
}

function buildDesktopNav(prefix) {
  return `<nav class="main-nav desktop-nav" aria-label="主导航">
        <a class="nav-link" href="${prefix}index.html">首页</a>
        <div class="nav-dropdown" data-dropdown>
          <button class="nav-link nav-dropdown-trigger" type="button" aria-expanded="false" aria-controls="explore-teak-menu" data-dropdown-trigger>
            探索柚木
          </button>
          <div class="nav-dropdown-menu" id="explore-teak-menu" data-dropdown-menu>
            <a href="${prefix}knowledge/index.html">探索柚木首页</a>
            <a href="${prefix}knowledge/teak-basics.html">初识柚木</a>
            <a href="${prefix}knowledge/teak-material-craft.html">材质与工艺</a>
            <a href="${prefix}knowledge/teak-buying-guide.html">选购与判断</a>
            <a href="${prefix}knowledge/teak-care.html">使用与养护</a>
          </div>
        </div>
        <div class="nav-dropdown" data-dropdown>
          <button class="nav-link nav-dropdown-trigger" type="button" aria-expanded="false" aria-controls="teak-aesthetics-menu" data-dropdown-trigger>
            柚木美学
          </button>
          <div class="nav-dropdown-menu" id="teak-aesthetics-menu" data-dropdown-menu>
            <a href="${prefix}cases/index.html">柚木美学首页</a>
            <a href="${prefix}solutions/tea-room.html">茶空间</a>
            <a href="${prefix}solutions/furniture.html">客厅与家具</a>
            <a href="${prefix}solutions/flooring.html">地面空间</a>
            <a href="${prefix}solutions/outdoor.html">庭院户外</a>
            <a href="${prefix}solutions/whole-decoration.html">整体木作</a>
          </div>
        </div>
        <div class="nav-dropdown" data-dropdown>
          <button class="nav-link nav-dropdown-trigger" type="button" aria-expanded="false" aria-controls="teak-life-menu" data-dropdown-trigger>
            柚木生活
          </button>
          <div class="nav-dropdown-menu" id="teak-life-menu" data-dropdown-menu>
            <a href="${prefix}solutions/index.html">柚木生活首页</a>
            <a href="${prefix}solutions/index.html#good-furniture">家具日常</a>
            <a href="${prefix}solutions/index.html#good-flooring">地面生活</a>
            <a href="${prefix}solutions/index.html#good-whole-decoration">空间木作</a>
            <a href="${prefix}solutions/index.html#good-outdoor">户外生活</a>
            <a href="${prefix}solutions/index.html#good-collection">老木与收藏</a>
            <a href="${prefix}solutions/index.html#good-cultural">文创器物</a>
          </div>
        </div>
        <a class="nav-link" href="${prefix}vendors/index.html">特色品牌</a>
        <a class="nav-link" href="${prefix}cooperation/index.html">生态合作</a>
      </nav>`;
}

function buildMobileNav(prefix) {
  return `<nav class="mobile-nav" aria-label="移动端主导航">
            <a href="${prefix}index.html">首页</a>
            <details>
              <summary>探索柚木</summary>
              <a href="${prefix}knowledge/index.html">探索柚木首页</a>
              <a href="${prefix}knowledge/teak-basics.html">初识柚木</a>
              <a href="${prefix}knowledge/teak-material-craft.html">材质与工艺</a>
              <a href="${prefix}knowledge/teak-buying-guide.html">选购与判断</a>
              <a href="${prefix}knowledge/teak-care.html">使用与养护</a>
            </details>
            <details>
              <summary>柚木美学</summary>
              <a href="${prefix}cases/index.html">柚木美学首页</a>
              <a href="${prefix}solutions/tea-room.html">茶空间</a>
              <a href="${prefix}solutions/furniture.html">客厅与家具</a>
              <a href="${prefix}solutions/flooring.html">地面空间</a>
              <a href="${prefix}solutions/outdoor.html">庭院户外</a>
              <a href="${prefix}solutions/whole-decoration.html">整体木作</a>
            </details>
            <details>
              <summary>柚木生活</summary>
              <a href="${prefix}solutions/index.html">柚木生活首页</a>
              <a href="${prefix}solutions/index.html#good-furniture">家具日常</a>
              <a href="${prefix}solutions/index.html#good-flooring">地面生活</a>
              <a href="${prefix}solutions/index.html#good-whole-decoration">空间木作</a>
              <a href="${prefix}solutions/index.html#good-outdoor">户外生活</a>
              <a href="${prefix}solutions/index.html#good-collection">老木与收藏</a>
              <a href="${prefix}solutions/index.html#good-cultural">文创器物</a>
            </details>
            <a href="${prefix}vendors/index.html">特色品牌</a>
            <a href="${prefix}cooperation/index.html">生态合作</a>
          </nav>`;
}

const htmlFiles = collectHtmlFiles(root);
let updated = 0;
let navigationPages = 0;

for (const absolutePath of htmlFiles) {
  const relativePath = path.relative(root, absolutePath).replaceAll("\\", "/");
  const depth = relativePath.split("/").length - 1;
  const prefix = depth === 0 ? "./" : "../".repeat(depth);
  const original = fs.readFileSync(absolutePath, "utf8");
  let html = original;

  if (html.includes('class="main-nav desktop-nav"')) {
    navigationPages += 1;
    html = html.replace(
      /<nav class="main-nav desktop-nav" aria-label="主导航">[\s\S]*?<\/nav>/,
      buildDesktopNav(prefix),
    );
    html = html.replace(
      /<nav class="mobile-nav" aria-label="移动端主导航">[\s\S]*?<\/nav>/,
      buildMobileNav(prefix),
    );
    html = html.replaceAll("<small>柚木爱好者乐园</small>", "<small>柚木生活方式</small>");
    html = html.replace(
      /<a class="nav-cta" href="[^"]*">[^<]*<\/a>/,
      `<a class="nav-cta" href="${prefix}index.html#wechat">咨询柚喜</a>`,
    );
    html = html.replace(
      /<a class="mobile-menu-cta" href="[^"]*">[^<]*<\/a>/,
      `<a class="mobile-menu-cta" href="${prefix}index.html#wechat">咨询柚喜</a>`,
    );
  }

  if (html !== original) {
    fs.writeFileSync(absolutePath, html, "utf8");
    updated += 1;
  }
}

if (htmlFiles.length !== 127) throw new Error(`预期127个HTML，实际${htmlFiles.length}个。`);
if (navigationPages !== 126) throw new Error(`预期126个导航页面，实际${navigationPages}个。`);

console.log(`v1.30-alpha.1 导航迁移完成：扫描 ${htmlFiles.length} 个HTML，更新 ${updated} 个导航页面。`);
