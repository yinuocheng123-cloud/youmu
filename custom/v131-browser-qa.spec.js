const { test, expect } = require("playwright/test");

const origin = process.env.V131_QA_ORIGIN || "http://127.0.0.1:8093";
const pages = [
  ["home", "/"],
  ["knowledge", "/knowledge/index.html"],
  ["knowledge-detail", "/knowledge/topics/what-is-teak.html"],
  ["aesthetics", "/cases/index.html"],
  ["living", "/solutions/index.html"],
  ["vendors", "/vendors/index.html"],
  ["cooperation", "/cooperation/index.html"],
];
const viewports = [
  ["desktop1440", { width: 1440, height: 900 }],
  ["mobile390", { width: 390, height: 844 }],
];

for (const [viewportName, viewport] of viewports) {
  test.describe(viewportName, () => {
    test.use({ viewport });

    for (const [name, pathname] of pages) {
      test(`${name} renders without overflow or console errors`, async ({ page }) => {
        const consoleErrors = [];
        const pageErrors = [];
        page.on("console", (message) => {
          if (message.type() === "error") consoleErrors.push(message.text());
        });
        page.on("pageerror", (error) => pageErrors.push(error.message));

        const response = await page.goto(`${origin}${pathname}`, { waitUntil: "networkidle" });
        expect(response?.status()).toBe(200);
        await expect(page.locator("h1")).toBeVisible();
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += 520) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        });
        await page.waitForTimeout(500);
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
        await page.evaluate(() => window.scrollTo(0, 0));
        const layout = await page.evaluate(() => ({
          viewport: document.documentElement.clientWidth,
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        }));
        expect(layout.document).toBeLessThanOrEqual(layout.viewport + 1);
        expect(layout.body).toBeLessThanOrEqual(layout.viewport + 1);
        expect(pageErrors).toEqual([]);
        expect(consoleErrors).toEqual([]);

        if (name === "home") {
          await page.screenshot({
            path: `custom/screenshots/v1.31-qa/home-${viewportName}.png`,
            fullPage: true,
          });
        }
        if (["aesthetics", "living", "vendors", "cooperation"].includes(name)) {
          await page.screenshot({
            path: `custom/screenshots/v1.31-qa/${name}-${viewportName}.png`,
            fullPage: true,
          });
        }
      });
    }

    if (viewportName === "mobile390") {
      test("mobile menu opens and closes", async ({ page }) => {
        await page.goto(`${origin}/`, { waitUntil: "networkidle" });
        await page.locator("[data-menu-toggle]").click();
        await expect(page.locator("[data-mobile-menu]")).toHaveAttribute("aria-hidden", "false");
        await expect(page.locator(".mobile-menu-panel")).toBeVisible();
        await page.locator("[data-menu-close]").click();
        await expect(page.locator("[data-mobile-menu]")).toHaveAttribute("aria-hidden", "true");
      });
    }
  });
}
