// @ts-check
const { defineConfig, devices } = require("@playwright/test");

// 本环境无法下载 Playwright 自带浏览器（CDN 不在出网白名单），
// 通过 CHROME_BIN 指向已就绪的 Chromium（见 README/测试说明）；未设置时回退到 Playwright 默认。
const executablePath = process.env.CHROME_BIN || undefined;

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  workers: 2,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:8123",
    launchOptions: { executablePath, args: ["--no-sandbox", "--disable-dev-shm-usage"] },
    actionTimeout: 8000,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "python3 -m http.server 8123",
    url: "http://localhost:8123/index.html",
    reuseExistingServer: true,
    timeout: 20000,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1366, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
});
