<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../api";

const all = ref([]);
const cur = ref("all");
const TABS = [["all", "全部"], ["industry", "📰 行业要闻"], ["notice", "📢 公司公告"], ["view", "💡 观点解读"]];
const COLOR = { notice: "var(--blue-600)", view: "var(--green-600)", industry: "var(--orange-600)" };

onMounted(async () => { all.value = await api.get("/news/"); });
const list = computed(() => (cur.value === "all" ? all.value : all.value.filter((n) => n.category === cur.value)));
const fmtTime = (t) => t.replace("T", " ").slice(0, 16);
</script>

<template>
  <section class="page-hero"><div class="wrap"><h1>📰 市场资讯</h1>
    <p>汇集基金行业要闻、基金公司公告与市场观点解读。资讯内容仅供参考，不构成投资建议。</p></div></section>
  <div class="wrap section">
    <div class="filter-pills">
      <span v-for="t in TABS" :key="t[0]" class="pill" :class="{ on: cur === t[0] }" @click="cur = t[0]">{{ t[1] }}</span>
    </div>
    <div class="card" style="padding:6px 22px">
      <div class="news-item" style="padding:14px 0" v-for="n in list" :key="n.title">
        <div class="flex" style="gap:10px;align-items:flex-start">
          <span class="tag" :style="{ background: 'transparent', color: COLOR[n.category], border: '1px solid currentColor', flexShrink: 0 }">{{ n.category_display }}</span>
          <div style="flex:1"><a href="#" @click.prevent style="font-size:15px;color:var(--ink-900);font-weight:500"><span class="dot-tag">[{{ n.tag }}]</span>{{ n.title }}</a>
            <div class="meta">{{ fmtTime(n.published_at) }}　·　来源：演示数据</div></div>
        </div>
      </div>
    </div>
    <div class="disclaimer-inline" style="margin-top:18px">本页资讯为<b>演示内容</b>，标题与时间均为示例，不代表真实新闻；相关信息以官方渠道为准，不构成投资建议。</div>
  </div>
</template>
