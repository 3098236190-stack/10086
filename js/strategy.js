/* ============================================================
   基智汇 · 策略专栏 (strategy.js)
   ============================================================ */
(function () {
  "use strict";
  var D = window.SiteData;
  if (!D) return;
  var STR = D.strategies;
  var qs = new URLSearchParams(location.search);
  var listView = document.getElementById("stratListView");
  var articleView = document.getElementById("stratArticleView");
  var curLevel = qs.get("level") || "all";

  function levelLabel(l) { return l === "beginner" ? "🌱 小白友好" : "🚀 进阶实战"; }

  function renderGrid() {
    var host = document.getElementById("stratGrid");
    var list = STR.filter(function (s) { return curLevel === "all" || s.level === curLevel; });
    host.innerHTML = list.map(function (s) {
      return '<a class="card article-card" href="strategy.html?id=' + s.id + '">' +
        '<div class="top"><span class="aud ' + s.level + '">' + levelLabel(s.level) + '</span></div>' +
        '<h3>' + s.title + '</h3>' +
        '<p class="excerpt"><b>适合：</b>' + s.suit + '</p>' +
        '<div class="foot"><span class="small muted">方法逻辑 · 适用人群 · 风险点</span><span style="color:var(--blue-600);font-weight:600">查看策略 →</span></div>' +
        '</a>';
    }).join("");
  }

  function showArticle(id) {
    var s = STR.filter(function (x) { return x.id === id; })[0];
    if (!s) { showList(); return; }
    listView.classList.add("hide"); articleView.classList.remove("hide");
    document.title = s.title + " | 基智汇策略专栏";
    var steps = s.framework.map(function (f, i) {
      return '<div class="path-step"><div class="node"><div class="dot">' + (i + 1) + '</div><div class="line"></div></div>' +
        '<div class="body"><h4>' + f + '</h4></div></div>';
    }).join("");
    var related = STR.filter(function (x) { return x.level === s.level && x.id !== s.id; }).slice(0, 4);

    articleView.innerHTML =
      '<div class="breadcrumb"><a href="#" id="backList">← 返回策略专栏</a> / ' + levelLabel(s.level) + '</div>' +
      '<div class="grid" style="grid-template-columns:1fr 280px;gap:24px;align-items:start">' +
        '<article class="card" style="padding:30px 34px">' +
          '<span class="aud ' + s.level + '">' + levelLabel(s.level) + '</span>' +
          '<h1 style="font-size:25px;line-height:1.4;margin:12px 0 18px">' + s.title + '</h1>' +
          '<div class="callout"><b>适用人群：</b>' + s.suit + '</div>' +
          '<h2 style="font-size:19px;margin:24px 0 14px">策略核心框架</h2>' +
          '<div class="learn-path">' + steps + '</div>' +
          '<div class="callout warn" style="margin-top:20px"><b>风险点与局限：</b>' + s.risk + '</div>' +
          '<div class="divider"></div>' +
          '<p class="small muted">本策略仅阐述方法逻辑，不推荐任何具体基金，不构成投资建议，不保证收益。历史表现不代表未来，请结合自身情况独立决策、自担风险。</p>' +
        '</article>' +
        '<aside>' +
          '<div class="card" style="padding:18px"><h3 style="font-size:15px;margin-bottom:10px">⚖️ 策略速览</h3>' +
            '<div class="kv-list" style="grid-template-columns:1fr">' +
              '<div class="kv"><span class="k">类型</span><span class="v">' + levelLabel(s.level) + '</span></div>' +
              '<div class="kv"><span class="k">核心步骤</span><span class="v">' + s.framework.length + ' 步</span></div>' +
            '</div></div>' +
          '<div class="card" style="padding:18px;margin-top:16px"><h3 style="font-size:15px;margin-bottom:10px">🔗 同类策略</h3>' +
            related.map(function (r) { return '<a class="news-item" style="display:block" href="strategy.html?id=' + r.id + '"><div style="font-size:13px;color:var(--ink-700)">' + r.title + '</div></a>'; }).join("") +
          '</div>' +
          '<a class="btn btn-primary btn-block" style="margin-top:16px" href="education.html">配套投教课程 →</a>' +
        '</aside>' +
      '</div>';

    document.getElementById("backList").addEventListener("click", function (e) {
      e.preventDefault(); history.pushState({}, "", "strategy.html"); showList();
    });
    window.scrollTo(0, 0);
  }

  function showList() {
    articleView.classList.add("hide"); listView.classList.remove("hide");
    document.title = "策略专栏 · 小白友好 + 进阶实战 | 基智汇";
    renderGrid();
  }

  document.getElementById("stratPills").querySelectorAll(".pill").forEach(function (p) {
    p.addEventListener("click", function () {
      curLevel = p.dataset.level;
      document.querySelectorAll("#stratPills .pill").forEach(function (x) { x.classList.remove("on"); });
      p.classList.add("on"); renderGrid();
    });
  });
  document.querySelectorAll("#stratPills .pill").forEach(function (p) { p.classList.toggle("on", p.dataset.level === curLevel); });

  var id = qs.get("id");
  if (id) showArticle(id); else showList();
})();
