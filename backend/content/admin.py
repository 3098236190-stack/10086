from django.contrib import admin

from .models import EduArticle, Strategy, News


@admin.register(EduArticle)
class EduArticleAdmin(admin.ModelAdmin):
    list_display = ["slug", "title", "level", "category", "read_time", "order"]
    list_filter = ["level", "category"]
    search_fields = ["title", "excerpt", "key_point"]
    list_editable = ["order"]
    ordering = ["level", "order"]


@admin.register(Strategy)
class StrategyAdmin(admin.ModelAdmin):
    list_display = ["slug", "title", "level", "suit", "order"]
    list_filter = ["level"]
    search_fields = ["title", "suit"]
    list_editable = ["order"]


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "tag", "published_at"]
    list_filter = ["category"]
    search_fields = ["title"]
    date_hierarchy = "published_at"
