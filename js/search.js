/* 基智汇 · 全站搜索结果 (search.js) */
(function () {
  "use strict";
  var D = window.SiteData;
  if (!D) return;
  var fmt = D.fmtPct, cls = D.cls;
  var q = (new URLSearchParams(location.search).get("q") || "").trim();

  // 顶部搜索框回填
  var gs = document.getElementById("globalSearch");
  if (gs) gs.value = q;

  function hit(text) { return q && String(text).toLowerCase().indexOf(q.toLowerCase()) >= 0; }

  var funds = D.funds.filter(function (f) {
    return hit(f.name) || hit(f.code) || hit(f.type) || hit(f.company) || hit(f.manager) ||
      (f.tags || []).some(hit);
  });
  var edu = D.education.filter(function (e) { return hit(e.title) || hit(e.excerpt) || hit(e.cat) || hit(e.key); });
  var strat = D.strategies.filter(function (s) { return hit(s.title) || hit(s.suit); });

  var total = funds.length + edu.length + strat.length;
  document.getElementById("searchSummary").innerHTML = q
    ? '关键词「<b>' + q + '</b>」共找到 <b>' + total + '</b> 条结果（基金 ' + funds.length + ' · 投教 ' + edu.length + ' · 策略 ' + strat.length + '）'
    : "请输入关键词进行搜索";

  var host = document.getElementById("searchResults");
  if (!q) { host.innerHTML = '<div class="empty"><div class="ic">🔍</div>在顶部搜索框输入基金名称/代码、投教或策略关键词</div>'; return; }
  if (total === 0) {
    host.innerHTML = '<div class="card"><div class="empty"><div class="ic">🤔</div>没有找到与「' + q + '」相关的内容<br>' +
      '<a class="btn btn-primary" style="margin-top:14px" href="screener.html">去基金筛选器看看 →</a></div></div>';
    return;
  }

  var html = "";

  if (funds.length) {
    html += '<div class="section-head"><h2>基金 · ' + funds.length + '</h2><a class="more" href="screener.html">全部基金 →</a></div>' +
      '<div class="card" style="padding:0;overflow:auto;margin-bottom:26px"><table class="rank-table">' +
      '<thead><tr><th>基金名称</th><th class="tr">净值</th><th class="tr">日涨</th><th class="tr">近1年</th><th class="tr">风险</th></tr></thead><tbody>' +
      funds.map(function (f) {
        return '<tr onclick="location.href=\'fund-detail.html?code=' + f.code + '\'" style="cursor:pointer">' +
          '<td class="fund-name-cell"><div class="nm">' + hl(f.name) + '</div><div class="cd">' + hl(f.code) + ' · ' + f.company + ' · ' + f.type + '</div></td>' +
          '<td class="tr b">' + f.nav.toFixed(4) + '</td>' +
          '<td class="tr ' + cls(f.day) + '">' + fmt(f.day) + '</td>' +
          '<td class="tr ' + cls(f.ret.y1) + ' b">' + fmt(f.ret.y1) + '</td>' +
          '<td class="tr"><span class="risk ' + f.risk + '">' + f.risk + '</span></td></tr>';
      }).join("") + '</tbody></table></div>';
  }

  if (edu.length) {
    html += '<div class="section-head"><h2>投教课堂 · ' + edu.length + '</h2><a class="more" href="education.html">全部投教 →</a></div>' +
      '<div class="grid cols-3" style="margin-bottom:26px">' + edu.map(function (e) {
        return '<a class="card article-card" href="education.html?id=' + e.id + '">' +
          '<div class="top"><span class="aud ' + e.level + '">' + (e.level === "beginner" ? "🌱 入门" : "🚀 进阶") + '</span><span class="tag gray">' + e.cat + '</span></div>' +
          '<h3>' + hl(e.title) + '</h3><p class="excerpt">' + hl(e.excerpt) + '</p>' +
          '<div class="foot"><span>约 ' + e.read + '</span><span style="color:var(--blue-600);font-weight:600">阅读 →</span></div></a>';
      }).join("") + '</div>';
  }

  if (strat.length) {
    html += '<div class="section-head"><h2>策略专栏 · ' + strat.length + '</h2><a class="more" href="strategy.html">全部策略 →</a></div>' +
      '<div class="grid cols-2">' + strat.map(function (s) {
        return '<a class="card article-card" href="strategy.html?id=' + s.id + '">' +
          '<div class="top"><span class="aud ' + s.level + '">' + (s.level === "beginner" ? "🌱 小白友好" : "🚀 进阶实战") + '</span></div>' +
          '<h3>' + hl(s.title) + '</h3><p class="excerpt"><b>适合：</b>' + hl(s.suit) + '</p>' +
          '<div class="foot"><span class="small muted">方法逻辑 · 风险点</span><span style="color:var(--blue-600);font-weight:600">查看 →</span></div></a>';
      }).join("") + '</div>';
  }

  html += '<div class="disclaimer-inline" style="margin-top:22px">搜索结果基于演示数据，不构成投资建议。基金有风险，历史业绩不代表未来表现。</div>';
  host.innerHTML = html;

  function hl(text) {
    if (!q) return text;
    try {
      var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
      return String(text).replace(re, '<mark style="background:var(--orange-100);color:var(--orange-600);padding:0 2px;border-radius:3px">$1</mark>');
    } catch (e) { return text; }
  }
})();
