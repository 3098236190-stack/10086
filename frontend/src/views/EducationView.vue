<script setup>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { useRoute } from "vue-router";
import api from "../api";
import { line } from "../utils/charts";

const route = useRoute();
const articles = ref([]);
const article = ref(null);
const curLevel = ref(route.query.level || "all");
const curCat = ref("all");

onMounted(async () => { articles.value = await api.get("/education/"); route.query.id && openArticle(route.query.id); });
watch(() => route.query.id, (id) => { id ? openArticle(id) : (article.value = null); });
watch(() => route.query.level, (l) => { curLevel.value = l || "all"; });

const cats = computed(() => {
  const pool = articles.value.filter((e) => curLevel.value === "all" || e.level === curLevel.value);
  return [...new Set(pool.map((e) => e.category))];
});
const filtered = computed(() => articles.value.filter((e) =>
  (curLevel.value === "all" || e.level === curLevel.value) && (curCat.value === "all" || e.category === curCat.value)));
const beginnerPath = computed(() => articles.value.filter((e) => e.level === "beginner").slice(0, 8));

function setLevel(l) { curLevel.value = l; curCat.value = "all"; }

async function openArticle(slug) { article.value = await api.get(`/education/${slug}/`); window.scrollTo(0, 0); }
const SCENE = {
  基础概念: "很多新手卡在最开始的概念关，似懂非懂就匆忙下场。这一篇，我们把它彻底讲清楚。",
  交易流程: "知道是一回事，真正操作起来又是另一回事。这一篇带你把流程走顺。",
  风险认知: "投资里最贵的学费，往往来自对风险的误解。先把风险看明白，比急着赚钱更重要。",
  避坑指南: "前人踩过的坑，没必要再踩一遍。这一篇帮你提前绕开。",
  分类解析: "名字相近的基金，内里可能天差地别。看懂分类，才能选对工具。",
  指标解读: "数据不会骗人，但会被误读。这一篇教你正确打开一个关键指标。",
  资产配置: "决定长期收益的，往往不是选了哪只基金，而是怎么配置。",
  定投优化: "同样是定投，方法不同，体验和结果可能差很多。",
  经理筛选: "把钱托付给谁，是主动基金最关键的一道选择题。",
};
const articleBody = computed(() => {
  const a = article.value; if (!a) return "";
  if (a.body) return a.body;
  const scene = SCENE[a.category] || "我们用尽量通俗的方式，把这个话题讲明白。";
  return `<div class="callout"><b>场景：</b>${scene}</div><h2>核心概念</h2><p>${a.excerpt}</p>` +
    `<p>理解这一点，关键是抓住它在你整个投资决策中的位置：它既不是万能钥匙，也不是可有可无的细节，而是帮助你做出更理性判断的一块拼图。` +
    `${a.level === "advanced" ? "对进阶投资者而言，真正的价值在于把它和其他维度结合起来交叉验证，而不是孤立地看单一数字。" : "对新手而言，先建立正确的直觉，比记住精确定义更重要。"}</p>` +
    `<h2>实操方法</h2><ul class="bul"><li>先明确你的目标与可投资的资金性质（闲钱、期限、可承受的波动）；</li>` +
    `<li>把本文的概念落到一个可执行的检查清单上，而不是停留在「知道了」；</li>` +
    `<li>${a.level === "advanced" ? "结合多周期、多指标交叉判断，警惕单一数据带来的误导；" : "从小金额、低门槛开始实践，在过程中加深理解；"}</li>` +
    `<li>定期回顾：投资逻辑是否仍然成立，而非被短期涨跌牵着走。</li></ul>` +
    `<div class="callout key"><b>一句话总结：</b>${a.key_point}</div>` +
    `<div class="callout warn"><b>风险提示：</b>基金有风险，投资需谨慎。历史业绩不代表未来表现，本文涉及的方法与判断均存在不确定性，请结合自身情况独立决策。</div>`;
});
const related = computed(() => {
  if (!article.value) return [];
  const a = article.value;
  let r = articles.value.filter((e) => e.level === a.level && e.slug !== a.slug && e.category === a.category).slice(0, 3);
  if (r.length < 3) articles.value.filter((e) => e.level === a.level && e.slug !== a.slug).forEach((e) => { if (r.length < 3 && !r.includes(e)) r.push(e); });
  return r;
});

/* 定投计算器 */
const showCalc = ref(false), calcOut = ref(false), calcChart = ref(null);
const calc = reactive({ amt: 1000, years: 10, rate: 6 });
const calcRes = reactive({ final: "", invest: "", profit: "", profitCls: "up" });
function annuityFV(amt, months, annual) { const r = annual / 12; return r === 0 ? amt * months : amt * (Math.pow(1 + r, months) - 1) / r * (1 + r); }
function runCalc() {
  const amt = +calc.amt || 0, years = Math.max(1, Math.min(40, +calc.years || 1)), rate = (+calc.rate || 0) / 100, months = years * 12;
  const fv = annuityFV(amt, months, rate), invest = amt * months, profit = fv - invest;
  calcRes.final = "¥" + Math.round(fv).toLocaleString();
  calcRes.invest = "¥" + Math.round(invest).toLocaleString();
  calcRes.profit = (profit >= 0 ? "+¥" : "-¥") + Math.abs(Math.round(profit)).toLocaleString();
  calcRes.profitCls = profit >= 0 ? "up" : "down";
  calcOut.value = true;
  nextTick(() => {
    const rLow = Math.max(0, rate - 0.03), rHigh = rate + 0.03;
    const principal = [], low = [], mid = [], high = [], labels = [];
    for (let y = 1; y <= years; y++) { const m = y * 12; labels.push(`第 ${y} 年`); principal.push(amt * m); low.push(annuityFV(amt, m, rLow)); mid.push(annuityFV(amt, m, rate)); high.push(annuityFV(amt, m, rHigh)); }
    const money = (v) => (v >= 10000 ? "¥" + (v / 10000).toFixed(1) + "万" : "¥" + Math.round(v));
    line(calcChart.value, { height: 220, labels, fmtAxis: money, fmtVal: (v) => "¥" + Math.round(v).toLocaleString(), series: [
      { name: "累计投入", color: "#8a93a0", values: principal, width: 1.5 },
      { name: "谨慎", color: "#2670c9", values: low, width: 1.6 },
      { name: "乐观", color: "#ff7a1a", values: high, width: 1.6 },
      { name: "中性", color: "#00a878", values: mid, fill: true, width: 2.4 }] });
  });
}

/* 风险测评 */
const QUIZ = [
  { q: "如果你的基金一个月内亏了 15%，你会？", opts: [["立刻全部卖出，受不了", 1], ["有点慌，先卖一部分", 2], ["按兵不动，再看看", 3], ["逢低补仓，越跌越买", 4]] },
  { q: "这笔投资的钱，大概多久不用？", opts: [["1 年以内", 1], ["1-3 年", 2], ["3-5 年", 3], ["5 年以上", 4]] },
  { q: "你对基金/投资的了解程度？", opts: [["几乎不懂", 1], ["知道一点", 2], ["比较了解", 3], ["相当熟悉", 4]] },
  { q: "你更认同哪种说法？", opts: [["保住本金最重要", 1], ["稳稳收益就好", 2], ["愿担波动换更高收益", 3], ["高风险高回报，搏一把", 4]] },
  { q: "这笔钱占你可投资资产的比例？", opts: [["几乎是全部", 1], ["一大半", 2], ["一小部分", 3], ["很小，亏了不影响生活", 4]] },
];
const showQuiz = ref(false);
const quiz = reactive({ step: 0, score: 0 });
function openQuiz() { quiz.step = 0; quiz.score = 0; showQuiz.value = true; }
function quizPick(s) { quiz.score += s; quiz.step++; }
const quizResult = computed(() => {
  const avg = quiz.score / QUIZ.length;
  return avg <= 1.5 ? ["保守型", "R1-R2", "你更看重本金安全，可重点关注货币、纯债等低风险产品。"]
    : avg <= 2.5 ? ["稳健型", "R1-R3", "你能接受小幅波动，可关注「固收+」、平衡型等稳健方向。"]
    : avg <= 3.3 ? ["平衡型", "R2-R4", "你攻守兼顾，可考虑股债搭配、宽基指数等均衡配置。"]
    : ["进取型", "R3-R5", "你能承受较大波动追求高回报，但仍需做好分散与仓位管理。"];
});
</script>

<template>
  <section class="page-hero"><div class="wrap"><h1>🎓 投教课堂</h1>
    <p>把复杂的基金知识讲成大白话。小白看「入门篇」按路径学，进阶看「提升篇」深度提升。本站内容仅为投资者教育，不构成投资建议。</p></div></section>

  <div class="wrap section">
    <!-- 文章 -->
    <div v-if="article">
      <div class="breadcrumb"><a href="#" @click.prevent="$router.push('/education')">← 返回投教课堂</a> / {{ article.category }}</div>
      <div class="grid" style="grid-template-columns:1fr 280px;gap:24px;align-items:start">
        <article class="card" style="padding:30px 34px">
          <div style="margin-bottom:10px"><span class="aud" :class="article.level">{{ article.level === "beginner" ? "🌱 小白入门" : "🚀 进阶提升" }}</span>
            <span class="tag gray">{{ article.category }}</span> <span class="small muted">约 {{ article.read_time }}阅读</span></div>
          <h1 style="font-size:26px;line-height:1.4;margin-bottom:16px">{{ article.title }}</h1>
          <div class="article-body" v-html="articleBody"></div>
          <div class="divider"></div>
          <div class="small muted">本文仅为知识科普，不构成投资建议。市场有风险，投资需谨慎。</div>
        </article>
        <aside>
          <div class="card" style="padding:18px"><h3 style="font-size:15px;margin-bottom:12px">📌 本文要点</h3>
            <div class="callout key" style="margin:0">{{ article.key_point }}</div></div>
          <div class="card" style="padding:18px;margin-top:16px"><h3 style="font-size:15px;margin-bottom:10px">🔗 相关阅读</h3>
            <router-link v-for="r in related" :key="r.slug" class="news-item" style="display:block" :to="`/education?id=${r.slug}`">
              <div style="font-size:13px;color:var(--ink-700)">{{ r.title }}</div></router-link></div>
          <router-link class="btn btn-primary btn-block" style="margin-top:16px" to="/screener?mode=wizard">🌱 学完去试试选基向导</router-link>
        </aside>
      </div>
    </div>

    <!-- 列表 -->
    <div v-else>
      <div class="grid cols-3" style="margin-bottom:24px">
        <div class="card tool-card t-orange" style="cursor:pointer" @click="showCalc = true"><div class="ic">🧮</div><div class="t">定投计算器</div><div class="d">测算定投到期收益（演示）</div></div>
        <div class="card tool-card t-green" style="cursor:pointer" @click="openQuiz"><div class="ic">🛡️</div><div class="t">风险承受力测评</div><div class="d">3 分钟看看你属于哪类投资者</div></div>
        <router-link class="card tool-card" to="/screener?mode=wizard"><div class="ic">🌱</div><div class="t">新手选基向导</div><div class="d">3 步匹配适合你的方向</div></router-link>
      </div>

      <div class="card" style="padding:18px 20px;margin-bottom:22px"><h3 style="font-size:16px;margin-bottom:14px">🌱 小白学习路径（按顺序学最高效）</h3>
        <div class="learn-path">
          <div class="path-step" v-for="(e, i) in beginnerPath" :key="e.slug">
            <div class="node"><div class="dot">{{ i + 1 }}</div><div class="line"></div></div>
            <div class="body"><h4><router-link :to="`/education?id=${e.slug}`">{{ e.title }}</router-link></h4><p>{{ e.excerpt }}</p></div></div>
        </div>
      </div>

      <div class="section-head"><h2>知识库</h2><span class="sub">共 {{ filtered.length }} 篇</span></div>
      <div class="filter-pills">
        <span class="pill" :class="{ on: curLevel === 'all' }" @click="setLevel('all')">全部</span>
        <span class="pill" :class="{ on: curLevel === 'beginner' }" @click="setLevel('beginner')">🌱 小白入门篇</span>
        <span class="pill" :class="{ on: curLevel === 'advanced' }" @click="setLevel('advanced')">🚀 进阶提升篇</span>
      </div>
      <div class="filter-pills">
        <span class="pill" :class="{ on: curCat === 'all' }" @click="curCat = 'all'">全部分类</span>
        <span v-for="c in cats" :key="c" class="pill" :class="{ on: curCat === c }" @click="curCat = c">{{ c }}</span>
      </div>
      <div class="grid cols-3">
        <router-link v-for="e in filtered" :key="e.slug" class="card article-card" :to="`/education?id=${e.slug}`">
          <div class="top"><span class="aud" :class="e.level">{{ e.level === "beginner" ? "🌱 入门" : "🚀 进阶" }}</span><span class="tag gray">{{ e.category }}</span></div>
          <h3>{{ e.title }}</h3><p class="excerpt">{{ e.excerpt }}</p>
          <div class="foot"><span>约 {{ e.read_time }}</span><span style="color:var(--blue-600);font-weight:600">阅读全文 →</span></div>
        </router-link>
      </div>
    </div>
  </div>

  <!-- 定投计算器 -->
  <div class="modal-mask" :class="{ show: showCalc }" @click.self="showCalc = false">
    <div class="modal"><div class="modal-head"><h3>🧮 定投计算器</h3><button class="x" @click="showCalc = false">&times;</button></div>
      <div class="modal-body">
        <div class="field"><label>每月定投金额（元）</label><input type="number" v-model="calc.amt" min="0"></div>
        <div class="field"><label>定投期限（年）</label><input type="number" v-model="calc.years" min="1" max="40"></div>
        <div class="field"><label>预期年化收益率（%）<span class="small muted">假设值，非承诺</span></label><input type="number" v-model="calc.rate" step="0.5"></div>
        <button class="btn btn-primary btn-block" @click="runCalc">开始测算</button>
        <div v-show="calcOut">
          <div class="calc-result" style="margin-top:16px"><div class="small muted">中性情景 · 预计期末市值</div>
            <div class="big">{{ calcRes.final }}</div>
            <div class="small" style="margin-top:6px">累计投入 <b>{{ calcRes.invest }}</b> · 预计收益 <b :class="calcRes.profitCls">{{ calcRes.profit }}</b></div></div>
          <div style="margin-top:16px">
            <div class="flex" style="gap:16px;flex-wrap:wrap;font-size:12px;margin-bottom:6px">
              <span><span style="display:inline-block;width:14px;height:3px;background:#8a93a0;vertical-align:middle"></span> 累计投入</span>
              <span><span style="display:inline-block;width:14px;height:3px;background:#2670c9;vertical-align:middle"></span> 谨慎</span>
              <span><span style="display:inline-block;width:14px;height:3px;background:#00a878;vertical-align:middle"></span> 中性</span>
              <span><span style="display:inline-block;width:14px;height:3px;background:#ff7a1a;vertical-align:middle"></span> 乐观</span>
            </div><div ref="calcChart"></div>
          </div>
          <div class="disclaimer-inline" style="margin-top:14px">三种情景基于不同假设收益率（中性±3%）模拟，<b>不代表真实收益，市场实际表现会上下波动甚至亏损</b>，可能低于「谨慎」情景。历史业绩不代表未来表现。</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 风险测评 -->
  <div class="modal-mask" :class="{ show: showQuiz }" @click.self="showQuiz = false">
    <div class="modal"><div class="modal-head"><h3>🛡️ 风险承受力测评</h3><button class="x" @click="showQuiz = false">&times;</button></div>
      <div class="modal-body">
        <template v-if="quiz.step < QUIZ.length">
          <div class="wizard-progress" style="margin-bottom:18px"><div v-for="(s, i) in QUIZ" :key="i" class="step" :class="{ on: i <= quiz.step }"></div></div>
          <div class="small muted tc" style="margin-bottom:8px">第 {{ quiz.step + 1 }} / {{ QUIZ.length }} 题</div>
          <h3 style="text-align:center;margin-bottom:18px">{{ QUIZ[quiz.step].q }}</h3>
          <div class="grid" style="gap:10px"><button v-for="o in QUIZ[quiz.step].opts" :key="o[0]" class="opt" style="text-align:left" @click="quizPick(o[1])"><div class="ot" style="font-size:14px">{{ o[0] }}</div></button></div>
        </template>
        <template v-else>
          <div class="calc-result"><div class="small muted">你的风险偏好画像（演示）</div><div class="big">{{ quizResult[0] }}</div>
            <div class="small" style="margin-top:6px">可承受风险等级约 <b>{{ quizResult[1] }}</b></div></div>
          <p style="margin:14px 0;color:var(--ink-700)">{{ quizResult[2] }}</p>
          <router-link class="btn btn-primary btn-block" to="/screener?mode=wizard" @click="showQuiz = false">🌱 用这个结果去匹配基金方向</router-link>
          <button class="btn btn-block" style="margin-top:10px" @click="openQuiz">重新测评</button>
          <div class="disclaimer-inline" style="margin-top:14px">本测评为简化演示，<b>不能替代正式的投资者风险承受能力评估</b>。实际投资请以销售机构的适当性测评为准。</div>
        </template>
      </div>
    </div>
  </div>
</template>
