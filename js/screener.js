/* ============================================================
   基智汇 · 基金筛选器 (screener.js)
   新手向导模式 + 进阶专业模式
   ============================================================ */
(function () {
  "use strict";
  var D = window.SiteData;
  if (!D) return;
  var fmt = D.fmtPct, cls = D.cls, funds = D.funds;

  var qs = new URLSearchParams(location.search);

  /* ============ 模式切换 ============ */
  var modeSwitch = document.getElementById("modeSwitch");
  var wizardPanel = document.getElementById("wizardPanel");
  var advancedPanel = document.getElementById("advancedPanel");

  function setMode(mode) {
    modeSwitch.querySelectorAll("button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.mode === mode);
    });
    wizardPanel.classList.toggle("hide", mode !== "wizard");
    advancedPanel.classList.toggle("hide", mode !== "advanced");
    document.getElementById("compareBar").classList.toggle("show", mode === "advanced" && compare.length > 0);
  }
  modeSwitch.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return; setMode(b.dataset.mode);
  });

  /* ============ 新手向导模式 ============ */
  var WIZ = [
    {
      q: "您的风险承受能力如何？", hint: "选一个最贴近你心态的，亏一点就睡不着 还是 能扛波动搏高收益？",
      key: "risk",
      opts: [
        { v: "保守", t: "保守型", d: "本金安全第一，几乎不能接受亏损" },
        { v: "稳健", t: "稳健型", d: "愿承担小幅波动，追求稳稳的收益" },
        { v: "平衡", t: "平衡型", d: "能接受中等波动，攻守兼顾" },
        { v: "进取", t: "进取型", d: "敢于承担较大波动，追求高回报" }
      ]
    },
    {
      q: "这笔钱你打算放多久？", hint: "投资期限越长，越能从容应对短期波动。",
      key: "term",
      opts: [
        { v: "3个月内", t: "3 个月内", d: "随时可能要用，重在灵活与稳" },
        { v: "半年到1年", t: "半年 ~ 1 年", d: "短期闲钱，求稳为主" },
        { v: "1到3年", t: "1 ~ 3 年", d: "中期不用，可适度承担波动" },
        { v: "3年以上", t: "3 年以上", d: "长期不用，可着眼长期成长" }
      ]
    },
    {
      q: "你更偏好哪个方向？", hint: "不确定也没关系，「混合均衡」是个稳妥的起点。",
      key: "dir",
      opts: [
        { v: "宽基指数", t: "宽基指数", d: "一篮子打包，分散又省心" },
        { v: "行业主题", t: "行业主题", d: "看好某个赛道，弹性更大" },
        { v: "债券固收", t: "债券固收", d: "求稳为主，波动较小" },
        { v: "混合均衡", t: "混合均衡", d: "股债搭配，攻守兼备" }
      ]
    }
  ];
  var wizState = { step: 0, answers: {} };

  var RISK_ALLOW = {
    "保守": ["R1", "R2"], "稳健": ["R1", "R2", "R3"],
    "平衡": ["R2", "R3", "R4"], "进取": ["R3", "R4", "R5"]
  };

  function renderWizard() {
    if (wizState.step >= WIZ.length) { renderWizardResult(); return; }
    var step = WIZ[wizState.step];
    var bars = WIZ.map(function (_, i) {
      return '<div class="step' + (i <= wizState.step ? " on" : "") + '"></div>';
    }).join("");
    var picked = wizState.answers[step.key];
    var opts = step.opts.map(function (o) {
      return '<div class="opt' + (picked === o.v ? " sel" : "") + '" data-v="' + o.v + '">' +
        '<div class="ot">' + o.t + '</div><div class="od">' + o.d + '</div></div>';
    }).join("");

    wizardPanel.innerHTML =
      '<div class="wizard card" style="padding:30px">' +
        '<div class="wizard-progress">' + bars + '</div>' +
        '<div class="wizard-q">' +
          '<div class="small muted tc" style="margin-bottom:6px">第 ' + (wizState.step + 1) + ' / ' + WIZ.length + ' 步</div>' +
          '<h2>' + step.q + '</h2>' +
          '<div class="hint">' + step.hint + '</div>' +
          '<div class="opt-grid">' + opts + '</div>' +
        '</div>' +
        '<div class="wizard-nav">' +
          '<button class="btn" id="wizBack"' + (wizState.step === 0 ? ' disabled style="opacity:.5"' : '') + '>← 上一步</button>' +
          '<button class="btn btn-primary" id="wizNext"' + (picked ? '' : ' disabled style="opacity:.5"') + '>' +
            (wizState.step === WIZ.length - 1 ? "查看推荐结果 →" : "下一步 →") + '</button>' +
        '</div>' +
        '<div class="disclaimer-inline" style="margin-top:18px">本向导根据你的选择做规则匹配，结果<b>仅为示例参考</b>，不构成投资建议；请结合自身情况独立决策。</div>' +
      '</div>';

    wizardPanel.querySelectorAll(".opt").forEach(function (o) {
      o.addEventListener("click", function () {
        wizState.answers[step.key] = o.dataset.v;
        renderWizard();
      });
    });
    var nx = document.getElementById("wizNext");
    nx && nx.addEventListener("click", function () { if (wizState.answers[step.key]) { wizState.step++; renderWizard(); } });
    var bk = document.getElementById("wizBack");
    bk && bk.addEventListener("click", function () { if (wizState.step > 0) { wizState.step--; renderWizard(); } });
  }

  function scoreFund(f, a) {
    var allow = RISK_ALLOW[a.risk] || [];
    var score = 0, reasons = [];
    if (allow.indexOf(f.risk) >= 0) { score += 3; reasons.push("风险等级 " + f.risk + "，与你的「" + a.risk + "」偏好相符"); }
    else { score -= 4; }
    if (f.direction === a.dir) { score += 3; reasons.push("投资方向「" + f.direction + "」正中你的偏好"); }
    if ((f.appetite || []).indexOf(a.risk) >= 0) score += 2;

    // 期限匹配
    var shortTerm = (a.term === "3个月内" || a.term === "半年到1年");
    if (shortTerm) {
      if (f.type === "货币型" || f.type === "债券型") { score += 2; reasons.push("偏短期持有，" + f.type + "相对平稳、流动性好"); }
      if (f.risk === "R5" || f.risk === "R4") score -= 2;
    } else {
      if (f.risk === "R4" || f.risk === "R5") { score += 1; }
      if (a.term === "3年以上" && (f.type === "股票型" || f.type === "混合型" || f.type === "指数型"))
        reasons.push("适合长期持有，时间有望平滑短期波动");
    }
    // 低波动加分（保守/稳健）
    if ((a.risk === "保守" || a.risk === "稳健") && f.metrics.mdd > -10) {
      score += 1; reasons.push("最大回撤约 " + f.metrics.mdd + "%，持有体验相对平稳");
    }
    // 标签亮点
    (f.tags || []).forEach(function (t) {
      if (["金牛奖", "晨星五星", "低波动", "指数增强"].indexOf(t) >= 0) reasons.push("具备「" + t + "」特征");
    });
    return { score: score, reasons: reasons.slice(0, 3) };
  }

  function renderWizardResult() {
    var a = wizState.answers;
    var scored = funds.map(function (f) {
      var s = scoreFund(f, a); return { f: f, score: s.score, reasons: s.reasons };
    }).filter(function (x) { return x.score > 0; })
      .sort(function (x, y) { return y.score - x.score || y.f.metrics.sharpe - x.f.metrics.sharpe; })
      .slice(0, 10);

    var summary = '你选择了：<b>' + a.risk + '型</b> · 投资 <b>' + WIZ[1].opts.filter(function(o){return o.v===a.term;})[0].t +
      '</b> · 偏好 <b>' + a.dir + '</b>';

    // 透明度说明：当风险约束导致无法匹配到偏好方向时，明确告知（优先保障风险匹配）
    var dirMatched = scored.some(function (x) { return x.f.direction === a.dir; });
    if (scored.length && !dirMatched) {
      summary += '<div style="font-size:12px;opacity:.9;margin-top:8px;line-height:1.6">' +
        '注：在你的「' + a.risk + '型」风险偏好下，暂无符合「' + a.dir + '」方向的合适产品，已优先为你保障<b>风险等级匹配</b>。' +
        '如仍想关注该方向，可切换进阶模式自行权衡。</div>';
    }

    var cards = scored.length ? scored.map(function (x, i) {
      var f = x.f, yc = cls(f.ret.y1);
      var reasons = x.reasons.map(function (r) { return '<li>✓ ' + r + '</li>'; }).join("");
      return '<div class="card" style="padding:16px;display:flex;gap:14px;align-items:flex-start">' +
        '<div class="rk' + (i < 3 ? ' top' : '') + '" style="margin-top:3px">' + (i + 1) + '</div>' +
        '<div style="flex:1">' +
          '<div class="flex between items-center" style="flex-wrap:wrap;gap:6px">' +
            '<a href="fund-detail.html?code=' + f.code + '" style="font-size:16px;font-weight:700">' + f.name + '</a>' +
            '<span><span class="risk ' + f.risk + '">' + f.risk + '</span> <span class="tag gray">' + f.type + '</span></span>' +
          '</div>' +
          '<div class="small muted" style="margin:4px 0 8px">' + f.code + ' · ' + f.company + ' · 近一年 <span class="' + yc + ' b">' + fmt(f.ret.y1) + '</span> · 最大回撤 <b>' + f.metrics.mdd + '%</b></div>' +
          '<ul class="small" style="color:var(--ink-700);line-height:1.9">' + reasons + '</ul>' +
          '<div style="margin-top:10px;display:flex;gap:8px">' +
            '<a class="btn btn-sm btn-primary" href="fund-detail.html?code=' + f.code + '">查看详情</a>' +
            '<button class="btn btn-sm wl-btn" data-code="' + f.code + '">' + (Watchlist.has(f.code) ? "已自选 ✓" : "+ 自选") + '</button>' +
          '</div>' +
        '</div></div>';
    }).join("") : '<div class="empty"><div class="ic">🤔</div>没有完全匹配的演示基金，建议放宽条件或切换到进阶模式手动筛选。</div>';

    wizardPanel.innerHTML =
      '<div class="wizard" style="max-width:780px">' +
        '<div class="card" style="padding:20px;margin-bottom:16px;background:linear-gradient(135deg,#0f2e5c,#1a5cad);color:#fff">' +
          '<div style="font-size:13px;opacity:.85">根据你的画像，为你筛选出以下方向相符的基金（演示）</div>' +
          '<div style="font-size:15px;margin-top:6px">' + summary + '</div>' +
        '</div>' +
        '<div class="grid" style="gap:12px">' + cards + '</div>' +
        '<div class="flex" style="gap:10px;margin-top:18px;justify-content:center">' +
          '<button class="btn" id="wizRestart">↺ 重新测一次</button>' +
          '<button class="btn btn-ghost" id="toAdvanced">切换到进阶模式精筛 →</button>' +
        '</div>' +
        '<div class="disclaimer-inline" style="margin-top:16px">以上结果由规则匹配生成，<b>仅供学习参考，不构成投资建议</b>。基金有风险，历史业绩不代表未来表现，请独立决策。</div>' +
      '</div>';

    document.getElementById("wizRestart").addEventListener("click", function () {
      wizState = { step: 0, answers: {} }; renderWizard();
    });
    document.getElementById("toAdvanced").addEventListener("click", function () { setMode("advanced"); });
    wizardPanel.querySelectorAll(".wl-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        var on = Watchlist.toggle(b.dataset.code);
        b.textContent = on ? "已自选 ✓" : "+ 自选";
        toast(on ? "已加入自选" : "已移出自选");
      });
    });
  }

  /* ============ 进阶专业模式 ============ */
  var TYPES = ["股票型", "混合型", "债券型", "指数型", "QDII", "货币型", "FOF"];
  var RISKS = ["R1", "R2", "R3", "R4", "R5"];
  var COMPANIES = funds.map(function (f) { return f.company; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
  var TAGS = ["金牛奖", "晨星五星", "低波动", "高分红", "指数增强", "行业主题"];

  var state = {
    types: [], risks: [], companies: [], tags: [],
    scale: "", age: "", rank: "",
    retY1: 0, retY3: -100, mdd: -100, sharpe: 0, vol: 100, mgrYears: 0,
    sortKey: "y1", sortDir: -1, page: 1, perPage: 20
  };

  function chk(label, on) { return '<span class="chk' + (on ? " on" : "") + '" data-v="' + label + '">' + label + '</span>'; }

  function buildFilterUI() {
    var side = document.getElementById("filterSide");
    side.innerHTML =
      '<div class="filter-group"><h4>基金类型</h4><div class="chk-list" data-grp="types">' + TYPES.map(function (t) { return chk(t, state.types.indexOf(t) >= 0); }).join("") + '</div></div>' +
      '<div class="filter-group"><h4>风险等级 <span class="small muted">R1低→R5高</span></h4><div class="chk-list" data-grp="risks">' + RISKS.map(function (t) { return chk(t, state.risks.indexOf(t) >= 0); }).join("") + '</div></div>' +
      '<div class="filter-group"><h4>基金公司</h4><div class="chk-list" data-grp="companies">' + COMPANIES.map(function (t) { return chk(t, state.companies.indexOf(t) >= 0); }).join("") + '</div></div>' +
      '<div class="filter-group"><h4>基金规模</h4><select class="field" id="fScale" style="height:34px"><option value="">不限</option><option value="0-10">10 亿以下</option><option value="10-50">10 ~ 50 亿</option><option value="50-100">50 ~ 100 亿</option><option value="100-99999">100 亿以上</option></select></div>' +
      '<div class="filter-group"><h4>成立年限</h4><select class="field" id="fAge" style="height:34px"><option value="">不限</option><option value="1">满 1 年</option><option value="3">满 3 年</option><option value="5">满 5 年</option></select></div>' +
      '<div class="filter-group"><h4>同类排名</h4><select class="field" id="fRank" style="height:34px"><option value="">不限</option><option value="10">前 10%</option><option value="20">前 20%</option><option value="30">前 30%</option></select></div>' +
      '<div class="filter-group"><h4>近 1 年收益 ≥ <span class="slider-val" id="vY1">0%</span></h4><input type="range" id="rY1" min="0" max="30" step="1" value="0"></div>' +
      '<div class="filter-group"><h4>最大回撤 ≥ <span class="slider-val" id="vMdd">-100%</span></h4><input type="range" id="rMdd" min="-60" max="0" step="1" value="-100"><div class="small muted">向右收紧：只看回撤更小的</div></div>' +
      '<div class="filter-group"><h4>夏普比率 ≥ <span class="slider-val" id="vSharpe">0</span></h4><input type="range" id="rSharpe" min="0" max="2" step="0.1" value="0"></div>' +
      '<div class="filter-group"><h4>波动率 ≤ <span class="slider-val" id="vVol">不限</span></h4><input type="range" id="rVol" min="2" max="40" step="1" value="40"><div class="small muted">向左收紧：只看更平稳的</div></div>' +
      '<div class="filter-group"><h4>经理任职 ≥ <span class="slider-val" id="vMgr">0 年</span></h4><input type="range" id="rMgr" min="0" max="10" step="1" value="0"></div>' +
      '<div class="filter-group"><h4>特色标签</h4><div class="chk-list" data-grp="tags">' + TAGS.map(function (t) { return chk(t, state.tags.indexOf(t) >= 0); }).join("") + '</div></div>' +
      '<div class="filter-group"><button class="btn btn-block" id="fReset">重置全部条件</button></div>';

    // 多选 chips
    side.querySelectorAll(".chk-list").forEach(function (grp) {
      grp.addEventListener("click", function (e) {
        var c = e.target.closest(".chk"); if (!c) return;
        var key = grp.dataset.grp, v = c.dataset.v, arr = state[key];
        var idx = arr.indexOf(v);
        if (idx >= 0) arr.splice(idx, 1); else arr.push(v);
        c.classList.toggle("on");
        state.page = 1; render();
      });
    });
    // selects
    bindSel("fScale", "scale"); bindSel("fAge", "age"); bindSel("fRank", "rank");
    // sliders
    bindRange("rY1", "retY1", "vY1", function (v) { return v + "%"; });
    bindRange("rMdd", "mdd", "vMdd", function (v) { return v <= -60 ? "-100%" : v + "%"; }, true);
    bindRange("rSharpe", "sharpe", "vSharpe", function (v) { return (+v).toFixed(1); });
    bindRange("rVol", "vol", "vVol", function (v) { return v >= 40 ? "不限" : "≤" + v + "%"; });
    bindRange("rMgr", "mgrYears", "vMgr", function (v) { return v + " 年"; });

    document.getElementById("fReset").addEventListener("click", function () {
      state.types = []; state.risks = []; state.companies = []; state.tags = [];
      state.scale = ""; state.age = ""; state.rank = "";
      state.retY1 = 0; state.retY3 = -100; state.mdd = -100; state.sharpe = 0; state.vol = 100; state.mgrYears = 0;
      state.page = 1; buildFilterUI(); render();
    });
  }
  function bindSel(id, key) {
    var el = document.getElementById(id); if (!el) return; el.value = state[key];
    el.addEventListener("change", function () { state[key] = el.value; state.page = 1; render(); });
  }
  function bindRange(id, key, valId, fmtFn, isMdd) {
    var el = document.getElementById(id), lab = document.getElementById(valId); if (!el) return;
    el.addEventListener("input", function () {
      var v = +el.value;
      lab.textContent = fmtFn(v);
      state[key] = (isMdd && v <= -60) ? -100 : (id === "rVol" && v >= 40 ? 100 : v);
      state.page = 1; render();
    });
  }

  function applyFilters() {
    return funds.filter(function (f) {
      if (state.types.length && state.types.indexOf(f.type) < 0) return false;
      if (state.risks.length && state.risks.indexOf(f.risk) < 0) return false;
      if (state.companies.length && state.companies.indexOf(f.company) < 0) return false;
      if (state.tags.length && !state.tags.every(function (t) { return (f.tags || []).indexOf(t) >= 0; })) return false;
      if (state.scale) { var p = state.scale.split("-"); if (f.scale < +p[0] || f.scale > +p[1]) return false; }
      if (state.age && f.ageYears < +state.age) return false;
      if (state.rank && f.rank > +state.rank) return false;
      if (f.ret.y1 < state.retY1) return false;
      if (f.metrics.mdd < state.mdd) return false;          // mdd 为负，越大越好
      if (f.metrics.sharpe < state.sharpe) return false;
      if (f.metrics.vol > state.vol) return false;
      if (f.mgrYears < state.mgrYears) return false;
      return true;
    });
  }

  var SORTS = [
    { k: "y1", t: "近一年" }, { k: "y3", t: "近三年" }, { k: "scale", t: "规模" },
    { k: "sharpe", t: "夏普" }, { k: "mdd", t: "回撤控制" }, { k: "age", t: "成立时间" }, { k: "day", t: "日涨幅" }
  ];
  function sortVal(f, k) {
    if (k === "scale") return f.scale; if (k === "sharpe") return f.metrics.sharpe;
    if (k === "mdd") return f.metrics.mdd; if (k === "age") return f.ageYears;
    if (k === "day") return f.day; return f.ret[k];
  }

  function exportCSV(list) {
    if (!list.length) { toast("没有可导出的数据"); return; }
    var head = ["基金代码", "基金名称", "类型", "风险等级", "单位净值", "日涨跌%", "近1年%", "近3年%", "最大回撤%", "夏普", "波动率%", "规模(亿)", "基金公司", "基金经理"];
    var rows = list.map(function (f) {
      return [f.code, f.name, f.type, f.risk, f.nav, f.day, f.ret.y1, f.ret.y3, f.metrics.mdd, f.metrics.sharpe, f.metrics.vol, f.scale, f.company, f.manager];
    });
    var csv = [head].concat(rows).map(function (r) {
      return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\r\n");
    var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }); // BOM 兼容 Excel 中文
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "基智汇-基金筛选结果.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast("已导出 " + list.length + " 条（演示数据，不构成投资建议）");
  }

  function render() {
    var list = applyFilters();
    list.sort(function (a, b) { return (sortVal(a, state.sortKey) - sortVal(b, state.sortKey)) * state.sortDir; });

    // 结果条
    var bar = document.getElementById("resultBar");
    bar.innerHTML =
      '<div class="count">共筛选出 <b>' + list.length + '</b> 只基金（演示库）　' +
        '<button class="btn btn-sm btn-ghost" id="exportCsv">⬇ 导出 CSV</button></div>' +
      '<div class="sort-tabs">排序：' + SORTS.map(function (s) {
        var on = s.k === state.sortKey;
        return '<button class="' + (on ? "on" : "") + '" data-sort="' + s.k + '">' + s.t + (on ? ' <span class="ar">' + (state.sortDir < 0 ? "↓" : "↑") + '</span>' : '') + '</button>';
      }).join("") + '</div>';
    var expBtn = document.getElementById("exportCsv");
    if (expBtn) expBtn.addEventListener("click", function () { exportCSV(list); });
    bar.querySelectorAll("[data-sort]").forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.dataset.sort;
        if (state.sortKey === k) state.sortDir *= -1; else { state.sortKey = k; state.sortDir = -1; }
        render();
      });
    });

    // 分页
    var total = list.length, pages = Math.max(1, Math.ceil(total / state.perPage));
    if (state.page > pages) state.page = pages;
    var pageList = list.slice((state.page - 1) * state.perPage, state.page * state.perPage);

    var table = document.getElementById("resultTable");
    if (!pageList.length) {
      table.innerHTML = '<tbody><tr><td><div class="empty"><div class="ic">🔍</div>没有符合条件的基金，试试放宽筛选条件</div></td></tr></tbody>';
    } else {
      var head = '<thead><tr><th>基金名称</th><th class="tr">净值</th><th class="tr min-hide">日涨</th><th class="tr">近1年</th><th class="tr min-hide">近3年</th><th class="tr min-hide">最大回撤</th><th class="tr min-hide">夏普</th><th class="tr min-hide">规模/亿</th><th class="tr">操作</th></tr></thead>';
      var body = pageList.map(function (f) {
        var dc = cls(f.day), y1 = cls(f.ret.y1), y3 = cls(f.ret.y3);
        var inCompare = compare.indexOf(f.code) >= 0;
        return '<tr>' +
          '<td class="fund-name-cell"><a href="fund-detail.html?code=' + f.code + '"><div class="nm">' + f.name + '</div></a>' +
            '<div class="cd">' + f.code + ' <span class="risk ' + f.risk + '">' + f.risk + '</span> <span class="tag gray">' + f.type + '</span></div></td>' +
          '<td class="tr b">' + f.nav.toFixed(4) + '</td>' +
          '<td class="tr min-hide ' + dc + '">' + fmt(f.day) + '</td>' +
          '<td class="tr ' + y1 + ' b">' + fmt(f.ret.y1) + '</td>' +
          '<td class="tr min-hide ' + y3 + '">' + fmt(f.ret.y3) + '</td>' +
          '<td class="tr min-hide">' + f.metrics.mdd + '%</td>' +
          '<td class="tr min-hide">' + f.metrics.sharpe.toFixed(2) + '</td>' +
          '<td class="tr min-hide">' + f.scale.toFixed(1) + '</td>' +
          '<td class="tr" style="white-space:nowrap">' +
            '<button class="btn btn-sm wl-btn" data-code="' + f.code + '" title="加入自选">' + (Watchlist.has(f.code) ? "★" : "☆") + '</button> ' +
            '<button class="btn btn-sm cmp-btn ' + (inCompare ? "btn-primary" : "") + '" data-code="' + f.code + '">' + (inCompare ? "对比中" : "+对比") + '</button>' +
          '</td></tr>';
      }).join("");
      table.innerHTML = head + "<tbody>" + body + "</tbody>";
      table.querySelectorAll(".wl-btn").forEach(function (b) {
        b.addEventListener("click", function () {
          var on = Watchlist.toggle(b.dataset.code); b.textContent = on ? "★" : "☆";
          toast(on ? "已加入自选" : "已移出自选");
        });
      });
      table.querySelectorAll(".cmp-btn").forEach(function (b) {
        b.addEventListener("click", function () { toggleCompare(b.dataset.code); });
      });
    }

    // 分页器
    var pager = document.getElementById("pager");
    if (pages <= 1) { pager.innerHTML = ""; }
    else {
      var html = '<button class="btn btn-sm"' + (state.page === 1 ? " disabled" : "") + ' data-p="' + (state.page - 1) + '">上一页</button>';
      for (var p = 1; p <= pages; p++) html += '<button class="btn btn-sm ' + (p === state.page ? "btn-primary" : "") + '" data-p="' + p + '">' + p + '</button>';
      html += '<button class="btn btn-sm"' + (state.page === pages ? " disabled" : "") + ' data-p="' + (state.page + 1) + '">下一页</button>';
      pager.innerHTML = html;
      pager.querySelectorAll("[data-p]").forEach(function (b) {
        b.addEventListener("click", function () { state.page = +b.dataset.p; render(); window.scrollTo({ top: 200, behavior: "smooth" }); });
      });
    }
  }

  /* ============ 对比 ============ */
  var compare = [];
  function toggleCompare(code) {
    var i = compare.indexOf(code);
    if (i >= 0) compare.splice(i, 1);
    else {
      if (compare.length >= 4) { toast("最多对比 4 只基金"); return; }
      compare.push(code);
    }
    renderCompareBar(); render();
  }
  function renderCompareBar() {
    var bar = document.getElementById("compareBar");
    var slots = document.getElementById("compareSlots");
    bar.classList.toggle("show", compare.length > 0 && !advancedPanel.classList.contains("hide"));
    slots.innerHTML = compare.map(function (code) {
      var f = D.getFund(code);
      return '<div class="compare-slot"><span class="x" data-x="' + code + '">×</span>' + f.name + '</div>';
    }).join("") || '<span class="small muted">勾选基金加入对比（最多 4 只）</span>';
    slots.querySelectorAll(".x").forEach(function (x) {
      x.addEventListener("click", function () { toggleCompare(x.dataset.x); });
    });
  }
  document.getElementById("compareClear").addEventListener("click", function () { compare = []; renderCompareBar(); render(); });
  document.getElementById("compareGo").addEventListener("click", function () {
    if (compare.length < 2) { toast("至少选择 2 只基金对比"); return; }
    renderCompareModal();
  });
  function renderCompareModal() {
    var rows = [
      ["基金代码", function (f) { return f.code; }],
      ["类型", function (f) { return f.type; }],
      ["风险等级", function (f) { return '<span class="risk ' + f.risk + '">' + f.risk + '</span>'; }],
      ["单位净值", function (f) { return f.nav.toFixed(4); }],
      ["近1年", function (f) { return '<span class="' + cls(f.ret.y1) + '">' + fmt(f.ret.y1) + '</span>'; }],
      ["近3年", function (f) { return '<span class="' + cls(f.ret.y3) + '">' + fmt(f.ret.y3) + '</span>'; }],
      ["最大回撤", function (f) { return f.metrics.mdd + '%'; }],
      ["夏普比率", function (f) { return f.metrics.sharpe.toFixed(2); }],
      ["波动率", function (f) { return f.metrics.vol + '%'; }],
      ["规模(亿)", function (f) { return f.scale.toFixed(1); }],
      ["基金经理", function (f) { return f.manager; }],
      ["经理任职", function (f) { return f.mgrYears + ' 年'; }]
    ];
    var fs = compare.map(function (c) { return D.getFund(c); });
    var head = '<th style="text-align:left">对比项</th>' + fs.map(function (f) { return '<th>' + f.name + '</th>'; }).join("");
    var body = rows.map(function (r) {
      return '<tr><td style="text-align:left;color:var(--ink-600)">' + r[0] + '</td>' +
        fs.map(function (f) { return '<td class="tr">' + r[1](f) + '</td>'; }).join("") + '</tr>';
    }).join("");
    document.getElementById("compareBody").innerHTML =
      '<table class="holding-table"><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table>' +
      '<div class="disclaimer-inline" style="margin-top:14px">对比数据为演示用途，不构成投资建议；历史业绩不代表未来表现。</div>';
    document.getElementById("compareModal").classList.add("show");
  }
  document.getElementById("compareModal").addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close") || e.target === this) this.classList.remove("show");
  });

  /* ============ 初始化 ============ */
  buildFilterUI();
  render();
  renderWizard();
  renderCompareBar();

  // URL 参数
  if (qs.get("mode") === "advanced") setMode("advanced");
  else setMode("wizard");
  var q = qs.get("q");
  if (q) {
    setMode("advanced");
    // 简单地把关键词作为公司或类型尝试匹配，否则忽略
    toast('正在「进阶模式」为你展示全部基金，可手动筛选「' + q + '」');
  }
})();
