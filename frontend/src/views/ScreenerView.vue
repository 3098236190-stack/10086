<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../api";
import { fmtPct, cls } from "../utils/format";
import wl from "../store/watchlist";
import toast from "../utils/toast";

const route = useRoute();
const funds = ref([]);
const mode = ref(route.query.mode === "advanced" ? "advanced" : "wizard");
const wlVersion = ref(0); // 触发自选按钮态刷新

onMounted(async () => {
  const data = await api.get("/funds/");
  funds.value = data.results || data;
});

/* ---------- 新手向导 ---------- */
const WIZ = [
  { key: "risk", q: "您的风险承受能力如何？", hint: "亏一点就睡不着 还是 能扛波动搏高收益？", opts: [
    { v: "保守", t: "保守型", d: "本金安全第一，几乎不能接受亏损" },
    { v: "稳健", t: "稳健型", d: "愿承担小幅波动，追求稳稳的收益" },
    { v: "平衡", t: "平衡型", d: "能接受中等波动，攻守兼顾" },
    { v: "进取", t: "进取型", d: "敢于承担较大波动，追求高回报" }] },
  { key: "term", q: "这笔钱你打算放多久？", hint: "投资期限越长，越能从容应对短期波动。", opts: [
    { v: "3个月内", t: "3 个月内", d: "随时可能要用，重在灵活与稳" },
    { v: "半年到1年", t: "半年 ~ 1 年", d: "短期闲钱，求稳为主" },
    { v: "1到3年", t: "1 ~ 3 年", d: "中期不用，可适度承担波动" },
    { v: "3年以上", t: "3 年以上", d: "长期不用，可着眼长期成长" }] },
  { key: "dir", q: "你更偏好哪个方向？", hint: "不确定也没关系，「混合均衡」是个稳妥的起点。", opts: [
    { v: "宽基指数", t: "宽基指数", d: "一篮子打包，分散又省心" },
    { v: "行业主题", t: "行业主题", d: "看好某个赛道，弹性更大" },
    { v: "债券固收", t: "债券固收", d: "求稳为主，波动较小" },
    { v: "混合均衡", t: "混合均衡", d: "股债搭配，攻守兼备" }] },
];
const RISK_ALLOW = { 保守: ["R1", "R2"], 稳健: ["R1", "R2", "R3"], 平衡: ["R2", "R3", "R4"], 进取: ["R3", "R4", "R5"] };
const wiz = reactive({ step: 0, answers: {} });
const wizDone = computed(() => wiz.step >= WIZ.length);

function pick(v) { wiz.answers[WIZ[wiz.step].key] = v; }
function wizNext() { if (wiz.answers[WIZ[wiz.step].key]) wiz.step++; }
function wizBack() { if (wiz.step > 0) wiz.step--; }
function wizRestart() { wiz.step = 0; wiz.answers = {}; }

function scoreFund(f, a) {
  const allow = RISK_ALLOW[a.risk] || [];
  let score = 0; const reasons = [];
  if (allow.includes(f.risk)) { score += 3; reasons.push(`风险等级 ${f.risk}，与你的「${a.risk}」偏好相符`); }
  else score -= 4;
  if (f.direction === a.dir) { score += 3; reasons.push(`投资方向「${f.direction}」正中你的偏好`); }
  if ((f.appetite || []).includes(a.risk)) score += 2;
  const shortTerm = a.term === "3个月内" || a.term === "半年到1年";
  if (shortTerm) {
    if (f.ftype === "货币型" || f.ftype === "债券型") { score += 2; reasons.push(`偏短期持有，${f.ftype}相对平稳、流动性好`); }
    if (f.risk === "R5" || f.risk === "R4") score -= 2;
  } else if (a.term === "3年以上" && ["股票型", "混合型", "指数型"].includes(f.ftype)) {
    reasons.push("适合长期持有，时间有望平滑短期波动");
  }
  if ((a.risk === "保守" || a.risk === "稳健") && f.metrics.mdd > -10) {
    score += 1; reasons.push(`最大回撤约 ${f.metrics.mdd}%，持有体验相对平稳`);
  }
  (f.tags || []).forEach((t) => { if (["金牛奖", "晨星五星", "低波动", "指数增强"].includes(t)) reasons.push(`具备「${t}」特征`); });
  return { score, reasons: reasons.slice(0, 3) };
}
const wizResults = computed(() => {
  if (!wizDone.value) return [];
  return funds.value.map((f) => ({ f, ...scoreFund(f, wiz.answers) }))
    .filter((x) => x.score > 0).sort((x, y) => y.score - x.score || y.f.metrics.sharpe - x.f.metrics.sharpe)
    .slice(0, 10);
});
const dirMatched = computed(() => wizResults.value.some((x) => x.f.direction === wiz.answers.dir));
const termLabel = computed(() => WIZ[1].opts.find((o) => o.v === wiz.answers.term)?.t || "");

/* ---------- 进阶专业 ---------- */
const TYPES = ["股票型", "混合型", "债券型", "指数型", "QDII", "货币型", "FOF"];
const RISKS = ["R1", "R2", "R3", "R4", "R5"];
const TAGS = ["金牛奖", "晨星五星", "低波动", "高分红", "指数增强", "行业主题"];
const companies = computed(() => [...new Set(funds.value.map((f) => f.company))]);

const flt = reactive({ types: [], risks: [], companies: [], tags: [], scale: "", age: "", rank: "",
  retY1: 0, mdd: -100, sharpe: 0, vol: 100, mgrYears: 0 });
const sort = reactive({ key: "y1", dir: -1 });
const page = ref(1);
const perPage = 20;

function toggleArr(arr, v) { const i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); page.value = 1; }
function resetFilters() {
  Object.assign(flt, { types: [], risks: [], companies: [], tags: [], scale: "", age: "", rank: "",
    retY1: 0, mdd: -100, sharpe: 0, vol: 100, mgrYears: 0 });
  page.value = 1;
}
const SORTS = [{ k: "y1", t: "近一年" }, { k: "y3", t: "近三年" }, { k: "scale", t: "规模" },
  { k: "sharpe", t: "夏普" }, { k: "mdd", t: "回撤控制" }, { k: "age", t: "成立时间" }, { k: "day", t: "日涨幅" }];
function sortVal(f, k) {
  if (k === "scale") return f.scale; if (k === "sharpe") return f.metrics.sharpe;
  if (k === "mdd") return f.metrics.mdd; if (k === "age") return f.age_years;
  if (k === "day") return f.day_change; return f.returns[k];
}
function setSort(k) { if (sort.key === k) sort.dir *= -1; else { sort.key = k; sort.dir = -1; } }

const filtered = computed(() => funds.value.filter((f) => {
  if (flt.types.length && !flt.types.includes(f.ftype)) return false;
  if (flt.risks.length && !flt.risks.includes(f.risk)) return false;
  if (flt.companies.length && !flt.companies.includes(f.company)) return false;
  if (flt.tags.length && !flt.tags.every((t) => (f.tags || []).includes(t))) return false;
  if (flt.scale) { const [a, b] = flt.scale.split("-").map(Number); if (f.scale < a || f.scale > b) return false; }
  if (flt.age && f.age_years < +flt.age) return false;
  if (flt.rank && f.rank_pct > +flt.rank) return false;
  if ((f.returns.y1 ?? -999) < flt.retY1) return false;
  if (f.metrics.mdd < flt.mdd) return false;
  if (f.metrics.sharpe < flt.sharpe) return false;
  if (f.metrics.vol > flt.vol) return false;
  if (f.manager_years < flt.mgrYears) return false;
  return true;
}));
const sorted = computed(() => [...filtered.value].sort((a, b) => (sortVal(a, sort.key) - sortVal(b, sort.key)) * sort.dir));
const pages = computed(() => Math.max(1, Math.ceil(sorted.value.length / perPage)));
const pageList = computed(() => sorted.value.slice((page.value - 1) * perPage, page.value * perPage));

function toggleWl(code) { const on = wl.toggle(code); wlVersion.value++; toast(on ? "已加入自选" : "已移出自选"); }
function inWl(code) { wlVersion.value; return wl.has(code); }

/* ---------- 对比 ---------- */
const compare = ref([]);
const showCompare = ref(false);
function toggleCompare(code) {
  const i = compare.value.indexOf(code);
  if (i >= 0) compare.value.splice(i, 1);
  else { if (compare.value.length >= 4) { toast("最多对比 4 只基金"); return; } compare.value.push(code); }
}
function openCompare() { if (compare.value.length < 2) { toast("至少选择 2 只基金对比"); return; } showCompare.value = true; }
const compareFunds = computed(() => compare.value.map((c) => funds.value.find((f) => f.code === c)).filter(Boolean));
const compareRows = [
  ["基金代码", (f) => f.code], ["类型", (f) => f.ftype], ["单位净值", (f) => f.nav.toFixed(4)],
  ["近1年", (f) => fmtPct(f.returns.y1)], ["近3年", (f) => fmtPct(f.returns.y3)],
  ["最大回撤", (f) => f.metrics.mdd + "%"], ["夏普比率", (f) => f.metrics.sharpe.toFixed(2)],
  ["波动率", (f) => f.metrics.vol + "%"], ["规模(亿)", (f) => f.scale.toFixed(1)],
  ["基金经理", (f) => f.manager_name], ["经理任职", (f) => f.manager_years + " 年"],
];

function exportCsv() {
  const list = sorted.value;
  if (!list.length) { toast("没有可导出的数据"); return; }
  const head = ["基金代码", "基金名称", "类型", "风险等级", "单位净值", "日涨跌%", "近1年%", "近3年%", "最大回撤%", "夏普", "波动率%", "规模(亿)", "基金公司", "基金经理"];
  const rows = list.map((f) => [f.code, f.name, f.ftype, f.risk, f.nav, f.day_change, f.returns.y1, f.returns.y3, f.metrics.mdd, f.metrics.sharpe, f.metrics.vol, f.scale, f.company, f.manager_name]);
  const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "基智汇-基金筛选结果.csv";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  toast(`已导出 ${list.length} 条（演示数据，不构成投资建议）`);
}
</script>

<template>
  <section class="page-hero"><div class="wrap">
    <div class="flex between items-center" style="flex-wrap:wrap;gap:14px">
      <div><h1>🔎 基金筛选器</h1><p>不会选？用「新手向导」3 步帮你匹配；想精挑？切到「进阶专业」多维度筛选。</p></div>
      <div class="mode-switch">
        <button :class="{ active: mode === 'wizard' }" @click="mode = 'wizard'">🌱 新手向导模式</button>
        <button :class="{ active: mode === 'advanced' }" @click="mode = 'advanced'">⚙️ 进阶专业模式</button>
      </div>
    </div>
  </div></section>

  <div class="wrap section">
    <!-- 向导 -->
    <div v-if="mode === 'wizard'">
      <div v-if="!wizDone" class="wizard card" style="padding:30px">
        <div class="wizard-progress"><div v-for="(s, i) in WIZ" :key="i" class="step" :class="{ on: i <= wiz.step }"></div></div>
        <div class="wizard-q">
          <div class="small muted tc" style="margin-bottom:6px">第 {{ wiz.step + 1 }} / {{ WIZ.length }} 步</div>
          <h2>{{ WIZ[wiz.step].q }}</h2><div class="hint">{{ WIZ[wiz.step].hint }}</div>
          <div class="opt-grid">
            <div v-for="o in WIZ[wiz.step].opts" :key="o.v" class="opt" :class="{ sel: wiz.answers[WIZ[wiz.step].key] === o.v }" @click="pick(o.v)">
              <div class="ot">{{ o.t }}</div><div class="od">{{ o.d }}</div>
            </div>
          </div>
        </div>
        <div class="wizard-nav">
          <button class="btn" :disabled="wiz.step === 0" @click="wizBack">← 上一步</button>
          <button class="btn btn-primary" :disabled="!wiz.answers[WIZ[wiz.step].key]" @click="wizNext">
            {{ wiz.step === WIZ.length - 1 ? "查看推荐结果 →" : "下一步 →" }}</button>
        </div>
        <div class="disclaimer-inline" style="margin-top:18px">本向导根据你的选择做规则匹配，结果<b>仅为示例参考</b>，不构成投资建议；请结合自身情况独立决策。</div>
      </div>

      <div v-else class="wizard" style="max-width:780px">
        <div class="card" style="padding:20px;margin-bottom:16px;background:linear-gradient(135deg,#0f2e5c,#1a5cad);color:#fff">
          <div style="font-size:13px;opacity:.85">根据你的画像，为你筛选出以下方向相符的基金（演示）</div>
          <div style="font-size:15px;margin-top:6px">你选择了：<b>{{ wiz.answers.risk }}型</b> · 投资 <b>{{ termLabel }}</b> · 偏好 <b>{{ wiz.answers.dir }}</b></div>
          <div v-if="wizResults.length && !dirMatched" style="font-size:12px;opacity:.9;margin-top:8px;line-height:1.6">
            注：在你的「{{ wiz.answers.risk }}型」风险偏好下，暂无符合「{{ wiz.answers.dir }}」方向的合适产品，已优先为你保障<b>风险等级匹配</b>。
          </div>
        </div>
        <div class="grid" style="gap:12px">
          <div v-for="(x, i) in wizResults" :key="x.f.code" class="card" style="padding:16px;display:flex;gap:14px;align-items:flex-start">
            <div class="rk" :class="{ top: i < 3 }" style="margin-top:3px">{{ i + 1 }}</div>
            <div style="flex:1">
              <div class="flex between items-center" style="flex-wrap:wrap;gap:6px">
                <router-link :to="`/fund/${x.f.code}`" style="font-size:16px;font-weight:700">{{ x.f.name }}</router-link>
                <span><span class="risk" :class="x.f.risk">{{ x.f.risk }}</span> <span class="tag gray">{{ x.f.ftype }}</span></span>
              </div>
              <div class="small muted" style="margin:4px 0 8px">{{ x.f.code }} · {{ x.f.company }} · 近一年 <span class="b" :class="cls(x.f.returns.y1)">{{ fmtPct(x.f.returns.y1) }}</span> · 最大回撤 <b>{{ x.f.metrics.mdd }}%</b></div>
              <ul class="small" style="color:var(--ink-700);line-height:1.9"><li v-for="r in x.reasons" :key="r">✓ {{ r }}</li></ul>
              <div style="margin-top:10px;display:flex;gap:8px">
                <router-link class="btn btn-sm btn-primary" :to="`/fund/${x.f.code}`">查看详情</router-link>
                <button class="btn btn-sm" @click="toggleWl(x.f.code)">{{ inWl(x.f.code) ? "已自选 ✓" : "+ 自选" }}</button>
              </div>
            </div>
          </div>
          <div v-if="!wizResults.length" class="empty"><div class="ic">🤔</div>没有完全匹配的演示基金，建议放宽条件或切换到进阶模式手动筛选。</div>
        </div>
        <div class="flex" style="gap:10px;margin-top:18px;justify-content:center">
          <button class="btn" @click="wizRestart">↺ 重新测一次</button>
          <button class="btn btn-ghost" @click="mode = 'advanced'">切换到进阶模式精筛 →</button>
        </div>
        <div class="disclaimer-inline" style="margin-top:16px">以上结果由规则匹配生成，<b>仅供学习参考，不构成投资建议</b>。基金有风险，历史业绩不代表未来表现，请独立决策。</div>
      </div>
    </div>

    <!-- 进阶 -->
    <div v-else class="filter-panel">
      <aside class="card filter-side">
        <div class="filter-group"><h4>基金类型</h4><div class="chk-list">
          <span v-for="t in TYPES" :key="t" class="chk" :class="{ on: flt.types.includes(t) }" @click="toggleArr(flt.types, t)">{{ t }}</span></div></div>
        <div class="filter-group"><h4>风险等级 <span class="small muted">R1低→R5高</span></h4><div class="chk-list">
          <span v-for="t in RISKS" :key="t" class="chk" :class="{ on: flt.risks.includes(t) }" @click="toggleArr(flt.risks, t)">{{ t }}</span></div></div>
        <div class="filter-group"><h4>基金公司</h4><div class="chk-list">
          <span v-for="t in companies" :key="t" class="chk" :class="{ on: flt.companies.includes(t) }" @click="toggleArr(flt.companies, t)">{{ t }}</span></div></div>
        <div class="filter-group"><h4>基金规模</h4><select class="field" style="height:34px" v-model="flt.scale" @change="page = 1">
          <option value="">不限</option><option value="0-10">10 亿以下</option><option value="10-50">10 ~ 50 亿</option><option value="50-100">50 ~ 100 亿</option><option value="100-99999">100 亿以上</option></select></div>
        <div class="filter-group"><h4>成立年限</h4><select class="field" style="height:34px" v-model="flt.age" @change="page = 1">
          <option value="">不限</option><option value="1">满 1 年</option><option value="3">满 3 年</option><option value="5">满 5 年</option></select></div>
        <div class="filter-group"><h4>同类排名</h4><select class="field" style="height:34px" v-model="flt.rank" @change="page = 1">
          <option value="">不限</option><option value="10">前 10%</option><option value="20">前 20%</option><option value="30">前 30%</option></select></div>
        <div class="filter-group"><h4>近 1 年收益 ≥ <span class="slider-val">{{ flt.retY1 }}%</span></h4>
          <input type="range" min="0" max="30" step="1" v-model.number="flt.retY1" @input="page = 1"></div>
        <div class="filter-group"><h4>最大回撤 ≥ <span class="slider-val">{{ flt.mdd <= -60 ? "-100%" : flt.mdd + "%" }}</span></h4>
          <input type="range" min="-60" max="0" step="1" v-model.number="flt.mdd" @input="page = 1"><div class="small muted">向右收紧：只看回撤更小的</div></div>
        <div class="filter-group"><h4>夏普比率 ≥ <span class="slider-val">{{ flt.sharpe.toFixed(1) }}</span></h4>
          <input type="range" min="0" max="2" step="0.1" v-model.number="flt.sharpe" @input="page = 1"></div>
        <div class="filter-group"><h4>波动率 ≤ <span class="slider-val">{{ flt.vol >= 40 ? "不限" : "≤" + flt.vol + "%" }}</span></h4>
          <input type="range" min="2" max="40" step="1" v-model.number="flt.vol" @input="page = 1"></div>
        <div class="filter-group"><h4>经理任职 ≥ <span class="slider-val">{{ flt.mgrYears }} 年</span></h4>
          <input type="range" min="0" max="10" step="1" v-model.number="flt.mgrYears" @input="page = 1"></div>
        <div class="filter-group"><h4>特色标签</h4><div class="chk-list">
          <span v-for="t in TAGS" :key="t" class="chk" :class="{ on: flt.tags.includes(t) }" @click="toggleArr(flt.tags, t)">{{ t }}</span></div></div>
        <div class="filter-group"><button class="btn btn-block" @click="resetFilters">重置全部条件</button></div>
      </aside>

      <div>
        <div class="card result-bar" style="margin-bottom:14px">
          <div class="count">共筛选出 <b>{{ sorted.length }}</b> 只基金（演示库）　<button class="btn btn-sm btn-ghost" @click="exportCsv">⬇ 导出 CSV</button></div>
          <div class="sort-tabs">排序：<button v-for="s in SORTS" :key="s.k" :class="{ on: sort.key === s.k }" @click="setSort(s.k)">
            {{ s.t }}<span v-if="sort.key === s.k" class="ar">{{ sort.dir < 0 ? " ↓" : " ↑" }}</span></button></div>
        </div>
        <div class="card" style="padding:0;overflow:auto">
          <table class="rank-table">
            <thead><tr><th>基金名称</th><th class="tr">净值</th><th class="tr min-hide">日涨</th><th class="tr">近1年</th>
              <th class="tr min-hide">近3年</th><th class="tr min-hide">最大回撤</th><th class="tr min-hide">夏普</th><th class="tr min-hide">规模/亿</th><th class="tr">操作</th></tr></thead>
            <tbody>
              <tr v-for="f in pageList" :key="f.code">
                <td class="fund-name-cell"><router-link :to="`/fund/${f.code}`"><div class="nm">{{ f.name }}</div></router-link>
                  <div class="cd">{{ f.code }} <span class="risk" :class="f.risk">{{ f.risk }}</span> <span class="tag gray">{{ f.ftype }}</span></div></td>
                <td class="tr b">{{ f.nav.toFixed(4) }}</td>
                <td class="tr min-hide" :class="cls(f.day_change)">{{ fmtPct(f.day_change) }}</td>
                <td class="tr b" :class="cls(f.returns.y1)">{{ fmtPct(f.returns.y1) }}</td>
                <td class="tr min-hide" :class="cls(f.returns.y3)">{{ fmtPct(f.returns.y3) }}</td>
                <td class="tr min-hide">{{ f.metrics.mdd }}%</td>
                <td class="tr min-hide">{{ f.metrics.sharpe.toFixed(2) }}</td>
                <td class="tr min-hide">{{ f.scale.toFixed(1) }}</td>
                <td class="tr" style="white-space:nowrap">
                  <button class="btn btn-sm wl-btn" @click="toggleWl(f.code)" title="加入自选">{{ inWl(f.code) ? "★" : "☆" }}</button>
                  <button class="btn btn-sm cmp-btn" :class="{ 'btn-primary': compare.includes(f.code) }" @click="toggleCompare(f.code)">{{ compare.includes(f.code) ? "对比中" : "+对比" }}</button>
                </td>
              </tr>
              <tr v-if="!pageList.length"><td colspan="9"><div class="empty"><div class="ic">🔍</div>没有符合条件的基金，试试放宽筛选条件</div></td></tr>
            </tbody>
          </table>
        </div>
        <div class="flex" style="justify-content:center;gap:6px;margin-top:16px" v-if="pages > 1">
          <button class="btn btn-sm" :disabled="page === 1" @click="page--">上一页</button>
          <button v-for="p in pages" :key="p" class="btn btn-sm" :class="{ 'btn-primary': p === page }" @click="page = p">{{ p }}</button>
          <button class="btn btn-sm" :disabled="page === pages" @click="page++">下一页</button>
        </div>
        <div class="disclaimer-inline" style="margin-top:16px">以上基金数据、收益率、排名、风险指标均为<b>演示数据</b>，不构成任何投资建议。基金有风险，过往业绩及排名不代表未来表现，请结合自身风险承受能力独立决策。</div>
      </div>
    </div>
  </div>

  <!-- 对比浮条 -->
  <div class="compare-bar" :class="{ show: compare.length && mode === 'advanced' }"><div class="wrap">
    <b style="white-space:nowrap">基金对比</b>
    <div class="compare-slots">
      <div v-for="c in compareFunds" :key="c.code" class="compare-slot"><span class="x" @click="toggleCompare(c.code)">×</span>{{ c.name }}</div>
      <span v-if="!compare.length" class="small muted">勾选基金加入对比（最多 4 只）</span>
    </div>
    <button class="btn btn-primary" @click="openCompare">开始对比</button>
    <button class="btn btn-sm" @click="compare = []">清空</button>
  </div></div>

  <!-- 对比弹窗 -->
  <div class="modal-mask" :class="{ show: showCompare }" @click.self="showCompare = false">
    <div class="modal" style="max-width:880px">
      <div class="modal-head"><h3>📊 基金对比（最多 4 只）</h3><button class="x" @click="showCompare = false">&times;</button></div>
      <div class="modal-body" style="overflow:auto">
        <table class="holding-table">
          <thead><tr><th style="text-align:left">对比项</th><th v-for="f in compareFunds" :key="f.code">{{ f.name }}</th></tr></thead>
          <tbody><tr v-for="row in compareRows" :key="row[0]"><td style="text-align:left;color:var(--ink-600)">{{ row[0] }}</td>
            <td class="tr" v-for="f in compareFunds" :key="f.code" v-html="row[1](f)"></td></tr></tbody>
        </table>
        <div class="disclaimer-inline" style="margin-top:14px">对比数据为演示用途，不构成投资建议；历史业绩不代表未来表现。</div>
      </div>
    </div>
  </div>
</template>
