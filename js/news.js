/* 基智汇 · 市场资讯 (news.js) */
(function () {
  "use strict";
  var D = window.SiteData;
  if (!D) return;
  var N = D.news;
  var TYPE = { industry: "行业要闻", notice: "公司公告", view: "观点解读" };
  var cur = "all";

  function all() {
    var out = [];
    ["industry", "notice", "view"].forEach(function (k) {
      N[k].forEach(function (n) { out.push({ k: k, n: n }); });
    });
    return out.sort(function (a, b) { return a.n.time < b.n.time ? 1 : -1; });
  }

  function render() {
    var host = document.getElementById("newsList");
    var list = cur === "all" ? all() : N[cur].map(function (n) { return { k: cur, n: n }; });
    host.innerHTML = list.map(function (x) {
      var color = x.k === "notice" ? "var(--blue-600)" : x.k === "view" ? "var(--green-600)" : "var(--orange-600)";
      return '<div class="news-item" style="padding:14px 0">' +
        '<div class="flex" style="gap:10px;align-items:flex-start">' +
        '<span class="tag" style="background:transparent;color:' + color + ';border:1px solid currentColor;flex-shrink:0">' + TYPE[x.k] + '</span>' +
        '<div style="flex:1"><a href="#" onclick="return false" style="font-size:15px;color:var(--ink-900);font-weight:500">' +
        '<span class="dot-tag">[' + x.n.tag + ']</span>' + x.n.title + '</a>' +
        '<div class="meta">' + x.n.time + '　·　来源：演示数据</div></div></div></div>';
    }).join("");
  }

  document.getElementById("newsTabs").querySelectorAll(".pill").forEach(function (p) {
    p.addEventListener("click", function () {
      cur = p.dataset.tab;
      document.querySelectorAll("#newsTabs .pill").forEach(function (x) { x.classList.remove("on"); });
      p.classList.add("on"); render();
    });
  });
  render();
})();
