import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/style.css";

// 尽早应用主题，减少闪烁
try {
  if (localStorage.getItem("jzh_theme") === "dark")
    document.documentElement.setAttribute("data-theme", "dark");
} catch {}

createApp(App).use(router).mount("#app");
