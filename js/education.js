/* ============================================================
   基智汇 · 投教课堂 (education.js)
   列表 / 文章阅读 / 定投计算器 / 风险测评
   ============================================================ */
(function () {
  "use strict";
  var D = window.SiteData;
  if (!D) return;
  var EDU = D.education;
  var qs = new URLSearchParams(location.search);

  var listView = document.getElementById("eduListView");
  var articleView = document.getElementById("eduArticleView");

  /* ---------- 文章正文（旗舰文章手写 + 其余模板化） ---------- */
  var BODIES = {
    e01:
      '<div class="callout"><b>场景：</b>第一次听到「基金」，很多人脑子里一团浆糊——它和股票什么关系？我的钱去哪了？别急，用买菜打个比方就懂了。</div>' +
      '<h2>核心概念：基金就是「凑钱请人买菜」</h2>' +
      '<p>假设你想吃一桌丰盛的菜，但既没时间逛菜市场，也不懂怎么挑食材。于是你和一群邻居凑钱，请一位经验丰富的大厨：你们出钱，大厨负责挑选、采购、搭配，最后做好的菜大家按出钱比例分。</p>' +
      '<p>基金就是这个道理：<b>投资者出钱，基金经理（大厨）用这笔钱去买股票、债券等资产（食材），赚了大家按份额分享，亏了也一起承担。</b>你买的「基金份额」，就是你在这桌菜里占的比例。</p>' +
      '<h3>那「净值」是什么？</h3>' +
      '<p>净值就是「每一份基金现在值多少钱」。今天食材涨价了，这桌菜更值钱，净值就上去；食材跌价，净值就下来。所以你的基金每天都在波动，是再正常不过的事。</p>' +
      '<h2>实操方法：新手记住这三点</h2>' +
      '<ul class="bul"><li>买基金 = 把钱交给专业团队，分散投到一篮子资产，不用自己盯个股；</li>' +
      '<li>不同基金「食材」不同：有的全是股票（波动大），有的全是债券（相对稳）；</li>' +
      '<li>挑基金本质是挑「大厨 + 菜谱」：看团队是否靠谱、风格是否适合你。</li></ul>' +
      '<div class="callout warn"><b>风险提示：</b>请专业的人也不保证一定赚钱。大厨水平有高低，食材价格会波动，基金同样有亏损的可能。<b>基金有风险，投资需谨慎，历史业绩不代表未来表现。</b></div>',
    e07:
      '<div class="callout"><b>场景：</b>打开任何一只基金，都能看到一个 R1 到 R5 的标签。这串代码到底什么意思？买之前为什么一定要看它？</div>' +
      '<h2>核心概念：风险等级是基金的「辣度标签」</h2>' +
      '<p>就像火锅有微辣到变态辣，监管把基金按风险高低分成 5 档。数字越大，潜在波动和亏损可能越大，当然潜在收益空间通常也更大。</p>' +
      '<ul class="bul">' +
      '<li><b>R1（低风险）</b>：以货币基金为代表，求稳为主，适合放短期闲钱；</li>' +
      '<li><b>R2（中低风险）</b>：多为纯债基金，波动较小；</li>' +
      '<li><b>R3（中风险）</b>：常见于「固收+」、平衡型、部分指数基金；</li>' +
      '<li><b>R4（中高风险）</b>：多为偏股混合、行业相对分散的股票基金；</li>' +
      '<li><b>R5（高风险）</b>：行业主题、高弹性股票基金，涨跌都可能很猛。</li></ul>' +
      '<h2>实操方法：买之前先「对号入座」</h2>' +
      '<ul class="bul"><li>先搞清自己的风险承受能力（可以做一次风险测评）；</li>' +
      '<li>再看基金风险等级是否匹配——保守的人别一上来就冲 R5；</li>' +
      '<li>风险等级要和「这笔钱能放多久」结合看：短期要用的钱，不适合放高风险产品。</li></ul>' +
      '<div class="callout warn"><b>风险提示：</b>风险等级只是分类参考，<b>同一等级内不同基金的实际波动仍有差异，且任何等级都可能出现亏损</b>。请结合自身情况独立决策。</div>',
    e12:
      '<div class="callout"><b>场景：</b>每个月工资到账，想理财又怕在高点买入被套。有没有一种「不用择时、还能强制储蓄」的笨办法？有，它叫定投。</div>' +
      '<h2>核心概念：定投就是「设个闹钟，自动买」</h2>' +
      '<p>定投（定期定额）指的是每隔固定时间（比如每月发薪日），用固定金额买入同一只基金。涨的时候买到的份额少，跌的时候买到的份额多，长期下来成本被摊平，这叫「平均成本法」。</p>' +
      '<h2>实操方法：工薪族这样起步</h2>' +
      '<ul class="bul"><li>用每月结余的闲钱，设定一个不影响生活的固定金额；</li>' +
      '<li>优先选波动适中、长期方向清晰的宽基指数作为起点；</li>' +
      '<li>坚持扣款，别因为短期下跌就停——下跌其实是在低位多攒份额；</li>' +
      '<li>事先想好「赚到多少就止盈」，避免坐过山车。</li></ul>' +
      '<div class="callout warn"><b>风险提示：</b>定投能平滑成本，但<b>不能保证盈利，单边下跌行情中同样会浮亏</b>。它的价值在于纪律与长期，而非预测高低点。</div>'
  };

  var SCENE = {
    "基础概念": "很多新手卡在最开始的概念关，似懂非懂就匆忙下场。这一篇，我们把它彻底讲清楚。",
    "交易流程": "知道是一回事，真正操作起来又是另一回事。这一篇带你把流程走顺。",
    "风险认知": "投资里最贵的学费，往往来自对风险的误解。先把风险看明白，比急着赚钱更重要。",
    "避坑指南": "前人踩过的坑，没必要再踩一遍。这一篇帮你提前绕开。",
    "分类解析": "名字相近的基金，内里可能天差地别。看懂分类，才能选对工具。",
    "指标解读": "数据不会骗人，但会被误读。这一篇教你正确打开一个关键指标。",
    "资产配置": "决定长期收益的，往往不是选了哪只基金，而是怎么配置。",
    "定投优化": "同样是定投，方法不同，体验和结果可能差很多。",
    "经理筛选": "把钱托付给谁，是主动基金最关键的一道选择题。"
  };

  function genBody(a) {
    if (BODIES[a.id]) return BODIES[a.id];
    var scene = SCENE[a.cat] || "我们用尽量通俗的方式，把这个话题讲明白。";
    return '<div class="callout"><b>场景：</b>' + scene + '</div>' +
      '<h2>核心概念</h2>' +
      '<p>' + a.excerpt + '</p>' +
      '<p>理解这一点，关键是抓住它在你整个投资决策中的位置：它既不是万能钥匙，也不是可有可无的细节，而是帮助你做出更理性判断的一块拼图。' +
      (a.level === "advanced" ? "对进阶投资者而言，真正的价值在于把它和其他维度结合起来交叉验证，而不是孤立地看单一数字。" : "对新手而言，先建立正确的直觉，比记住精确定义更重要。") + '</p>' +
      '<h2>实操方法</h2>' +
      '<ul class="bul">' +
      '<li>先明确你的目标与可投资的资金性质（闲钱、期限、可承受的波动）；</li>' +
      '<li>把本文的概念落到一个可执行的检查清单上，而不是停留在「知道了」；</li>' +
      '<li>' + (a.level === "advanced" ? "结合多周期、多指标交叉判断，警惕单一数据带来的误导；" : "从小金额、低门槛开始实践，在过程中加深理解；") + '</li>' +
      '<li>定期回顾：投资逻辑是否仍然成立，而非被短期涨跌牵着走。</li></ul>' +
      '<div class="callout key"><b>一句话总结：</b>' + a.key + '</div>' +
      '<div class="callout warn"><b>风险提示：</b>基金有风险，投资需谨慎。历史业绩不代表未来表现，本文涉及的方法与判断均存在不确定性，请结合自身情况独立决策。</div>';
  }

  /* ---------- 文章阅读视图 ---------- */
  function showArticle(id) {
    var a = EDU.filter(function (e) { return e.id === id; })[0];
    if (!a) { showList(); return; }
    listView.classList.add("hide");
    articleView.classList.remove("hide");
    document.title = a.title + " | 基智汇投教课堂";

    var related = EDU.filter(function (e) { return e.level === a.level && e.id !== a.id && e.cat === a.cat; }).slice(0, 3);
    if (related.length < 3) {
      EDU.filter(function (e) { return e.level === a.level && e.id !== a.id; }).forEach(function (e) {
        if (related.length < 3 && related.indexOf(e) < 0) related.push(e);
      });
    }

    articleView.innerHTML =
      '<div class="breadcrumb"><a href="#" id="backList">← 返回投教课堂</a> / ' + a.cat + '</div>' +
      '<div class="grid" style="grid-template-columns:1fr 280px;gap:24px;align-items:start">' +
        '<article class="card" style="padding:30px 34px">' +
          '<div style="margin-bottom:10px"><span class="aud ' + a.level + '">' + (a.level === "beginner" ? "🌱 小白入门" : "🚀 进阶提升") + '</span> ' +
            '<span class="tag gray">' + a.cat + '</span> <span class="small muted">约 ' + a.read + '阅读</span></div>' +
          '<h1 style="font-size:26px;line-height:1.4;margin-bottom:16px">' + a.title + '</h1>' +
          '<div class="article-body">' + genBody(a) + '</div>' +
          '<div class="divider"></div>' +
          '<div class="small muted">本文仅为知识科普，不构成投资建议。市场有风险，投资需谨慎。</div>' +
        '</article>' +
        '<aside>' +
          '<div class="card" style="padding:18px">' +
            '<h3 style="font-size:15px;margin-bottom:12px">📌 本文要点</h3>' +
            '<div class="callout key" style="margin:0">' + a.key + '</div>' +
          '</div>' +
          '<div class="card" style="padding:18px;margin-top:16px">' +
            '<h3 style="font-size:15px;margin-bottom:10px">🔗 相关阅读</h3>' +
            related.map(function (r) {
              return '<a class="news-item" style="display:block" href="education.html?id=' + r.id + '"><div style="font-size:13px;color:var(--ink-700)">' + r.title + '</div></a>';
            }).join("") +
          '</div>' +
          '<a class="btn btn-primary btn-block" style="margin-top:16px" href="screener.html?mode=wizard">🌱 学完去试试选基向导</a>' +
        '</aside>' +
      '</div>';

    document.getElementById("backList").addEventListener("click", function (e) {
      e.preventDefault(); history.pushState({}, "", "education.html"); showList();
    });
    window.scrollTo(0, 0);
  }

  /* ---------- 列表视图 ---------- */
  var curLevel = qs.get("level") || "all";
  var curCat = "all";

  function cats(level) {
    var pool = EDU.filter(function (e) { return level === "all" || e.level === level; });
    var set = []; pool.forEach(function (e) { if (set.indexOf(e.cat) < 0) set.push(e.cat); });
    return set;
  }

  function renderPath() {
    var host = document.getElementById("eduPath");
    var items = EDU.filter(function (e) { return e.level === "beginner"; })
      .sort(function (a, b) { return a.order - b.order; }).slice(0, 8);
    host.innerHTML = items.map(function (e, i) {
      return '<div class="path-step"><div class="node"><div class="dot">' + (i + 1) + '</div><div class="line"></div></div>' +
        '<div class="body"><h4><a href="education.html?id=' + e.id + '">' + e.title + '</a></h4>' +
        '<p>' + e.excerpt + '</p></div></div>';
    }).join("");
  }

  function renderCatPills() {
    var host = document.getElementById("eduCatPills");
    var list = cats(curLevel);
    host.innerHTML = '<span class="pill' + (curCat === "all" ? " on" : "") + '" data-cat="all">全部分类</span>' +
      list.map(function (c) { return '<span class="pill' + (curCat === c ? " on" : "") + '" data-cat="' + c + '">' + c + '</span>'; }).join("");
    host.querySelectorAll(".pill").forEach(function (p) {
      p.addEventListener("click", function () { curCat = p.dataset.cat; renderCatPills(); renderGrid(); });
    });
  }

  function renderGrid() {
    var host = document.getElementById("eduGrid");
    var list = EDU.filter(function (e) {
      return (curLevel === "all" || e.level === curLevel) && (curCat === "all" || e.cat === curCat);
    });
    document.getElementById("eduCount").textContent = "共 " + list.length + " 篇";
    host.innerHTML = list.map(function (e) {
      return '<a class="card article-card" href="education.html?id=' + e.id + '">' +
        '<div class="top"><span class="aud ' + e.level + '">' + (e.level === "beginner" ? "🌱 入门" : "🚀 进阶") + '</span><span class="tag gray">' + e.cat + '</span></div>' +
        '<h3>' + e.title + '</h3>' +
        '<p class="excerpt">' + e.excerpt + '</p>' +
        '<div class="foot"><span>约 ' + e.read + '</span><span style="color:var(--blue-600);font-weight:600">阅读全文 →</span></div>' +
        '</a>';
    }).join("");
  }

  function showList() {
    articleView.classList.add("hide");
    listView.classList.remove("hide");
    document.title = "投教课堂 · 小白入门 + 进阶提升 | 基智汇";
    renderPath(); renderCatPills(); renderGrid();
  }

  document.getElementById("eduLevelPills").querySelectorAll(".pill").forEach(function (p) {
    p.addEventListener("click", function () {
      curLevel = p.dataset.level; curCat = "all";
      document.querySelectorAll("#eduLevelPills .pill").forEach(function (x) { x.classList.remove("on"); });
      p.classList.add("on");
      renderCatPills(); renderGrid();
    });
  });
  // 初始 level pill 高亮
  document.querySelectorAll("#eduLevelPills .pill").forEach(function (p) {
    p.classList.toggle("on", p.dataset.level === curLevel);
  });

  /* ---------- 定投计算器 ---------- */
  function openModal(id) { document.getElementById(id).classList.add("show"); }
  function closeModal(el) { el.classList.remove("show"); }
  document.querySelectorAll(".modal-mask").forEach(function (m) {
    m.addEventListener("click", function (e) {
      if (e.target.hasAttribute("data-close") || e.target === m) closeModal(m);
    });
  });
  document.getElementById("openCalc").addEventListener("click", function () { openModal("calcModal"); });
  function annuityFV(amt, months, annualRate) {
    var r = annualRate / 12;
    return r === 0 ? amt * months : amt * (Math.pow(1 + r, months) - 1) / r * (1 + r);
  }
  document.getElementById("calcBtn").addEventListener("click", function () {
    var amt = +document.getElementById("cAmt").value || 0;
    var years = Math.max(1, Math.min(40, +document.getElementById("cYears").value || 1));
    var rate = (+document.getElementById("cRate").value || 0) / 100;
    var months = years * 12;
    var fv = annuityFV(amt, months, rate);
    var invest = amt * months;
    document.getElementById("calcOut").classList.remove("hide");
    document.getElementById("cFinal").textContent = "¥" + Math.round(fv).toLocaleString();
    document.getElementById("cInvest").textContent = "¥" + Math.round(invest).toLocaleString();
    var profit = fv - invest;
    var pe = document.getElementById("cProfit");
    pe.textContent = (profit >= 0 ? "+¥" : "-¥") + Math.abs(Math.round(profit)).toLocaleString();
    pe.className = profit >= 0 ? "up" : "down";

    // 多情景曲线（按年取点）
    if (window.Charts) {
      var rLow = Math.max(0, rate - 0.03), rHigh = rate + 0.03;
      var principal = [], low = [], mid = [], high = [], labels = [];
      for (var y = 1; y <= years; y++) {
        var m = y * 12;
        labels.push("第 " + y + " 年");
        principal.push(amt * m);
        low.push(annuityFV(amt, m, rLow));
        mid.push(annuityFV(amt, m, rate));
        high.push(annuityFV(amt, m, rHigh));
      }
      var money = function (v) { return v >= 10000 ? "¥" + (v / 10000).toFixed(1) + "万" : "¥" + Math.round(v); };
      Charts.line(document.getElementById("calcChart"), {
        height: 220, labels: labels,
        fmtAxis: money, fmtVal: function (v) { return "¥" + Math.round(v).toLocaleString(); },
        series: [
          { name: "累计投入", color: "#8a93a0", values: principal, width: 1.5 },
          { name: "谨慎", color: "#2670c9", values: low, width: 1.6 },
          { name: "乐观", color: "#ff7a1a", values: high, width: 1.6 },
          { name: "中性", color: "#00a878", values: mid, fill: true, width: 2.4 }
        ]
      });
    }
  });

  /* ---------- 风险测评 ---------- */
  var QUIZ = [
    { q: "如果你的基金一个月内亏了 15%，你会？", opts: [["立刻全部卖出，受不了", 1], ["有点慌，先卖一部分", 2], ["按兵不动，再看看", 3], ["逢低补仓，越跌越买", 4]] },
    { q: "这笔投资的钱，大概多久不用？", opts: [["1 年以内", 1], ["1-3 年", 2], ["3-5 年", 3], ["5 年以上", 4]] },
    { q: "你对基金/投资的了解程度？", opts: [["几乎不懂", 1], ["知道一点", 2], ["比较了解", 3], ["相当熟悉", 4]] },
    { q: "你更认同哪种说法？", opts: [["保住本金最重要", 1], ["稳稳收益就好", 2], ["愿担波动换更高收益", 3], ["高风险高回报，搏一把", 4]] },
    { q: "这笔钱占你可投资资产的比例？", opts: [["几乎是全部", 1], ["一大半", 2], ["一小部分", 3], ["很小，亏了不影响生活", 4]] }
  ];
  var quizState = { step: 0, score: 0 };
  function renderQuiz() {
    var body = document.getElementById("quizBody");
    if (quizState.step >= QUIZ.length) {
      var avg = quizState.score / QUIZ.length;
      var profile = avg <= 1.5 ? ["保守型", "R1-R2", "你更看重本金安全，可重点关注货币、纯债等低风险产品。"] :
        avg <= 2.5 ? ["稳健型", "R1-R3", "你能接受小幅波动，可关注「固收+」、平衡型等稳健方向。"] :
        avg <= 3.3 ? ["平衡型", "R2-R4", "你攻守兼顾，可考虑股债搭配、宽基指数等均衡配置。"] :
        ["进取型", "R3-R5", "你能承受较大波动追求高回报，但仍需做好分散与仓位管理。"];
      body.innerHTML =
        '<div class="calc-result"><div class="small muted">你的风险偏好画像（演示）</div>' +
        '<div class="big">' + profile[0] + '</div>' +
        '<div class="small" style="margin-top:6px">可承受风险等级约 <b>' + profile[1] + '</b></div></div>' +
        '<p style="margin:14px 0;color:var(--ink-700)">' + profile[2] + '</p>' +
        '<a class="btn btn-primary btn-block" href="screener.html?mode=wizard">🌱 用这个结果去匹配基金方向</a>' +
        '<button class="btn btn-block" style="margin-top:10px" id="quizRetry">重新测评</button>' +
        '<div class="disclaimer-inline" style="margin-top:14px">本测评为简化演示，<b>不能替代正式的投资者风险承受能力评估</b>。实际投资请以销售机构的适当性测评为准。</div>';
      document.getElementById("quizRetry").addEventListener("click", function () { quizState = { step: 0, score: 0 }; renderQuiz(); });
      return;
    }
    var q = QUIZ[quizState.step];
    body.innerHTML =
      '<div class="wizard-progress" style="margin-bottom:18px">' + QUIZ.map(function (_, i) {
        return '<div class="step' + (i <= quizState.step ? " on" : "") + '"></div>';
      }).join("") + '</div>' +
      '<div class="small muted tc" style="margin-bottom:8px">第 ' + (quizState.step + 1) + " / " + QUIZ.length + ' 题</div>' +
      '<h3 style="text-align:center;margin-bottom:18px">' + q.q + '</h3>' +
      '<div class="grid" style="gap:10px">' + q.opts.map(function (o, i) {
        return '<button class="opt" data-s="' + o[1] + '" style="text-align:left"><div class="ot" style="font-size:14px">' + o[0] + '</div></button>';
      }).join("") + '</div>';
    body.querySelectorAll(".opt").forEach(function (b) {
      b.addEventListener("click", function () { quizState.score += +b.dataset.s; quizState.step++; renderQuiz(); });
    });
  }
  document.getElementById("openQuiz").addEventListener("click", function () {
    quizState = { step: 0, score: 0 }; renderQuiz(); openModal("quizModal");
  });

  /* ---------- 路由 ---------- */
  var id = qs.get("id");
  if (id) showArticle(id); else showList();
  if (location.hash === "#tools" && !id) {
    setTimeout(function () { document.getElementById("tools").scrollIntoView({ behavior: "smooth" }); }, 100);
  }
})();
