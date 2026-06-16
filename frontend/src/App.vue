<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import SiteHeader from "./components/SiteHeader.vue";
import SiteFooter from "./components/SiteFooter.vue";

const showTop = ref(false);
function onScroll() { showTop.value = window.pageYOffset > 400; }
function toTop() { window.scrollTo({ top: 0, behavior: "smooth" }); }
onMounted(() => window.addEventListener("scroll", onScroll));
onUnmounted(() => window.removeEventListener("scroll", onScroll));
</script>

<template>
  <SiteHeader />
  <router-view />
  <SiteFooter />
  <button class="to-top" :class="{ show: showTop }" @click="toTop" title="返回顶部" aria-label="返回顶部">↑</button>
</template>
