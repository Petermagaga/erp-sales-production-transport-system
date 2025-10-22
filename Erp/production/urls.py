from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RawMaterialViewSet, FlourOutputViewSet, ProductionAnalyticsView,ProductionCreateView,MergedProductionView
from . import views

router = DefaultRouter()
router.register(r'raw-materials', RawMaterialViewSet, basename='raw-material')
router.register(r'flour-output', FlourOutputViewSet, basename='flour-output')

urlpatterns = [
    path('', include(router.urls)),
    path('analytics/', ProductionAnalyticsView.as_view(), name='production-analytics'),
    path("create-production/",ProductionCreateView.as_view(),name="create-production"),
    path("merged/", MergedProductionView.as_view(), name="merged-production"),
]