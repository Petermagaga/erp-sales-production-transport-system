from django.shortcuts import render,redirect
from rest_framework import status
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Avg
from .models import RawMaterial, FlourOutput
from .serializers import RawMaterialSerializer, FlourOutputSerializer,MergedProductionSerializer
from datetime import datetime, timedelta
from django.utils.dateparse import parse_date
from django.db.models.functions import TruncWeek
from rest_framework.permissions import AllowAny
from .forms import ExcelUploadForm
from .utils.import_excel import import_production_excel
from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required

# CRUD ViewSets
class RawMaterialViewSet(viewsets.ModelViewSet):
    queryset = RawMaterial.objects.all().order_by('-date')
    serializer_class = RawMaterialSerializer


class FlourOutputViewSet(viewsets.ModelViewSet):
    queryset = FlourOutput.objects.all().order_by('-date')
    serializer_class = FlourOutputSerializer





class ProductionAnalyticsView(APIView):
    def get(self, request):
        start_param = request.GET.get("start_date")
        end_param = request.GET.get("end_date")
        
        today = datetime.today().date()
        start_date_param = request.GET.get("start_date")
        end_date_param = request.GET.get("end_date")

        start_date = parse_date(start_date_param) if start_date_param else (today - timedelta(days=30))
        end_date = parse_date(end_date_param) if end_date_param else today

        shift = request.GET.get("shift")       # --- Filter both models ---
        raw_qs = RawMaterial.objects.filter(date__range=[start_date, end_date])
        flour_qs = FlourOutput.objects.filter(date__range=[start_date, end_date])

        if shift and shift.lower() != "all":
            raw_qs = raw_qs.filter(shift__iexact=shift)
            flour_qs = flour_qs.filter(shift__iexact=shift)

        # --- Totals ---
        total_raw = raw_qs.aggregate(Sum("total_raw_material"))["total_raw_material__sum"] or 0
        total_flour = flour_qs.aggregate(Sum("total_bags"))["total_bags__sum"] or 0
        total_byproducts = (
            flour_qs.aggregate(
                total=Sum("spillage_kg") + Sum("germ_kg") + Sum("chaff_kg") + Sum("waste_kg")
            )["total"]
            or 0
        )

        efficiency = (total_flour / total_raw * 100) if total_raw > 0 else 0
        waste_ratio = (total_byproducts / total_raw * 100) if total_raw > 0 else 0

        # --- Shift Performance ---
        shift_performance = []
        for s in ["morning", "evening", "night"]:
            raw_total = raw_qs.filter(shift=s).aggregate(Sum("total_raw_material"))["total_raw_material__sum"] or 0
            flour_total = flour_qs.filter(shift=s).aggregate(Sum("total_bags"))["total_bags__sum"] or 0
            byproducts = (
                flour_qs.filter(shift=s)
                .aggregate(
                    total=Sum("spillage_kg") + Sum("germ_kg") + Sum("chaff_kg") + Sum("waste_kg")
                )["total"]
                or 0
            )

            efficiency_s = (flour_total / raw_total * 100) if raw_total > 0 else 0
            waste_s = (byproducts / raw_total * 100) if raw_total > 0 else 0

            shift_performance.append({
                "shift": s,
                "total_raw": raw_total,
                "total_flour": flour_total,
                "total_byproducts": byproducts,
                "efficiency": round(efficiency_s, 2),
                "waste_ratio": round(waste_s, 2),
            })

        best_shift = max(shift_performance, key=lambda s: s["efficiency"], default={})
        poor_shift = min(shift_performance, key=lambda s: s["efficiency"], default={})

        # --- Weekly Trends ---
        weekly_raw = raw_qs.annotate(week=TruncWeek("date")).values("week").annotate(total_raw=Sum("total_raw_material")).order_by("week")
        weekly_flour = flour_qs.annotate(week=TruncWeek("date")).values("week").annotate(total_flour=Sum("total_bags")).order_by("week")

        # merge trends by week
        weekly_trends = []
        for wr in weekly_raw:
            wf = next((f for f in weekly_flour if f["week"] == wr["week"]), {"total_flour": 0})
            week_total_raw = wr["total_raw"]
            week_total_flour = wf["total_flour"]
            efficiency_w = (week_total_flour / week_total_raw * 100) if week_total_raw > 0 else 0
            weekly_trends.append({
                "week_start": wr["week"].strftime("%Y-%m-%d"),
                "total_raw": week_total_raw,
                "total_flour": week_total_flour,
                "efficiency": round(efficiency_w, 2)
            })

        data = {
            "totals": {
                "total_raw": total_raw,
                "total_flour": total_flour,
                "total_byproducts": total_byproducts,
                "efficiency": round(efficiency, 2),
                "waste_ratio": round(waste_ratio, 2),
            },
            "shift_performance": shift_performance,
            "best_shift": best_shift,
            "poor_shift": poor_shift,
            "weekly_trends": weekly_trends,
        }

        return Response(data)


class ProductionCreateView(APIView):
    def post(self, request):
        raw_data = request.data.get("raw")
        flour_data = request.data.get("flour")

        # Save Raw Material
        raw_serializer = RawMaterialSerializer(data=raw_data)
        raw_serializer.is_valid(raise_exception=True)
        raw_instance = raw_serializer.save()

        # Save Flour Output (auto-calculates efficiency in model save)
        flour_serializer = FlourOutputSerializer(data=flour_data)
        flour_serializer.is_valid(raise_exception=True)
        flour_instance = flour_serializer.save()

        return Response({
            "raw": raw_serializer.data,
            "flour": flour_serializer.data
        }, status=status.HTTP_201_CREATED)
    

class MergedProductionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        raw_materials = RawMaterial.objects.all()
        flour_outputs = FlourOutput.objects.all()

        merged_data = []

        for raw in raw_materials:
            flour = flour_outputs.filter(date=raw.date, shift=raw.shift).first()
            efficiency = 0
            if flour and raw.total_raw_material > 0:
                efficiency = (flour.total_bags * 25 / raw.total_raw_material) * 100

            merged_data.append({
                "date": raw.date,
                "shift": raw.shift,
                "premix": raw.premix_kg,
                "maize": raw.maize_kg,
                "soya": raw.soya_kg,
                "sugar": raw.sugar_kg,
                "sorghum": raw.sorghum_kg,
                "total_raw": raw.total_raw_material,
                "flour_output": flour.total_bags if flour else None,
                "flour_spillage": flour.spillage_kg if flour else None,
                "maize_germ": flour.germ_kg if flour else None,
                "maize_chaff": flour.chaff_kg if flour else None,
                "sorghum_waste": flour.waste_kg if flour else None,
                "efficiency": round(efficiency, 2),
            })

        serializer = MergedProductionSerializer(merged_data, many=True)
        return Response(serializer.data)
    
@staff_member_required
def upload_excel(request):
    preview_data = None
    filename = None

    if request.method == "POST":
        form = ExcelUploadForm(request.POST, request.FILES)

        # ✅ Step 1: Preview phase
        if not request.POST.get("confirm"):
            if form.is_valid() and request.FILES.get("file"):
                file = request.FILES["file"]
                try:
                    df = pd.read_excel(file)
                    preview_data = df.head(10).to_html(classes="table table-striped", index=False)
                    # Store dataframe temporarily in session
                    request.session["excel_preview_data"] = df.to_dict(orient="records")
                    messages.info(request, "Preview first 10 rows. Click confirm to import.")
                except Exception as e:
                    messages.error(request, f"⚠️ Failed to read Excel file: {e}")
            else:
                messages.error(request, "Please upload a valid Excel file.")

        # ✅ Step 2: Confirm phase
        elif request.POST.get("confirm") == "true":
            try:
                df_data = request.session.get("excel_preview_data")
                if df_data:
                    import pandas as pd
                    df = pd.DataFrame(df_data)
                    rows = import_production_excel(df)
                    messages.success(request, f"✅ Successfully imported {rows} rows!")
                    # Clear session data
                    request.session.pop("excel_preview_data", None)
                    return redirect("admin:index")
                else:
                    messages.error(request, "No preview data found in session.")
            except Exception as e:
                messages.error(request, f"⚠️ Import failed: {e}")
    else:
        form = ExcelUploadForm()

    return render(request, "admin/excel_upload.html", {
        "form": form,
        "preview_data": preview_data,
    })
