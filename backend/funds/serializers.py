from datetime import date
from rest_framework import serializers
from .models import Fund, FundManager, MarketIndex, Sector

REFERENCE_DATE = date(2026, 6, 16)


class FundManagerSerializer(serializers.ModelSerializer):
    class Meta:
        model = FundManager
        fields = ["id", "name", "years", "annual_return", "funds_count", "bio"]


class MarketIndexSerializer(serializers.ModelSerializer):
    class Meta:
        model = MarketIndex
        fields = ["name", "code", "value", "change_pct"]


class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = ["name", "change_pct"]


class FundListSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source="manager.name", read_only=True)
    returns = serializers.SerializerMethodField()
    metrics = serializers.SerializerMethodField()
    age_years = serializers.SerializerMethodField()

    class Meta:
        model = Fund
        fields = [
            "code", "name", "ftype", "risk", "company", "manager_name", "direction",
            "appetite", "scale", "nav", "acc_nav", "day_change", "rank_pct", "tags",
            "returns", "metrics", "age_years",
        ]

    def get_returns(self, obj):
        return obj.returns_dict

    def get_metrics(self, obj):
        return {
            "mdd": obj.mdd, "sharpe": obj.sharpe, "vol": obj.vol,
            "down_risk": obj.down_risk, "info_ratio": obj.info_ratio,
        }

    def get_age_years(self, obj):
        return round((REFERENCE_DATE - obj.inception_date).days / 365.25, 1)


class FundDetailSerializer(FundListSerializer):
    manager = FundManagerSerializer(read_only=True)
    allocation = serializers.SerializerMethodField()
    fees = serializers.SerializerMethodField()
    nav_history = serializers.SerializerMethodField()

    class Meta(FundListSerializer.Meta):
        fields = FundListSerializer.Meta.fields + [
            "manager", "inception_date", "allocation", "fees",
            "holdings", "industries", "nav_history",
        ]

    def get_allocation(self, obj):
        return {"stock": obj.alloc_stock, "bond": obj.alloc_bond, "cash": obj.alloc_cash}

    def get_fees(self, obj):
        return {
            "sub": obj.fee_sub, "red": obj.fee_red, "manage": obj.fee_manage,
            "custody": obj.fee_custody, "confirm": obj.fee_confirm, "arrive": obj.fee_arrive,
        }

    def get_nav_history(self, obj):
        return obj.nav_history()
