from rest_framework import viewsets, filters

from .models import EduArticle, Strategy, News
from .serializers import (
    EduArticleListSerializer, EduArticleDetailSerializer,
    StrategySerializer, NewsSerializer,
)


class EduArticleViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = EduArticle.objects.all()
    lookup_field = "slug"
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "excerpt", "key_point", "category"]

    def get_serializer_class(self):
        return EduArticleDetailSerializer if self.action == "retrieve" else EduArticleListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        level = self.request.query_params.get("level")
        category = self.request.query_params.get("category")
        if level:
            qs = qs.filter(level=level)
        if category:
            qs = qs.filter(category=category)
        return qs


class StrategyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Strategy.objects.all()
    serializer_class = StrategySerializer
    lookup_field = "slug"
    pagination_class = None
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "suit"]

    def get_queryset(self):
        qs = super().get_queryset()
        level = self.request.query_params.get("level")
        return qs.filter(level=level) if level else qs


class NewsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = News.objects.all()
    serializer_class = NewsSerializer
    pagination_class = None

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        return qs.filter(category=category) if category else qs
