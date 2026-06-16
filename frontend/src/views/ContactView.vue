<script setup>
import { reactive, ref } from "vue";
import api from "../api";

const form = reactive({ name: "", phone: "", email: "", investor_type: "beginner", topic: "getstarted", message: "" });
const topics = [["getstarted", "新手入门咨询"], ["product", "基金/产品咨询"], ["strategy", "投资策略咨询"], ["complaint", "投诉与建议"], ["other", "其他"]];
const submitting = ref(false);
const done = ref(false);
const errMsg = ref("");

async function submit() {
  errMsg.value = "";
  if (!form.name.trim()) { errMsg.value = "请填写您的称呼。"; return; }
  submitting.value = true;
  try {
    await api.post("/inquiries/", { ...form });
    done.value = true;
  } catch (e) {
    const d = e.data || {};
    errMsg.value = d.non_field_errors?.[0] || d.message?.[0] || d.email?.[0] || "提交失败，请检查填写内容后重试。";
  } finally { submitting.value = false; }
}
function reset() { done.value = false; Object.assign(form, { name: "", phone: "", email: "", investor_type: "beginner", topic: "getstarted", message: "" }); }
</script>

<template>
  <section class="page-hero"><div class="wrap"><h1>📨 联系 / 咨询</h1>
    <p>有任何关于基金入门、产品或策略的疑问，填写下方表单，我们会尽快与你联系。本表单仅作演示，请勿填写敏感信息。</p></div></section>

  <div class="wrap section">
    <div class="grid split-form">
      <div class="card" style="padding:28px 30px">
        <template v-if="!done">
          <h2 style="font-size:20px;margin-bottom:18px">填写咨询信息</h2>
          <div class="field"><label>称呼 <span style="color:var(--up)">*</span></label><input v-model="form.name" placeholder="怎么称呼您？" maxlength="40"></div>
          <div class="grid cols-2" style="gap:14px">
            <div class="field"><label>联系电话</label><input v-model="form.phone" placeholder="手机号" maxlength="20"></div>
            <div class="field"><label>邮箱</label><input v-model="form.email" placeholder="name@example.com"></div>
          </div>
          <div class="grid cols-2" style="gap:14px">
            <div class="field"><label>我是</label><select v-model="form.investor_type"><option value="beginner">理财小白</option><option value="advanced">进阶基民</option></select></div>
            <div class="field"><label>咨询主题</label><select v-model="form.topic"><option v-for="t in topics" :key="t[0]" :value="t[0]">{{ t[1] }}</option></select></div>
          </div>
          <div class="field"><label>咨询内容 <span style="color:var(--up)">*</span></label>
            <textarea v-model="form.message" rows="5" placeholder="请描述你的问题（至少 5 个字）" style="width:100%;border:1px solid var(--line-2);border-radius:8px;padding:10px 12px;font-size:14px;font-family:inherit;background:var(--card);color:var(--ink-900);outline:none"></textarea></div>
          <div class="field" style="font-size:12px;color:var(--ink-600)">请至少填写一种联系方式（电话或邮箱），方便我们回复你。</div>
          <div v-if="errMsg" class="callout warn" style="margin:0 0 14px"><b>提交未成功：</b>{{ errMsg }}</div>
          <button class="btn btn-primary btn-block" :disabled="submitting" @click="submit">{{ submitting ? "提交中…" : "提交咨询" }}</button>
          <div class="disclaimer-inline" style="margin-top:14px">本表单数据将提交至后台用于演示，<b>不构成投资建议，也不会用于任何真实金融服务</b>。</div>
        </template>
        <template v-else>
          <div class="empty"><div class="ic">✅</div>
            <h3 style="margin-bottom:8px">提交成功！</h3>
            <p class="muted" style="margin-bottom:18px">我们已收到你的咨询（演示），运营人员可在后台「用户咨询」中查看处理。</p>
            <button class="btn btn-primary" @click="reset">再提交一条</button>
          </div>
        </template>
      </div>

      <aside>
        <div class="card" style="padding:22px"><h3 style="font-size:16px;margin-bottom:12px">🕘 服务说明</h3>
          <div class="kv-list kv-1">
            <div class="kv"><span class="k">在线时段</span><span class="v">工作日 9:00–18:00</span></div>
            <div class="kv"><span class="k">响应时效</span><span class="v">1 个工作日内</span></div>
            <div class="kv"><span class="k">客服邮箱</span><span class="v">demo@jizhihui.example</span></div>
          </div>
          <p class="small muted" style="margin-top:12px">以上为演示信息。投资有风险，本平台不提供任何保本保收益承诺。</p>
        </div>
        <div class="card" style="padding:22px;margin-top:16px"><h3 style="font-size:16px;margin-bottom:10px">💡 你可能更想先看</h3>
          <router-link class="news-item" style="display:block" to="/education">🌱 新手入门：基金到底是什么</router-link>
          <router-link class="news-item" style="display:block" to="/screener?mode=wizard">🧭 3 步找到适合我的基金方向</router-link>
          <router-link class="news-item" style="display:block" to="/education">🛡️ 先做一次风险承受力测评</router-link>
        </div>
      </aside>
    </div>
  </div>
</template>
