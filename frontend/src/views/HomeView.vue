<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../api";
import { fmtPct, cls } from "../utils/format";

const data = ref(null);
const err = ref("");
onMounted(async () => {
  try { data.value = await api.get("/home/"); }
  catch (e) { err.value = "数据加载失败，请确认后端服务已启动。"; }
});

const tickerItems = computed(() => {
  if (!data.value) return [];
  const idx = data.value.indices.map((x) => ({ name: x.name, value: x.value, change: x.change_pct }));
  const sec = data.value.sectors.map((s) => ({ name: s.name, value: null, change: s.change_pct }));
  return idx.concat(sec);
});
const tools = [
  { ic: "🔎", t: "基金筛选", d: "双模式选基", to: "/screener", cls: "" },
  { ic: "💹", t: "净值查询", d: "实时净值走势", to: "/screener", cls: "t-green" },
  { ic: "🧮", t: "定投计算器", d: "测算定投收益", to: "/education", cls: "t-orange" },
  { ic: "🛡️", t: "风险测评", d: "看看你属哪类", to: "/education", cls: "t-green" },
  { ic: "🎓", t: "新手入门", d: "0 基础学理财", to: "/education", cls: "" },
  { ic: "🧭", t: "热门策略", d: "可复用方法论", to: "/strategy", cls: "t-orange" },
];
const sectorsSorted = computed(() =>
  data.value ? [...data.value.sectors].sort((a, b) => b.change_pct - a.change_pct) : []
);
const maxSector = computed(() => 4);
</script>

<template>
  <div v-if="err" class="wrap section"><div class="card"><div class="empty"><div class="ic">⚠️</div>{{ err }}</div></div></div>
  <template v-else-if="data">
    <!-- 行情条 -->
    <div class="ticker"><div class="wrap" style="overflow:hidden"><div class="ticker-track">
      <span class="ticker-item" v-for="(x, i) in tickerItems.concat(tickerItems)" :key="i">
        {{ x.name }} <b v-if="x.value !== null">{{ x.value.toFixed(2) }}</b>
        <span :class="cls(x.change)">{{ fmtPct(x.change) }}</span>
      </span>
    </div></div></div>

    <!-- Banner -->
    <section class="hero"><div class="wrap"><div class="hero-grid">
      <div class="hero-left">
        <span class="eyebrow">📚 0 基础也能看懂的基金平台</span>
        <h1>新手理财入门<br>从<span class="hl">看懂一只基金</span>开始</h1>
        <p>不懂术语？怕踩坑？这里用大白话带你认识基金，3 步测出适合你的方向，再用数据工具帮你做选择。小白友好，进阶够用。</p>
        <div class="hero-actions">
          <router-link class="btn btn-cta" to="/screener?mode=wizard">🚀 1 分钟找到适合我的基金</router-link>
          <router-link class="btn btn-ghost" style="color:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.4)" to="/education">先去投教课堂学一学</router-link>
        </div>
        <ul class="hero-steps">
          <li><b>双梯队</b>投教体系</li><li><b>双模式</b>选基工具</li><li><b>全维度</b>基金数据</li>
        </ul>
      </div>
      <div class="hero-right">
        <div class="flex between items-center"><h3>📈 今日大盘概览</h3><span class="risk-note">数据为演示用途</span></div>
        <div class="index-list">
          <div class="index-item" v-for="x in data.indices.slice(0, 4)" :key="x.code">
            <div><div class="name">{{ x.name }}</div><div class="small muted">{{ x.code }}</div></div>
            <div class="tr"><div class="val" :class="cls(x.change_pct)">{{ x.value.toFixed(2) }}</div>
              <span class="chg" :class="'chip-' + cls(x.change_pct)">{{ fmtPct(x.change_pct) }}</span></div>
          </div>
        </div>
        <div class="disclaimer-inline" style="margin-top:12px">指数行情仅供参考，历史与当前表现均不代表未来走势。</div>
      </div>
    </div></div></section>

    <!-- 工具 -->
    <section class="section"><div class="wrap">
      <div class="section-head"><h2>常用工具</h2><span class="sub">小白找入门入口，进阶直达数据工具</span></div>
      <div class="tools-grid">
        <router-link v-for="t in tools" :key="t.t" class="tool-card" :class="t.cls" :to="t.to">
          <div class="ic">{{ t.ic }}</div><div class="t">{{ t.t }}</div><div class="d">{{ t.d }}</div>
        </router-link>
      </div>
    </div></section>

    <!-- 投教精选 -->
    <section class="section" style="background:var(--card);border-top:1px solid var(--line);border-bottom:1px solid var(--line)"><div class="wrap">
      <div class="section-head"><h2>投教精选</h2><router-link class="more" to="/education">进入投教课堂 →</router-link></div>
      <div class="grid cols-2">
        <div class="card" style="padding:18px 20px">
          <div class="flex between items-center" style="margin-bottom:6px"><h3 style="font-size:16px">🌱 小白学习路径</h3>
            <router-link class="more" to="/education">查看全部 →</router-link></div>
          <div class="learn-path">
            <div class="path-step" v-for="(e, i) in data.edu_beginner" :key="e.slug">
              <div class="node"><div class="dot">{{ i + 1 }}</div><div class="line"></div></div>
              <div class="body"><h4><router-link :to="`/education?id=${e.slug}`">{{ e.title }}</router-link></h4><p>{{ e.key_point }}</p></div>
            </div>
          </div>
        </div>
        <div class="card" style="padding:18px 20px">
          <div class="flex between items-center" style="margin-bottom:6px"><h3 style="font-size:16px">🚀 进阶提升精选</h3>
            <router-link class="more" to="/education?level=advanced">更多进阶 →</router-link></div>
          <div class="edu-list">
            <router-link class="item" v-for="(e, i) in data.edu_advanced" :key="e.slug" :to="`/education?id=${e.slug}`">
              <span class="num">{{ i + 1 }}</span><div><h4>{{ e.title }}</h4><p>{{ e.excerpt }}</p></div>
            </router-link>
          </div>
        </div>
      </div>
    </div></section>

    <!-- 行情 -->
    <section class="section"><div class="wrap">
      <div class="section-head"><h2>市场行情</h2><span class="sub">行情与榜单均为演示数据 · 历史业绩不代表未来</span></div>
      <div class="grid" style="grid-template-columns:1.5fr 1fr">
        <div class="card" style="padding:0;overflow:hidden">
          <div class="flex between items-center" style="padding:14px 16px;border-bottom:1px solid var(--line)">
            <h3 style="font-size:15px">🔥 今日基金涨幅 TOP10</h3><router-link class="more" to="/screener">去筛选 →</router-link></div>
          <table class="rank-table">
            <thead><tr><th style="width:40px">排名</th><th>基金名称</th><th class="tr">单位净值</th><th class="tr">日涨跌</th><th class="tr min-hide">近一年</th></tr></thead>
            <tbody>
              <tr v-for="(f, i) in data.top_funds" :key="f.code" style="cursor:pointer" @click="$router.push(`/fund/${f.code}`)">
                <td><span class="rk" :class="{ top: i < 3 }">{{ i + 1 }}</span></td>
                <td class="fund-name-cell"><div class="nm">{{ f.name }}</div><div class="cd">{{ f.code }} · <span class="tag gray">{{ f.ftype }}</span></div></td>
                <td class="tr b">{{ f.nav.toFixed(4) }}</td>
                <td class="tr b" :class="cls(f.day_change)">{{ fmtPct(f.day_change) }}</td>
                <td class="tr min-hide" :class="cls(f.returns.y1)">{{ fmtPct(f.returns.y1) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="card" style="padding:16px">
          <h3 style="font-size:15px;margin-bottom:12px">🏭 热门板块涨幅榜</h3>
          <div class="sector-list">
            <div class="sector-bar" v-for="s in sectorsSorted" :key="s.name">
              <span class="nm">{{ s.name }}</span>
              <span class="track"><span class="fill" :style="{ width: Math.min(100, Math.abs(s.change_pct) / maxSector * 100) + '%', background: s.change_pct >= 0 ? 'var(--up)' : 'var(--down)' }"></span></span>
              <span class="pc" :class="cls(s.change_pct)">{{ fmtPct(s.change_pct) }}</span>
            </div>
          </div>
          <div class="risk-note" style="margin-top:10px">红涨绿跌为示意，板块表现存在轮动，过往不代表未来。</div>
        </div>
      </div>
    </div></section>

    <!-- 资讯 -->
    <section class="section" style="background:var(--card);border-top:1px solid var(--line)"><div class="wrap">
      <div class="section-head"><h2>资讯要闻</h2><router-link class="more" to="/news">更多资讯 →</router-link></div>
      <div class="grid cols-3">
        <div class="news-col"><h3>📰 基金行业要闻</h3>
          <div class="news-item" v-for="n in data.news.industry" :key="n.title">
            <router-link to="/news"><span class="dot-tag">[{{ n.tag }}]</span>{{ n.title }}</router-link>
            <div class="meta">{{ n.published_at.replace('T', ' ').slice(0, 16) }}</div></div>
        </div>
        <div class="news-col"><h3>📢 基金公司公告</h3>
          <div class="news-item" v-for="n in data.news.notice" :key="n.title">
            <router-link to="/news"><span class="dot-tag">[{{ n.tag }}]</span>{{ n.title }}</router-link>
            <div class="meta">{{ n.published_at.replace('T', ' ').slice(0, 16) }}</div></div>
        </div>
        <div class="news-col"><h3>💡 市场观点解读</h3>
          <div class="news-item" v-for="n in data.news.view" :key="n.title">
            <router-link to="/news"><span class="dot-tag">[{{ n.tag }}]</span>{{ n.title }}</router-link>
            <div class="meta">{{ n.published_at.replace('T', ' ').slice(0, 16) }}</div></div>
        </div>
      </div>
    </div></section>
  </template>
</template>
