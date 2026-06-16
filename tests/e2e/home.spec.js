const { test, expect, openNav, assertNoGarbage } = require("./fixtures");

test.describe("首页与全站框架", () => {
  test("首页正常加载：行情条、指数、TOP10、资讯", async ({ page }) => {
    await page.goto("/index.html");
    await expect(page).toHaveTitle(/基智汇/);
    // 滚动行情条
    await expect(page.locator("#homeTicker .ticker-item").first()).toBeVisible();
    // 大盘指数 4 条
    await expect(page.locator("#homeIndices .index-item")).toHaveCount(4);
    // TOP10 共 10 行
    await expect(page.locator("#homeTop10 tbody tr")).toHaveCount(10);
    // 资讯三栏均有内容
    await expect(page.locator("#newsIndustry .news-item").first()).toBeVisible();
    await assertNoGarbage(page);
  });

  test("常驻合规提示存在", async ({ page }) => {
    await page.goto("/index.html");
    await expect(page.locator(".compliance-bar")).toContainText("投资需谨慎");
    await expect(page.locator(".footer-risk")).toContainText("历史业绩不代表未来");
  });

  test("点击 TOP10 行可跳转到对应基金详情", async ({ page }) => {
    await page.goto("/index.html");
    await page.locator("#homeTop10 tbody tr").first().click();
    await expect(page).toHaveURL(/fund-detail\.html\?code=\d+/);
    await expect(page.locator(".fd-head .nm")).toBeVisible();
  });

  test("主导航跳转到投教课堂", async ({ page }) => {
    await page.goto("/index.html");
    await openNav(page);
    await page.locator(".nav-menu a", { hasText: "投教课堂" }).click();
    await expect(page).toHaveURL(/education\.html/);
  });

  test("深色模式切换并跨页面持久化", async ({ page }) => {
    await page.goto("/index.html");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme", "dark");
    await page.locator("#themeToggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    // 跳到另一个页面仍为深色
    await page.goto("/screener.html");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("全站搜索：有结果", async ({ page }) => {
    await page.goto("/index.html");
    await page.locator("#globalSearch").fill("红利");
    await page.locator("#globalSearch").press("Enter");
    await expect(page).toHaveURL(/search\.html\?q=/);
    await expect(page.locator("#searchSummary")).toContainText("找到");
    await expect(page.locator("#searchResults")).toContainText("红利");
  });

  test("全站搜索：无结果时给出兜底", async ({ page }) => {
    await page.goto("/search.html?q=zzzznotexist");
    await expect(page.locator("#searchResults")).toContainText("没有找到");
    await expect(page.locator("#searchResults a.btn")).toBeVisible();
  });
});

test.describe("移动端专项", () => {
  test.beforeEach(() => { test.skip(test.info().project.name !== "mobile", "仅移动端"); });

  test("汉堡菜单可展开并导航；搜索框在移动端可用", async ({ page }) => {
    await page.goto("/index.html");
    // 菜单初始不可见
    await expect(page.locator(".nav-menu a", { hasText: "策略专栏" })).toBeHidden();
    await page.locator("#navToggle").click();
    await expect(page.locator(".nav-menu a", { hasText: "策略专栏" })).toBeVisible();
    // 移动端搜索框应可用（此前为隐藏，已修复）
    await expect(page.locator("#globalSearch")).toBeVisible();
  });
});
