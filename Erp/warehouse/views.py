from datetime import date
from django.db.models import Sum,Avg
from rest_framework import viewsets,status
from serializers import (MaterialSerializer,
                         DailyInventorySerializer,
                         WarehouseSerializer,
                         WarehousinAnalyticsSerializer)
from  .models import Warehouse,Material,DailyInventory,WarehouseAnalytics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action


class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all().order_by("name")
    serializer_class=MaterialSerializer
    permission_classes=[AllowAny]

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset=Warehouse.objects.all().order_by("categories")
    serializer_class=WarehouseSerializer
    permission_classes=[AllowAny]

class DailyInventoryViewSet(viewsets.ModelViewSet):
    queryset=DailyInventory.objects.select_related("warehouse","material").all()
    serializer_class=DailyInventorySerializer
    permission_classes=[AllowAny]

    @action(detail=False,methods=["get"])
    def summary(self, request):
        """
        Returns daily summary by warehouse & material

        """

        queryset=self.queryset
        warehouse_id=request.query_params.get("warehouse")
        category=request.query_params.get("category")
        filter_date=request.query_params.get("date")

        if warehouse_id:
            queryset=queryset.filter(Warehouse_id=warehouse_id)
        
        if category:
            queryset=queryset.filter(material_category=category)

        if filter_date:
            queryset=queryset.filter(date=filter_date)

        data=(
            queryset.values(
                "warehouse__categories","material__name","material__category"
            )
        
        .annotate(
            total_opening=Sum("opening_balance"),
            total_raw_in=Sum("raw_in"),
            total_shift_1=Sum("shift_1"),
            total_shift_2=Sum("shift_2"),
            total_shift_3=Sum("shift_3"),
            total_closing=Sum("closing_balance"),

        )
        .order_by("warehouse_categories")
        )
        return Response(data)

class WarehouseAnalyticsViewSet(viewsets.ModelViewSet):
    queryset=WarehouseAnalytics.objects.select_related("warehouse").all()
    serializer_class=WarehousinAnalyticsSerializer
    permission_classes=[AllowAny]

    @action(detail=False,methods=["get"])
    def dashboard(self,request):
        """
        Returns dashboard metrics acreoss warehouses or by date range
        """
        queryset=self.queryset
        start_date=request.query_params.get("start_date")
        end_date=request.query_params.get("end_date")
        warehouse_id=request.query_params.get("warehouse")

        if start_date and end_date:
            queryset=queryset.filter(date__range=[start_date,end_date])
        if warehouse_id:
            queryset=queryset.filter(warehouse_id=warehouse_id)
        summary =(
            queryset.values("warehouse__categories")
            .annotate(
                total_raw_in=Sum("total_raw_in"),
                total_output=Sum("total_output"),
                total_waste=Sum("total_waste"),
                avg_effiency=Avg("efficiency_rate"),
            )
            .order_by("warehouse__categories")
        )

        return Response(summary)