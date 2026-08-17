module.exports = {
  testDir: __dirname,
  testMatch: "v134-browser-qa.spec.js",
  outputDir: "screenshots/v1.34-qa/test-results",
  reporter: "line",
  workers: 1,
  timeout: 1_200_000,
  use: {
    browserName: "chromium",
    headless: true,
    launchOptions: {
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    },
  },
};
