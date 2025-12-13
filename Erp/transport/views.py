from django.db.models import Sum
from django.db.models.functions import TruncDay,TruncMonth
from rest_framework import viewsets,status
from rest_framework.decorators import action
from  rest_framework.response import Response
from rest_framework.parsers import JSONParser
from django.utils.dateparse import parse_date
from datetime import datetime,timedelta


from .models import Vehicle,TransportRecord
from .serializers import VehicleSerializer,TransportRecordSerializer
from accounts.permissions import ModulePermission



class VehicleViewSet(viewsets.ModelViewSet):
    queryset=Vehicle.objects.all().order_by("plate_number")
    serializer_class=VehicleSerializer

    permission_classes=[ModulePermission]
    module_name="transport"



class TransportRecordViewSet(viewsets.ModelViewSet):

    queryset=(
        TransportRecord.objects.select_related("vehicle").all().order_by("-date"))
    

    serializer_class=TransportRecordSerializer
    parser_classes=[JSONParser]

    permission_classes=[ModulePermission]
    module_name="transport"

    def get_queryset(self):
        qs=super().get_queryset()

        vehicles_id = self.request.query_params.get("vehicle")
        start=self.request.query_params.get("start_date")
        end=self.request.query_params.get("end_date")

        if vehicles_id:
            qs=qs.filter(vehicles__id=vehicles_id)
        
        if start:
            date_obj= parse_date(start)
            if date_obj:
                qs=qs.filter(date__gte=date_obj)

        if end:
            date_obj=parse_date(end)
            if date_obj:
                qs=qs.filter(date__lte=date_obj)
        return qs
    
    @action(
        detail=False,
        method=['get'],
        permission_classes=[ModulePermission]
    )

    def analytics(self,request):
        if request.method != "GET":
            return Response(
                {"detail":"Analytics is read-only"},
                status=status.HTTP_403_FORBIDDEN
            )
        start_param=request.query_params.get("start_date")
        end_param=request.query_params.get("end_date")

        start_date=parse_date(start_param) if start_param else(
            datetime.today() -timedelta(days=30)
        ).date()

        end_date=parse_date(end_param) if end_param else datetime.today().date()

        records= TransportRecord.objects.filter(
            date__range=[start_date,end_date]
        )


        vehicle_param=request.query_params.get("vehicle")
        if vehicle_param:
            records=records.filter(vehicles__id=int(vehicle_param))


        
        totals =records.aggregate(
            total_fuel=Sum("fuel_cost"),
            total_service=Sum("service_cost"),
        )

        total_fuel=float(totals["total_fuel"] or 0)
        total_service=float(totals["total_service"] or 0)


        daily_qs =(
            records.annotate(day=TruncDay("date"))
            .values("day")
            .annotate(
              fuel=Sum("fuel_cost"),
              service=Sum("service_cost")  
            )
            .order_by("day")
 
 
        )

        daily_data=[
            {
                "date":d["day"].strftime("%Y-%m-%d"),
                "fuel":float(d["fuel"] or 0),
                "service":float(d["service"] or 0),
            }
            for d in daily_qs
        ]
        
        monthly_qs= (
            records.annotate(month=TruncMonth("date"))
            .values("month")
            .annotate(
                month_fuel=Sum("fuel_cost"),
                month_service=Sum("service_cost")
            )
            .order_by("month")
        )
        monthly_trends=[
            {
                "month":m["month"].strftime("%Y -%m"),
                "fuel":float(m["month_fuel"] or 0),
                "service":float(m["month_service"] or 0),
                "total":float(m["month_fuel"] or 0 + float(m["month_service"] or 0))
            }

            for m in monthly_qs

        ]
        vehicles_qs=(
            records.values("vehicle__id","vehicle__plate_number","vehicle_name")
            .annotate(
                fuel_sum=Sum("fuel_cost"),
                service_sum=Sum("service_cost"),
            )
            .order_by("-fuel_sum","-service_sum")
        )
        vehicle__totals=[]
        for v in vehicles_qs:
            fuel_sum=float(v["fuel_sum"] or 0)
            service_sum=float(v["service_sum"] or 0)

            vehicle__totals.append({
                "vehicle_id":v["vehicle__id"],
                "plate_number":v["vehicle__plate_number"],
                "name":v["vehicle__name"],
                "fuel":fuel_sum,
                "service":service_sum,
                "total":fuel_sum+service_sum,
            })


        top_vehicles=sorted(
            vehicle__totals,key=lambda x:x["total"], reverse=True

        )[:5]

        return Response({

            "summary":{
                "total_fuel":total_fuel,
                "total_service":total_service,
                "total_cost":total_fuel + total_service,
            },
            "daily_data":daily_data,
            "monthly_trends":monthly_trends,
            "vehicle_totals": vehicle__totals,
            "top_vehicles":top_vehicles,

        })






