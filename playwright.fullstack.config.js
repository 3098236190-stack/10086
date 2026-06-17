// @ts-check
// 全栈端到端：同时拉起 Django(8000) 与 Vue 预览(4173)，验证「前端 ← API ← SQLite」整链路。
const { defineConfig, devices } = require("@playwright/test");

const executablePath = process.env.CHROME_BIN || undefined;
const PYTHON = process.env.PYTHON || "../.venv/bin/python";

module.exports = defineConfig({
  testDir: "./tests/e2e-fullstack",
  timeout: 40000,
  expect: { timeout: 8000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: { executablePath, args: ["--no-sandbox", "--disable-dev-shm-usage"] },
    actionTimeout: 10000,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `${PYTHON} manage.py runserver 127.0.0.1:8000`,
      cwd: "backend",
      url: "http://127.0.0.1:8000/api/home/",
      reuseExistingServer: true,
      timeout: 30000,
    },
    {
      command: "npm run preview -- --port 4173 --host 127.0.0.1",
      cwd: "frontend",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: true,
      timeout: 30000,
    },
  ],
  projects: [
    { name: "desktop", use: { viewport: { width: 1366, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
});
