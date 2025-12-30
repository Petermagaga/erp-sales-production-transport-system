from django.db.models import Sum
from django.db.models.functions import TruncDay, TruncMonth
from django.utils.dateparse import parse_date
from django.utils.timezone import now
from datetime import datetime, timedelta

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from notifications.services import notify_role
from .models import Vehicle, TransportRecord
from .serializers import VehicleSerializer, TransportRecordSerializer

from accounts.permissions import (ModulePermission, AdminDeleteOnly,
                                  ApprovalWorkflowPermission,IsownerOrAdmin)


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

    permission_classes = [ModulePermission, AdminDeleteOnly,IsownerOrAdmin,ApprovalWorkflowPermission,]
    module_name = "transport"

    # -------------------------------
    # FILTERING
    # -------------------------------

    def perform_create(self,serializer):
        serializer.save(created_by=self.request.user)

    def submit(self, request, pk=None):
        record = self.get_object()

        if record.created_by != request.user:
            return Response(
                {"detail": "Only owner can submit"},
                status=status.HTTP_403_FORBIDDEN
            )

        record.status = "pending"
        record.save()

        notify_role(
            role="transporter",
            company=record.company,
            title="Transport record pending approval",
            message=f"Transport record #{record.id} was submitted for approval.",
            module="transport",
            object_id=record.id,
        )


        return Response({"status": "submitted for approval"})

    # ✅ APPROVE (Admin / Manager)
    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        if request.user.role not in ["admin", "transporter"]:
            return Response(
                {"detail": "Not authorized"},
                status=status.HTTP_403_FORBIDDEN
            )

        record = self.get_object()
        record.status = "approved"
        record.approved_by = request.user
        record.approved_at = now()
        record.save()

        notify_user(
            user=record.created_by,
            company=record.company,
            title="Transport record approved",
            message=f"Your transport record #{record.id} has been approved. ",
            notification_type="success",
            module="transport",
            object_id=record.id,
        )

        return Response({"status": "approved"})

    def get_queryset(self):
        qs = super().get_queryset()

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

    def get_queryset(self):
        return TransportRecord.objects.for_user(self.request.user)

    # -------------------------------
    # ANALYTICS (READ-ONLY)
    # -------------------------------

    @action(detail=False, methods=["get"])
    def analytics(self, request):
        """
        Transport cost analytics (read-only)
        """

        start_param = request.query_params.get("start_date")
        end_param = request.query_params.get("end_date")
        vehicle_param = request.query_params.get("vehicle")

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

        records = TransportRecord.objects.filter(
            date__range=[start_date, end_date]
        )

        if vehicle_param:
            records = records.filter(vehicle__id=vehicle_param)

        # -------------------------------
        # TOTALS
        # -------------------------------

        totals = records.aggregate(
            total_fuel=Sum("fuel_cost"),
            total_service=Sum("service_cost"),
        )

        total_fuel = float(totals["total_fuel"] or 0)
        total_service = float(totals["total_service"] or 0)

        # -------------------------------
        # DAILY TRENDS
        # -------------------------------

        daily_qs = (
            records
            .annotate(day=TruncDay("date"))
            .values("day")
            .annotate(
                fuel=Sum("fuel_cost"),
                service=Sum("service_cost"),
            )
            .order_by("day")
        )

        daily_data = [
            {
                "date": d["day"].strftime("%Y-%m-%d"),
                "fuel": float(d["fuel"] or 0),
                "service": float(d["service"] or 0),
            }
            for d in daily_qs
        ]

        # -------------------------------
        # MONTHLY TRENDS
        # -------------------------------

        monthly_qs = (
            records
            .annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(
                fuel=Sum("fuel_cost"),
                service=Sum("service_cost"),
            )
            .order_by("month")
        )

        monthly_trends = [
            {
                "month": m["month"].strftime("%Y-%m"),
                "fuel": float(m["fuel"] or 0),
                "service": float(m["service"] or 0),
                "total": float(m["fuel"] or 0) + float(m["service"] or 0),
            }
            for m in monthly_qs
        ]

        # -------------------------------
        # VEHICLE TOTALS
        # -------------------------------

        vehicle_qs = (
            records
            .values(
                "vehicle__id",
                "vehicle__plate_number",
                "vehicle__name",
            )
            .annotate(
                fuel=Sum("fuel_cost"),
                service=Sum("service_cost"),
            )
            .order_by("-fuel", "-service")
        )

        vehicle_totals = [
            {
                "vehicle_id": v["vehicle__id"],
                "plate_number": v["vehicle__plate_number"],
                "name": v["vehicle__name"],
                "fuel": float(v["fuel"] or 0),
                "service": float(v["service"] or 0),
                "total": float(v["fuel"] or 0) + float(v["service"] or 0),
            }
            for v in vehicle_qs
        ]

        top_vehicles = sorted(
            vehicle_totals,
            key=lambda x: x["total"],
            reverse=True
        )[:5]

        return Response({
            "summary": {
                "total_fuel": total_fuel,
                "total_service": total_service,
                "total_cost": total_fuel + total_service,
            },
            "daily_data": daily_data,
            "monthly_trends": monthly_trends,
            "vehicle_totals": vehicle_totals,
            "top_vehicles": top_vehicles,
        })


