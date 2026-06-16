const { test, expect, assertNoGarbage } = require("./fixtures");

test.describe("基金详情", () => {
  test("核心信息、业绩卡、净值图、配置环形图均渲染", async ({ page }) => {
    await page.goto("/fund-detail.html?code=002345");
    await expect(page.locator(".fd-head .nm")).toContainText("鼎成消费精选混合");
    await expect(page.locator(".perf-grid .perf-cell")).toHaveCount(7);
    await expect(page.locator("#navChart svg")).toBeVisible();
    await expect(page.locator("#allocChart svg")).toBeVisible();
    await expect(page.locator(".holding-table tbody tr").first()).toBeVisible();
    await assertNoGarbage(page);
  });

  test("切换净值时间区间，图表重绘", async ({ page }) => {
    await page.goto("/fund-detail.html?code=001234");
    await page.locator("#rangeTools button", { hasText: "近1月" }).click();
    await expect(page.locator("#rangeTools button.on")).toHaveText("近1月");
    await expect(page.locator("#navChart svg")).toBeVisible();
  });

  test("展开进阶数据，业绩归因柱状渲染", async ({ page }) => {
    await page.goto("/fund-detail.html?code=001234");
    await expect(page.locator("#advBody")).toBeHidden();
    await page.locator("#advHead").click();
    await expect(page.locator("#advBody")).toBeVisible();
    await expect(page.locator("#attrBars .sector-bar").first()).toBeVisible();
  });

  test("加入自选并持久化；模拟申购给出演示提示", async ({ page }) => {
    await page.goto("/fund-detail.html?code=003456");
    await page.locator("#wlBtn").click();
    await expect(page.locator("#wlBtn")).toContainText("已自选");
    await page.reload();
    await expect(page.locator("#wlBtn")).toContainText("已自选");
    await page.locator("#buyBtn").click();
    await expect(page.locator("#toast")).toContainText("不提供真实交易");
  });

  test("找茬：非法基金代码应给出未找到，而非静默显示其它基金", async ({ page }) => {
    await page.goto("/fund-detail.html?code=999999");
    await expect(page.locator("#fdRoot")).toContainText("未找到");
    await expect(page.locator("#fdRoot a.btn")).toBeVisible();
    // 不应渲染出正常详情结构
    await expect(page.locator(".perf-grid")).toHaveCount(0);
  });
});
