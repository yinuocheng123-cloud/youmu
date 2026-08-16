export const packageName = "v1.33.0";
export const packageDirectory = "release";

export const rootFiles = [
  "index.html",
  "404.html",
  "styles.css",
  "script.js",
  "robots.txt",
  "sitemap.xml",
];

export const publicDirectoryRules = new Map([
  ["about", new Set([".html"])],
  ["articles", new Set([".html"])],
  ["cases", new Set([".html"])],
  ["cooperation", new Set([".html"])],
  ["data", new Set([".js"])],
  ["forms", new Set([".html", ".js"])],
  ["knowledge", new Set([".html"])],
  ["solutions", new Set([".html"])],
  ["vendors", new Set([".html"])],
]);

export const assetFiles = [
  "assets/favicon.svg",
  "assets/logo-yuxi-horizontal.svg",
  "assets/logo-yuxi-mark.svg",
  "assets/logo-yuxi-mark-dark.svg",
  "assets/logo-yuxi-mark-mono.svg",
  "assets/wecom-qr.jpg",
  "assets/official-account-qr.jpg",
  "assets/qr-placeholder.svg",
  "assets/images/hero-teak-lifestyle.jpg",
  "assets/images/article-teak-aging-tones.jpg",
  "assets/images/article-teak-flooring-selection.jpg",
  "assets/images/article-teak-joinery-craft.jpg",
  "assets/images/article-teak-material-study.jpg",
  "assets/images/article-teak-outdoor-care.jpg",
  "assets/images/article-teak-small-objects.jpg",
  "assets/images/knowledge-outdoor-wood.jpg",
  "assets/images/knowledge-teak-grain.jpg",
  "assets/images/knowledge-teak-maintenance.jpg",
  "assets/images/product-teak-cabinet.jpg",
  "assets/images/product-teak-chair.jpg",
  "assets/images/product-teak-table.jpg",
  "assets/images/vendor-craft-sample.jpg",
  "assets/images/vendor-showroom-sample.jpg",
  "assets/images/vendor-workshop-sample.jpg",
  "assets/images/wechat-section-bg.jpg",
];

export const forbiddenPackageSegments = new Set([
  ".git",
  ".github",
  ".gitattributes",
  ".gitignore",
  ".nojekyll",
  "custom",
  "README.md",
]);
