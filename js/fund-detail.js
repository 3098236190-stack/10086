/* ============================================================
   基智汇 · 基金详情 (fund-detail.js)
   信息分层：小白先看核心结论 → 进阶再看深度数据
   ============================================================ */
(function () {
  "use strict";
  var D = window.SiteData;
  if (!D) return;
  var fmt = D.fmtPct, cls = D.cls;

  var code = new URLSearchParams(location.search).get("code") || D.funds[0].code;
  var f = D.getFund(code) || D.funds[0];
  document.getElementById("bcName").textContent = f.name;
  document.title = f.name + " " + f.code + " | 基智汇";

  function grade(rank) {
    if (rank <= 15) return ["excellent", "优秀"];
    if (rank <= 33) return ["good", "良好"];
    return ["ok", "一般"];
  }
  var gd = grade(f.rank);

  /* ---------- 业绩卡片 ---------- */
  var PERF = [
    ["近1周", "w1"], ["近1月", "m1"], ["近3月", "m3"], ["近6月", "m6"],
    ["近1年", "y1"], ["近3年", "y3"], ["成立来", "since"]
  ];
  var perfCells = PERF.map(function (p) {
    var v = f.ret[p[1]];
    var sub = (p[1] === "y1") ? '<div class="rk">同类前 ' + f.rank + '%</div>' : '<div class="rk">&nbsp;</div>';
    return '<div class="perf-cell"><div class="lab">' + p[0] + '</div>' +
      '<div class="val ' + cls(v) + '">' + (v === null ? "--" : fmt(v)) + '</div>' + sub + '</div>';
  }).join("");

  /* ---------- 资产配置 / 持仓 / 行业 ---------- */
  var alloc = [
    { name: "股票", value: f.allocation.stock, color: "#e0392f" },
    { name: "债券", value: f.allocation.bond, color: "#1a5cad" },
    { name: "现金", value: f.allocation.cash, color: "#00a878" }
  ].filter(function (a) { return a.value > 0; });

  var holdingRows = f.holdings.map(function (h, i) {
    return '<tr><td>' + (i + 1) + '　' + h[0] + '</td><td>' + h[1].toFixed(2) + '%</td>' +
      '<td><div class="track" style="height:8px;width:90px;background:var(--bg);border-radius:4px;display:inline-block;vertical-align:middle">' +
      '<div style="height:100%;border-radius:4px;width:' + Math.min(100, h[1] / f.holdings[0][1] * 100) + '%;background:var(--blue-500)"></div></div></td></tr>';
  }).join("");

  /* ---------- 进阶：业绩归因 / 持有人结构（演示合成） ---------- */
  var attrIndustry = +(f.ret.y1 * 0.55).toFixed(1);
  var attrStock = +(f.ret.y1 * 0.35).toFixed(1);
  var attrOther = +(f.ret.y1 - attrIndustry - attrStock).toFixed(1);
  var holderInst = 30 + (f.code.charCodeAt(5) % 40);
  var holderIndiv = 100 - holderInst - 2;

  /* ---------- 渲染 ---------- */
  var root = document.getElementById("fdRoot");
  root.innerHTML =
    // 基础信息 + 当前净值
    '<div class="card fd-head">' +
      '<div>' +
        '<div class="nm">' + f.name + '</div>' +
        '<div class="meta">' +
          '<span>代码 <b>' + f.code + '</b></span><span>·</span>' +
          '<span class="tag gray">' + f.type + '</span>' +
          '<span class="risk ' + f.risk + '">' + f.risk + ' 风险</span>' +
          '<span>·</span><span>' + f.company + '</span>' +
          (f.tags || []).map(function (t) { return '<span class="tag">' + t + '</span>'; }).join("") +
        '</div>' +
      '</div>' +
      '<div class="fd-nav-now">' +
        '<div class="small muted">单位净值（' + "2026-06-16" + '）</div>' +
        '<div class="v ' + cls(f.day) + '">' + f.nav.toFixed(4) + '</div>' +
        '<div class="d ' + cls(f.day) + '">' + fmt(f.day) + ' 今日　累计净值 ' + f.accNav.toFixed(4) + '</div>' +
        '<div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">' +
          '<button class="btn btn-sm" id="wlBtn"></button>' +
          '<button class="btn btn-sm btn-cta" id="buyBtn">模拟申购</button>' +
        '</div>' +
      '</div>' +
    '</div>' +

    // 业绩概览
    '<div class="card section" style="padding:18px 20px;margin-top:16px">' +
      '<div class="section-head" style="margin-bottom:12px"><h2 style="font-size:18px">业绩概览</h2>' +
        '<span class="sub">综合评级 <span class="grade ' + gd[0] + '">' + gd[1] + '</span> · 同类排名前 ' + f.rank + '%（演示）</span></div>' +
      '<div class="perf-grid">' + perfCells + '</div>' +
      '<div class="disclaimer-inline" style="margin-top:14px">「优秀 / 良好 / 一般」为基于同类排名的通俗化提示，便于新手理解；<b>历史业绩不代表未来表现</b>，不构成投资建议。</div>' +
    '</div>' +

    // 净值走势
    '<div class="card" style="padding:18px 20px;margin-top:16px">' +
      '<div class="section-head" style="margin-bottom:10px"><h2 style="font-size:18px">净值走势</h2>' +
        '<div class="chart-tools" id="rangeTools">' +
          '<button data-r="20">近1月</button><button data-r="60">近3月</button>' +
          '<button data-r="120">近6月</button><button data-r="250" class="on">近1年</button>' +
        '</div>' +
      '</div>' +
      '<div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:8px" class="small">' +
        '<span><span style="display:inline-block;width:14px;height:3px;background:#e0392f;vertical-align:middle"></span> ' + f.name + '</span>' +
        '<span><span style="display:inline-block;width:14px;height:3px;background:#9aa4b2;vertical-align:middle"></span> 同类平均</span>' +
        '<span><span style="display:inline-block;width:14px;height:3px;background:#1a5cad;vertical-align:middle"></span> 沪深300</span>' +
      '</div>' +
      '<div id="navChart"></div>' +
      '<div class="risk-note" style="margin-top:8px">对比线以区间期初净值为基点等比缩放，仅用于走势示意。历史走势不代表未来。</div>' +
    '</div>' +

    // 资产配置与持仓
    '<div class="grid" style="grid-template-columns:1fr 1.2fr;gap:16px;margin-top:16px">' +
      '<div class="card" style="padding:18px 20px">' +
        '<h2 style="font-size:18px;margin-bottom:14px">资产配置</h2>' +
        '<div style="display:flex;gap:18px;align-items:center">' +
          '<div id="allocChart"></div>' +
          '<div style="flex:1" id="allocLegend"></div>' +
        '</div>' +
        '<h3 style="font-size:15px;margin:18px 0 10px">行业分布</h3>' +
        '<div class="sector-list" id="industryBars"></div>' +
      '</div>' +
      '<div class="card" style="padding:18px 20px">' +
        '<h2 style="font-size:18px;margin-bottom:6px">前十大重仓</h2>' +
        '<div class="small muted" style="margin-bottom:10px">数据为演示用途，实际持仓以基金定期报告为准</div>' +
        '<table class="holding-table"><thead><tr><th>持仓</th><th>占比</th><th>占净值比</th></tr></thead><tbody>' + holdingRows + '</tbody></table>' +
      '</div>' +
    '</div>' +

    // 基金经理
    '<div class="card mgr-card" style="margin-top:16px">' +
      '<div class="mgr-avatar">' + f.manager.charAt(0) + '</div>' +
      '<div style="flex:1">' +
        '<div class="flex between items-center" style="flex-wrap:wrap"><h3 style="font-size:17px">' + f.manager +
          ' <span class="tag green" style="vertical-align:middle">基金经理</span></h3></div>' +
        '<div class="kv-list" style="margin-top:10px;grid-template-columns:repeat(4,1fr)">' +
          '<div class="kv"><span class="k">从业年限</span><span class="v">' + f.mgrYears + ' 年</span></div>' +
          '<div class="kv"><span class="k">任职年化</span><span class="v ' + cls(f.mgrAnnual) + '">' + fmt(f.mgrAnnual) + '</span></div>' +
          '<div class="kv"><span class="k">在管基金</span><span class="v">' + f.mgrFunds + ' 只</span></div>' +
          '<div class="kv"><span class="k">管理规模</span><span class="v">' + f.scale.toFixed(1) + ' 亿</span></div>' +
        '</div>' +
        '<p class="small muted" style="margin:10px 0 0">' + f.manager + '，证券从业 ' + f.mgrYears + ' 年，注重在控制回撤的前提下追求长期稳健回报，投资风格相对' +
          (f.risk === "R5" || f.risk === "R4" ? "进取，组合弹性较高" : f.risk === "R1" || f.risk === "R2" ? "稳健，强调持有体验" : "均衡，攻守兼顾") +
          '。（人物简介为演示文案）</p>' +
      '</div>' +
    '</div>' +

    // 进阶数据（默认折叠）
    '<div class="card" style="margin-top:16px">' +
      '<div class="collapse-head" id="advHead"><h2 style="font-size:18px">进阶数据 <span class="aud advanced">进阶</span></h2>' +
        '<span class="ar">▼ 展开查看风险指标 / 业绩归因 / 持有人结构</span></div>' +
      '<div class="collapse-body hide" id="advBody">' +
        '<h3 style="font-size:15px;margin-bottom:10px">风险指标（近1年，演示）</h3>' +
        '<div class="kv-list" style="grid-template-columns:repeat(3,1fr)">' +
          '<div class="kv"><span class="k">最大回撤</span><span class="v">' + f.metrics.mdd + '%</span></div>' +
          '<div class="kv"><span class="k">夏普比率</span><span class="v">' + f.metrics.sharpe.toFixed(2) + '</span></div>' +
          '<div class="kv"><span class="k">年化波动率</span><span class="v">' + f.metrics.vol + '%</span></div>' +
          '<div class="kv"><span class="k">下行风险</span><span class="v">' + f.metrics.downRisk + '%</span></div>' +
          '<div class="kv"><span class="k">信息比率</span><span class="v">' + f.metrics.info.toFixed(2) + '</span></div>' +
          '<div class="kv"><span class="k">成立年限</span><span class="v">' + f.ageYears + ' 年</span></div>' +
        '</div>' +
        '<h3 style="font-size:15px;margin:18px 0 10px">业绩归因（近1年收益拆解，演示）</h3>' +
        '<div class="sector-list" id="attrBars"></div>' +
        '<h3 style="font-size:15px;margin:18px 0 10px">持有人结构（演示）</h3>' +
        '<div class="sector-list" id="holderBars"></div>' +
      '</div>' +
    '</div>' +

    // 交易规则与费率
    '<div class="card" style="padding:18px 20px;margin-top:16px">' +
      '<h2 style="font-size:18px;margin-bottom:14px">交易规则与费率</h2>' +
      '<div class="kv-list" style="grid-template-columns:repeat(3,1fr)">' +
        '<div class="kv"><span class="k">申购费率</span><span class="v">' + f.fees.sub + '</span></div>' +
        '<div class="kv"><span class="k">赎回费率</span><span class="v">' + f.fees.red + '</span></div>' +
        '<div class="kv"><span class="k">管理费</span><span class="v">' + f.fees.manage + '</span></div>' +
        '<div class="kv"><span class="k">托管费</span><span class="v">' + f.fees.custody + '</span></div>' +
        '<div class="kv"><span class="k">申购确认</span><span class="v">' + f.fees.confirm + '</span></div>' +
        '<div class="kv"><span class="k">赎回到账</span><span class="v">' + f.fees.arrive + '</span></div>' +
      '</div>' +
      '<div class="disclaimer-inline" style="margin-top:14px">费率与交易规则<b>仅供参考，以基金公司官方公告及销售平台实际展示为准</b>。</div>' +
    '</div>' +

    // 风险提示
    '<div class="card" style="padding:18px 20px;margin-top:16px;background:#fbfaf4;border-color:#f0e6c8">' +
      '<h3 style="font-size:15px;color:var(--orange-600);margin-bottom:8px">⚠️ 风险提示与免责声明</h3>' +
      '<p class="small muted" style="line-height:1.9;margin:0">本页面所有基金信息、净值、收益率、排名及风险指标均为<b>虚构演示数据</b>，不代表任何真实基金产品，不构成任何投资建议或收益承诺。基金有风险，投资需谨慎。' +
      '基金的过往业绩及其净值高低并不预示其未来表现，基金管理人管理的其他基金的业绩不构成本基金业绩的保证。投资者应认真阅读基金合同、招募说明书等法律文件，' +
      '结合自身风险承受能力独立判断、自主决策、自担风险。</p>' +
    '</div>';

  /* ---------- 自选 / 申购 按钮 ---------- */
  var wlBtn = document.getElementById("wlBtn");
  function syncWl() { wlBtn.textContent = Watchlist.has(f.code) ? "★ 已自选" : "☆ 加自选"; }
  syncWl();
  wlBtn.addEventListener("click", function () {
    var on = Watchlist.toggle(f.code); syncWl(); toast(on ? "已加入自选" : "已移出自选");
  });
  document.getElementById("buyBtn").addEventListener("click", function () {
    toast("这是演示平台，不提供真实交易");
  });

  /* ---------- 净值图 ---------- */
  function rebase(series, base) {
    var s0 = series[0];
    return series.map(function (v) { return +(v / s0 * base).toFixed(4); });
  }
  function synth(seed, points, base, drift, vol) {
    var s = seed, out = [], v = 1;
    function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    for (var i = 0; i < points; i++) { v = v * (1 + (rnd() - 0.5) * vol + drift); out.push(v); }
    return rebase(out, base);
  }
  var chartHost = document.getElementById("navChart");
  function drawChart(range) {
    var full = f.navHistory;
    var slice = full.slice(Math.max(0, full.length - range));
    var base = slice[0];
    var peer = synth(7, slice.length, base, (f.ret.y1 / 100 * 0.6) / 250, f.metrics.vol / 100 / Math.sqrt(250) * 1.4);
    var hs = synth(31, slice.length, base, 0.0002, 0.011);
    Charts.line(chartHost, {
      height: 300,
      series: [
        { name: "同类平均", color: "#9aa4b2", values: peer, width: 1.5 },
        { name: "沪深300", color: "#1a5cad", values: hs, width: 1.5 },
        { name: f.name, color: "#e0392f", values: slice, fill: true, width: 2.4 }
      ]
    });
  }
  drawChart(250);
  document.getElementById("rangeTools").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    this.querySelectorAll("button").forEach(function (x) { x.classList.remove("on"); });
    b.classList.add("on"); drawChart(+b.dataset.r);
  });
  window.addEventListener("resize", function () {
    var on = document.querySelector("#rangeTools .on"); drawChart(on ? +on.dataset.r : 250);
  });

  /* ---------- 配置环形 + 图例 ---------- */
  Charts.donut(document.getElementById("allocChart"), alloc, { size: 150 });
  document.getElementById("allocLegend").innerHTML = alloc.map(function (a) {
    return '<div class="flex between" style="padding:5px 0"><span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + a.color + ';margin-right:6px"></span>' + a.name + '</span><b>' + a.value + '%</b></div>';
  }).join("");

  /* ---------- 行业柱 ---------- */
  Charts.hbars(document.getElementById("industryBars"),
    f.industries.map(function (x) { return { name: x[0], value: x[1] }; }), { color: "var(--blue-500)" });

  /* ---------- 进阶折叠 ---------- */
  var advHead = document.getElementById("advHead"), advBody = document.getElementById("advBody");
  advHead.addEventListener("click", function () {
    advHead.classList.toggle("open");
    advBody.classList.toggle("hide");
    if (!advBody.classList.contains("hide")) {
      Charts.hbars(document.getElementById("attrBars"), [
        { name: "行业配置", value: attrIndustry }, { name: "个股选择", value: attrStock }, { name: "其他", value: attrOther }
      ], { color: "var(--green-500)", unit: "%" });
      Charts.hbars(document.getElementById("holderBars"), [
        { name: "个人投资者", value: holderIndiv }, { name: "机构投资者", value: holderInst }, { name: "内部持有", value: 2 }
      ], { color: "var(--orange-500)" });
    }
  });
})();
