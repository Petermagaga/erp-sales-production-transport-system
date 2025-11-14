from django.db.models import Sum
from django.db.models.functions import TruncMonth
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from django.utils.dateparse import parse_date
from datetime import datetime, timedelta

from django.db.models.functions import TruncDay,TruncMonth

from .models import Vehicle, TransportRecord
from .serializers import VehicleSerializer, TransportRecordSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all().order_by('plate_number')
    serializer_class = VehicleSerializer
    permission_classes = [permissions.AllowAny]


class TransportRecordViewSet(viewsets.ModelViewSet):
    """
    CRUD for transport records.
    Also includes an `analytics/` action that returns:
      - summary totals (fuel, service, logistics, total)
      - monthly trends (month, totals)
      - per-vehicle totals (vehicle plate, totals)
    """
    queryset = TransportRecord.objects.select_related('vehicle').all().order_by('-date')
    serializer_class = TransportRecordSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [JSONParser]

    def get_queryset(self):
        """
        Optional filtering by query params:
         - vehicle (id)
         - start_date / end_date (YYYY-MM-DD)
        """
        qs = super().get_queryset()
        vehicle_id = self.request.query_params.get('vehicle')
        start = self.request.query_params.get('start_date')
        end = self.request.query_params.get('end_date')

        if vehicle_id:
            qs = qs.filter(vehicle__id=vehicle_id)

        if start:
            try:
                start_date = parse_date(start)
                qs = qs.filter(date__gte=start_date)
            except Exception:
                pass

        if end:
            try:
                end_date = parse_date(end)
                qs = qs.filter(date__lte=end_date)
            except Exception:
                pass

        return qs


    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def analytics(self, request):
        start_param = request.query_params.get('start_date')
        end_param = request.query_params.get('end_date')

        start_date = parse_date(start_param) if start_param else (datetime.today() - timedelta(days=30)).date()
        end_date = parse_date(end_param) if end_param else datetime.today().date()

        records = TransportRecord.objects.filter(date__range=[start_date, end_date])

        vehicle_param = request.query_params.get('vehicle')
        if vehicle_param:
            try:
                records = records.filter(vehicle__id=int(vehicle_param))
            except:
                pass

        # Summary totals
        totals = records.aggregate(
            total_fuel=Sum('fuel_cost'),
            total_service=Sum('service_cost'),
        )
        total_fuel = float(totals.get('total_fuel') or 0)
        total_service = float(totals.get('total_service') or 0)

        # ✅ Daily trend
        daily_qs = (
            records.annotate(day=TruncDay('date'))
            .values('day')
            .annotate(
                fuel=Sum('fuel_cost'),
                service=Sum('service_cost'),
            ).order_by('day')
        )

        daily_data = [
            {
                "date": d["day"].strftime("%Y-%m-%d"),
                "fuel": float(d["fuel"] or 0),
                "service": float(d["service"] or 0),
            }
            for d in daily_qs
        ]

        # ✅ Monthly trend (existing)
        monthly_qs = (
            records.annotate(month=TruncMonth('date'))
            .values('month')
            .annotate(
                month_fuel=Sum('fuel_cost'),
                month_service=Sum('service_cost'),
            ).order_by('month')
        )

        monthly_trends = [{
            "month": m["month"].strftime("%Y-%m"),
            "fuel": float(m["month_fuel"] or 0),
            "service": float(m["month_service"] or 0),
            "total": float(m["month_fuel"] or 0) + float(m["month_service"] or 0),
        } for m in monthly_qs]

        # ✅ Per vehicle totals + breakdown
        vehicle_qs = (
            records.values('vehicle__id', 'vehicle__plate_number', 'vehicle__name')
            .annotate(
                fuel_sum=Sum('fuel_cost'),
                service_sum=Sum('service_cost'),
            ).order_by('-fuel_sum', '-service_sum')
        )

        vehicle_totals = []
        for v in vehicle_qs:
            fuel_sum = float(v["fuel_sum"] or 0)
            service_sum = float(v["service_sum"] or 0)
            vehicle_totals.append({
                "vehicle_id": v["vehicle__id"],
                "plate_number": v["vehicle__plate_number"],
                "name": v["vehicle__name"],
                "fuel": fuel_sum,
                "service": service_sum,
                "total": fuel_sum + service_sum,
            })

        # ✅ Top 5 vehicles
        top_vehicles = sorted(vehicle_totals, key=lambda x: x["total"], reverse=True)[:5]

        return Response({
            "summary": {
                "total_fuel": total_fuel,
                "total_service": total_service,
                "total_cost": total_fuel + total_service,
            },
            "daily_data": daily_data,          # ✅ NEW
            "monthly_trends": monthly_trends,
            "vehicle_totals": vehicle_totals,
            "top_vehicles": top_vehicles,
        })
