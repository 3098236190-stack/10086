/* 基智汇 · 我的自选 (watchlist.js) */
(function () {
  "use strict";
  var D = window.SiteData;
  if (!D) return;
  var fmt = D.fmtPct, cls = D.cls;
  var host = document.getElementById("wlContent");

  function render() {
    var codes = Watchlist.list();
    var funds = codes.map(function (c) { return D.getFund(c); }).filter(Boolean);

    if (!funds.length) {
      host.innerHTML =
        '<div class="card"><div class="empty">' +
        '<div class="ic">⭐</div>' +
        '<h3 style="margin-bottom:8px">自选列表还是空的</h3>' +
        '<p class="muted" style="margin-bottom:18px">在基金筛选或详情页点击「☆ 加自选」，就能把基金收藏到这里啦</p>' +
        '<a class="btn btn-primary" href="screener.html">去筛选基金 →</a>' +
        '</div></div>';
      return;
    }

    // 汇总
    var avgY1 = funds.reduce(function (a, f) { return a + f.ret.y1; }, 0) / funds.length;
    var rows = funds.map(function (f) {
      var dc = cls(f.day), y1 = cls(f.ret.y1), y3 = cls(f.ret.y3);
      return '<tr>' +
        '<td class="fund-name-cell"><a href="fund-detail.html?code=' + f.code + '"><div class="nm">' + f.name + '</div></a>' +
        '<div class="cd">' + f.code + ' <span class="risk ' + f.risk + '">' + f.risk + '</span> <span class="tag gray">' + f.type + '</span></div></td>' +
        '<td class="tr b">' + f.nav.toFixed(4) + '</td>' +
        '<td class="tr ' + dc + ' b">' + fmt(f.day) + '</td>' +
        '<td class="tr ' + y1 + '">' + fmt(f.ret.y1) + '</td>' +
        '<td class="tr ' + y3 + '">' + fmt(f.ret.y3) + '</td>' +
        '<td class="tr">' + f.metrics.mdd + '%</td>' +
        '<td class="tr"><a class="btn btn-sm btn-primary" href="fund-detail.html?code=' + f.code + '">详情</a> ' +
        '<button class="btn btn-sm rm" data-code="' + f.code + '">移除</button></td>' +
        '</tr>';
    }).join("");

    host.innerHTML =
      '<div class="grid cols-3" style="margin-bottom:18px">' +
        '<div class="card" style="padding:18px"><div class="small muted">自选基金数</div><div style="font-size:26px;font-weight:800;color:var(--blue-700)">' + funds.length + ' 只</div></div>' +
        '<div class="card" style="padding:18px"><div class="small muted">自选平均近一年（演示）</div><div style="font-size:26px;font-weight:800" class="' + cls(avgY1) + '">' + fmt(avgY1) + '</div></div>' +
        '<div class="card" style="padding:18px;display:flex;align-items:center;justify-content:space-between"><div><div class="small muted">管理自选</div><div class="b" style="font-size:15px">添加更多基金</div></div><a class="btn btn-primary btn-sm" href="screener.html">去筛选</a></div>' +
      '</div>' +
      '<div class="card" style="padding:0;overflow:auto"><table class="rank-table">' +
        '<thead><tr><th>基金名称</th><th class="tr">净值</th><th class="tr">日涨</th><th class="tr">近1年</th><th class="tr">近3年</th><th class="tr">最大回撤</th><th class="tr">操作</th></tr></thead>' +
        '<tbody>' + rows + '</tbody></table></div>' +
      '<div class="disclaimer-inline" style="margin-top:16px">自选数据保存在本地浏览器（localStorage），清除缓存或更换设备将丢失。所示数据为<b>演示用途，不构成投资建议</b>，历史业绩不代表未来表现。</div>';

    host.querySelectorAll(".rm").forEach(function (b) {
      b.addEventListener("click", function () {
        Watchlist.remove(b.dataset.code); toast("已移出自选"); render();
      });
    });
  }
  render();
})();
