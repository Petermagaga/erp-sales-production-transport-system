from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import (MillingBatchViewSet,MillingAnalyticsView,
                    MillingDailyChartView,MillingShiftRankingView,
                    MillingDashboardView,
                    MillingMonthlyChartView,MillingWasteRatioChartView)

router=DefaultRouter()
router.register("batches",MillingBatchViewSet,basename="milling-batch")

urlpatterns = [
     path("analytics/",MillingAnalyticsView.as_view()),
     path("charts/daily-efficiency/", MillingDailyChartView.as_view()),
     path("charts/monthly/", MillingMonthlyChartView.as_view()),
     path("charts/waste-ratio/",MillingWasteRatioChartView.as_view()),
     path("charts/shift-ranking/",MillingShiftRankingView.as_view()),
     path("dashboard/",MillingDashboardView.as_view(),)
]


urlpatterns +=router.urls
