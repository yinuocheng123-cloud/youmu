module.exports = {
  testDir: __dirname,
  testMatch: "v133-browser-qa.spec.js",
  outputDir: "screenshots/v1.33-qa/test-results",
  reporter: "line",
  workers: 1,
  use: {
    browserName: "chromium",
    headless: true,
    launchOptions: {
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    },
  },
};
