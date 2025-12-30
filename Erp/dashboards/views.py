from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from datetime import date, timedelta

from .permissions import IsExecutive
from .services.kpis import get_company_kpis
from .services.trends import monthly_revenue_trend
from .services.alerts import get_executive_alerts


class ExecutiveDashboardView(APIView):
    permission_classes= [IsAuthenticated,IsExecutive]

    def get(self,request):
        company=request.user.company

        end_date =date.today()
        start_date= end_date-timedelta(days=90)


        return Response(
            {
             "kpis":get_company_kpis(company,start_date,end_date),
             "revenue_trend":monthly_revenue_trend(company,start_date,end_date),
             "alerts":get_executive_alerts(company)   ,
            }
        )