// 公共测试夹具：以「找茬」思想，任何页面/控制台错误、以及页面出现 NaN/undefined 文本，都判失败。
const base = require("@playwright/test");

const test = base.test.extend({
  // 自动捕获运行期错误，测试结束后断言为空
  page: async ({ page }, use) => {
    const errors = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    page.on("console", (m) => { if (m.type() === "error") errors.push("console.error: " + m.text()); });
    await use(page);
    base.expect(errors, "页面不应有运行期/控制台错误").toEqual([]);
  },
});

// 移动端时先展开汉堡菜单，再操作导航链接
async function openNav(page) {
  const toggle = page.locator("#navToggle");
  if (await toggle.isVisible()) await toggle.click();
}

// 断言可见区域文本不含明显的渲染缺陷
async function assertNoGarbage(page) {
  const body = await page.locator("body").innerText();
  base.expect(body, "不应出现 NaN").not.toContain("NaN");
  base.expect(body, "不应出现 undefined").not.toContain("undefined");
  base.expect(body, "不应出现 [object Object]").not.toContain("[object Object]");
  base.expect(body, "不应出现未替换的占位符").not.toMatch(/\$\{|\+-/);
}

module.exports = { test, expect: base.expect, openNav, assertNoGarbage };
