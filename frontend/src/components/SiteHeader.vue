<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
function isActive(to) {
  return to === "/" ? route.path === "/" : route.path.startsWith(to);
}
const menuOpen = ref(false);
const keyword = ref("");
const isDark = ref(document.documentElement.getAttribute("data-theme") === "dark");

const nav = [
  { key: "home", text: "首页", to: "/" },
  { key: "screener", text: "基金数据", to: "/screener" },
  { key: "education", text: "投教课堂", to: "/education" },
  { key: "strategy", text: "策略专栏", to: "/strategy" },
  { key: "news", text: "市场资讯", to: "/news" },
  { key: "watchlist", text: "我的自选", to: "/watchlist" },
  { key: "contact", text: "联系咨询", to: "/contact" },
];

function search() {
  const q = keyword.value.trim();
  router.push({ path: "/search", query: q ? { q } : {} });
  menuOpen.value = false;
}
function toggleTheme() {
  isDark.value = !isDark.value;
  if (isDark.value) document.documentElement.setAttribute("data-theme", "dark");
  else document.documentElement.removeAttribute("data-theme");
  try { localStorage.setItem("jzh_theme", isDark.value ? "dark" : "light"); } catch {}
}
</script>

<template>
  <div class="compliance-bar"><div class="wrap">
    <span class="dot">●</span>
    <span>市场有风险，投资需谨慎 · 历史业绩不代表未来表现 · 本站内容仅供参考，不构成投资建议</span>
  </div></div>
  <header class="site-header"><div class="wrap"><nav class="nav">
    <router-link class="brand" to="/">
      <span class="logo">智</span><span>基智汇<small>FUND · 投教门户</small></span>
    </router-link>
    <div class="nav-search">
      <input v-model="keyword" type="text" placeholder="搜索基金名称 / 代码，如 沪深300" @keydown.enter="search" aria-label="搜索" />
      <button @click="search" aria-label="搜索">🔍</button>
    </div>
    <button class="nav-toggle" @click="menuOpen = !menuOpen" aria-label="菜单">☰</button>
    <div class="nav-menu" :class="{ open: menuOpen }">
      <router-link v-for="n in nav" :key="n.key" :to="n.to" :class="{ active: isActive(n.to) }" @click="menuOpen = false">{{ n.text }}</router-link>
    </div>
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换浅色' : '切换深色'" aria-label="切换主题">{{ isDark ? "☀️" : "🌙" }}</button>
  </nav></div></header>
</template>
