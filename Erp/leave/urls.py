from rest_framework.routers import DefaultRouter
from .views import LeaveBalanceViewSet,LeaveRequestViewSet


router= DefaultRouter()
router.register("leave-requests",LeaveRequestViewSet,basename="leave-request")
router.register("leave-balances",LeaveBalanceViewSet,basename="leave-balance")
router.register("leave-types",)
urlpatterns = router.urls


