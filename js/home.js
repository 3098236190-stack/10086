/* ============================================================
   基智汇 · 首页脚本 (home.js)
   ============================================================ */
(function () {
  "use strict";
  var D = window.SiteData;
  if (!D) return;
  var fmt = D.fmtPct, cls = D.cls;

  /* 滚动行情条（指数 + 板块，复制两份实现无缝滚动） */
  (function () {
    var host = document.getElementById("homeTicker");
    if (!host) return;
    var items = D.indices.concat(D.sectors.map(function (s) { return { name: s.name, value: null, change: s.change }; }));
    function cell(x) {
      var c = cls(x.change);
      return '<span class="ticker-item">' + x.name +
        (x.value !== null ? ' <b>' + x.value.toFixed(2) + '</b>' : '') +
        ' <span class="' + c + '">' + fmt(x.change) + '</span></span>';
    }
    var one = items.map(cell).join("");
    host.innerHTML = '<div class="wrap" style="overflow:hidden"><div class="ticker-track">' + one + one + '</div></div>';
  })();

  /* 大盘指数 */
  (function () {
    var host = document.getElementById("homeIndices");
    host.innerHTML = D.indices.slice(0, 4).map(function (x) {
      var c = cls(x.change);
      return '<div class="index-item">' +
        '<div><div class="name">' + x.name + '</div><div class="small muted">' + x.code + '</div></div>' +
        '<div class="tr"><div class="val ' + c + '">' + x.value.toFixed(2) + '</div>' +
        '<span class="chg chip-' + c + '">' + fmt(x.change) + '</span></div>' +
        '</div>';
    }).join("");
  })();

  /* 小白学习路径（取前 5 个入门课） */
  (function () {
    var host = document.getElementById("homePath");
    var items = D.education.filter(function (e) { return e.level === "beginner"; })
      .sort(function (a, b) { return a.order - b.order; }).slice(0, 5);
    host.innerHTML = items.map(function (e, i) {
      return '<div class="path-step">' +
        '<div class="node"><div class="dot">' + (i + 1) + '</div><div class="line"></div></div>' +
        '<div class="body"><h4><a href="education.html?id=' + e.id + '">' + e.title + '</a></h4>' +
        '<p>' + e.key + '</p></div></div>';
    }).join("");
  })();

  /* 进阶投教精选 */
  (function () {
    var host = document.getElementById("homeAdvEdu");
    var items = D.education.filter(function (e) { return e.level === "advanced"; }).slice(0, 5);
    host.innerHTML = items.map(function (e, i) {
      return '<a class="item" href="education.html?id=' + e.id + '">' +
        '<span class="num">' + (i + 1) + '</span>' +
        '<div><h4>' + e.title + '</h4><p>' + e.excerpt + '</p></div></a>';
    }).join("");
  })();

  /* 基金涨幅 TOP10（按当日涨幅排序） */
  (function () {
    var host = document.getElementById("homeTop10");
    var items = D.funds.slice().sort(function (a, b) { return b.day - a.day; }).slice(0, 10);
    var head = '<thead><tr><th style="width:40px">排名</th><th>基金名称</th><th class="tr">单位净值</th><th class="tr">日涨跌</th><th class="tr">近一年</th></tr></thead>';
    var body = items.map(function (f, i) {
      var dc = cls(f.day), yc = cls(f.ret.y1);
      return '<tr onclick="location.href=\'fund-detail.html?code=' + f.code + '\'" style="cursor:pointer">' +
        '<td><span class="rk' + (i < 3 ? ' top' : '') + '">' + (i + 1) + '</span></td>' +
        '<td class="fund-name-cell"><div class="nm">' + f.name + '</div><div class="cd">' + f.code + ' · <span class="tag gray">' + f.type + '</span></div></td>' +
        '<td class="tr b">' + f.nav.toFixed(4) + '</td>' +
        '<td class="tr ' + dc + ' b">' + fmt(f.day) + '</td>' +
        '<td class="tr ' + yc + '">' + fmt(f.ret.y1) + '</td>' +
        '</tr>';
    }).join("");
    host.innerHTML = head + "<tbody>" + body + "</tbody>";
  })();

  /* 热门板块 */
  (function () {
    var host = document.getElementById("homeSectors");
    var items = D.sectors.slice().sort(function (a, b) { return b.change - a.change; });
    items.forEach(function (s) {
      var c = cls(s.change);
      var color = s.change >= 0 ? "var(--up)" : "var(--down)";
      var row = document.createElement("div");
      row.className = "sector-bar";
      row.innerHTML = '<span class="nm">' + s.name + '</span>' +
        '<span class="track"><span class="fill" style="width:' + Math.min(100, Math.abs(s.change) / 4 * 100).toFixed(0) + '%;background:' + color + '"></span></span>' +
        '<span class="pc ' + c + '">' + fmt(s.change) + '</span>';
      host.appendChild(row);
    });
  })();

  /* 资讯三栏 */
  function renderNews(hostId, items) {
    var host = document.getElementById(hostId);
    host.innerHTML = items.map(function (n) {
      return '<div class="news-item"><a href="news.html"><span class="dot-tag">[' + n.tag + ']</span>' + n.title + '</a>' +
        '<div class="meta">' + n.time + '</div></div>';
    }).join("");
  }
  renderNews("newsIndustry", D.news.industry);
  renderNews("newsNotice", D.news.notice);
  renderNews("newsView", D.news.view);
})();
