<script setup>
import { ref, computed, onMounted } from "vue";
import api from "../api";
import { fmtPct, cls } from "../utils/format";
import wl from "../store/watchlist";
import toast from "../utils/toast";

const allFunds = ref([]);
const version = ref(0); // 触发重算
const curGroup = ref("全部");

onMounted(async () => { const d = await api.get("/funds/"); allFunds.value = d.results || d; });

const funds = computed(() => { version.value; return wl.list().map((c) => allFunds.value.find((f) => f.code === c)).filter(Boolean); });
const groups = computed(() => { version.value; return wl.groups(); });
const countIn = (g) => funds.value.filter((f) => wl.groupOf(f.code) === g).length;
const shown = computed(() => funds.value.filter((f) => curGroup.value === "全部" || wl.groupOf(f.code) === curGroup.value));
const avgY1 = computed(() => shown.value.length ? shown.value.reduce((a, f) => a + f.returns.y1, 0) / shown.value.length : 0);

function remove(code) { wl.remove(code); version.value++; toast("已移出自选"); }
function addGroup() {
  const name = prompt("新建分组名称：", "");
  if (name && wl.addGroup(name)) { version.value++; toast(`已创建分组「${name.trim()}」`); }
  else if (name) toast("分组已存在或名称无效");
}
function delGroup(g) {
  if (confirm(`删除分组「${g}」？该组基金将移回「默认」。`)) { wl.removeGroup(g); if (curGroup.value === g) curGroup.value = "全部"; version.value++; }
}
function setGroup(code, e) { wl.setGroup(code, e.target.value); version.value++; toast(`已移动到「${e.target.value}」`); }
function saveNote(code, e) { wl.setNote(code, e.target.innerText.trim().slice(0, 60)); }
function noteOf(code) { return wl.noteOf(code); }
function groupOf(code) { return wl.groupOf(code); }
</script>

<template>
  <section class="page-hero"><div class="wrap"><h1>⭐ 我的自选</h1>
    <p>把关注的基金放在一起对比观察。自选、分组与备注保存在你本地浏览器，换设备不会同步。数据为演示用途，不构成投资建议。</p></div></section>

  <div class="wrap section">
    <div v-if="!funds.length" class="card"><div class="empty"><div class="ic">⭐</div>
      <h3 style="margin-bottom:8px">自选列表还是空的</h3>
      <p class="muted" style="margin-bottom:18px">在基金筛选或详情页点击「☆ 加自选」，就能把基金收藏到这里啦</p>
      <router-link class="btn btn-primary" to="/screener">去筛选基金 →</router-link></div></div>

    <template v-else>
      <div class="grid cols-3" style="margin-bottom:18px">
        <div class="card" style="padding:18px"><div class="small muted">自选基金数</div><div style="font-size:26px;font-weight:800;color:var(--blue-700)">{{ funds.length }} 只</div></div>
        <div class="card" style="padding:18px"><div class="small muted">当前分组平均近一年（演示）</div><div style="font-size:26px;font-weight:800" :class="cls(avgY1)">{{ shown.length ? fmtPct(avgY1) : "--" }}</div></div>
        <div class="card" style="padding:18px;display:flex;align-items:center;justify-content:space-between"><div><div class="small muted">添加更多</div><div class="b" style="font-size:15px">去基金筛选器</div></div><router-link class="btn btn-primary btn-sm" to="/screener">去筛选</router-link></div>
      </div>

      <div class="wl-tabs">
        <div class="wl-tab" :class="{ on: curGroup === '全部' }" @click="curGroup = '全部'">全部 <span class="cnt">{{ funds.length }}</span></div>
        <div class="wl-tab" v-for="g in groups" :key="g" :class="{ on: curGroup === g }" @click="curGroup = g">{{ g }} <span class="cnt">{{ countIn(g) }}</span>
          <span v-if="g !== '默认'" class="del-g" style="margin-left:4px;color:inherit;opacity:.6" @click.stop="delGroup(g)">×</span></div>
        <button class="btn btn-sm btn-ghost" @click="addGroup">+ 新建分组</button>
      </div>

      <div class="card" style="padding:0;overflow:auto"><table class="rank-table">
        <thead><tr><th>基金名称 / 备注</th><th class="tr min-hide">净值</th><th class="tr min-hide">日涨</th><th class="tr">近1年</th><th class="tr min-hide">近3年</th><th class="tr">分组</th><th class="tr">操作</th></tr></thead>
        <tbody>
          <tr v-for="f in shown" :key="f.code">
            <td class="fund-name-cell"><router-link :to="`/fund/${f.code}`"><div class="nm">{{ f.name }}</div></router-link>
              <div class="cd">{{ f.code }} <span class="risk" :class="f.risk">{{ f.risk }}</span> <span class="tag gray">{{ f.ftype }}</span></div>
              <div class="wl-note" contenteditable="true" @blur="saveNote(f.code, $event)" @keydown.enter.prevent="$event.target.blur()">{{ noteOf(f.code) }}</div></td>
            <td class="tr b min-hide">{{ f.nav.toFixed(4) }}</td>
            <td class="tr b min-hide" :class="cls(f.day_change)">{{ fmtPct(f.day_change) }}</td>
            <td class="tr" :class="cls(f.returns.y1)">{{ fmtPct(f.returns.y1) }}</td>
            <td class="tr min-hide" :class="cls(f.returns.y3)">{{ fmtPct(f.returns.y3) }}</td>
            <td class="tr"><select class="wl-group-sel" :value="groupOf(f.code)" @change="setGroup(f.code, $event)" style="height:30px;border:1px solid var(--line-2);border-radius:6px;background:var(--card);color:var(--ink-900)">
              <option v-for="g in groups" :key="g" :value="g">{{ g }}</option></select></td>
            <td class="tr"><router-link class="btn btn-sm btn-primary" :to="`/fund/${f.code}`">详情</router-link>
              <button class="btn btn-sm" @click="remove(f.code)">移除</button></td>
          </tr>
          <tr v-if="!shown.length"><td colspan="7"><div class="empty">该分组下暂无基金</div></td></tr>
        </tbody></table></div>
      <div class="disclaimer-inline" style="margin-top:16px">自选、分组与备注均保存在本地浏览器（localStorage），清除缓存或更换设备将丢失。所示数据为<b>演示用途，不构成投资建议</b>，历史业绩不代表未来表现。</div>
    </template>
  </div>
</template>
