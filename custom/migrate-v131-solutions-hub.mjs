import fs from "node:fs/promises";
import path from "node:path";

const file = path.join(process.cwd(), "solutions", "index.html");
let html = await fs.readFile(file, "utf8");

const title = "柚木生活｜家具、地板、户外与日常使用｜柚喜饰界";
const description = "按家具、地板、空间木作、户外、老木收藏和文创器物查看柚木的使用与维护内容。";
const main = `    <main class="content-main solution-index-layout good-things-layout solutions-hub">
      <nav class="breadcrumb" aria-label="面包屑"><a href="../index.html">首页</a><span>柚木生活</span></nav>
      <section class="content-hero-panel good-things-hero good-things-hero-compact">
        <p class="eyebrow dark">Teak Living</p>
        <h1>柚木生活</h1>
        <p class="content-lead">从家具、地面、空间木作、户外用品、老木和小件器物中，查看柚木怎样使用与维护。</p>
      </section>

      <nav class="solutions-hub-nav" aria-label="柚木生活分类">
        <a href="#good-furniture">家具日常</a>
        <a href="#good-flooring">地面生活</a>
        <a href="#good-whole-decoration">空间木作</a>
        <a href="#good-outdoor">户外生活</a>
        <a href="#good-collection">老木与收藏</a>
        <a href="#good-cultural">文创器物</a>
      </nav>

      <section class="solutions-hub-grid" aria-label="柚木生活六个分类">
        <article class="solutions-hub-card" id="good-furniture">
          <img src="../assets/images/product-teak-table.jpg" alt="柚木桌与室内家具参考" width="1400" height="2487" loading="lazy" decoding="async" />
          <div>
            <span>Furniture</span>
            <h2>家具日常</h2>
            <p>从茶桌、餐桌到柜体，关注尺寸、结构、触感和日常维护。</p>
            <a class="solutions-feature-link" href="goods/teak-tea-table.html">精选：柚木茶桌的尺寸、触感和维护</a>
            <a class="btn btn-secondary" href="furniture.html">查看更多</a>
          </div>
        </article>

        <article class="solutions-hub-card" id="good-flooring">
          <img src="../assets/images/knowledge-teak-grain.jpg" alt="柚木地板纹理与铺装参考" width="1400" height="933" loading="lazy" decoding="async" />
          <div>
            <span>Flooring</span>
            <h2>地面生活</h2>
            <p>了解脚感、光线、基层、安装和长期清洁等实际问题。</p>
            <a class="solutions-feature-link" href="guides/flooring-how-to-choose.html">精选：柚木地板怎么选</a>
            <a class="btn btn-secondary" href="flooring.html">查看更多</a>
          </div>
        </article>

        <article class="solutions-hub-card" id="good-whole-decoration">
          <img src="../assets/images/vendor-craft-sample.jpg" alt="柚木墙面与空间木作参考" width="1400" height="933" loading="lazy" decoding="async" />
          <div>
            <span>Woodwork</span>
            <h2>空间木作</h2>
            <p>墙面、柜体、木门和楼梯需要一起考虑材料比例、收口与维护。</p>
            <a class="solutions-feature-link" href="goods/teak-wall-panel.html">精选：空间里的柚木墙面</a>
            <a class="btn btn-secondary" href="whole-decoration.html">查看更多</a>
          </div>
        </article>

        <article class="solutions-hub-card" id="good-outdoor">
          <img src="../assets/images/knowledge-outdoor-wood.jpg" alt="庭院与户外木作参考" width="1400" height="2100" loading="lazy" decoding="async" />
          <div>
            <span>Outdoor</span>
            <h2>户外生活</h2>
            <p>露台、庭院和甲板要重点看排水、防滑、五金和日晒维护。</p>
            <a class="solutions-feature-link" href="goods/teak-yacht-deck.html">精选：游艇甲板与户外柚木</a>
            <a class="btn btn-secondary" href="outdoor.html">查看更多</a>
          </div>
        </article>

        <article class="solutions-hub-card" id="good-collection">
          <img src="../assets/images/vendor-workshop-sample.jpg" alt="老木与木作整理参考" width="1400" height="2100" loading="lazy" decoding="async" />
          <div>
            <span>Old Teak</span>
            <h2>老木与收藏</h2>
            <p>旧门、旧窗和老料保留使用痕迹，来源与材料状态需要说明清楚。</p>
            <a class="solutions-feature-link" href="goods/old-teak-door.html">精选：老木留下的真实痕迹</a>
            <a class="btn btn-secondary" href="goods/aged-teak-timber.html">查看更多</a>
          </div>
        </article>

        <article class="solutions-hub-card" id="good-cultural">
          <img src="../assets/images/knowledge-teak-maintenance.jpg" alt="柚木小件器物与日常使用参考" width="1400" height="2100" loading="lazy" decoding="async" />
          <div>
            <span>Objects</span>
            <h2>文创器物</h2>
            <p>托盘、香器和文具要看尺寸、重量、边缘触感和使用频率。</p>
            <a class="solutions-feature-link" href="goods/teak-tray.html">精选：柚木托盘的尺寸和手感</a>
            <a class="btn btn-secondary" href="goods/teak-incense-holder.html">查看更多</a>
          </div>
        </article>
      </section>

      <aside class="solutions-source-note" aria-label="内容说明">
        <strong>内容说明</strong>
        <p>空间参考、使用记录和品牌授权内容会按相应分类整理；概念图与真实案例会明确区分。</p>
      </aside>
    </main>`;

const mainMatches = html.match(/<main\b[^>]*>[^]*?<\/main>/gi) ?? [];
if (mainMatches.length !== 1) throw new Error(`Expected one main element, found ${mainMatches.length}`);
html = html.replace(mainMatches[0], main);
html = html.replace(/<title>[^]*?<\/title>/, `<title>${title}</title>`);
html = html.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/>/, `<meta name="description" content="${description}" />`);
html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/, `<meta property="og:title" content="${title}" />`);
html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/, `<meta property="og:description" content="${description}" />`);
html = html.replace("发现柚木家具、地板、整装、户外、收藏和文创好物。", "柚木家具、地板、空间木作、户外、老木和器物。 ");

await fs.writeFile(file, html, "utf8");
console.log("Rebuilt solutions/index.html as the v1.31 compact hub.");
