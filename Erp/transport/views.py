from django.db.models import Sum
from django.db.models.functions import TruncDay, TruncMonth
from django.utils.dateparse import parse_date
from django.utils.timezone import now
from datetime import datetime, timedelta

from django.db.models import Sum, Q 
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied


from notifications.services import notify_role
from .models import Vehicle, TransportRecord
from .serializers import VehicleSerializer, TransportRecordSerializer
from cores.utils.periods import is_period_locked
from accounts.permissions import (ModulePermission, AdminDeleteOnly,
                                  ApprovalWorkflowPermission,IsownerOrAdmin)

from billing.utils.features import is_feature_enabled
# =====================================================
# VEHICLES
# =====================================================

class VehicleViewSet(viewsets.ModelViewSet):
    """
    Fleet vehicle management
    """
    queryset = Vehicle.objects.all().order_by("plate_number")
    serializer_class = VehicleSerializer

    permission_classes = [ModulePermission, AdminDeleteOnly]
    module_name = "transport"


# =====================================================
# TRANSPORT RECORDS
# =====================================================

class TransportRecordViewSet(viewsets.ModelViewSet):
    """
    Daily fuel & service cost records
    """
    queryset = (
        TransportRecord.objects
        .select_related("vehicle")
        .order_by("-date")
    )
    serializer_class = TransportRecordSerializer

    permission_classes = [
        ModulePermission,
        AdminDeleteOnly,
        IsownerOrAdmin,
        ApprovalWorkflowPermission,
    ]
    module_name = "transport"

    # -------------------------------
    # QUERYSET (FILTERING)
    # -------------------------------
    def get_queryset(self):
        qs = TransportRecord.objects.for_user(self.request.user)

        vehicle_id = self.request.query_params.get("vehicle")
        start = self.request.query_params.get("start_date")
        end = self.request.query_params.get("end_date")

        if vehicle_id:
            qs = qs.filter(vehicle__id=vehicle_id)

        if start:
            start_date = parse_date(start)
            if start_date:
                qs = qs.filter(date__gte=start_date)

        if end:
            end_date = parse_date(end)
            if end_date:
                qs = qs.filter(date__lte=end_date)

        return qs

    # -------------------------------
    # ANALYTICS (READ-ONLY)
    # -------------------------------
    @action(detail=False, methods=["get"])
    def analytics(self, request):
        start_param = request.query_params.get("start_date")
        end_param = request.query_params.get("end_date")

        start_date = (
            parse_date(start_param)
            if start_param
            else (datetime.today() - timedelta(days=30)).date()
        )
        end_date = (
            parse_date(end_param)
            if end_param
            else datetime.today().date()
        )

        records = TransportRecord.objects.for_user(request.user).filter(
            date__range=[start_date, end_date]
        )

        totals = records.aggregate(
            total_fuel=Sum("fuel_cost"),
            total_service=Sum("service_cost"),
        )

        # -------------------------------
        # VEHICLE TOTALS (ALL VEHICLES)
        # -------------------------------
        vehicles_qs = (
            Vehicle.objects
            .annotate(
                fuel=Sum(
                    "records__fuel_cost",
                    filter=Q(records__date__range=[start_date, end_date])
                ),
                service=Sum(
                    "records__service_cost",
                    filter=Q(records__date__range=[start_date, end_date])
                ),
            )
        )

        vehicle_totals = [
            {
                "vehicle_id": v.id,
                "plate_number": v.plate_number,
                "name": v.name,
                "fuel": float(v.fuel or 0),
                "service": float(v.service or 0),
                "total": float((v.fuel or 0) + (v.service or 0)),
            }
            for v in vehicles_qs
        ]

        top_vehicles = sorted(
            vehicle_totals,
            key=lambda x: x["total"],
            reverse=True
        )[:5]

        return Response({
            "summary": {
                "total_fuel": float(totals["total_fuel"] or 0),
                "total_service": float(totals["total_service"] or 0),
                "total_cost": float(
                    (totals["total_fuel"] or 0) +
                    (totals["total_service"] or 0)
                ),
            },
            "vehicle_totals": vehicle_totals,
            "top_vehicles": top_vehicles,
        })

def initial(self, request, *args, **kwargs):
    super().initial(request, *args, **kwargs)

    if not is_feature_enabled(request.user.company, "transport"):
        raise PermissionDenied("Transport module not enabled for your plan.")


