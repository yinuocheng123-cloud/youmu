const fs = require("node:fs");
const path = require("node:path");
const { test, expect } = require("playwright/test");

const root = path.resolve(__dirname, "..");
const origin = process.env.V134_QA_ORIGIN || "http://127.0.0.1:8096";
const audit = JSON.parse(fs.readFileSync(path.join(__dirname, "v134-article-image-semantic-audit.json"), "utf8"));
const screenshotRoot = path.join(__dirname, "screenshots/v1.34-qa");
fs.mkdirSync(screenshotRoot, { recursive: true });

const representatives = [
  ["material-texture", "knowledge/topics/what-is-teak.html"],
  ["color-aging", "knowledge/topics/teak-color-change.html"],
  ["selection-comparison", "knowledge/topics/teak-price-difference.html"],
  ["craft-drying", "knowledge/topics/teak-drying-process.html"],
  ["craft-finishing", "knowledge/topics/teak-joinery-surface.html"],
  ["maintenance-cleaning", "knowledge/topics/teak-daily-cleaning.html"],
  ["furniture-use", "solutions/goods/teak-living-room.html"],
  ["flooring", "solutions/guides/flooring-before-install.html"],
  ["outdoor", "solutions/goods/teak-pool-deck.html"],
  ["interior-space", "cases/tea-room-teak-sample.html"],
  ["objects", "solutions/goods/teak-incense-holder.html"],
  ["brand-real-assets", "vendors/wachen-teak.html"],
];

const viewports = {
  mobile390: { width: 390, height: 844 },
  tablet768: { width: 768, height: 1024 },
  desktop1440: { width: 1440, height: 900 },
};

async function inspect(page, record) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const onConsole = (message) => { if (message.type() === "error") consoleErrors.push(message.text()); };
  const onPageError = (error) => pageErrors.push(error.message);
  const onRequestFailed = (request) => failedRequests.push(`${request.url()} :: ${request.failure()?.errorText ?? "failed"}`);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);
  page.on("requestfailed", onRequestFailed);
  const response = await page.goto(`${origin}/${record.articlePath}`, { waitUntil: "networkidle" });
  expect(response?.status(), record.articlePath).toBe(200);
  await expect(page.locator("h1").first(), record.articlePath).toBeVisible();

  const cover = page.locator(".article-cover img");
  if (await cover.count()) {
    await cover.first().scrollIntoViewIfNeeded();
    const state = await cover.first().evaluate((image) => ({
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      src: image.currentSrc,
      alt: image.getAttribute("alt"),
      width: image.getAttribute("width"),
      height: image.getAttribute("height"),
    }));
    expect(state.complete, record.articlePath).toBe(true);
    expect(state.naturalWidth, record.articlePath).toBeGreaterThan(0);
    expect(state.naturalHeight, record.articlePath).toBeGreaterThan(0);
    expect(state.src, record.articlePath).toContain(path.basename(record.currentMainImage));
    expect(state.alt, record.articlePath).toBeTruthy();
    expect(state.width, record.articlePath).toBeTruthy();
    expect(state.height, record.articlePath).toBeTruthy();
  } else {
    const hero = page.locator(".goods-article-hero, .case-hero, .content-hero-panel, .solution-topic-hero, .vendor-profile-hero").first();
    await expect(hero, record.articlePath).toBeVisible();
    const background = await hero.evaluate((element) => getComputedStyle(element).backgroundImage);
    expect(background, record.articlePath).toContain(path.basename(record.currentMainImage));
  }

  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 640) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  const renderedImages = page.locator("img:visible");
  for (let index = 0; index < await renderedImages.count(); index += 1) {
    await renderedImages.nth(index).scrollIntoViewIfNeeded();
  }
  await page.waitForTimeout(220);

  const result = await page.evaluate(() => ({
    brokenImages: [...document.images].filter((image) => {
      const style = getComputedStyle(image);
      const rendered = style.display !== "none" && style.visibility !== "hidden" && image.getClientRects().length > 0;
      return rendered && (!image.complete || image.naturalWidth === 0);
    }).map((image) => image.currentSrc || image.src),
    overflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) > document.documentElement.clientWidth + 1,
    cls: window.__v134Cls ?? 0,
  }));
  page.off("console", onConsole);
  page.off("pageerror", onPageError);
  page.off("requestfailed", onRequestFailed);
  return { ...result, consoleErrors, pageErrors, failedRequests };
}

test("v1.34 all article assets and representative visuals pass", async ({ browser }) => {
  const summary = {
    status: "PASS",
    origin,
    totalArticlePagesChecked: 0,
    themeRepresentativeCount: representatives.length,
    viewportResults: {},
    brokenImageCount: 0,
    consoleErrorCount: 0,
    pageErrorCount: 0,
    failedRequestCount: 0,
    horizontalOverflowCount: 0,
    maxCls: 0,
    failures: [],
  };

  const desktopContext = await browser.newContext({ viewport: viewports.desktop1440 });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.addInitScript(() => {
    window.__v134Cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__v134Cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
  for (const record of audit.records) {
    const result = await inspect(desktopPage, record);
    summary.totalArticlePagesChecked += 1;
    summary.brokenImageCount += result.brokenImages.length;
    summary.consoleErrorCount += result.consoleErrors.length;
    summary.pageErrorCount += result.pageErrors.length;
    summary.failedRequestCount += result.failedRequests.length;
    summary.horizontalOverflowCount += Number(result.overflow);
    summary.maxCls = Math.max(summary.maxCls, result.cls);
    if (result.brokenImages.length || result.consoleErrors.length || result.pageErrors.length || result.failedRequests.length || result.overflow || result.cls > 0.1) {
      summary.failures.push({ path: record.articlePath, viewport: "desktop1440", ...result });
    }
  }
  await desktopContext.close();

  for (const [viewportName, viewport] of Object.entries(viewports)) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__v134Cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__v134Cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    let passed = 0;
    for (const [theme, articlePath] of representatives) {
      const record = audit.records.find((item) => item.articlePath === articlePath);
      const result = await inspect(page, record);
      summary.brokenImageCount += result.brokenImages.length;
      summary.consoleErrorCount += result.consoleErrors.length;
      summary.pageErrorCount += result.pageErrors.length;
      summary.failedRequestCount += result.failedRequests.length;
      summary.horizontalOverflowCount += Number(result.overflow);
      summary.maxCls = Math.max(summary.maxCls, result.cls);
      const failed = result.brokenImages.length || result.consoleErrors.length || result.pageErrors.length || result.failedRequests.length || result.overflow || result.cls > 0.1;
      if (failed) summary.failures.push({ path: articlePath, viewport: viewportName, ...result });
      else passed += 1;
      await page.screenshot({ path: path.join(screenshotRoot, `${theme}-${viewportName}.png`), fullPage: false });
    }
    summary.viewportResults[viewportName] = { checked: representatives.length, passed };
    await context.close();
  }

  summary.maxCls = Number(summary.maxCls.toFixed(4));
  if (summary.failures.length) summary.status = "FAIL";
  fs.writeFileSync(path.join(__dirname, "v134-browser-qa-result.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  expect(summary.failures).toEqual([]);
  expect(summary.totalArticlePagesChecked).toBe(115);
});
