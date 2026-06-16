<script setup>
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import { useRoute } from "vue-router";
import api from "../api";
import { fmtPct, cls } from "../utils/format";
import { line, donut, hbars } from "../utils/charts";
import wl from "../store/watchlist";
import toast from "../utils/toast";

const route = useRoute();
const f = ref(null);
const notFound = ref(false);
const range = ref(250);
const advOpen = ref(false);
const inWl = ref(false);
const navChart = ref(null), allocChart = ref(null), industryBars = ref(null), attrBars = ref(null), holderBars = ref(null);

const PERF = [["近1周", "w1"], ["近1月", "m1"], ["近3月", "m3"], ["近6月", "m6"], ["近1年", "y1"], ["近3年", "y3"], ["成立来", "since"]];

function grade(rank) { return rank <= 15 ? ["excellent", "优秀"] : rank <= 33 ? ["good", "良好"] : ["ok", "一般"]; }

onMounted(load);
watch(() => route.params.code, load);

async function load() {
  notFound.value = false; f.value = null;
  try {
    f.value = await api.get(`/funds/${route.params.code}/`);
    inWl.value = wl.has(f.value.code);
    await nextTick();
    drawAll();
  } catch (e) { notFound.value = true; }
}

function rebase(series, base) { const s0 = series[0]; return series.map((v) => +(v / s0 * base).toFixed(4)); }
function synth(seed, points, base, drift, vol) {
  let s = seed, v = 1; const out = [];
  for (let i = 0; i < points; i++) { s = (s * 9301 + 49297) % 233280; v = v * (1 + (s / 233280 - 0.5) * vol + drift); out.push(v); }
  return rebase(out, base);
}
function drawChart() {
  if (!navChart.value || !f.value) return;
  const full = f.value.nav_history;
  const slice = full.slice(Math.max(0, full.length - range.value));
  const base = slice[0];
  const peer = synth(7, slice.length, base, (f.value.returns.y1 / 100 * 0.6) / 250, f.value.metrics.vol / 100 / Math.sqrt(250) * 1.4);
  const hs = synth(31, slice.length, base, 0.0002, 0.011);
  line(navChart.value, { height: 300, series: [
    { name: "同类平均", color: "#9aa4b2", values: peer, width: 1.5 },
    { name: "沪深300", color: "#1a5cad", values: hs, width: 1.5 },
    { name: f.value.name, color: "#e0392f", values: slice, fill: true, width: 2.4 }] });
}
function drawAll() {
  drawChart();
  const a = f.value.allocation;
  const alloc = [{ name: "股票", value: a.stock, color: "#e0392f" }, { name: "债券", value: a.bond, color: "#1a5cad" }, { name: "现金", value: a.cash, color: "#00a878" }].filter((x) => x.value > 0);
  if (allocChart.value) donut(allocChart.value, alloc, { size: 150 });
  if (industryBars.value) hbars(industryBars.value, f.value.industries.map((x) => ({ name: x[0], value: x[1] })), { color: "var(--blue-500)" });
}
watch(range, () => { drawChart(); });
function toggleAdv() {
  advOpen.value = !advOpen.value;
  if (advOpen.value) nextTick(() => {
    const at = +(f.value.returns.y1 * 0.55).toFixed(1), as = +(f.value.returns.y1 * 0.35).toFixed(1);
    hbars(attrBars.value, [{ name: "行业配置", value: at }, { name: "个股选择", value: as }, { name: "其他", value: +(f.value.returns.y1 - at - as).toFixed(1) }], { color: "var(--green-500)" });
    const inst = 30 + (f.value.code.charCodeAt(5) % 40);
    hbars(holderBars.value, [{ name: "个人投资者", value: 100 - inst - 2 }, { name: "机构投资者", value: inst }, { name: "内部持有", value: 2 }], { color: "var(--orange-500)" });
  });
}
function toggleWl() { inWl.value = wl.toggle(f.value.code); toast(inWl.value ? "已加入自选" : "已移出自选"); }

const allocList = () => { const a = f.value.allocation; return [{ name: "股票", value: a.stock, color: "#e0392f" }, { name: "债券", value: a.bond, color: "#1a5cad" }, { name: "现金", value: a.cash, color: "#00a878" }].filter((x) => x.value > 0); };
</script>

<template>
  <div class="wrap" style="padding-top:18px">
    <div class="breadcrumb"><router-link to="/">首页</router-link> / <router-link to="/screener">基金数据</router-link> / <span>{{ f ? f.name : (notFound ? "未找到" : "基金详情") }}</span></div>
  </div>

  <div v-if="notFound" class="wrap" style="padding-bottom:30px"><div class="card"><div class="empty"><div class="ic">🔍</div>
    <h3 style="margin-bottom:8px">未找到基金「{{ route.params.code }}」</h3>
    <p class="muted" style="margin-bottom:18px">该基金代码可能不存在，或链接有误。</p>
    <router-link class="btn btn-primary" to="/screener">去基金筛选器看看 →</router-link></div></div></div>

  <div v-else-if="f" class="wrap" style="padding-bottom:30px">
    <div class="card fd-head">
      <div>
        <div class="nm">{{ f.name }}</div>
        <div class="meta"><span>代码 <b>{{ f.code }}</b></span><span>·</span><span class="tag gray">{{ f.ftype }}</span>
          <span class="risk" :class="f.risk">{{ f.risk }} 风险</span><span>·</span><span>{{ f.company }}</span>
          <span v-for="t in f.tags" :key="t" class="tag">{{ t }}</span></div>
      </div>
      <div class="fd-nav-now">
        <div class="small muted">单位净值（2026-06-16）</div>
        <div class="v" :class="cls(f.day_change)">{{ f.nav.toFixed(4) }}</div>
        <div class="d" :class="cls(f.day_change)">{{ fmtPct(f.day_change) }} 今日　累计净值 {{ f.acc_nav.toFixed(4) }}</div>
        <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
          <button class="btn btn-sm" @click="toggleWl">{{ inWl ? "★ 已自选" : "☆ 加自选" }}</button>
          <button class="btn btn-sm btn-cta" @click="toast('这是演示平台，不提供真实交易')">模拟申购</button>
        </div>
      </div>
    </div>

    <div class="card section" style="padding:18px 20px;margin-top:16px">
      <div class="section-head" style="margin-bottom:12px"><h2 style="font-size:18px">业绩概览</h2>
        <span class="sub">综合评级 <span class="grade" :class="grade(f.rank_pct)[0]">{{ grade(f.rank_pct)[1] }}</span> · 同类排名前 {{ f.rank_pct }}%（演示）</span></div>
      <div class="perf-grid">
        <div class="perf-cell" v-for="p in PERF" :key="p[1]">
          <div class="lab">{{ p[0] }}</div>
          <div class="val" :class="cls(f.returns[p[1]])">{{ f.returns[p[1]] === null ? "--" : fmtPct(f.returns[p[1]]) }}</div>
          <div class="rk">{{ p[1] === "y1" ? "同类前 " + f.rank_pct + "%" : " " }}</div>
        </div>
      </div>
      <div class="disclaimer-inline" style="margin-top:14px">「优秀 / 良好 / 一般」为基于同类排名的通俗化提示，便于新手理解；<b>历史业绩不代表未来表现</b>，不构成投资建议。</div>
    </div>

    <div class="card" style="padding:18px 20px;margin-top:16px">
      <div class="section-head" style="margin-bottom:10px"><h2 style="font-size:18px">净值走势</h2>
        <div class="chart-tools">
          <button v-for="r in [[20,'近1月'],[60,'近3月'],[120,'近6月'],[250,'近1年']]" :key="r[0]" :class="{ on: range === r[0] }" @click="range = r[0]">{{ r[1] }}</button>
        </div></div>
      <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:8px" class="small">
        <span><span style="display:inline-block;width:14px;height:3px;background:#e0392f;vertical-align:middle"></span> {{ f.name }}</span>
        <span><span style="display:inline-block;width:14px;height:3px;background:#9aa4b2;vertical-align:middle"></span> 同类平均</span>
        <span><span style="display:inline-block;width:14px;height:3px;background:#1a5cad;vertical-align:middle"></span> 沪深300</span>
      </div>
      <div ref="navChart"></div>
      <div class="risk-note" style="margin-top:8px">对比线以区间期初净值为基点等比缩放，仅用于走势示意。历史走势不代表未来。</div>
    </div>

    <div class="grid" style="grid-template-columns:1fr 1.2fr;gap:16px;margin-top:16px">
      <div class="card" style="padding:18px 20px">
        <h2 style="font-size:18px;margin-bottom:14px">资产配置</h2>
        <div style="display:flex;gap:18px;align-items:center">
          <div ref="allocChart"></div>
          <div style="flex:1">
            <div class="flex between" style="padding:5px 0" v-for="a in allocList()" :key="a.name">
              <span><span :style="{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '2px', background: a.color, marginRight: '6px' }"></span>{{ a.name }}</span><b>{{ a.value }}%</b>
            </div>
          </div>
        </div>
        <h3 style="font-size:15px;margin:18px 0 10px">行业分布</h3>
        <div class="sector-list" ref="industryBars"></div>
      </div>
      <div class="card" style="padding:18px 20px">
        <h2 style="font-size:18px;margin-bottom:6px">前十大重仓</h2>
        <div class="small muted" style="margin-bottom:10px">数据为演示用途，实际持仓以基金定期报告为准</div>
        <table class="holding-table"><thead><tr><th>持仓</th><th>占比</th><th>占净值比</th></tr></thead>
          <tbody><tr v-for="(h, i) in f.holdings" :key="i"><td>{{ i + 1 }}　{{ h[0] }}</td><td>{{ h[1].toFixed(2) }}%</td>
            <td><span class="track" style="height:8px;width:90px;background:var(--bg);border-radius:4px;display:inline-block;vertical-align:middle">
              <span :style="{ display: 'block', height: '100%', borderRadius: '4px', width: Math.min(100, h[1] / f.holdings[0][1] * 100) + '%', background: 'var(--blue-500)' }"></span></span></td></tr></tbody></table>
      </div>
    </div>

    <div class="card mgr-card" style="margin-top:16px">
      <div class="mgr-avatar">{{ f.manager.name.charAt(0) }}</div>
      <div style="flex:1">
        <div class="flex between items-center" style="flex-wrap:wrap"><h3 style="font-size:17px">{{ f.manager.name }} <span class="tag green" style="vertical-align:middle">基金经理</span></h3></div>
        <div class="kv-list" style="margin-top:10px;grid-template-columns:repeat(4,1fr)">
          <div class="kv"><span class="k">从业年限</span><span class="v">{{ f.manager.years }} 年</span></div>
          <div class="kv"><span class="k">任职年化</span><span class="v" :class="cls(f.manager.annual_return)">{{ fmtPct(f.manager.annual_return) }}</span></div>
          <div class="kv"><span class="k">在管基金</span><span class="v">{{ f.manager.funds_count }} 只</span></div>
          <div class="kv"><span class="k">管理规模</span><span class="v">{{ f.scale.toFixed(1) }} 亿</span></div>
        </div>
        <p class="small muted" style="margin:10px 0 0">{{ f.manager.bio }}</p>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="collapse-head" :class="{ open: advOpen }" @click="toggleAdv"><h2 style="font-size:18px">进阶数据 <span class="aud advanced">进阶</span></h2>
        <span class="ar">▼ 展开查看风险指标 / 业绩归因 / 持有人结构</span></div>
      <div class="collapse-body" v-show="advOpen">
        <h3 style="font-size:15px;margin-bottom:10px">风险指标（近1年，演示）</h3>
        <div class="kv-list" style="grid-template-columns:repeat(3,1fr)">
          <div class="kv"><span class="k">最大回撤</span><span class="v">{{ f.metrics.mdd }}%</span></div>
          <div class="kv"><span class="k">夏普比率</span><span class="v">{{ f.metrics.sharpe.toFixed(2) }}</span></div>
          <div class="kv"><span class="k">年化波动率</span><span class="v">{{ f.metrics.vol }}%</span></div>
          <div class="kv"><span class="k">下行风险</span><span class="v">{{ f.metrics.down_risk }}%</span></div>
          <div class="kv"><span class="k">信息比率</span><span class="v">{{ f.metrics.info_ratio.toFixed(2) }}</span></div>
          <div class="kv"><span class="k">成立年限</span><span class="v">{{ f.age_years }} 年</span></div>
        </div>
        <h3 style="font-size:15px;margin:18px 0 10px">业绩归因（近1年收益拆解，演示）</h3>
        <div class="sector-list" ref="attrBars"></div>
        <h3 style="font-size:15px;margin:18px 0 10px">持有人结构（演示）</h3>
        <div class="sector-list" ref="holderBars"></div>
      </div>
    </div>

    <div class="card" style="padding:18px 20px;margin-top:16px">
      <h2 style="font-size:18px;margin-bottom:14px">交易规则与费率</h2>
      <div class="kv-list" style="grid-template-columns:repeat(3,1fr)">
        <div class="kv"><span class="k">申购费率</span><span class="v">{{ f.fees.sub }}</span></div>
        <div class="kv"><span class="k">赎回费率</span><span class="v">{{ f.fees.red }}</span></div>
        <div class="kv"><span class="k">管理费</span><span class="v">{{ f.fees.manage }}</span></div>
        <div class="kv"><span class="k">托管费</span><span class="v">{{ f.fees.custody }}</span></div>
        <div class="kv"><span class="k">申购确认</span><span class="v">{{ f.fees.confirm }}</span></div>
        <div class="kv"><span class="k">赎回到账</span><span class="v">{{ f.fees.arrive }}</span></div>
      </div>
      <div class="disclaimer-inline" style="margin-top:14px">费率与交易规则<b>仅供参考，以基金公司官方公告及销售平台实际展示为准</b>。</div>
    </div>

    <div class="card" style="padding:18px 20px;margin-top:16px;background:var(--warn-bg)">
      <h3 style="font-size:15px;color:var(--orange-600);margin-bottom:8px">⚠️ 风险提示与免责声明</h3>
      <p class="small muted" style="line-height:1.9;margin:0">本页面所有基金信息、净值、收益率、排名及风险指标均为<b>虚构演示数据</b>，不代表任何真实基金产品，不构成任何投资建议或收益承诺。基金有风险，投资需谨慎。基金的过往业绩及其净值高低并不预示其未来表现。投资者应认真阅读基金合同、招募说明书等法律文件，结合自身风险承受能力独立判断、自主决策、自担风险。</p>
    </div>
  </div>
</template>
