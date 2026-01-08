from datetime import datetime, timedelta

import csv
from django.http import HttpResponse
from openpyxl import Workbook
from rest_framework.decorators import action

from django.db.models import Avg
from django.db.models.functions import TruncDay

from django.db.models import Sum, Avg
from django.db.models.functions import TruncWeek
from django.utils.dateparse import parse_date

from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import MillingBatch
from .serializers import (
    MillingBatchSerializer,
    MillingAnalyticsSerializer,
)

from accounts.permissions import ModulePermission, AdminDeleteOnly
from core.audit import log_action


# =====================================================
# MILLING BATCH CRUD
# =====================================================

class MillingBatchViewSet(viewsets.ModelViewSet):
    """
    Milling production per shift and batch
    """
    queryset = MillingBatch.objects.all().order_by("-date")
    serializer_class = MillingBatchSerializer

    permission_classes = [ModulePermission, AdminDeleteOnly]
    module_name = "milling"

    def get_queryset(self):
        """
        Supports filtering by:
        - start_date
        - end_date
        - shift
        - batch_no
        - company
        - branch
        """
        qs = super().get_queryset()

        start_date = parse_date(self.request.GET.get("start_date"))
        end_date = parse_date(self.request.GET.get("end_date"))
        shift = self.request.GET.get("shift")
        batch_no = self.request.GET.get("batch_no")
        company = self.request.GET.get("company")
        branch = self.request.GET.get("branch")

        if start_date:
            qs = qs.filter(date__gte=start_date)

        if end_date:
            qs = qs.filter(date__lte=end_date)

        if shift and shift.lower() != "all":
            qs = qs.filter(shift__iexact=shift)

        if batch_no:
            qs = qs.filter(batch_no__icontains=batch_no)

        if company:
            qs = qs.filter(company_id=company)

        if branch:
            qs = qs.filter(branch_id=branch)

        return qs

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
    # EXPORT CSV
    # =====================================================
    @action(detail=False, methods=["get"], url_path="export-csv")
    def export_csv(self, request):
        qs = self.filter_queryset(self.get_queryset())

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="milling_batches.csv"'

        writer = csv.writer(response)
        writer.writerow([
            "Date",
            "Shift",
            "Batch No",
            "Maize Milled (kg)",
            "Premix (kg)",
            "Germ (kg)",
            "Chaff (kg)",
            "Waste (kg)",
            "Bales",
            "Efficiency (%)",
            "Expiry Date",
        ])

        for obj in qs:
            writer.writerow([
                obj.date,
                obj.shift,
                obj.batch_no,
                obj.maize_milled_kg,
                obj.premix_kg,
                obj.maize_germ_kg,
                obj.maize_chaffs_kg,
                obj.waste_kg,
                obj.bales,
                round(obj.efficiency or 0, 2),
                obj.expiry_date,
            ])

        return response


    # =====================================================
    # EXPORT EXCEL
    # =====================================================
    @action(detail=False, methods=["get"], url_path="export-excel")
    def export_excel(self, request):
        qs = self.filter_queryset(self.get_queryset())

        wb = Workbook()
        ws = wb.active
        ws.title = "Milling Data"

        headers = [
            "Date",
            "Shift",
            "Batch No",
            "Maize Milled (kg)",
            "Premix (kg)",
            "Germ (kg)",
            "Chaff (kg)",
            "Waste (kg)",
            "Bales",
            "Efficiency (%)",
            "Expiry Date",
        ]

        ws.append(headers)

        for obj in qs:
            ws.append([
                obj.date.strftime("%Y-%m-%d"),
                obj.shift,
                obj.batch_no,
                obj.maize_milled_kg,
                obj.premix_kg,
                obj.maize_germ_kg,
                obj.maize_chaffs_kg,
                obj.waste_kg,
                obj.bales,
                round(obj.efficiency or 0, 2),
                obj.expiry_date.strftime("%Y-%m-%d"),
            ])

        response = HttpResponse(
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        response["Content-Disposition"] = 'attachment; filename="milling_batches.xlsx"'
        wb.save(response)

        return response

# =====================================================
# MILLING ANALYTICS (READ-ONLY)
# =====================================================

class MillingAnalyticsView(APIView):
    """
    Milling KPIs, efficiency & waste analytics
    """
    permission_classes = [ModulePermission]
    module_name = "milling"

    def get(self, request):
        today = datetime.today().date()

        start_date = parse_date(request.GET.get("start_date")) or (
            today - timedelta(days=30)
        )
        end_date = parse_date(request.GET.get("end_date")) or today
        shift = request.GET.get("shift")

        qs = MillingBatch.objects.filter(
            date__range=[start_date, end_date]
        )

        if shift and shift.lower() != "all":
            qs = qs.filter(shift__iexact=shift)

        # -------------------------------
        # TOTALS
        # -------------------------------
        totals = qs.aggregate(
            total_maize=Sum("maize_milled_kg"),
            total_premix=Sum("premix_kg"),
            total_germ=Sum("maize_germ_kg"),
            total_chaff=Sum("maize_chaffs_kg"),
            total_waste=Sum("waste_kg"),
            total_bales=Sum("bales"),
            avg_efficiency=Avg("efficiency"),
        )

        # -------------------------------
        # SHIFT PERFORMANCE
        # -------------------------------
        shift_performance = []
        for s in ["morning", "evening"]:
            s_qs = qs.filter(shift=s)

            data = s_qs.aggregate(
                total_maize=Sum("maize_milled_kg"),
                total_bales=Sum("bales"),
                avg_efficiency=Avg("efficiency"),
            )

            shift_performance.append({
                "shift": s,
                "total_maize": data["total_maize"] or 0,
                "total_bales": data["total_bales"] or 0,
                "avg_efficiency": round(data["avg_efficiency"] or 0, 2),
            })

        # -------------------------------
        # WEEKLY TRENDS
        # -------------------------------
        weekly = qs.annotate(
            week=TruncWeek("date")
        ).values("week").annotate(
            total_maize=Sum("maize_milled_kg"),
            avg_efficiency=Avg("efficiency"),
        ).order_by("week")

        weekly_trends = [
            {
                "week_start": row["week"].strftime("%Y-%m-%d"),
                "total_maize": row["total_maize"],
                "avg_efficiency": round(row["avg_efficiency"] or 0, 2),
            }
            for row in weekly
        ]

        return Response({
            "totals": {
                "total_maize": totals["total_maize"] or 0,
                "total_premix": totals["total_premix"] or 0,
                "total_germ": totals["total_germ"] or 0,
                "total_chaff": totals["total_chaff"] or 0,
                "total_waste": totals["total_waste"] or 0,
                "total_bales": totals["total_bales"] or 0,
                "avg_efficiency": round(totals["avg_efficiency"] or 0, 2),
            },
            "shift_performance": shift_performance,
            "weekly_trends": weekly_trends,
        })


# =====================================================
# DAILY CHARTS API
# =====================================================

class MillingDailyChartView(APIView):
    """
    Daily efficiency, maize milled & waste trends
    """
    permission_classes = [ModulePermission]
    module_name = "milling"

    def get(self, request):
        today = datetime.today().date()

        start_date = parse_date(request.GET.get("start_date")) or (
            today - timedelta(days=30)
        )
        end_date = parse_date(request.GET.get("end_date")) or today
        shift = request.GET.get("shift")

        qs = MillingBatch.objects.filter(
            date__range=[start_date, end_date]
        )

        if shift and shift.lower() != "all":
            qs = qs.filter(shift__iexact=shift)

        daily = qs.annotate(
            day=TruncDay("date")
        ).values("day").annotate(
            avg_efficiency=Avg("efficiency"),
            total_maize=Sum("maize_milled_kg"),
            total_waste=Sum("waste_kg"),
        ).order_by("day")

        labels = []
        efficiency = []
        maize = []
        waste = []

        for row in daily:
            labels.append(row["day"].strftime("%Y-%m-%d"))
            efficiency.append(round(row["avg_efficiency"] or 0, 2))
            maize.append(row["total_maize"] or 0)
            waste.append(row["total_waste"] or 0)

        return Response({
            "labels": labels,
            "efficiency": efficiency,
            "maize_milled": maize,
            "waste": waste,
        })
    
# =====================================================
# MONTHLY CHARTS API
# =====================================================

class MillingMonthlyChartView(APIView):
    """
    Monthly maize, efficiency & waste trends
    """
    permission_classes = [ModulePermission]
    module_name = "milling"

    def get(self, request):
        today = datetime.today().date()

        start_date = parse_date(request.GET.get("start_date")) or (
            today - timedelta(days=365)
        )
        end_date = parse_date(request.GET.get("end_date")) or today
        shift = request.GET.get("shift")

        qs = MillingBatch.objects.filter(
            date__range=[start_date, end_date]
        )

        if shift and shift.lower() != "all":
            qs = qs.filter(shift__iexact=shift)

        monthly = qs.annotate(
            month=TruncMonth("date")
        ).values("month").annotate(
            total_maize=Sum("maize_milled_kg"),
            total_waste=Sum("waste_kg"),
            avg_efficiency=Avg("efficiency"),
        ).order_by("month")

        labels = []
        maize = []
        waste = []
        efficiency = []

        for row in monthly:
            labels.append(row["month"].strftime("%Y-%m"))
            maize.append(row["total_maize"] or 0)
            waste.append(row["total_waste"] or 0)
            efficiency.append(round(row["avg_efficiency"] or 0, 2))

        return Response({
            "labels": labels,
            "total_maize": maize,
            "total_waste": waste,
            "avg_efficiency": efficiency,
        })

# =====================================================
# WASTE RATIO CHART API
# =====================================================

class MillingWasteRatioChartView(APIView):
    """
    Waste ratio = (total waste / total maize) * 100
    """
    permission_classes = [ModulePermission]
    module_name = "milling"

    def get(self, request):
        today = datetime.today().date()

        start_date = parse_date(request.GET.get("start_date")) or (
            today - timedelta(days=30)
        )
        end_date = parse_date(request.GET.get("end_date")) or today
        shift = request.GET.get("shift")

        qs = MillingBatch.objects.filter(
            date__range=[start_date, end_date]
        )

        if shift and shift.lower() != "all":
            qs = qs.filter(shift__iexact=shift)

        daily = qs.annotate(
            day=TruncDay("date")
        ).values("day").annotate(
            total_maize=Sum("maize_milled_kg"),
            total_waste=Sum("waste_kg"),
        ).order_by("day")

        labels = []
        waste_ratio = []
        total_waste = []
        total_maize = []

        for row in daily:
            maize = row["total_maize"] or 0
            waste = row["total_waste"] or 0

            ratio = (waste / maize * 100) if maize > 0 else 0

            labels.append(row["day"].strftime("%Y-%m-%d"))
            waste_ratio.append(round(ratio, 2))
            total_waste.append(waste)
            total_maize.append(maize)

        return Response({
            "labels": labels,
            "waste_ratio": waste_ratio,
            "total_waste": total_waste,
            "total_maize": total_maize,
        })


# =====================================================
# BEST / WORST SHIFT RANKING API
# =====================================================

class MillingShiftRankingView(APIView):
    """
    Best & worst performing shift based on avg efficiency
    """
    permission_classes = [ModulePermission]
    module_name = "milling"

    def get(self, request):
        today = datetime.today().date()

        start_date = parse_date(request.GET.get("start_date")) or (
            today - timedelta(days=30)
        )
        end_date = parse_date(request.GET.get("end_date")) or today

        qs = MillingBatch.objects.filter(date__range=[start_date, end_date])

        shift_stats = qs.values("shift").annotate(
            avg_efficiency=Avg("efficiency"),
            total_maize=Sum("maize_milled_kg"),
            total_waste=Sum("waste_kg"),
        )

        if not shift_stats:
            return Response({
                "best_shift": None,
                "worst_shift": None
            })

        best_shift = max(shift_stats, key=lambda x: x["avg_efficiency"] or 0)
        worst_shift = min(shift_stats, key=lambda x: x["avg_efficiency"] or 0)

        return Response({
            "best_shift": {
                "shift": best_shift["shift"],
                "avg_efficiency": round(best_shift["avg_efficiency"] or 0, 2),
                "total_maize": best_shift["total_maize"] or 0,
                "total_waste": best_shift["total_waste"] or 0,
            },
            "worst_shift": {
                "shift": worst_shift["shift"],
                "avg_efficiency": round(worst_shift["avg_efficiency"] or 0, 2),
                "total_maize": worst_shift["total_maize"] or 0,
                "total_waste": worst_shift["total_waste"] or 0,
            }
        })
# =====================================================
# MILLING DASHBOARD (COMBINED API)
# =====================================================

class MillingDashboardView(APIView):
    """
    Combined dashboard API for all charts & KPIs
    """
    permission_classes = [ModulePermission]
    module_name = "milling"

    def get(self, request):
        today = datetime.today().date()

        start_date = parse_date(request.GET.get("start_date")) or (
            today - timedelta(days=30)
        )
        end_date = parse_date(request.GET.get("end_date")) or today

        qs = MillingBatch.objects.filter(date__range=[start_date, end_date])

        # =====================================================
        # SUMMARY KPI
        # =====================================================
        totals = qs.aggregate(
            total_maize=Sum("maize_milled_kg"),
            total_output=Sum("total_output_kg"),
            avg_efficiency=Avg("efficiency"),
            total_waste=Sum("waste_kg"),
        )

        total_maize = totals["total_maize"] or 0
        total_waste = totals["total_waste"] or 0

        waste_ratio = (
            (total_waste / total_maize) * 100 if total_maize else 0
        )

        summary = {
            "total_maize": total_maize,
            "total_output": totals["total_output"] or 0,
            "avg_efficiency": round(totals["avg_efficiency"] or 0, 2),
            "total_waste": total_waste,
            "waste_ratio": round(waste_ratio, 2),
        }

        # =====================================================
        # DAILY EFFICIENCY CHART
        # =====================================================
        daily_efficiency = qs.annotate(
            day=TruncDay("date")
        ).values("day").annotate(
            avg_efficiency=Avg("efficiency")
        ).order_by("day")

        daily_efficiency_data = [
            {
                "date": d["day"].strftime("%Y-%m-%d"),
                "efficiency": round(d["avg_efficiency"] or 0, 2)
            }
            for d in daily_efficiency
        ]

        # =====================================================
        # MONTHLY TRENDS
        # =====================================================
        monthly = qs.annotate(
            month=TruncMonth("date")
        ).values("month").annotate(
            total_maize=Sum("maize_milled_kg"),
            avg_efficiency=Avg("efficiency"),
        ).order_by("month")

        monthly_data = [
            {
                "month": m["month"].strftime("%Y-%m"),
                "total_maize": m["total_maize"] or 0,
                "avg_efficiency": round(m["avg_efficiency"] or 0, 2),
            }
            for m in monthly
        ]

        # =====================================================
        # WASTE RATIO CHART
        # =====================================================
        waste_chart = qs.annotate(
            day=TruncDay("date")
        ).values("day").annotate(
            total_waste=Sum("waste_kg"),
            total_maize=Sum("maize_milled_kg"),
        ).order_by("day")

        waste_chart_data = [
            {
                "date": w["day"].strftime("%Y-%m-%d"),
                "waste_ratio": round(
                    ((w["total_waste"] or 0) / (w["total_maize"] or 1)) * 100,
                    2
                ),
            }
            for w in waste_chart
        ]

        # =====================================================
        # SHIFT RANKING
        # =====================================================
        shift_stats = qs.values("shift").annotate(
            avg_efficiency=Avg("efficiency"),
            total_maize=Sum("maize_milled_kg"),
            total_waste=Sum("waste_kg"),
        )

        if shift_stats:
            best_shift = max(
                shift_stats, key=lambda x: x["avg_efficiency"] or 0
            )
            worst_shift = min(
                shift_stats, key=lambda x: x["avg_efficiency"] or 0
            )
        else:
            best_shift = None
            worst_shift = None

        shift_ranking = {
            "best_shift": best_shift,
            "worst_shift": worst_shift,
        }

        # =====================================================
        # FINAL RESPONSE
        # =====================================================
        return Response({
            "summary": summary,
            "daily_efficiency": daily_efficiency_data,
            "monthly_trends": monthly_data,
            "waste_ratio_chart": waste_chart_data,
            "shift_ranking": shift_ranking,
        })
