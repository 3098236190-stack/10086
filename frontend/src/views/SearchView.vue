<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import api from "../api";
import { fmtPct, cls } from "../utils/format";

const route = useRoute();
const q = computed(() => (route.query.q || "").trim());
const funds = ref([]), edu = ref([]), strat = ref([]);
const loading = ref(false);

async function run() {
  if (!q.value) { funds.value = []; edu.value = []; strat.value = []; return; }
  loading.value = true;
  const enc = encodeURIComponent(q.value);
  try {
    const [fr, er, sr] = await Promise.all([
      api.get(`/funds/?search=${enc}`), api.get(`/education/?search=${enc}`), api.get(`/strategies/?search=${enc}`),
    ]);
    funds.value = fr.results || fr; edu.value = er; strat.value = sr;
  } finally { loading.value = false; }
}
onMounted(run);
watch(q, run);

const total = computed(() => funds.value.length + edu.value.length + strat.value.length);
function hl(text) {
  if (!q.value) return text;
  try {
    const re = new RegExp("(" + q.value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return String(text).replace(re, '<mark style="background:var(--orange-100);color:var(--orange-600);padding:0 2px;border-radius:3px">$1</mark>');
  } catch { return text; }
}
</script>

<template>
  <section class="page-hero"><div class="wrap"><h1>🔍 搜索结果</h1>
    <p v-if="!q">请输入关键词进行搜索</p>
    <p v-else>关键词「<b>{{ q }}</b>」共找到 <b>{{ total }}</b> 条结果（基金 {{ funds.length }} · 投教 {{ edu.length }} · 策略 {{ strat.length }}）</p>
  </div></section>

  <div class="wrap section">
    <div v-if="!q" class="empty"><div class="ic">🔍</div>在顶部搜索框输入基金名称/代码、投教或策略关键词</div>
    <div v-else-if="!loading && total === 0" class="card"><div class="empty"><div class="ic">🤔</div>没有找到与「{{ q }}」相关的内容<br>
      <router-link class="btn btn-primary" style="margin-top:14px" to="/screener">去基金筛选器看看 →</router-link></div></div>
    <template v-else>
      <template v-if="funds.length">
        <div class="section-head"><h2>基金 · {{ funds.length }}</h2><router-link class="more" to="/screener">全部基金 →</router-link></div>
        <div class="card" style="padding:0;overflow:auto;margin-bottom:26px"><table class="rank-table">
          <thead><tr><th>基金名称</th><th class="tr">净值</th><th class="tr min-hide">日涨</th><th class="tr">近1年</th><th class="tr">风险</th></tr></thead>
          <tbody><tr v-for="f in funds" :key="f.code" style="cursor:pointer" @click="$router.push(`/fund/${f.code}`)">
            <td class="fund-name-cell"><div class="nm" v-html="hl(f.name)"></div><div class="cd" v-html="hl(f.code) + ' · ' + f.company + ' · ' + f.ftype"></div></td>
            <td class="tr b">{{ f.nav.toFixed(4) }}</td><td class="tr min-hide" :class="cls(f.day_change)">{{ fmtPct(f.day_change) }}</td>
            <td class="tr b" :class="cls(f.returns.y1)">{{ fmtPct(f.returns.y1) }}</td>
            <td class="tr"><span class="risk" :class="f.risk">{{ f.risk }}</span></td></tr></tbody></table></div>
      </template>

      <template v-if="edu.length">
        <div class="section-head"><h2>投教课堂 · {{ edu.length }}</h2><router-link class="more" to="/education">全部投教 →</router-link></div>
        <div class="grid cols-3" style="margin-bottom:26px">
          <router-link v-for="e in edu" :key="e.slug" class="card article-card" :to="`/education?id=${e.slug}`">
            <div class="top"><span class="aud" :class="e.level">{{ e.level === "beginner" ? "🌱 入门" : "🚀 进阶" }}</span><span class="tag gray">{{ e.category }}</span></div>
            <h3 v-html="hl(e.title)"></h3><p class="excerpt" v-html="hl(e.excerpt)"></p>
            <div class="foot"><span>约 {{ e.read_time }}</span><span style="color:var(--blue-600);font-weight:600">阅读 →</span></div></router-link>
        </div>
      </template>

      <template v-if="strat.length">
        <div class="section-head"><h2>策略专栏 · {{ strat.length }}</h2><router-link class="more" to="/strategy">全部策略 →</router-link></div>
        <div class="grid cols-2">
          <router-link v-for="s in strat" :key="s.slug" class="card article-card" :to="`/strategy?id=${s.slug}`">
            <div class="top"><span class="aud" :class="s.level">{{ s.level === "beginner" ? "🌱 小白友好" : "🚀 进阶实战" }}</span></div>
            <h3 v-html="hl(s.title)"></h3><p class="excerpt"><b>适合：</b><span v-html="hl(s.suit)"></span></p>
            <div class="foot"><span class="small muted">方法逻辑 · 风险点</span><span style="color:var(--blue-600);font-weight:600">查看 →</span></div></router-link>
        </div>
      </template>
      <div class="disclaimer-inline" style="margin-top:22px">搜索结果基于演示数据，不构成投资建议。基金有风险，历史业绩不代表未来表现。</div>
    </template>
  </div>
</template>
