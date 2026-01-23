from datetime import datetime, timedelta
from django.db import transaction
from django.db.models import Sum
from django.db.models.functions import TruncWeek
from django.utils.dateparse import parse_date

from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import RawMaterial, FlourOutput
from .serializers import (
    RawMaterialSerializer,
    FlourOutputSerializer,
    MergedProductionSerializer,
)

from accounts.permissions import ModulePermission, AdminDeleteOnly
from core.audit import log_action


# =====================================================
# RAW MATERIAL INPUT
# =====================================================

class RawMaterialViewSet(viewsets.ModelViewSet):
    """
    Raw material intake per shift
    """
    queryset = RawMaterial.objects.all().order_by("-date")
    serializer_class = RawMaterialSerializer

    permission_classes = [ModulePermission, AdminDeleteOnly]
    module_name = "production"

    def perform_create(self, serializer):
        instance = serializer.save()
        log_action(self.request, "CREATE", instance)

    def perform_update(self, serializer):
        instance = self.get_object()
        old_data = RawMaterialSerializer(instance).data

        updated = serializer.save()
        new_data = RawMaterialSerializer(updated).data

        log_action(
            self.request,
            "update",
            updated,
            old_data=old_data,
            new_data=new_data
        )

    def perform_destroy(self, instance):
        log_action(self.request, "DELETE", instance)
        instance.delete()


# =====================================================
# FLOUR OUTPUT
# =====================================================

class FlourOutputViewSet(viewsets.ModelViewSet):
    """
    Flour output & by-products per shift
    """
    queryset = FlourOutput.objects.all().order_by("-date")
    serializer_class = FlourOutputSerializer

    permission_classes = [ModulePermission, AdminDeleteOnly]
    module_name = "production"

    def perform_create(self, serializer):
        instance = serializer.save()
        log_action(self.request, "CREATE", instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        log_action(self.request, "UPDATE", instance)

    def perform_destroy(self, instance):
        log_action(self.request, "DELETE", instance)
        instance.delete()


# =====================================================
# PRODUCTION ANALYTICS (READ-ONLY)
# =====================================================

class ProductionAnalyticsView(APIView):
    """
    Production KPIs, efficiency & waste analytics
    """
    permission_classes = [ModulePermission]
    module_name = "production"

    def get(self, request):
        today = datetime.today().date()

        start_date_param=request.GET.get("start_date")
        start_date = parse_date(start_date_param)if start_date_param else (
            today - timedelta(days=30)
        )
        end_date = parse_date(request.GET.get("end_date")) or today
        shift = request.GET.get("shift")

        raw_qs = RawMaterial.objects.filter(
            date__range=[start_date, end_date]
        )
        flour_qs = FlourOutput.objects.filter(
            date__range=[start_date, end_date]
        )

        if shift and shift.lower() != "all":
            raw_qs = raw_qs.filter(shift__iexact=shift)
            flour_qs = flour_qs.filter(shift__iexact=shift)

        total_raw = raw_qs.aggregate(
            total=Sum("total_raw_material")
        )["total"] or 0

        total_flour = flour_qs.aggregate(
            total=Sum("total_bags")
        )["total"] or 0

        total_byproducts = flour_qs.aggregate(
            total=(
                Sum("spillage_kg") +
                Sum("germ_kg") +
                Sum("chaff_kg") +
                Sum("waste_kg")
            )
        )["total"] or 0

        efficiency = (total_flour / total_raw * 100) if total_raw else 0
        waste_ratio = (total_byproducts / total_raw * 100) if total_raw else 0

        # -------------------------------
        # SHIFT PERFORMANCE
        # -------------------------------
        shift_performance = []
        for s in ["morning", "evening", "night"]:
            raw_s = raw_qs.filter(shift=s).aggregate(
                total=Sum("total_raw_material")
            )["total"] or 0

            flour_s = flour_qs.filter(shift=s).aggregate(
                total=Sum("total_bags")
            )["total"] or 0

            by_s = flour_qs.filter(shift=s).aggregate(
                total=(
                    Sum("spillage_kg") +
                    Sum("germ_kg") +
                    Sum("chaff_kg") +
                    Sum("waste_kg")
                )
            )["total"] or 0

            shift_performance.append({
                "shift": s,
                "total_raw": raw_s,
                "total_flour": flour_s,
                "total_byproducts": by_s,
                "efficiency": round(
                    (flour_s / raw_s * 100) if raw_s else 0, 2
                ),
                "waste_ratio": round(
                    (by_s / raw_s * 100) if raw_s else 0, 2
                ),
            })

        # -------------------------------
        # WEEKLY TRENDS
        # -------------------------------
        weekly_raw = raw_qs.annotate(
            week=TruncWeek("date")
        ).values("week").annotate(
            total_raw=Sum("total_raw_material")
        )

        weekly_flour = flour_qs.annotate(
            week=TruncWeek("date")
        ).values("week").annotate(
            total_flour=Sum("total_bags")
        )

        weekly_trends = []
        for wr in weekly_raw:
            wf = next(
                (f for f in weekly_flour if f["week"] == wr["week"]),
                {"total_flour": 0},
            )

            weekly_trends.append({
                "week_start": wr["week"].strftime("%Y-%m-%d"),
                "total_raw": wr["total_raw"],
                "total_flour": wf["total_flour"],
                "efficiency": round(
                    (wf["total_flour"] / wr["total_raw"] * 100)
                    if wr["total_raw"] else 0,
                    2,
                ),
            })

        return Response({
            "totals": {
                "total_raw": total_raw,
                "total_flour": total_flour,
                "total_byproducts": total_byproducts,
                "efficiency": round(efficiency, 2),
                "waste_ratio": round(waste_ratio, 2),
            },
            "shift_performance": shift_performance,
            "best_shift": max(
                shift_performance,
                key=lambda x: x["efficiency"],
                default={},
            ),
            "poor_shift": min(
                shift_performance,
                key=lambda x: x["efficiency"],
                default={},
            ),
            "weekly_trends": weekly_trends,
        })


# =====================================================
# COMBINED CREATE (RAW + FLOUR)
# =====================================================

class ProductionCreateView(APIView):
    """
    Atomic create for raw material + flour output
    """
    permission_classes = [ModulePermission]
    module_name = "production"



    def post(self, request):
        with transaction.atomic():
            raw_serializer = RawMaterialSerializer(data=request.data.get("raw"))
            raw_serializer.is_valid(raise_exception=True)
            raw_instance = raw_serializer.save()

            flour_serializer = FlourOutputSerializer(data=request.data.get("flour"))
            flour_serializer.is_valid(raise_exception=True)
            flour_serializer.save()

            log_action(request, "create", raw_instance)

        return Response(
            {"raw": raw_serializer.data, "flour": flour_serializer.data},
            status=status.HTTP_201_CREATED
        )


# =====================================================
# MERGED PRODUCTION VIEW
# =====================================================

class MergedProductionView(APIView):
    """
    Merged raw input + flour output per date & shift
    """
    permission_classes = [ModulePermission]
    module_name = "production"

    def get(self, request):
        raw_materials = RawMaterial.objects.all()
        flour_outputs = FlourOutput.objects.all()

        merged_data = []
        for raw in raw_materials:
            flour = flour_outputs.filter(
                date=raw.date,
                shift=raw.shift,
            ).first()

            efficiency = (
                (flour.total_bags * 25 / raw.total_raw_material) * 100
                if flour and raw.total_raw_material else 0
            )

            merged_data.append({
                "date": raw.date,
                "shift": raw.shift,
                "total_raw": raw.total_raw_material,
                "flour_output": flour.total_bags if flour else None,
                "efficiency": round(efficiency, 2),
            })

        return Response(
            MergedProductionSerializer(
                merged_data,
                many=True
            ).data
        )
