from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import(
    MaterialViewSet,
    DailyInventoryViewSet,
    WarehouseAnalyticsViewSet,
    inventory_analytics
)
router=DefaultRouter()
\
router.register("materials",MaterialViewSet)
router.register("warehouseanalytics",WarehouseAnalyticsViewSet)
router.register("dailyinventory",DailyInventoryViewSet)


urlpatterns =[ path('inventory/analytics/', inventory_analytics, name='inventory_analytics'),
              
              ] 

urlpatterns+= router.urls
