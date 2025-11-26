from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SalespersonViewSet, CustomerViewSet, ProductViewSet,
    BatchViewSet, SaleViewSet, FeedbackViewSet,
    ComplaintViewSet, ProductRecallViewSet,
    AnalyticsView, SalesRegionsView
)

router = DefaultRouter()

router.register(r'customers', CustomerViewSet)
router.register(r'products', ProductViewSet)
router.register(r'batches', BatchViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'feedbacks', FeedbackViewSet)
router.register(r'complaints', ComplaintViewSet)
router.register(r'recalls', ProductRecallViewSet)
router.register(r"reps", SalespersonViewSet, basename="reps")

urlpatterns = [
    path('', include(router.urls)),

    # ANALYTICS ENDPOINTS
    path("analytics/sales", AnalyticsView.as_view(), name="sales-analytics"),
    path("analytics/regions/", SalesRegionsView.as_view(), name="regions"),
]
