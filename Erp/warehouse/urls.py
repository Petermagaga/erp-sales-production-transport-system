from rest_framework.routers import DefaultRouter
from .views import(
    WarehouseViewSet,
    MaterialViewSet,
    DailyInventoryViewSet,
    WarehouseAnalyticsViewSet
)
router=DefaultRouter()
router.register("warehouses",WarehouseViewSet)
router.register("materials",MaterialViewSet)
router.register("warehouseanalytics",WarehouseAnalyticsViewSet)
router.register("dailyinventory",DailyInventoryViewSet)


urlpatterns =router.urls
