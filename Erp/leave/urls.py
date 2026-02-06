from rest_framework.routers import DefaultRouter
from .views import LeaveBalanceViewSet,LeaveRequestViewSet,LeaveTypeViewSet

router= DefaultRouter()
router.register("leave-requests",LeaveRequestViewSet,basename="leave-request")
router.register("leave-balances",LeaveBalanceViewSet,basename="leave-balance")
router.register("leave-types",LeaveTypeViewSet,basename="leave-types")

urlpatterns = router.urls
