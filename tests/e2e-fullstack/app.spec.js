const base = require("@playwright/test");

// 找茬夹具：任何控制台错误 / 页面异常 / NaN-undefined 文本都判失败
const test = base.test.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
    await use(page);
    base.expect(errors, "页面不应有运行期/控制台错误").toEqual([]);
  },
});
const { expect } = base;

async function openNav(page) {
  const t = page.locator("#navToggle, .nav-toggle");
  if (await t.first().isVisible()) await t.first().click();
}

test.describe("全栈：前端 ← Django API ← SQLite", () => {
  test("首页数据来自后端 API（行情条 / 指数 / TOP10 / 资讯）", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".ticker-item").first()).toBeVisible();
    await expect(page.locator(".index-item")).toHaveCount(4);
    await expect(page.locator(".rank-table tbody tr")).toHaveCount(10);
    await expect(page.locator(".news-col").first().locator(".news-item").first()).toBeVisible();
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("NaN");
    expect(body).not.toContain("undefined");
    expect(body).not.toContain("数据加载失败");
  });

  test("SPA 导航：跳到投教课堂并加载文章列表", async ({ page }) => {
    await page.goto("/");
    await openNav(page);
    await page.locator(".nav-menu a", { hasText: "投教课堂" }).click();
    await expect(page).toHaveURL(/#\/education/);
    await expect(page.locator(".article-card").first()).toBeVisible();
  });

  test("点击 TOP10 进入基金详情，净值图与业绩卡渲染（来自 API 详情）", async ({ page }) => {
    await page.goto("/");
    await page.locator(".rank-table tbody tr").first().click();
    await expect(page).toHaveURL(/#\/fund\/\d+/);
    await expect(page.locator(".fd-head .nm")).toBeVisible();
    await expect(page.locator(".perf-grid .perf-cell")).toHaveCount(7);
    await expect(page.locator("svg").first()).toBeVisible();
  });

  test("筛选器向导 3 步出结果；进阶模式按 R5 过滤", async ({ page }) => {
    await page.goto("/#/screener?mode=wizard");
    for (let i = 0; i < 3; i++) {
      await page.locator(".opt").first().click();
      await page.locator(".wizard-nav .btn-primary, .btn-primary", { hasText: /下一步|查看推荐/ }).first().click();
    }
    await expect(page.getByText("重新测一次")).toBeVisible();
    await expect(page.locator(".wizard .rk").first()).toBeVisible();

    await page.getByRole("button", { name: /进阶专业模式/ }).click();
    await expect(page.locator(".rank-table tbody tr")).toHaveCount(12);
    await page.locator(".chk", { hasText: "R5" }).click();
    await expect(page.locator(".rank-table tbody tr")).toHaveCount(2);
  });

  test("定投计算器算出多情景曲线", async ({ page }) => {
    await page.goto("/#/education");
    await page.locator(".tool-card", { hasText: "定投计算器" }).click();
    await page.getByRole("button", { name: "开始测算" }).click();
    await expect(page.locator(".calc-result .big")).toContainText("¥");
    await expect(page.locator(".modal svg")).toBeVisible();
  });

  test("找茬：搜索无结果给出兜底", async ({ page }) => {
    await page.goto("/#/search?q=zzzznotexist");
    await expect(page.getByText("没有找到")).toBeVisible();
  });

  test("联系咨询表单：正常提交 → 成功（写入后端 DB）", async ({ page }) => {
    await page.goto("/#/contact");
    await page.locator('input[placeholder="怎么称呼您？"]').fill("自动化测试用户");
    await page.locator('input[placeholder="手机号"]').fill("13900000000");
    await page.locator("textarea").fill("我是通过端到端测试提交的咨询内容，验证前后端打通。");
    await page.getByRole("button", { name: "提交咨询" }).click();
    await expect(page.getByText("提交成功！")).toBeVisible();
  });

  test("找茬：联系表单缺联系方式 → 被后端校验拦截并提示", async ({ page }) => {
    await page.goto("/#/contact");
    await page.locator('input[placeholder="怎么称呼您？"]').fill("无联系方式用户");
    await page.locator("textarea").fill("这条没有填电话也没有邮箱，应该被拦截。");
    await page.getByRole("button", { name: "提交咨询" }).click();
    await expect(page.getByText(/至少填写一种联系方式/)).toBeVisible();
    await expect(page.getByText("提交成功！")).toHaveCount(0);
  });

  // 找茬：响应式横向溢出守卫。覆盖平板 768（导航塌缩临界区）与窄手机 360，
  // 逐页校验不出现横向滚动条 —— 此前 fund-detail 重仓分栏与全站导航都曾在此溢出。
  test("找茬：关键页面在平板/手机窄屏均无横向溢出", async ({ page }) => {
    const routes = [
      ["首页", "/"],
      ["进阶筛选", "/#/screener?mode=pro"],
      ["基金详情", "/#/fund/001234"],
      ["投教文章", "/#/education?id=a01"],
      ["策略文章", "/#/strategy?id=s09"],
      ["联系咨询", "/#/contact"],
    ];
    for (const w of [768, 360]) {
      await page.setViewportSize({ width: w, height: 900 });
      for (const [name, path] of routes) {
        await page.goto(path, { waitUntil: "networkidle" });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        expect(overflow, `${name} @${w}px 不应出现横向溢出`).toBeLessThanOrEqual(2);
      }
    }
  });
});
