/* ============================================================
   基智汇 · 演示数据层  (data.js)
   说明：本文件所有基金、净值、收益、排名均为「虚构演示数据」，
   仅用于产品功能展示，不代表任何真实基金，不构成投资建议。
   基金名称均为虚构，如有雷同纯属巧合。
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------- 工具函数 ---------- */
  function fmtPct(v, withSign) {
    if (v === null || v === undefined || isNaN(v)) return "--";
    var s = (v > 0 && withSign !== false ? "+" : "") + v.toFixed(2) + "%";
    return s;
  }
  function cls(v) { return v > 0 ? "up" : v < 0 ? "down" : "flat"; }

  // 以种子生成稳定的伪随机净值曲线（让每次刷新曲线一致）
  function seededSeries(seed, points, startVal, drift, vol) {
    var s = seed, out = [], v = startVal;
    function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    for (var i = 0; i < points; i++) {
      var shock = (rnd() - 0.5) * vol + drift;
      v = Math.max(0.2, v * (1 + shock));
      out.push(+v.toFixed(4));
    }
    return out;
  }

  /* ---------- 大盘指数 ---------- */
  var indices = [
    { name: "上证指数",  code: "000001", value: 3218.46, change: 0.62 },
    { name: "深证成指",  code: "399001", value: 10142.83, change: 0.88 },
    { name: "创业板指",  code: "399006", value: 2034.17, change: 1.24 },
    { name: "沪深300",   code: "000300", value: 3895.62, change: 0.55 },
    { name: "科创50",    code: "000688", value: 1086.34, change: 1.51 },
    { name: "中证红利",  code: "000922", value: 5642.18, change: -0.31 }
  ];

  /* ---------- 热门板块 ---------- */
  var sectors = [
    { name: "人工智能", change: 3.42 },
    { name: "半导体",   change: 2.78 },
    { name: "新能源车", change: 1.95 },
    { name: "医药生物", change: 1.12 },
    { name: "高端制造", change: 0.74 },
    { name: "食品饮料", change: -0.46 },
    { name: "房地产",   change: -1.23 },
    { name: "银行",     change: -0.18 }
  ];

  /* ---------- 基金库（虚构演示数据） ---------- */
  // direction: 宽基指数 / 行业主题 / 债券固收 / 混合均衡（用于新手向导匹配）
  // appetite: 适合的风险偏好 保守/稳健/平衡/进取
  var rawFunds = [
    {
      code: "001234", name: "汇盈沪深300指数A", type: "指数型", risk: "R3",
      company: "汇盈基金", manager: "李宏伟", direction: "宽基指数", appetite: ["稳健","平衡"],
      scale: 186.4, inception: "2016-05-12", nav: 1.8642, accNav: 1.8642, day: 0.55,
      ret: { w1: 1.12, m1: 2.34, m3: 5.67, m6: 8.21, y1: 12.45, y3: 28.6, y5: 46.2, since: 86.4 },
      rank: 18, metrics: { mdd: -18.4, sharpe: 0.92, vol: 16.8, downRisk: 11.2, info: 0.31 },
      tags: ["指数增强", "低费率"], allocation: { stock: 94, bond: 0, cash: 6 },
      holdings: [["贵州茅台",5.8],["宁德时代",4.2],["招商银行",3.1],["中国平安",2.7],["美的集团",2.3],["五粮液",2.1],["比亚迪",1.9],["长江电力",1.7],["兴业银行",1.5],["紫金矿业",1.4]],
      industries: [["食品饮料",18],["银行",15],["电力设备",13],["非银金融",11],["医药生物",9],["其他",34]],
      fees: { sub: "0.12%（1折）", red: "0.50%（持有<7天1.5%）", manage: "0.50%/年", custody: "0.10%/年", confirm: "T+1", arrive: "T+2" }
    },
    {
      code: "002345", name: "鼎成消费精选混合", type: "混合型", risk: "R4",
      company: "鼎成基金", manager: "王启明", direction: "行业主题", appetite: ["平衡","进取"],
      scale: 78.9, inception: "2018-03-20", nav: 2.4317, accNav: 2.6817, day: 1.32,
      ret: { w1: 2.21, m1: 3.88, m3: -2.14, m6: 6.42, y1: 18.92, y3: 35.1, y5: 72.4, since: 143.2 },
      rank: 9, metrics: { mdd: -32.6, sharpe: 0.78, vol: 24.3, downRisk: 17.8, info: 0.52 },
      tags: ["金牛奖", "行业主题", "明星经理"], allocation: { stock: 88, bond: 3, cash: 9 },
      holdings: [["贵州茅台",9.2],["五粮液",7.8],["伊利股份",5.4],["海天味业",4.6],["泸州老窖",4.1],["农夫山泉",3.7],["山西汾酒",3.2],["双汇发展",2.8],["青岛啤酒",2.4],["安琪酵母",2.0]],
      industries: [["食品饮料",62],["农林牧渔",12],["商贸零售",9],["家用电器",7],["医药生物",5],["其他",5]],
      fees: { sub: "0.15%（1折）", red: "0.50%", manage: "1.50%/年", custody: "0.25%/年", confirm: "T+1", arrive: "T+2" }
    },
    {
      code: "003456", name: "安泰稳健债券A", type: "债券型", risk: "R2",
      company: "安泰基金", manager: "陈思远", direction: "债券固收", appetite: ["保守","稳健"],
      scale: 245.7, inception: "2015-09-08", nav: 1.3284, accNav: 1.5984, day: 0.06,
      ret: { w1: 0.12, m1: 0.42, m3: 1.18, m6: 2.46, y1: 4.82, y3: 14.2, y5: 26.8, since: 59.8 },
      rank: 22, metrics: { mdd: -2.8, sharpe: 1.84, vol: 3.2, downRisk: 1.9, info: 0.66 },
      tags: ["低波动", "稳健"], allocation: { stock: 0, bond: 92, cash: 8 },
      holdings: [["23国开10",8.4],["22附息国债05",6.2],["23农发08",5.1],["21铁道01",4.3],["23进出12",3.8]],
      industries: [["利率债",58],["金融债",24],["企业债",14],["其他",4]],
      fees: { sub: "0.08%（1折）", red: "0.10%", manage: "0.30%/年", custody: "0.10%/年", confirm: "T+1", arrive: "T+2" }
    },
    {
      code: "004567", name: "兴源科技先锋混合", type: "混合型", risk: "R5",
      company: "兴源基金", manager: "赵泽宇", direction: "行业主题", appetite: ["进取"],
      scale: 42.3, inception: "2019-07-15", nav: 3.1856, accNav: 3.1856, day: 2.18,
      ret: { w1: 3.42, m1: 6.71, m3: -5.82, m6: 12.34, y1: 24.6, y3: 18.4, y5: 118.6, since: 218.6 },
      rank: 5, metrics: { mdd: -45.2, sharpe: 0.71, vol: 32.6, downRisk: 24.1, info: 0.48 },
      tags: ["行业主题", "高弹性", "晨星五星"], allocation: { stock: 91, bond: 0, cash: 9 },
      holdings: [["宁德时代",8.9],["中芯国际",7.2],["寒武纪",6.1],["北方华创",5.4],["韦尔股份",4.8],["阳光电源",4.2],["澜起科技",3.6],["兆易创新",3.1],["晶晨股份",2.7],["卓胜微",2.3]],
      industries: [["电子",42],["电力设备",28],["计算机",16],["机械设备",8],["其他",6]],
      fees: { sub: "0.15%（1折）", red: "0.50%", manage: "1.50%/年", custody: "0.25%/年", confirm: "T+1", arrive: "T+2" }
    },
    {
      code: "005678", name: "广信中证红利指数A", type: "指数型", risk: "R3",
      company: "广信基金", manager: "孙莉", direction: "宽基指数", appetite: ["稳健","平衡"],
      scale: 132.6, inception: "2017-11-30", nav: 1.5723, accNav: 1.9223, day: -0.31,
      ret: { w1: -0.42, m1: 1.24, m3: 3.86, m6: 5.92, y1: 9.68, y3: 31.4, y5: 41.2, since: 72.4 },
      rank: 26, metrics: { mdd: -14.6, sharpe: 1.02, vol: 13.4, downRisk: 9.1, info: 0.38 },
      tags: ["高分红", "低波动", "红利策略"], allocation: { stock: 95, bond: 0, cash: 5 },
      holdings: [["长江电力",4.1],["中国神华",3.8],["工商银行",3.4],["中国石化",3.0],["大秦铁路",2.7],["双汇发展",2.4],["格力电器",2.2],["农业银行",2.0],["华能水电",1.8],["陕西煤业",1.6]],
      industries: [["银行",24],["煤炭",16],["公用事业",14],["交通运输",11],["钢铁",8],["其他",27]],
      fees: { sub: "0.12%（1折）", red: "0.50%", manage: "0.50%/年", custody: "0.10%/年", confirm: "T+1", arrive: "T+2" }
    },
    {
      code: "006789", name: "恒丰货币市场A", type: "货币型", risk: "R1",
      company: "恒丰基金", manager: "周敏", direction: "债券固收", appetite: ["保守"],
      scale: 612.8, inception: "2014-06-18", nav: 1.0000, accNav: 1.0000, day: 0.005,
      ret: { w1: 0.03, m1: 0.14, m3: 0.42, m6: 0.86, y1: 1.78, y3: 6.2, y5: 11.4, since: 24.6 },
      rank: 30, metrics: { mdd: 0.0, sharpe: 6.2, vol: 0.2, downRisk: 0.0, info: 0.0 },
      tags: ["现金管理", "T+0灵活"], allocation: { stock: 0, bond: 38, cash: 62 },
      holdings: [["同业存单",42],["买入返售",28],["短融债券",18],["银行存款",12]],
      industries: [["货币工具",100]],
      fees: { sub: "0", red: "0", manage: "0.20%/年", custody: "0.05%/年", confirm: "T+1", arrive: "T+1" }
    },
    {
      code: "007890", name: "博远医药健康混合A", type: "混合型", risk: "R4",
      company: "博远基金", manager: "吴桐", direction: "行业主题", appetite: ["平衡","进取"],
      scale: 56.2, inception: "2019-02-26", nav: 1.9248, accNav: 1.9248, day: 1.12,
      ret: { w1: 1.86, m1: 4.12, m3: -3.42, m6: 4.68, y1: 8.24, y3: -6.8, y5: 48.2, since: 92.5 },
      rank: 14, metrics: { mdd: -38.4, sharpe: 0.42, vol: 26.8, downRisk: 19.4, info: 0.21 },
      tags: ["行业主题", "高弹性"], allocation: { stock: 89, bond: 2, cash: 9 },
      holdings: [["恒瑞医药",7.6],["药明康德",6.4],["迈瑞医疗",5.8],["爱尔眼科",4.9],["智飞生物",4.2],["片仔癀",3.8],["长春高新",3.2],["复星医药",2.9],["云南白药",2.4],["通策医疗",2.1]],
      industries: [["医药生物",88],["医疗器械",7],["其他",5]],
      fees: { sub: "0.15%（1折）", red: "0.50%", manage: "1.50%/年", custody: "0.25%/年", confirm: "T+1", arrive: "T+2" }
    },
    {
      code: "008901", name: "国睿固收增强债券A", type: "债券型", risk: "R2",
      company: "国睿基金", manager: "郑凯", direction: "债券固收", appetite: ["保守","稳健"],
      scale: 168.4, inception: "2017-04-10", nav: 1.4126, accNav: 1.6626, day: 0.14,
      ret: { w1: 0.24, m1: 0.68, m3: 1.86, m6: 3.42, y1: 6.24, y3: 18.6, y5: 32.4, since: 64.2 },
      rank: 11, metrics: { mdd: -4.2, sharpe: 1.56, vol: 4.8, downRisk: 3.1, info: 0.58 },
      tags: ["固收+", "低波动", "金牛奖"], allocation: { stock: 12, bond: 80, cash: 8 },
      holdings: [["23国开05",6.8],["招商银行",2.4],["22附息国债08",5.2],["贵州茅台",1.8],["长江电力",1.6]],
      industries: [["利率债",46],["金融债",22],["权益资产",12],["企业债",16],["其他",4]],
      fees: { sub: "0.08%（1折）", red: "0.10%", manage: "0.60%/年", custody: "0.15%/年", confirm: "T+1", arrive: "T+2" }
    },
    {
      code: "009012", name: "华安全球科技QDII", type: "QDII", risk: "R4",
      company: "华安基金", manager: "林夕", direction: "行业主题", appetite: ["平衡","进取"],
      scale: 38.6, inception: "2020-01-14", nav: 2.0864, accNav: 2.0864, day: 0.92,
      ret: { w1: 1.42, m1: 3.24, m3: 8.62, m6: 16.42, y1: 32.6, y3: 58.4, y5: null, since: 108.6 },
      rank: 7, metrics: { mdd: -34.2, sharpe: 0.86, vol: 28.4, downRisk: 20.1, info: 0.44 },
      tags: ["跨境投资", "科技主题"], allocation: { stock: 93, bond: 0, cash: 7 },
      holdings: [["英伟达",9.4],["微软",8.2],["苹果",7.6],["谷歌",6.1],["亚马逊",5.4],["Meta",4.8],["台积电",4.2],["特斯拉",3.6],["博通",3.1],["AMD",2.7]],
      industries: [["信息技术",68],["通讯服务",16],["可选消费",12],["其他",4]],
      fees: { sub: "0.80%（1折）", red: "0.50%", manage: "1.80%/年", custody: "0.28%/年", confirm: "T+2", arrive: "T+3~T+8" }
    },
    {
      code: "010123", name: "前海均衡配置FOF", type: "FOF", risk: "R3",
      company: "前海基金", manager: "黄智", direction: "混合均衡", appetite: ["稳健","平衡"],
      scale: 24.8, inception: "2019-10-22", nav: 1.4682, accNav: 1.4682, day: 0.42,
      ret: { w1: 0.68, m1: 1.86, m3: 2.94, m6: 5.12, y1: 8.64, y3: 22.8, y5: null, since: 46.8 },
      rank: 16, metrics: { mdd: -16.8, sharpe: 1.12, vol: 11.6, downRisk: 7.8, info: 0.42 },
      tags: ["一站式配置", "多元分散", "低波动"], allocation: { stock: 52, bond: 38, cash: 10 },
      holdings: [["权益类子基金A",14],["债券类子基金B",12],["指数类子基金C",10],["QDII子基金D",8],["黄金ETF",6]],
      industries: [["权益基金",52],["债券基金",34],["商品/另类",8],["现金",6]],
      fees: { sub: "0.10%（1折）", red: "0.50%", manage: "0.80%/年", custody: "0.20%/年", confirm: "T+2", arrive: "T+3" }
    },
    {
      code: "011234", name: "长城新能源主题股票", type: "股票型", risk: "R5",
      company: "长城基金", manager: "马涛", direction: "行业主题", appetite: ["进取"],
      scale: 64.7, inception: "2020-06-30", nav: 1.6428, accNav: 1.6428, day: 1.95,
      ret: { w1: 2.84, m1: 5.42, m3: -8.64, m6: 9.86, y1: 16.4, y3: -22.6, y5: null, since: 64.3 },
      rank: 12, metrics: { mdd: -52.4, sharpe: 0.32, vol: 36.2, downRisk: 27.8, info: 0.18 },
      tags: ["行业主题", "高弹性"], allocation: { stock: 92, bond: 0, cash: 8 },
      holdings: [["宁德时代",9.6],["阳光电源",7.8],["隆基绿能",6.4],["比亚迪",5.9],["亿纬锂能",4.8],["天合光能",4.1],["通威股份",3.6],["国电南瑞",3.1],["阳光新能源",2.7],["先导智能",2.3]],
      industries: [["电力设备",72],["有色金属",12],["机械设备",9],["其他",7]],
      fees: { sub: "0.15%（1折）", red: "0.50%", manage: "1.50%/年", custody: "0.25%/年", confirm: "T+1", arrive: "T+2" }
    },
    {
      code: "012345", name: "招商中证500指数增强A", type: "指数型", risk: "R3",
      company: "招商基金", manager: "高远", direction: "宽基指数", appetite: ["稳健","平衡"],
      scale: 96.3, inception: "2018-08-16", nav: 1.7234, accNav: 1.7234, day: 0.78,
      ret: { w1: 1.34, m1: 2.86, m3: 4.92, m6: 7.68, y1: 11.86, y3: 26.4, y5: 52.6, since: 72.3 },
      rank: 13, metrics: { mdd: -22.6, sharpe: 0.88, vol: 18.6, downRisk: 12.8, info: 0.62 },
      tags: ["指数增强", "超额收益", "金牛奖"], allocation: { stock: 93, bond: 0, cash: 7 },
      holdings: [["华友钴业",1.8],["北方华创",1.6],["三花智控",1.4],["晶澳科技",1.3],["科达制造",1.2],["振华科技",1.1],["国电南瑞",1.0],["亿纬锂能",0.9],["恩捷股份",0.9],["华熙生物",0.8]],
      industries: [["电子",16],["医药生物",13],["电力设备",12],["基础化工",11],["机械设备",10],["其他",38]],
      fees: { sub: "0.12%（1折）", red: "0.50%", manage: "1.00%/年", custody: "0.20%/年", confirm: "T+1", arrive: "T+2" }
    }
  ];

  // 为每只基金生成净值历史曲线（约 250 个交易日）
  rawFunds.forEach(function (f, i) {
    var drift = (f.ret.y1 / 100) / 250;            // 用近一年收益估算日漂移
    var vol = f.metrics.vol / 100 / Math.sqrt(250) * 2.2; // 用波动率估算日波动
    var start = +(f.nav / (1 + f.ret.y1 / 100)).toFixed(4);
    f.navHistory = seededSeries(99 + i * 37, 250, start, drift, vol);
    // 让最后一个点贴近当前净值
    var last = f.navHistory[f.navHistory.length - 1];
    var k = f.nav / last;
    f.navHistory = f.navHistory.map(function (v) { return +(v * k).toFixed(4); });
  });

  // 派生基金经理与「成立年限」信息（演示用，按成立日确定性推算）
  var NOW = new Date(2026, 5, 16);
  rawFunds.forEach(function (f, i) {
    var ageYears = (NOW - new Date(f.inception)) / (365.25 * 86400000);
    f.ageYears = +ageYears.toFixed(1);
    f.mgrYears = Math.max(1, Math.round(ageYears) + (i % 3));      // 经理从业年限
    var annual = Math.pow(1 + f.ret.since / 100, 1 / Math.max(0.5, ageYears)) - 1;
    f.mgrAnnual = +(annual * 100).toFixed(1);                      // 任职年化回报
    f.mgrFunds = 2 + (i % 5);                                      // 在管基金数
  });

  /* ---------- 投教知识库 ---------- */
  // level: beginner / advanced ; cat: 分类
  var education = [
    // 小白入门篇（按学习路径排序）
    { id: "e01", level: "beginner", order: 1, cat: "基础概念", title: "基金到底是什么？一个买菜的比喻就讲清", excerpt: "把钱交给专业的人帮你打理，大家一起出钱、一起分担风险、一起分享收益——这就是基金。", read: "5分钟", key: "基金 = 一群人凑钱，请专业团队帮忙投资的工具。" },
    { id: "e02", level: "beginner", order: 2, cat: "基础概念", title: "股票、债券、基金有什么区别？", excerpt: "股票是当老板，债券是当债主，基金是请管家——三种角色，三种风险收益特征。", read: "6分钟", key: "买基金 ≈ 请专业管家替你同时打理一篮子资产。" },
    { id: "e03", level: "beginner", order: 3, cat: "基础概念", title: "什么是净值？为什么我的基金每天都在变", excerpt: "净值就是你手里每一份基金今天值多少钱，它随着里面的股票债券价格每天波动。", read: "5分钟", key: "净值 = 基金每一份的当前价格，每个交易日更新一次。" },
    { id: "e04", level: "beginner", order: 4, cat: "交易流程", title: "新手第一次买基金，完整流程长什么样？", excerpt: "选平台 → 实名开户 → 做风险测评 → 选基金 → 确认份额，手把手带你走一遍。", read: "7分钟", key: "买入按当日收盘净值确认，T+1 确认份额，别被实时涨跌吓到。" },
    { id: "e05", level: "beginner", order: 5, cat: "交易流程", title: "申购、认购、定投，到底有什么不一样？", excerpt: "认购是开业前预订，申购是开业后购买，定投是设个闹钟自动买——场景不同，玩法不同。", read: "6分钟", key: "新手优先了解「申购」与「定投」两种最常用方式。" },
    { id: "e06", level: "beginner", order: 6, cat: "交易流程", title: "买卖基金的那些费用，一笔都别漏算", excerpt: "申购费、赎回费、管理费、托管费……搞懂费率结构，长期能省下不少钱。", read: "6分钟", key: "长期持有可显著降低赎回费，频繁买卖最伤收益。" },
    { id: "e07", level: "beginner", order: 7, cat: "风险认知", title: "R1 到 R5，基金的风险等级怎么看？", excerpt: "监管把基金风险分成五档，从最稳的货币基金到最猛的行业股票，对号入座很重要。", read: "5分钟", key: "买之前先看风险等级是否匹配你的承受能力。" },
    { id: "e08", level: "beginner", order: 8, cat: "风险认知", title: "为什么说「基金有风险，投资需谨慎」", excerpt: "再好的基金也会回撤，理解波动是投资的常态，是新手最该上的第一课。", read: "6分钟", key: "历史业绩不代表未来表现，浮亏是投资过程的正常部分。" },
    { id: "e09", level: "beginner", order: 9, cat: "避坑指南", title: "新手最容易踩的 6 个坑", excerpt: "追高杀跌、满仓单押、把基金当股票炒……这些坑，过来人都踩过。", read: "8分钟", key: "不追涨杀跌、不押注单一赛道，是新手避坑的两条底线。" },
    { id: "e10", level: "beginner", order: 10, cat: "避坑指南", title: "看到「冠军基金」就冲，为什么经常被套", excerpt: "去年的冠军，今年可能垫底。冠军魔咒背后是行业轮动的规律。", read: "6分钟", key: "排行榜只代表过去，切忌单纯按短期排名追买。" },
    { id: "e11", level: "beginner", order: 11, cat: "基础概念", title: "主动基金 vs 被动基金，新手怎么选", excerpt: "一个靠基金经理选股，一个紧跟指数。各有优劣，关键看你信什么。", read: "7分钟", key: "拿不准时，低费率的宽基指数是新手友好的起点。" },
    { id: "e12", level: "beginner", order: 12, cat: "交易流程", title: "什么是定投？为什么适合工薪族", excerpt: "每月固定投一笔，用时间摊平成本，把择时这件难事交给纪律。", read: "6分钟", key: "定投的核心是纪律与长期，而非预测市场高低点。" },
    { id: "e13", level: "beginner", order: 13, cat: "风险认知", title: "基金亏了要不要割肉？先问自己三个问题", excerpt: "是逻辑变了还是只是波动？仓位重不重？钱急不急用？想清楚再决定。", read: "7分钟", key: "决策应基于投资逻辑与资金安排，而非短期情绪。" },
    { id: "e14", level: "beginner", order: 14, cat: "基础概念", title: "A 类、C 类傻傻分不清？一张表看懂", excerpt: "A 类收申购费、C 类收销售服务费，持有时间长短决定哪类更划算。", read: "5分钟", key: "短期持有多看 C 类，长期持有多看 A 类。" },
    { id: "e15", level: "beginner", order: 15, cat: "避坑指南", title: "别把生活钱、应急钱都买成基金", excerpt: "投资的前提是用「闲钱」，先留足 3-6 个月生活备用金再谈理财。", read: "5分钟", key: "先建立应急储备，再用闲钱投资，是理财的第一性原则。" },
    // 进阶提升篇（按难度排序）
    { id: "a01", level: "advanced", order: 1, cat: "分类解析", title: "一文读懂混合型基金的偏股、偏债与灵活配置", excerpt: "同样叫混合基金，仓位约束天差地别，决定了它的风险收益定位。", read: "10分钟", key: "看清招募说明书里的仓位区间，才知道它到底是什么风格。" },
    { id: "a02", level: "advanced", order: 2, cat: "指标解读", title: "最大回撤：衡量「最坏情况」的核心指标", excerpt: "从最高点跌到最低点的幅度，决定了你能不能拿得住。", read: "9分钟", key: "最大回撤反映持有体验，需与自身承受力匹配。" },
    { id: "a03", level: "advanced", order: 3, cat: "指标解读", title: "夏普比率：每承担一份风险，赚到多少回报", excerpt: "收益高不一定好，要看是冒了多大风险换来的。夏普比率帮你做性价比对比。", read: "9分钟", key: "同类比较时，夏普比率越高，风险调整后收益越优。" },
    { id: "a04", level: "advanced", order: 4, cat: "指标解读", title: "波动率与下行风险，到底该看哪个", excerpt: "波动率把涨和跌一视同仁，下行风险只盯着让你难受的那部分。", read: "8分钟", key: "对厌恶亏损的投资者，下行风险比波动率更贴近真实体验。" },
    { id: "a05", level: "advanced", order: 5, cat: "资产配置", title: "股债平衡：最朴素也最有效的配置思路", excerpt: "用债券对冲股票的波动，靠再平衡实现「高抛低吸」的纪律。", read: "11分钟", key: "定期再平衡是股债组合长期稳健的关键纪律。" },
    { id: "a06", level: "advanced", order: 6, cat: "资产配置", title: "核心-卫星策略：稳住基本盘，再博取超额", excerpt: "大部分仓位用宽基打底，小部分仓位进攻行业主题，攻守兼备。", read: "11分钟", key: "核心仓求稳、卫星仓求弹性，比例需匹配风险偏好。" },
    { id: "a07", level: "advanced", order: 7, cat: "定投优化", title: "定投不是无脑买，三种进阶玩法对比", excerpt: "普通定投、价值平均、目标止盈，不同方法适配不同的市场预期。", read: "10分钟", key: "进阶定投的核心是规则化，而非主观频繁调整。" },
    { id: "a08", level: "advanced", order: 8, cat: "定投优化", title: "定投到底要不要止盈？怎么止盈", excerpt: "目标收益率法、估值法、回撤法……止盈规则决定了定投的最终成果。", read: "10分钟", key: "事先定好止盈规则并严格执行，胜过临场拍脑袋。" },
    { id: "a09", level: "advanced", order: 9, cat: "经理筛选", title: "如何评估一位基金经理，而不只看收益", excerpt: "任职年限、回撤控制、风格稳定性、规模适配度——好经理是多维度筛出来的。", read: "12分钟", key: "穿越完整牛熊、风格不漂移的经理，更值得长期信任。" },
    { id: "a10", level: "advanced", order: 10, cat: "指标解读", title: "业绩归因：你的收益到底从哪来", excerpt: "是选对了行业，还是选对了个股？归因分析帮你看清基金的真实能力。", read: "11分钟", key: "归因可区分运气与能力，是判断可持续性的关键。" },
    { id: "a11", level: "advanced", order: 11, cat: "资产配置", title: "为什么要做全球资产配置", excerpt: "不同市场涨跌不同步，跨境配置能在不显著降低收益的前提下分散风险。", read: "11分钟", key: "适度的跨市场分散，有助于平滑组合整体波动。" },
    { id: "a12", level: "advanced", order: 12, cat: "分类解析", title: "指数增强基金：在跟住指数的基础上多赚一点", excerpt: "用量化模型在成分股里做微调，力争跑赢指数，但超额并非保证。", read: "10分钟", key: "指数增强的超额收益存在不确定性，需观察长期稳定性。" }
  ];

  /* ---------- 策略专栏 ---------- */
  var strategies = [
    // 小白友好策略
    { id: "s01", level: "beginner", title: "懒人定投法：每月发薪日，自动买一笔", suit: "没时间盯盘的工薪族", framework: ["设定每月固定金额与扣款日", "选择 1-2 只宽基指数打底", "坚持至少穿越一轮波动", "设定目标收益率并提前定好止盈规则"], risk: "定投同样会浮亏，需接受过程波动，避免中途因恐慌停投。" },
    { id: "s02", level: "beginner", title: "宽基指数配置：用一篮子代替押单只", suit: "怕选错个股、想分散风险的新手", framework: ["以沪深300/中证500等宽基为底仓", "避免在单一指数上集中过高仓位", "用估值高低辅助判断买入节奏", "长期持有，淡化短期波动"], risk: "宽基同样随市场整体下跌，不能消除系统性风险。" },
    { id: "s03", level: "beginner", title: "固收+组合思路：求稳为主，少量增厚", suit: "风险偏好偏保守、追求平稳的人群", framework: ["以债券资产为主体仓位", "用少量权益或可转债力争增厚收益", "控制权益比例上限，守住波动底线", "关注回撤而非短期排名"], risk: "「固收+」不等于保本，权益部分仍可能带来阶段性回撤。" },
    { id: "s04", level: "beginner", title: "仓位管理入门：别让一次下跌打乱节奏", suit: "容易追涨杀跌、拿不住的新手", framework: ["先确定自己能承受的最大亏损比例", "据此倒推权益类资产的上限仓位", "预留现金应对加仓与生活需求", "用纪律替代情绪做加减仓"], risk: "仓位管理只能平滑体验，不能保证不亏损。" },
    { id: "s05", level: "beginner", title: "目标日期思路：随年龄自动调整股债比", suit: "希望「一键托管」资产配置的人", framework: ["明确用钱的目标时点（如养老、教育）", "距离目标越远，权益比例可越高", "随时间推移逐步降低权益、增加债券", "借助目标日期/目标风险型产品实现"], risk: "自动调整不代表稳赚，临近目标时仍需关注市场环境。" },
    { id: "s06", level: "beginner", title: "微笑曲线定投：越跌越买的心理建设", suit: "面对下跌容易动摇的定投者", framework: ["理解定投在下跌段积累低价份额的逻辑", "下跌时坚持甚至适度加码扣款", "回升后份额价值集中释放", "事先定好止盈线，避免坐过山车"], risk: "微笑曲线需要市场最终回升才成立，单边下跌中仍会亏损。" },
    { id: "s07", level: "beginner", title: "三笔钱配置法：先分钱，再投资", suit: "理财起步、想厘清资金用途的人", framework: ["短期要花的钱放货币/短债，保流动性", "中期闲钱配稳健型组合", "长期不用的钱再考虑权益类", "三笔钱物理隔离，互不挪用"], risk: "划分比例需结合个人现金流，配置不当会影响生活资金安全。" },
    { id: "s08", level: "beginner", title: "长期主义：把时间变成朋友", suit: "急于求成、频繁交易的新手", framework: ["理解复利需要时间发酵", "减少不必要的申赎，降低交易摩擦", "用长期视角看待短期波动", "定期检视而非每日盯盘"], risk: "长期持有不等于躺赢，仍需选对底层资产并定期检视。" },
    // 进阶实战策略
    { id: "s09", level: "advanced", title: "行业轮动思路：在景气度之间做切换", suit: "有研究能力、能承受较高波动的进阶者", framework: ["跟踪各行业景气度与估值分位", "在低估且景气向上的行业适度超配", "设定纪律化的切换与止损规则", "控制单一行业的最高仓位"], risk: "轮动依赖判断，频繁切换可能增加成本并踏错节奏。" },
    { id: "s10", level: "advanced", title: "指数增强策略:在被动框架里争取超额", suit: "认可指数化、又想要一点超额的进阶者", framework: ["以指数为业绩基准，控制跟踪误差", "通过量化因子在成分股内做微调", "长期观察超额收益的稳定性", "警惕规模过大对超额的稀释"], risk: "超额收益不确定，部分时段可能跑输基准指数。" },
    { id: "s11", level: "advanced", title: "基金组合构建：1+1 如何大于 2", suit: "想自建组合、做风格分散的进阶者", framework: ["挑选低相关性的基金做搭配", "明确每只基金在组合中的角色", "控制重仓股重叠度，避免伪分散", "定期再平衡维持目标权重"], risk: "组合分散不能消除系统性风险，过度分散会摊薄收益。" },
    { id: "s12", level: "advanced", title: "估值择时框架：用温度计辅助决策", suit: "希望用规则约束买卖时点的进阶者", framework: ["选取市盈率/市净率分位等估值锚", "低估区域分批布局，高估区域逐步减仓", "用规则替代主观情绪", "承认择时无法精准，只求大致区间"], risk: "估值择时可能长期钝化，低估可以更低估，需有耐心与纪律。" },
    { id: "s13", level: "advanced", title: "分批止盈方法：把利润一点点落袋", suit: "面对盈利不知如何兑现的进阶者", framework: ["设定多档止盈目标位", "达到一档减一部分，而非一次清仓", "保留底仓参与可能的后续上涨", "结合估值与目标收益率综合判断"], risk: "分批止盈可能错过单边上涨，也可能在回调中回吐利润。" },
    { id: "s14", level: "advanced", title: "下跌市应对方案：熊市里如何不被消耗", suit: "经历大幅回撤、心态承压的进阶者", framework: ["重新评估底层逻辑是否破坏", "用再平衡纪律低位补仓优质资产", "适度提升债券/现金等防御仓位", "降低关注频率，避免情绪化操作"], risk: "补仓需以闲钱进行，下跌可能持续，切忌借钱抄底。" },
    { id: "s15", level: "advanced", title: "再平衡机制：机械纪律战胜人性", suit: "认可纪律化、想长期执行的进阶者", framework: ["设定目标股债比例", "偏离阈值时触发再平衡", "卖出涨多的、买入跌多的", "按固定周期或阈值执行，不掺杂情绪"], risk: "再平衡在单边行情中可能阶段性跑输，需坚持完整周期。" },
    { id: "s16", level: "advanced", title: "核心-卫星实战：稳健打底 + 主题进攻", suit: "想兼顾稳健与弹性的进阶配置者", framework: ["核心仓位用宽基/红利等稳健资产", "卫星仓位配置行业主题博取弹性", "严格限定卫星仓位上限", "定期检视卫星仓的逻辑是否仍成立"], risk: "卫星仓位波动大，比例失控会放大整体组合风险。" }
  ];

  /* ---------- 资讯要闻 ---------- */
  var news = {
    industry: [
      { tag: "要闻", title: "公募基金二季度规模稳步增长，权益类产品获持续净申购", time: "2026-06-16 09:20" },
      { tag: "政策", title: "监管发文进一步规范基金销售适当性管理，强化投资者保护", time: "2026-06-16 08:45" },
      { tag: "市场", title: "多只指数基金费率再下调，被动投资成本进入「白菜价」时代", time: "2026-06-15 17:30" },
      { tag: "数据", title: "上半年新成立基金数量同比回升，固收+产品热度回暖", time: "2026-06-15 15:10" },
      { tag: "要闻", title: "养老 FOF 持有期产品扩容，长期资金配置工具更趋丰富", time: "2026-06-15 11:05" }
    ],
    notice: [
      { tag: "公告", title: "汇盈沪深300指数A 关于新增销售机构及开通定投业务的公告", time: "2026-06-16 10:00" },
      { tag: "分红", title: "广信中证红利指数A 关于2026年度第二次分红的公告", time: "2026-06-15 16:20" },
      { tag: "变更", title: "国睿固收增强债券A 关于基金经理变更的公告", time: "2026-06-15 14:00" },
      { tag: "限购", title: "安泰稳健债券A 关于暂停大额申购的公告", time: "2026-06-14 09:30" },
      { tag: "费率", title: "招商中证500指数增强A 关于调低管理费托管费率的公告", time: "2026-06-13 17:45" }
    ],
    view: [
      { tag: "观点", title: "震荡市下如何做好资产配置？三位投研人士这样看", time: "2026-06-16 08:00" },
      { tag: "解读", title: "如何理性看待基金短期排名波动：拉长周期才有意义", time: "2026-06-15 18:30" },
      { tag: "策略", title: "下半年权益市场怎么走？机构普遍强调「均衡配置」", time: "2026-06-15 12:15" },
      { tag: "科普", title: "读懂基金季报：从重仓股变化看经理的操作思路", time: "2026-06-14 16:40" },
      { tag: "观点", title: "定投是不是过时了？长期视角下的纪律价值依然成立", time: "2026-06-13 10:20" }
    ]
  };

  /* ---------- 导出 ---------- */
  global.SiteData = {
    indices: indices,
    sectors: sectors,
    funds: rawFunds,
    education: education,
    strategies: strategies,
    news: news,
    fmtPct: fmtPct,
    cls: cls,
    getFund: function (code) {
      return rawFunds.filter(function (f) { return f.code === code; })[0] || null;
    }
  };
})(window);
