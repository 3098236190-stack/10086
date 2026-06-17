import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  { path: "/", name: "home", component: () => import("./views/HomeView.vue") },
  { path: "/screener", name: "screener", component: () => import("./views/ScreenerView.vue") },
  { path: "/fund/:code", name: "fund", component: () => import("./views/FundDetailView.vue") },
  { path: "/education", name: "education", component: () => import("./views/EducationView.vue") },
  { path: "/strategy", name: "strategy", component: () => import("./views/StrategyView.vue") },
  { path: "/news", name: "news", component: () => import("./views/NewsView.vue") },
  { path: "/watchlist", name: "watchlist", component: () => import("./views/WatchlistView.vue") },
  { path: "/search", name: "search", component: () => import("./views/SearchView.vue") },
  { path: "/contact", name: "contact", component: () => import("./views/ContactView.vue") },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0 }; },
});
