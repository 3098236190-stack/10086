/* 基智汇 · 我的自选 (watchlist.js) —— 分组 + 备注 */
(function () {
  "use strict";
  var D = window.SiteData;
  if (!D) return;
  var fmt = D.fmtPct, cls = D.cls;
  var host = document.getElementById("wlContent");
  var curGroup = "全部";

  function render() {
    var codes = Watchlist.list();
    var funds = codes.map(function (c) { return D.getFund(c); }).filter(Boolean);

    if (!funds.length) {
      host.innerHTML =
        '<div class="card"><div class="empty">' +
        '<div class="ic">⭐</div><h3 style="margin-bottom:8px">自选列表还是空的</h3>' +
        '<p class="muted" style="margin-bottom:18px">在基金筛选或详情页点击「☆ 加自选」，就能把基金收藏到这里啦</p>' +
        '<a class="btn btn-primary" href="screener.html">去筛选基金 →</a>' +
        '</div></div>';
      return;
    }

    var groups = Watchlist.groups();
    // 分组计数
    function countIn(g) { return funds.filter(function (f) { return Watchlist.groupOf(f.code) === g; }).length; }
    var tabs = '<div class="wl-tab' + (curGroup === "全部" ? " on" : "") + '" data-g="全部">全部 <span class="cnt">' + funds.length + '</span></div>' +
      groups.map(function (g) {
        return '<div class="wl-tab' + (curGroup === g ? " on" : "") + '" data-g="' + g + '">' + g + ' <span class="cnt">' + countIn(g) + '</span>' +
          (g !== "默认" ? ' <span class="del-g" data-del="' + g + '" title="删除分组" style="margin-left:4px;color:inherit;opacity:.6">×</span>' : '') + '</div>';
      }).join("") +
      '<button class="btn btn-sm btn-ghost" id="addGroup">+ 新建分组</button>';

    var shown = funds.filter(function (f) { return curGroup === "全部" || Watchlist.groupOf(f.code) === curGroup; });
    var avgY1 = shown.length ? shown.reduce(function (a, f) { return a + f.ret.y1; }, 0) / shown.length : 0;

    var groupOpts = function (code) {
      var cur = Watchlist.groupOf(code);
      return groups.map(function (g) { return '<option value="' + g + '"' + (g === cur ? " selected" : "") + '>' + g + '</option>'; }).join("");
    };

    var rows = shown.map(function (f) {
      var dc = cls(f.day), y1 = cls(f.ret.y1), y3 = cls(f.ret.y3);
      return '<tr>' +
        '<td class="fund-name-cell"><a href="fund-detail.html?code=' + f.code + '"><div class="nm">' + f.name + '</div></a>' +
        '<div class="cd">' + f.code + ' <span class="risk ' + f.risk + '">' + f.risk + '</span> <span class="tag gray">' + f.type + '</span></div>' +
        '<div class="wl-note" contenteditable="true" data-note="' + f.code + '">' + escapeHtml(Watchlist.noteOf(f.code)) + '</div></td>' +
        '<td class="tr b min-hide">' + f.nav.toFixed(4) + '</td>' +
        '<td class="tr min-hide ' + dc + ' b">' + fmt(f.day) + '</td>' +
        '<td class="tr ' + y1 + '">' + fmt(f.ret.y1) + '</td>' +
        '<td class="tr min-hide ' + y3 + '">' + fmt(f.ret.y3) + '</td>' +
        '<td class="tr"><select class="wl-group-sel" data-grp="' + f.code + '" style="height:30px;border:1px solid var(--line-2);border-radius:6px;background:var(--card);color:var(--ink-900)">' + groupOpts(f.code) + '</select></td>' +
        '<td class="tr"><a class="btn btn-sm btn-primary" href="fund-detail.html?code=' + f.code + '">详情</a> ' +
        '<button class="btn btn-sm rm" data-code="' + f.code + '">移除</button></td>' +
        '</tr>';
    }).join("");

    host.innerHTML =
      '<div class="grid cols-3" style="margin-bottom:18px">' +
        '<div class="card" style="padding:18px"><div class="small muted">自选基金数</div><div style="font-size:26px;font-weight:800;color:var(--blue-700)">' + funds.length + ' 只</div></div>' +
        '<div class="card" style="padding:18px"><div class="small muted">当前分组平均近一年（演示）</div><div style="font-size:26px;font-weight:800" class="' + cls(avgY1) + '">' + (shown.length ? fmt(avgY1) : "--") + '</div></div>' +
        '<div class="card" style="padding:18px;display:flex;align-items:center;justify-content:space-between"><div><div class="small muted">添加更多</div><div class="b" style="font-size:15px">去基金筛选器</div></div><a class="btn btn-primary btn-sm" href="screener.html">去筛选</a></div>' +
      '</div>' +
      '<div class="wl-tabs">' + tabs + '</div>' +
      '<div class="card" style="padding:0;overflow:auto"><table class="rank-table">' +
        '<thead><tr><th>基金名称 / 备注</th><th class="tr min-hide">净值</th><th class="tr min-hide">日涨</th><th class="tr">近1年</th><th class="tr min-hide">近3年</th><th class="tr">分组</th><th class="tr">操作</th></tr></thead>' +
        '<tbody>' + (rows || '<tr><td colspan="7"><div class="empty">该分组下暂无基金</div></td></tr>') + '</tbody></table></div>' +
      '<div class="disclaimer-inline" style="margin-top:16px">自选、分组与备注均保存在本地浏览器（localStorage），清除缓存或更换设备将丢失。所示数据为<b>演示用途，不构成投资建议</b>，历史业绩不代表未来表现。</div>';

    wire();
  }

  function wire() {
    host.querySelectorAll(".wl-tab").forEach(function (t) {
      t.addEventListener("click", function (e) {
        if (e.target.hasAttribute("data-del")) {
          var g = e.target.getAttribute("data-del");
          if (confirm('删除分组「' + g + '」？该组基金将移回「默认」。')) {
            Watchlist.removeGroup(g); if (curGroup === g) curGroup = "全部"; render();
          }
          return;
        }
        curGroup = t.getAttribute("data-g"); render();
      });
    });
    var ag = document.getElementById("addGroup");
    if (ag) ag.addEventListener("click", function () {
      var name = prompt("新建分组名称：", "");
      if (name && Watchlist.addGroup(name)) { toast("已创建分组「" + name.trim() + "」"); render(); }
      else if (name) toast("分组已存在或名称无效");
    });
    host.querySelectorAll(".rm").forEach(function (b) {
      b.addEventListener("click", function () { Watchlist.remove(b.dataset.code); toast("已移出自选"); render(); });
    });
    host.querySelectorAll(".wl-group-sel").forEach(function (s) {
      s.addEventListener("change", function () { Watchlist.setGroup(s.dataset.grp, s.value); toast("已移动到「" + s.value + "」"); render(); });
    });
    host.querySelectorAll(".wl-note").forEach(function (n) {
      n.addEventListener("blur", function () {
        var txt = n.textContent.trim().slice(0, 60);
        Watchlist.setNote(n.dataset.note, txt);
      });
      n.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); n.blur(); } });
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  render();
})();
