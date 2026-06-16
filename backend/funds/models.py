from django.db import models


class FundManager(models.Model):
    name = models.CharField("姓名", max_length=40)
    years = models.PositiveIntegerField("从业年限", default=1)
    annual_return = models.FloatField("任职年化回报(%)", default=0)
    funds_count = models.PositiveIntegerField("在管基金数", default=1)
    bio = models.TextField("简介", blank=True)

    class Meta:
        verbose_name = "基金经理"
        verbose_name_plural = "基金经理"

    def __str__(self):
        return self.name


class MarketIndex(models.Model):
    name = models.CharField("指数名称", max_length=40)
    code = models.CharField("指数代码", max_length=20, unique=True)
    value = models.FloatField("最新点位")
    change_pct = models.FloatField("涨跌幅(%)")
    order = models.IntegerField("排序", default=0)

    class Meta:
        verbose_name = "大盘指数"
        verbose_name_plural = "大盘指数"
        ordering = ["order"]

    def __str__(self):
        return f"{self.name}({self.code})"


class Sector(models.Model):
    name = models.CharField("板块名称", max_length=40)
    change_pct = models.FloatField("涨跌幅(%)")

    class Meta:
        verbose_name = "热门板块"
        verbose_name_plural = "热门板块"
        ordering = ["-change_pct"]

    def __str__(self):
        return self.name


class Fund(models.Model):
    RISK_CHOICES = [(f"R{i}", f"R{i}") for i in range(1, 6)]
    TYPE_CHOICES = [(t, t) for t in ["股票型", "混合型", "债券型", "指数型", "QDII", "货币型", "FOF"]]
    DIRECTION_CHOICES = [(d, d) for d in ["宽基指数", "行业主题", "债券固收", "混合均衡"]]

    code = models.CharField("基金代码", max_length=10, unique=True)
    name = models.CharField("基金名称", max_length=60)
    ftype = models.CharField("基金类型", max_length=10, choices=TYPE_CHOICES)
    risk = models.CharField("风险等级", max_length=2, choices=RISK_CHOICES)
    company = models.CharField("基金公司", max_length=40)
    manager = models.ForeignKey(FundManager, verbose_name="基金经理", on_delete=models.PROTECT, related_name="funds")
    direction = models.CharField("投资方向", max_length=10, choices=DIRECTION_CHOICES)
    appetite = models.JSONField("适配风险偏好", default=list, help_text="如 ['稳健','平衡']")

    scale = models.FloatField("规模(亿元)")
    inception_date = models.DateField("成立日期")
    nav = models.FloatField("单位净值")
    acc_nav = models.FloatField("累计净值")
    day_change = models.FloatField("日涨跌幅(%)")

    r_w1 = models.FloatField("近1周(%)", null=True, blank=True)
    r_m1 = models.FloatField("近1月(%)", null=True, blank=True)
    r_m3 = models.FloatField("近3月(%)", null=True, blank=True)
    r_m6 = models.FloatField("近6月(%)", null=True, blank=True)
    r_y1 = models.FloatField("近1年(%)", null=True, blank=True)
    r_y3 = models.FloatField("近3年(%)", null=True, blank=True)
    r_y5 = models.FloatField("近5年(%)", null=True, blank=True)
    r_since = models.FloatField("成立来(%)", null=True, blank=True)
    rank_pct = models.PositiveIntegerField("同类排名前(%)", default=50)

    mdd = models.FloatField("最大回撤(%)")
    sharpe = models.FloatField("夏普比率")
    vol = models.FloatField("年化波动率(%)")
    down_risk = models.FloatField("下行风险(%)", default=0)
    info_ratio = models.FloatField("信息比率", default=0)

    tags = models.JSONField("特色标签", default=list)
    alloc_stock = models.IntegerField("股票仓位(%)", default=0)
    alloc_bond = models.IntegerField("债券仓位(%)", default=0)
    alloc_cash = models.IntegerField("现金仓位(%)", default=0)

    fee_sub = models.CharField("申购费率", max_length=40, default="")
    fee_red = models.CharField("赎回费率", max_length=40, default="")
    fee_manage = models.CharField("管理费", max_length=40, default="")
    fee_custody = models.CharField("托管费", max_length=40, default="")
    fee_confirm = models.CharField("申购确认", max_length=20, default="T+1")
    fee_arrive = models.CharField("赎回到账", max_length=20, default="T+2")

    holdings = models.JSONField("前十大重仓", default=list, help_text="[[名称, 占比], ...]")
    industries = models.JSONField("行业分布", default=list, help_text="[[行业, 占比], ...]")

    class Meta:
        verbose_name = "基金"
        verbose_name_plural = "基金"
        ordering = ["code"]

    def __str__(self):
        return f"{self.name}({self.code})"

    @property
    def returns_dict(self):
        return {
            "w1": self.r_w1, "m1": self.r_m1, "m3": self.r_m3, "m6": self.r_m6,
            "y1": self.r_y1, "y3": self.r_y3, "y5": self.r_y5, "since": self.r_since,
        }

    def nav_history(self, points=250):
        """以基金代码为种子，确定性生成净值曲线（演示用，逻辑与前端一致）。"""
        seed = int(self.code) % 100000 + 99
        drift = ((self.r_y1 or 0) / 100) / points
        vol = self.vol / 100 / (points ** 0.5) * 2.2
        s, out, v = seed, [], max(0.2, self.nav / (1 + (self.r_y1 or 0) / 100))
        for _ in range(points):
            s = (s * 9301 + 49297) % 233280
            shock = (s / 233280 - 0.5) * vol + drift
            v = max(0.2, v * (1 + shock))
            out.append(round(v, 4))
        k = self.nav / out[-1]
        return [round(x * k, 4) for x in out]
