<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import api from "../api";

const route = useRoute();
const all = ref([]);
const strategy = ref(null);
const curLevel = ref(route.query.level || "all");

onMounted(async () => { all.value = await api.get("/strategies/"); route.query.id && open(route.query.id); });
watch(() => route.query.id, (id) => { id ? open(id) : (strategy.value = null); });

const filtered = computed(() => all.value.filter((s) => curLevel.value === "all" || s.level === curLevel.value));
const levelLabel = (l) => (l === "beginner" ? "🌱 小白友好" : "🚀 进阶实战");
async function open(slug) { strategy.value = await api.get(`/strategies/${slug}/`); window.scrollTo(0, 0); }
const related = computed(() => strategy.value ? all.value.filter((s) => s.level === strategy.value.level && s.slug !== strategy.value.slug).slice(0, 4) : []);
</script>

<template>
  <section class="page-hero"><div class="wrap"><h1>🧭 策略专栏</h1>
    <p>这里只讲「可复用的方法论」，不推荐具体基金、不预测市场涨跌。小白看友好策略上手，进阶看实战策略提升。所有内容不构成投资建议。</p></div></section>

  <div class="wrap section">
    <div v-if="strategy">
      <div class="breadcrumb"><a href="#" @click.prevent="$router.push('/strategy')">← 返回策略专栏</a> / {{ levelLabel(strategy.level) }}</div>
      <div class="grid reader">
        <article class="card" style="padding:30px 34px">
          <span class="aud" :class="strategy.level">{{ levelLabel(strategy.level) }}</span>
          <h1 style="font-size:25px;line-height:1.4;margin:12px 0 18px">{{ strategy.title }}</h1>
          <div class="callout"><b>适用人群：</b>{{ strategy.suit }}</div>
          <h2 style="font-size:19px;margin:24px 0 14px">策略核心框架</h2>
          <div class="learn-path">
            <div class="path-step" v-for="(step, i) in strategy.framework" :key="i">
              <div class="node"><div class="dot">{{ i + 1 }}</div><div class="line"></div></div>
              <div class="body"><h4>{{ step }}</h4></div></div>
          </div>
          <div class="callout warn" style="margin-top:20px"><b>风险点与局限：</b>{{ strategy.risk }}</div>
          <div class="divider"></div>
          <p class="small muted">本策略仅阐述方法逻辑，不推荐任何具体基金，不构成投资建议，不保证收益。历史表现不代表未来，请结合自身情况独立决策、自担风险。</p>
        </article>
        <aside>
          <div class="card" style="padding:18px"><h3 style="font-size:15px;margin-bottom:10px">⚖️ 策略速览</h3>
            <div class="kv-list kv-1">
              <div class="kv"><span class="k">类型</span><span class="v">{{ levelLabel(strategy.level) }}</span></div>
              <div class="kv"><span class="k">核心步骤</span><span class="v">{{ strategy.framework.length }} 步</span></div></div></div>
          <div class="card" style="padding:18px;margin-top:16px"><h3 style="font-size:15px;margin-bottom:10px">🔗 同类策略</h3>
            <router-link v-for="r in related" :key="r.slug" class="news-item" style="display:block" :to="`/strategy?id=${r.slug}`">
              <div style="font-size:13px;color:var(--ink-700)">{{ r.title }}</div></router-link></div>
          <router-link class="btn btn-primary btn-block" style="margin-top:16px" to="/education">配套投教课程 →</router-link>
        </aside>
      </div>
    </div>

    <div v-else>
      <div class="filter-pills">
        <span class="pill" :class="{ on: curLevel === 'all' }" @click="curLevel = 'all'">全部策略</span>
        <span class="pill" :class="{ on: curLevel === 'beginner' }" @click="curLevel = 'beginner'">🌱 小白友好策略</span>
        <span class="pill" :class="{ on: curLevel === 'advanced' }" @click="curLevel = 'advanced'">🚀 进阶实战策略</span>
      </div>
      <div class="grid cols-2">
        <router-link v-for="s in filtered" :key="s.slug" class="card article-card" :to="`/strategy?id=${s.slug}`">
          <div class="top"><span class="aud" :class="s.level">{{ levelLabel(s.level) }}</span></div>
          <h3>{{ s.title }}</h3><p class="excerpt"><b>适合：</b>{{ s.suit }}</p>
          <div class="foot"><span class="small muted">方法逻辑 · 适用人群 · 风险点</span><span style="color:var(--blue-600);font-weight:600">查看策略 →</span></div>
        </router-link>
      </div>
      <div class="disclaimer-inline" style="margin-top:20px">本专栏所有策略仅阐述方法逻辑与适用场景，<b>不推荐任何具体基金，不构成投资建议，不保证收益</b>。历史表现不代表未来，投资需自主决策、自担风险。</div>
    </div>
  </div>
</template>
