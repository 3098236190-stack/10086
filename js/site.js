/* ============================================================
   基智汇 · 全站通用脚本 (site.js)
   - 注入顶部导航 + 合规条 + 页脚（含风险提示）
   - 顶部搜索、移动端菜单
   - 自选 Watchlist（localStorage）
   - 通用 toast 提示
   每个页面在 <body data-page="xxx"> 标注当前栏目用于高亮。
   ============================================================ */
(function () {
  "use strict";

  var NAV = [
    { key: "home",      text: "首页",     href: "index.html" },
    { key: "fund",      text: "基金数据", href: "screener.html" },
    { key: "edu",       text: "投教课堂", href: "education.html" },
    { key: "strategy",  text: "策略专栏", href: "strategy.html" },
    { key: "news",      text: "市场资讯", href: "news.html" },
    { key: "watchlist", text: "我的自选", href: "watchlist.html" }
  ];

  var page = document.body.getAttribute("data-page") || "";

  /* ---------------- 主题（尽早应用，减少闪烁） ---------------- */
  var THEME_KEY = "jzh_theme";
  function curTheme() { try { return localStorage.getItem(THEME_KEY) || "light"; } catch (e) { return "light"; } }
  function applyTheme(t) {
    if (t === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    var btn = document.getElementById("themeToggle");
    if (btn) btn.textContent = t === "dark" ? "☀️" : "🌙";
  }
  applyTheme(curTheme());

  /* ---------------- 顶部 ---------------- */
  function buildHeader() {
    var menu = NAV.map(function (n) {
      return '<a href="' + n.href + '"' + (n.key === page ? ' class="active"' : "") + '>' + n.text + "</a>";
    }).join("");

    var html =
      '<div class="compliance-bar"><div class="wrap">' +
        '<span class="dot">●</span>' +
        '<span>市场有风险，投资需谨慎 · 历史业绩不代表未来表现 · 本站内容仅供参考，不构成投资建议</span>' +
      "</div></div>" +
      '<header class="site-header"><div class="wrap"><nav class="nav">' +
        '<a class="brand" href="index.html">' +
          '<span class="logo">智</span>' +
          '<span>基智汇<small>FUND · 投教门户</small></span>' +
        "</a>" +
        '<div class="nav-search">' +
          '<input id="globalSearch" type="text" placeholder="搜索基金名称 / 代码，如 沪深300" autocomplete="off">' +
          '<button id="globalSearchBtn" aria-label="搜索">🔍</button>' +
        "</div>" +
        '<button class="nav-toggle" id="navToggle" aria-label="菜单">☰</button>' +
        '<div class="nav-menu" id="navMenu">' + menu + "</div>" +
        '<button class="theme-toggle" id="themeToggle" title="切换深色/浅色" aria-label="切换主题">🌙</button>' +
      "</nav></div></header>";

    var host = document.getElementById("site-header");
    if (host) host.innerHTML = html;
  }

  /* ---------------- 页脚 ---------------- */
  function buildFooter() {
    var html =
      '<footer class="site-footer"><div class="wrap">' +
        '<div class="footer-risk">' +
          "<b>风险提示：</b>基金有风险，投资需谨慎。本网站为基金资讯与投资者教育演示平台，所展示的基金数据、净值、收益率、排名等均为<b>虚构演示数据</b>，" +
          "不代表任何真实产品，不构成任何投资建议或对未来收益的承诺。<b>历史业绩不代表未来表现</b>，基金的过往业绩及其净值高低并不预示其未来表现。" +
          "投资者应当认真阅读基金合同、招募说明书等法律文件，结合自身风险承受能力审慎决策，独立承担投资风险。" +
        "</div>" +
        '<div class="footer-cols">' +
          "<div><h4>基智汇 · 基金投教门户</h4>" +
            '<p style="color:#9fb6d4;margin:0 0 6px;line-height:1.8">面向理财小白与进阶基民的基金资讯与投资者教育平台，倡导理性投资、长期投资、价值投资。</p>' +
          "</div>" +
          '<div><h4>核心栏目</h4>' +
            '<a href="screener.html">基金筛选</a><a href="fund-detail.html?code=001234">基金详情</a><a href="education.html">投教课堂</a><a href="strategy.html">策略专栏</a></div>' +
          '<div><h4>实用工具</h4>' +
            '<a href="screener.html">基金筛选器</a><a href="education.html#tools">定投计算器</a><a href="education.html#tools">风险测评</a><a href="watchlist.html">我的自选</a></div>' +
          '<div><h4>合规与帮助</h4>' +
            '<a href="#" onclick="return false">投资者适当性</a><a href="#" onclick="return false">免责声明</a><a href="#" onclick="return false">隐私政策</a><a href="#" onclick="return false">联系我们</a></div>' +
        "</div>" +
        '<div class="footer-bottom">' +
          "演示项目 · 仅供学习交流 © 2026 基智汇　|　本站为产品原型演示，非真实金融服务，不接受任何资金往来　|　ICP 备案号：示例-00000000号" +
        "</div>" +
      "</div></footer>";

    var host = document.getElementById("site-footer");
    if (host) host.innerHTML = html;
  }

  /* ---------------- 交互 ---------------- */
  function wireSearch() {
    var input = document.getElementById("globalSearch");
    var btn = document.getElementById("globalSearchBtn");
    if (!input) return;
    function go() {
      var q = input.value.trim();
      if (!q) { location.href = "screener.html"; return; }
      location.href = "search.html?q=" + encodeURIComponent(q);
    }
    btn && btn.addEventListener("click", go);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
  }

  function wireNavToggle() {
    var t = document.getElementById("navToggle");
    var m = document.getElementById("navMenu");
    if (t && m) t.addEventListener("click", function () { m.classList.toggle("open"); });
  }

  function wireTheme() {
    var btn = document.getElementById("themeToggle");
    if (!btn) return;
    applyTheme(curTheme());
    btn.addEventListener("click", function () {
      var next = curTheme() === "dark" ? "light" : "dark";
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      applyTheme(next);
      window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
    });
  }

  /* ---------------- 返回顶部 ---------------- */
  function backToTop() {
    var btn = document.createElement("button");
    btn.className = "to-top"; btn.id = "toTop"; btn.innerHTML = "↑"; btn.title = "返回顶部";
    btn.setAttribute("aria-label", "返回顶部");
    document.body.appendChild(btn);
    btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () {
        btn.classList.toggle("show", window.pageYOffset > 400); ticking = false;
      });
    });
  }

  /* ---------------- 自选 Watchlist（成员 + 分组 + 备注） ---------------- */
  var KEY = "jzh_watchlist";       // 成员：代码数组
  var META = "jzh_wl_meta";        // 元数据：{ groups:[], items:{code:{group,note}} }
  function readMeta() {
    try { var m = JSON.parse(localStorage.getItem(META) || "{}"); m.groups = m.groups || []; m.items = m.items || {}; return m; }
    catch (e) { return { groups: [], items: {} }; }
  }
  function writeMeta(m) { try { localStorage.setItem(META, JSON.stringify(m)); } catch (e) {} }

  var Watchlist = {
    list: function () {
      try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; }
    },
    has: function (code) { return this.list().indexOf(code) >= 0; },
    add: function (code) {
      var l = this.list();
      if (l.indexOf(code) < 0) { l.push(code); localStorage.setItem(KEY, JSON.stringify(l)); }
      return l;
    },
    remove: function (code) {
      var l = this.list().filter(function (c) { return c !== code; });
      localStorage.setItem(KEY, JSON.stringify(l));
      var m = readMeta(); delete m.items[code]; writeMeta(m);
      return l;
    },
    toggle: function (code) {
      if (this.has(code)) { this.remove(code); return false; }
      this.add(code); return true;
    },
    /* 分组 */
    groups: function () { return ["默认"].concat(readMeta().groups); },
    addGroup: function (name) {
      name = (name || "").trim(); if (!name || name === "默认") return false;
      var m = readMeta(); if (m.groups.indexOf(name) >= 0) return false;
      m.groups.push(name); writeMeta(m); return true;
    },
    removeGroup: function (name) {
      if (name === "默认") return;
      var m = readMeta();
      m.groups = m.groups.filter(function (g) { return g !== name; });
      Object.keys(m.items).forEach(function (c) { if (m.items[c] && m.items[c].group === name) m.items[c].group = "默认"; });
      writeMeta(m);
    },
    groupOf: function (code) { var it = readMeta().items[code]; return (it && it.group) || "默认"; },
    setGroup: function (code, name) { var m = readMeta(); m.items[code] = m.items[code] || {}; m.items[code].group = name; writeMeta(m); },
    noteOf: function (code) { var it = readMeta().items[code]; return (it && it.note) || ""; },
    setNote: function (code, note) { var m = readMeta(); m.items[code] = m.items[code] || {}; m.items[code].note = note; writeMeta(m); }
  };
  window.Watchlist = Watchlist;

  /* ---------------- Toast ---------------- */
  var toastTimer;
  window.toast = function (msg) {
    var el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.style.cssText = "position:fixed;left:50%;bottom:40px;transform:translateX(-50%) translateY(20px);" +
        "background:rgba(26,35,50,.94);color:#fff;padding:11px 22px;border-radius:24px;font-size:13px;z-index:200;" +
        "opacity:0;transition:.25s;pointer-events:none;box-shadow:0 6px 24px rgba(0,0,0,.2)";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    requestAnimationFrame(function () {
      el.style.opacity = "1"; el.style.transform = "translateX(-50%) translateY(0)";
    });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.style.opacity = "0"; el.style.transform = "translateX(-50%) translateY(20px)";
    }, 1900);
  };

  /* ---------------- favicon（内联 SVG，避免 404） ---------------- */
  function injectFavicon() {
    if (document.querySelector("link[rel='icon']")) return;
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>" +
      "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
      "<stop offset='0' stop-color='#00a878'/><stop offset='1' stop-color='#1a5cad'/></linearGradient></defs>" +
      "<rect width='64' height='64' rx='15' fill='url(#g)'/>" +
      "<text x='32' y='45' font-size='38' text-anchor='middle' fill='#fff' font-family='sans-serif' font-weight='bold'>智</text></svg>";
    var l = document.createElement("link");
    l.rel = "icon";
    l.href = "data:image/svg+xml," + encodeURIComponent(svg);
    document.head.appendChild(l);
  }

  /* ---------------- init ---------------- */
  injectFavicon();
  buildHeader();
  buildFooter();
  wireSearch();
  wireNavToggle();
  wireTheme();
  backToTop();
})();
