from rest_framework import viewsets, filters
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Fund, MarketIndex, Sector
from .serializers import (
    FundListSerializer, FundDetailSerializer,
    MarketIndexSerializer, SectorSerializer,
)
from content.models import EduArticle, News
from content.serializers import EduArticleListSerializer, NewsSerializer


class FundViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Fund.objects.select_related("manager").all()
    lookup_field = "code"
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["code", "name", "company", "manager__name", "ftype"]
    ordering_fields = ["r_y1", "r_y3", "scale", "sharpe", "mdd", "day_change", "inception_date"]

    def get_serializer_class(self):
        return FundDetailSerializer if self.action == "retrieve" else FundListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        risk = self.request.query_params.get("risk")
        ftype = self.request.query_params.get("ftype")
        if risk:
            qs = qs.filter(risk=risk)
        if ftype:
            qs = qs.filter(ftype=ftype)
        return qs


class MarketIndexViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MarketIndex.objects.all()
    serializer_class = MarketIndexSerializer
    pagination_class = None


class SectorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer
    pagination_class = None


class HomeSummaryView(APIView):
    """首页聚合数据，减少前端请求往返。"""

    def get(self, request):
        top = Fund.objects.select_related("manager").order_by("-day_change")[:10]
        edu = EduArticle.objects.all()
        return Response({
            "indices": MarketIndexSerializer(MarketIndex.objects.all(), many=True).data,
            "sectors": SectorSerializer(Sector.objects.all(), many=True).data,
            "top_funds": FundListSerializer(top, many=True).data,
            "edu_beginner": EduArticleListSerializer(edu.filter(level="beginner")[:5], many=True).data,
            "edu_advanced": EduArticleListSerializer(edu.filter(level="advanced")[:5], many=True).data,
            "news": {
                "industry": NewsSerializer(News.objects.filter(category="industry")[:5], many=True).data,
                "notice": NewsSerializer(News.objects.filter(category="notice")[:5], many=True).data,
                "view": NewsSerializer(News.objects.filter(category="view")[:5], many=True).data,
            },
        })
