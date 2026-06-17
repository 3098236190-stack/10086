from django.contrib import admin
from django.utils.html import format_html

from .models import Fund, FundManager, MarketIndex, Sector


def colored_pct(value):
    if value is None:
        return "--"
    color = "#e0392f" if value > 0 else "#0a9b56" if value < 0 else "#888"
    sign = "+" if value > 0 else ""
    return format_html('<span style="color:{}">{}{}%</span>', color, sign, round(value, 2))


@admin.register(FundManager)
class FundManagerAdmin(admin.ModelAdmin):
    list_display = ["name", "years", "annual_return", "funds_count"]
    search_fields = ["name"]


@admin.register(MarketIndex)
class MarketIndexAdmin(admin.ModelAdmin):
    list_display = ["name", "code", "value", "colored_change", "order"]
    list_editable = ["order"]
    search_fields = ["name", "code"]

    @admin.display(description="涨跌幅")
    def colored_change(self, obj):
        return colored_pct(obj.change_pct)


@admin.register(Sector)
class SectorAdmin(admin.ModelAdmin):
    list_display = ["name", "colored_change"]
    search_fields = ["name"]

    @admin.display(description="涨跌幅")
    def colored_change(self, obj):
        return colored_pct(obj.change_pct)


@admin.register(Fund)
class FundAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "ftype", "risk_badge", "company", "manager",
                    "nav", "day_col", "y1_col", "scale", "rank_pct"]
    list_filter = ["ftype", "risk", "direction", "company"]
    search_fields = ["code", "name", "company", "manager__name"]
    autocomplete_fields = ["manager"]
    list_per_page = 20
    fieldsets = (
        ("基础信息", {"fields": ("code", "name", "ftype", "risk", "direction", "company",
                               "manager", "appetite", "scale", "inception_date", "tags")}),
        ("净值与业绩", {"fields": ("nav", "acc_nav", "day_change",
                                ("r_w1", "r_m1", "r_m3", "r_m6"), ("r_y1", "r_y3", "r_y5", "r_since"),
                                "rank_pct")}),
        ("风险指标", {"fields": (("mdd", "sharpe", "vol"), ("down_risk", "info_ratio"))}),
        ("资产配置与持仓", {"fields": (("alloc_stock", "alloc_bond", "alloc_cash"),
                                  "holdings", "industries")}),
        ("交易费率", {"fields": (("fee_sub", "fee_red"), ("fee_manage", "fee_custody"),
                              ("fee_confirm", "fee_arrive"))}),
    )

    @admin.display(description="风险等级", ordering="risk")
    def risk_badge(self, obj):
        colors = {"R1": "#23a06b", "R2": "#5bb56b", "R3": "#e8a33d", "R4": "#ec7c3c", "R5": "#e0503f"}
        return format_html('<span style="background:{};color:#fff;padding:1px 7px;border-radius:4px">{}</span>',
                           colors.get(obj.risk, "#888"), obj.risk)

    @admin.display(description="日涨跌", ordering="day_change")
    def day_col(self, obj):
        return colored_pct(obj.day_change)

    @admin.display(description="近1年", ordering="r_y1")
    def y1_col(self, obj):
        return colored_pct(obj.r_y1)
