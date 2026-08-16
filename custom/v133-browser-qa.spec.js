const { test, expect } = require("playwright/test");

const origin = process.env.V133_QA_ORIGIN || "http://127.0.0.1:8094";
const pages = [
  { name: "material", path: "/articles/what-is-teak.html", cover: true },
  { name: "knowledge-aging", path: "/knowledge/topics/teak-aging-color.html", cover: true },
  { name: "knowledge-outdoor", path: "/knowledge/topics/outdoor-teak-maintenance.html", cover: true },
  { name: "guide-flooring", path: "/solutions/guides/flooring-how-to-choose.html", cover: true },
  { name: "guide-cabinet", path: "/solutions/guides/teak-cabinet-storage.html", cover: true },
  { name: "goods-seating", path: "/solutions/goods/teak-bench.html", heroAsset: "product-teak-chair.jpg" },
  { name: "goods-small-object", path: "/solutions/goods/teak-pen.html", heroAsset: "article-teak-small-objects.jpg" },
  { name: "brand-profile", path: "/vendors/wachen-teak.html", brandContext: true },
  { name: "brand-guide", path: "/vendors/flooring-sample.html", cover: true },
  { name: "aesthetic-existing", path: "/cases/tea-room-teak-sample.html" },
];

const viewports = [
  ["mobile390", { width: 390, height: 844 }],
  ["tablet768", { width: 768, height: 1024 }],
  ["desktop1024", { width: 1024, height: 768 }],
  ["desktop1440", { width: 1440, height: 900 }],
];

test.use({ channel: "chrome" });

for (const [viewportName, viewport] of viewports) {
  test.describe(viewportName, () => {
    test.use({ viewport });

    for (const item of pages) {
      test(`${item.name} renders article imagery without regressions`, async ({ page }) => {
        const consoleErrors = [];
        const pageErrors = [];
        page.on("console", (message) => {
          if (message.type() === "error") consoleErrors.push(message.text());
        });
        page.on("pageerror", (error) => pageErrors.push(error.message));

        const response = await page.goto(`${origin}${item.path}`, { waitUntil: "networkidle" });
        expect(response?.status()).toBe(200);
        await expect(page.locator("h1")).toBeVisible();

        if (item.cover) {
          const cover = page.locator(".article-cover img");
          await expect(cover).toHaveCount(1);
          await cover.scrollIntoViewIfNeeded();
          await expect(cover).toBeVisible();
          const imageState = await cover.evaluate((image) => ({
            complete: image.complete,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
            box: image.getBoundingClientRect().toJSON(),
          }));
          expect(imageState.complete).toBe(true);
          expect(imageState.naturalWidth).toBeGreaterThan(1000);
          expect(imageState.naturalHeight).toBeGreaterThan(900);
          expect(imageState.box.width).toBeGreaterThan(Math.min(300, viewport.width - 64));
          expect(imageState.box.height / imageState.box.width).toBeGreaterThan(0.64);
          expect(imageState.box.height / imageState.box.width).toBeLessThan(0.69);
          await expect(page.locator(".article-cover figcaption")).toBeVisible();
        }

        if (item.heroAsset) {
          const hero = page.locator(".goods-article-hero");
          await expect(hero).toBeVisible();
          const background = await hero.evaluate((element) => getComputedStyle(element).backgroundImage);
          expect(background).toContain(item.heroAsset);
        }

        if (item.brandContext) {
          await expect(page.locator(".article-image-context")).toBeVisible();
        }

        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += 560) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 40));
          }
        });
        await page.waitForTimeout(150);

        const brokenImages = await page.locator("img").evaluateAll((images) =>
          images
            .filter((image) => {
              const style = getComputedStyle(image);
              const rendered = style.display !== "none" && style.visibility !== "hidden" && image.getClientRects().length > 0;
              return rendered && (!image.complete || image.naturalWidth === 0);
            })
            .map((image) => image.currentSrc || image.src),
        );
        expect(brokenImages).toEqual([]);

        const layout = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        }));
        expect(layout.document).toBeLessThanOrEqual(layout.viewport + 1);
        expect(layout.body).toBeLessThanOrEqual(layout.viewport + 1);
        expect(pageErrors).toEqual([]);
        expect(consoleErrors).toEqual([]);

        if (["material", "goods-small-object", "brand-profile"].includes(item.name) && ["mobile390", "desktop1440"].includes(viewportName)) {
          await page.screenshot({
            path: `custom/screenshots/v1.33-qa/${item.name}-${viewportName}.png`,
            fullPage: true,
          });
        }
      });
    }
  });
}
