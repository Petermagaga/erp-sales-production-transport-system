from datetime import date
from django.db.models import (
    Sum, Avg, F, FloatField, Case, When, Value
)
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action, api_view

from .models import Material, DailyInventory, WarehouseAnalytics
from .serializers import (
    MaterialSerializer,
    DailyInventorySerializer,
    WarehouseAnalyticsSerializer
)
from accounts.permissions import ModulePermission   # ✅ Hybrid permission

class MaterialViewSet(viewsets.ModelViewSet):
    """
    Warehouse materials management
    """
    queryset = Material.objects.all().order_by("name")
    serializer_class = MaterialSerializer

    permission_classes = [ModulePermission]
    module_name = "warehouse"


class DailyInventoryViewSet(viewsets.ModelViewSet):
    """
    Daily inventory records per material
    """
    queryset = DailyInventory.objects.select_related("material").all()
    serializer_class = DailyInventorySerializer

    permission_classes = [ModulePermission]
    module_name = "warehouse"


    @action(
        detail=False,
        methods=["get"],
        permission_classes=[ModulePermission]  # READ-ONLY via SAFE_METHODS
    )
    def summary(self, request):
        """
        Returns daily summary by warehouse & material
        """

        queryset = self.get_queryset()

        category = request.query_params.get("category")
        filter_date = request.query_params.get("date")

        if category:
            queryset = queryset.filter(material__category=category)

        if filter_date:
            queryset = queryset.filter(date=filter_date)

        data = (
            queryset
            .values("material__name", "material__category")
            .annotate(
                total_opening=Sum("opening_balance"),
                total_raw_in=Sum("raw_in"),
                total_shift_1=Sum("shift_1"),
                total_shift_2=Sum("shift_2"),
                total_shift_3=Sum("shift_3"),
                total_closing=Sum("closing_balance"),
            )
            .order_by("material__category")
        )

        return Response(data)

class WarehouseAnalyticsViewSet(viewsets.ModelViewSet):
    """
    Warehouse KPI analytics
    """
    queryset = WarehouseAnalytics.objects.all()
    serializer_class = WarehouseAnalyticsSerializer

    permission_classes = [ModulePermission]
    module_name = "warehouse"


    @action(
        detail=False,
        methods=["get"],
        permission_classes=[ModulePermission]  # READ-ONLY
    )
    def dashboard(self, request):
        """
        Returns dashboard metrics across warehouses or by date range
        """

        queryset = self.get_queryset()

        start_date = request.query_params.get("start_date")
        end_date = request.query_params.get("end_date")

        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])

        summary = (
            queryset
            .values("date")
            .annotate(
                total_raw_in_sum=Sum("total_raw_in"),
                total_output_sum=Sum("total_output"),
                total_waste_sum=Sum("total_waste"),
                avg_efficiency_sum=Avg("efficiency_rate"),
            )
            .order_by("-date")
        )

        return Response(summary)

@api_view(["GET"])
def inventory_analytics(request):
    """
    Inventory analytics – read-only for all roles
    """

    # Manually enforce permission (FBV)
    permission = ModulePermission()
    permission.module_name = "warehouse"

    if not permission.has_permission(request, view=type("obj", (), {"module_name": "warehouse"})):
        return Response(
            {"detail": "Permission denied"},
            status=status.HTTP_403_FORBIDDEN
        )

    qs = DailyInventory.objects.all()

    data = (
        qs.values("date")
        .annotate(
            total_raw_in=Sum("raw_in"),
            total_opening_balance=Sum("opening_balance"),
            total_closing_balance=Sum("closing_balance"),
            total_shift1=Sum("shift_1"),
            total_shift2=Sum("shift_2"),
            total_shift3=Sum("shift_3"),
            avg_efficiency=Avg(
                Case(
                    When(raw_in=0, then=Value(0)),
                    default=(
                        F("shift_1") + F("shift_2") + F("shift_3")
                    ) / F("raw_in"),
                    output_field=FloatField(),
                )
            ),
        )
        .order_by("date")
    )

    return Response(data)
