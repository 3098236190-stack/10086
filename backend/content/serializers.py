from rest_framework import serializers
from .models import EduArticle, Strategy, News


class EduArticleListSerializer(serializers.ModelSerializer):
    class Meta:
        model = EduArticle
        fields = ["slug", "level", "category", "title", "excerpt", "read_time", "key_point", "order"]


class EduArticleDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = EduArticle
        fields = ["slug", "level", "category", "title", "excerpt", "read_time", "key_point", "body", "order"]


class StrategySerializer(serializers.ModelSerializer):
    class Meta:
        model = Strategy
        fields = ["slug", "level", "title", "suit", "framework", "risk", "order"]


class NewsSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = News
        fields = ["category", "category_display", "tag", "title", "published_at"]
