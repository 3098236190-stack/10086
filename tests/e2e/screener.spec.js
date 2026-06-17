const { test, expect, assertNoGarbage } = require("./fixtures");

test.describe("筛选器 · 新手向导", () => {
  test("3 步问答走完得到推荐结果，并可重测", async ({ page }) => {
    await page.goto("/screener.html?mode=wizard");
    // 第 1 步
    await page.locator("#wizardPanel .opt").first().click();
    await page.locator("#wizNext").click();
    // 第 2 步
    await page.locator("#wizardPanel .opt").first().click();
    await page.locator("#wizNext").click();
    // 第 3 步
    await page.locator("#wizardPanel .opt").first().click();
    await page.locator("#wizNext").click();
    // 结果
    await expect(page.locator("#wizRestart")).toBeVisible();
    await expect(page.locator("#wizardPanel .card .rk").first()).toBeVisible();
    await assertNoGarbage(page);
    // 重测回到第 1 步
    await page.locator("#wizRestart").click();
    await expect(page.locator("#wizardPanel .wizard-q h2")).toBeVisible();
  });

  test("找茬：保守型 + 短期 + 宽基指数 —— 不应推荐高风险，且要解释方向无法满足", async ({ page }) => {
    await page.goto("/screener.html?mode=wizard");
    await page.locator(".opt", { hasText: "保守型" }).click();
    await page.locator("#wizNext").click();
    await page.locator(".opt", { hasText: "3 个月内" }).click();
    await page.locator("#wizNext").click();
    await page.locator(".opt", { hasText: "宽基指数" }).click();
    await page.locator("#wizNext").click();
    // 保守用户结果里绝不能出现 R4 / R5
    await expect(page.locator("#wizardPanel .risk.R4")).toHaveCount(0);
    await expect(page.locator("#wizardPanel .risk.R5")).toHaveCount(0);
    // 由于风险约束，宽基指数（R3）无法满足，应有透明度说明
    await expect(page.locator("#wizardPanel")).toContainText("优先");
  });
});

test.describe("筛选器 · 进阶专业", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/screener.html?mode=advanced");
    await expect(page.locator("#resultTable tbody tr").first()).toBeVisible();
  });

  test("默认展示全部 12 只；按风险等级过滤生效", async ({ page }) => {
    await expect(page.locator("#resultTable tbody tr")).toHaveCount(12);
    await page.locator('[data-grp="risks"] .chk', { hasText: "R5" }).click();
    await expect(page.locator("#resultTable tbody tr")).toHaveCount(2);
    await expect(page.locator("#resultBar .count")).toContainText("2");
  });

  test("按规模排序后，规模最大的基金排第一", async ({ page }) => {
    await page.locator('.sort-tabs button', { hasText: "规模" }).click();
    // 演示库中货币基金规模最大（612.8 亿）
    await expect(page.locator("#resultTable tbody tr").first()).toContainText("恒丰货币");
  });

  test("最多对比 4 只，第 5 只被拦截；对比弹窗可打开", async ({ page }) => {
    for (let i = 0; i < 4; i++) {
      await page.locator(".cmp-btn:not(.btn-primary)").first().click();
    }
    await expect(page.locator("#compareSlots .compare-slot")).toHaveCount(4);
    // 第 5 只：应被拦截，仍是 4
    await page.locator(".cmp-btn:not(.btn-primary)").first().click();
    await expect(page.locator("#toast")).toContainText("最多对比 4 只");
    await expect(page.locator("#compareSlots .compare-slot")).toHaveCount(4);
    // 打开对比
    await page.locator("#compareGo").click();
    await expect(page.locator("#compareModal.show")).toBeVisible();
    await expect(page.locator("#compareBody table tbody tr").first()).toBeVisible();
  });

  test("找茬：对比不足 2 只时点击对比应被拦截", async ({ page }) => {
    await page.locator(".cmp-btn:not(.btn-primary)").first().click();
    await expect(page.locator("#compareSlots .compare-slot")).toHaveCount(1);
    await page.locator("#compareGo").click();
    await expect(page.locator("#toast")).toContainText("至少选择 2 只");
    await expect(page.locator("#compareModal.show")).toHaveCount(0);
  });

  test("导出 CSV 触发下载且内容正确", async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.locator("#exportCsv").click(),
    ]);
    const content = require("fs").readFileSync(await download.path(), "utf8");
    expect(content).toContain("基金代码");           // 表头
    expect(content).toContain("汇盈沪深300指数A");    // 数据行
    expect(content.trim().split(/\r?\n/).length).toBe(13); // 表头 + 12 只
  });

  test("加入自选后按钮态变化", async ({ page }) => {
    const star = page.locator("#resultTable tbody tr").first().locator(".wl-btn");
    await expect(star).toHaveText("☆");
    await star.click();
    await expect(page.locator("#resultTable tbody tr").first().locator(".wl-btn")).toHaveText("★");
  });
});
