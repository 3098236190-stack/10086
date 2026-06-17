from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from funds.views import FundViewSet, MarketIndexViewSet, SectorViewSet, HomeSummaryView
from content.views import EduArticleViewSet, StrategyViewSet, NewsViewSet
from inquiry.views import ContactInquiryViewSet

router = DefaultRouter()
router.register("funds", FundViewSet, basename="fund")
router.register("indices", MarketIndexViewSet, basename="index")
router.register("sectors", SectorViewSet, basename="sector")
router.register("education", EduArticleViewSet, basename="education")
router.register("strategies", StrategyViewSet, basename="strategy")
router.register("news", NewsViewSet, basename="news")
router.register("inquiries", ContactInquiryViewSet, basename="inquiry")

admin.site.site_header = "基智汇运营后台"
admin.site.site_title = "基智汇运营后台"
admin.site.index_title = "数据与内容管理"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/home/", HomeSummaryView.as_view(), name="home-summary"),
    path("api/", include(router.urls)),
]
