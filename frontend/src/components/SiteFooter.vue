<script setup></script>

<template>
  <footer class="site-footer"><div class="wrap">
    <div class="footer-risk">
      <b>风险提示：</b>基金有风险，投资需谨慎。本网站为基金资讯与投资者教育演示平台，所展示的基金数据、净值、收益率、排名等均为<b>虚构演示数据</b>，
      不代表任何真实产品，不构成任何投资建议或对未来收益的承诺。<b>历史业绩不代表未来表现</b>，基金的过往业绩及其净值高低并不预示其未来表现。
      投资者应当认真阅读基金合同、招募说明书等法律文件，结合自身风险承受能力审慎决策，独立承担投资风险。
    </div>
    <div class="footer-cols">
      <div>
        <h4>基智汇 · 基金投教门户</h4>
        <p style="color:#9fb6d4;margin:0 0 6px;line-height:1.8">面向理财小白与进阶基民的基金资讯与投资者教育平台，倡导理性投资、长期投资、价值投资。</p>
      </div>
      <div><h4>核心栏目</h4>
        <router-link to="/screener">基金筛选</router-link>
        <router-link to="/education">投教课堂</router-link>
        <router-link to="/strategy">策略专栏</router-link>
        <router-link to="/news">市场资讯</router-link>
      </div>
      <div><h4>实用工具</h4>
        <router-link to="/screener">基金筛选器</router-link>
        <router-link to="/education">定投计算器</router-link>
        <router-link to="/watchlist">我的自选</router-link>
        <router-link to="/contact">联系咨询</router-link>
      </div>
      <div><h4>合规与帮助</h4>
        <a href="#" @click.prevent>投资者适当性</a>
        <a href="#" @click.prevent>免责声明</a>
        <a href="#" @click.prevent>隐私政策</a>
        <router-link to="/contact">联系我们</router-link>
      </div>
    </div>
    <div class="footer-bottom">
      演示项目 · 仅供学习交流 © 2026 基智汇　|　本站为产品原型演示，非真实金融服务，不接受任何资金往来　|　ICP 备案号：示例-00000000号
    </div>
  </div></footer>
</template>
