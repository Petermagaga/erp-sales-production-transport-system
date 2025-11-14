from rest_framework.routers import DefaultRouter
from django.urls import path,include
from  .views import VehicleViewSet,TransportRecordViewSet

router=DefaultRouter()
router.register(r'vehicles',VehicleViewSet,basename='vehicle')
router.register(r'records',TransportRecordViewSet,basename='transpoertrecord')

urlpatterns = [
    path('',include(router.urls)),
]
