const { test, expect } = require("./fixtures");

// 找茬：响应式横向溢出守卫。覆盖平板 768（导航塌缩临界区）与窄手机 360，
// 逐页校验不出现横向滚动条 —— 此前 fund-detail 配置/重仓分栏与全站导航都曾在此溢出。
const pages = [
  ["首页", "/index.html"],
  ["筛选器", "/screener.html"],
  ["基金详情", "/fund-detail.html?code=001234"],
  ["投教文章", "/education.html?id=e01"],
  ["策略文章", "/strategy.html?id=s01"],
  ["市场资讯", "/news.html"],
];

for (const w of [768, 360]) {
  test(`关键页面在 ${w}px 窄屏无横向溢出`, async ({ page }) => {
    await page.setViewportSize({ width: w, height: 900 });
    for (const [name, path] of pages) {
      await page.goto(path, { waitUntil: "networkidle" });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${name} @${w}px 不应出现横向溢出`).toBeLessThanOrEqual(2);
    }
  });
}
