from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import MillingBatchViewSet,MillingAnalyticsView,MillingDailyChartView

router=DefaultRouter()
router.register("batches",MillingBatchViewSet,basename="milling-batch")

urlpatterns = [
     path("analytics/",MillingAnalyticsView.as_view()),
     path("charts/daily-efficiency/", MillingDailyChartView.as_view()),

]


urlpatterns +=router.urls
