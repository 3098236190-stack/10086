const { test, expect, assertNoGarbage } = require("./fixtures");

test.describe("投教课堂", () => {
  test("分级筛选：只看小白入门篇时不应混入进阶卡片", async ({ page }) => {
    await page.goto("/education.html");
    await page.locator("#eduLevelPills .pill", { hasText: "小白入门篇" }).click();
    await expect(page.locator("#eduGrid .article-card").first()).toBeVisible();
    await expect(page.locator("#eduGrid .aud.advanced")).toHaveCount(0);
  });

  test("打开文章，正文与免责声明齐全", async ({ page }) => {
    await page.goto("/education.html?id=e07");
    await expect(page.locator("#eduArticleView h1")).toContainText("风险等级");
    await expect(page.locator("#eduArticleView")).toContainText("R1");
    await expect(page.locator("#eduArticleView")).toContainText("不构成投资建议");
    await assertNoGarbage(page);
  });

  test("定投计算器：正常测算给出多情景曲线", async ({ page }) => {
    await page.goto("/education.html");
    await page.locator("#openCalc").click();
    await page.locator("#cAmt").fill("2000");
    await page.locator("#cYears").fill("10");
    await page.locator("#cRate").fill("7");
    await page.locator("#calcBtn").click();
    await expect(page.locator("#cFinal")).toContainText("¥");
    await expect(page.locator("#calcChart svg")).toBeVisible();
  });

  test("找茬：定投计算器边界（0 元 / 超长年限）不应报错或出 NaN", async ({ page }) => {
    await page.goto("/education.html");
    await page.locator("#openCalc").click();
    await page.locator("#cAmt").fill("0");
    await page.locator("#cYears").fill("40");
    await page.locator("#cRate").fill("0");
    await page.locator("#calcBtn").click();
    await expect(page.locator("#cFinal")).toContainText("¥0");
    const txt = await page.locator("#calcOut").innerText();
    expect(txt).not.toContain("NaN");
  });

  test("风险测评：5 题走完得到画像", async ({ page }) => {
    await page.goto("/education.html");
    await page.locator("#openQuiz").click();
    for (let i = 0; i < 5; i++) {
      await page.locator("#quizBody .opt").first().click();
    }
    await expect(page.locator("#quizBody")).toContainText("风险偏好画像");
  });
});

test.describe("策略专栏", () => {
  test("筛选并打开策略详情，含适用人群与风险点", async ({ page }) => {
    await page.goto("/strategy.html?id=s09");
    await expect(page.locator("#stratArticleView h1")).toContainText("行业轮动");
    await expect(page.locator("#stratArticleView")).toContainText("风险点");
    await expect(page.locator("#stratArticleView")).toContainText("不推荐任何具体基金");
  });
});

test.describe("市场资讯", () => {
  test("切换公司公告分类后只显示公告", async ({ page }) => {
    await page.goto("/news.html");
    await page.locator("#newsTabs .pill", { hasText: "公司公告" }).click();
    await expect(page.locator("#newsList .news-item").first()).toBeVisible();
    await expect(page.locator("#newsList")).toContainText("公告");
  });
});

test.describe("我的自选 · 分组与备注全链路", () => {
  test("空态提示", async ({ page }) => {
    await page.goto("/watchlist.html");
    await expect(page.locator("#wlContent")).toContainText("自选列表还是空的");
  });

  test("从筛选器加入 2 只 → 自选显示 2 行 → 新建分组并移动 → 删除分组回收", async ({ page }) => {
    await page.goto("/screener.html?mode=advanced");
    await expect(page.locator("#resultTable tbody tr").first()).toBeVisible();
    await page.locator("#resultTable tbody tr:nth-child(1) .wl-btn").click();
    await page.locator("#resultTable tbody tr:nth-child(2) .wl-btn").click();

    await page.goto("/watchlist.html");
    await expect(page.locator("#wlContent tbody tr")).toHaveCount(2);

    // 新建分组
    page.once("dialog", (d) => d.accept("长期定投"));
    await page.locator("#addGroup").click();
    await expect(page.locator(".wl-tab", { hasText: "长期定投" })).toBeVisible();

    // 移动第一只到「长期定投」
    await page.locator("#wlContent tbody tr").first().locator(".wl-group-sel").selectOption("长期定投");
    await expect(page.locator(".wl-tab", { hasText: "长期定投" })).toContainText("1");

    // 写备注
    const note = page.locator(".wl-note").first();
    await note.click();
    await note.fill("长期持有");
    await page.locator("h1").first().click(); // 触发 blur 保存
    await page.reload();
    await expect(page.locator(".wl-note").first()).toContainText("长期持有");

    // 删除分组（确认对话框）→ 分组消失
    page.once("dialog", (d) => d.accept());
    await page.locator('.del-g[data-del="长期定投"]').click();
    await expect(page.locator('.wl-tab', { hasText: "长期定投" })).toHaveCount(0);
    // 基金仍在（被回收到默认），总数不变
    await expect(page.locator("#wlContent tbody tr")).toHaveCount(2);
  });
});
