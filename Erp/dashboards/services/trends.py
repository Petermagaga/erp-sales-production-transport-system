from django.db.models import Sum
from django.db.models.functions import TruncMonth
from sales.models import Sale

def monthly_revenue_trend(company, start_date, end_date):
    qs = (
        Sale.objects
        .filter(company=company, date__range=[start_date, end_date])
        .annotate(month=TruncMonth("date"))
        .values("month")
        .annotate(total=Sum("total_amount"))
        .order_by("month")
    )

    return [
        {
            "month": r["month"].strftime("%Y-%m"),
            "revenue": float(r["total"] or 0)
        }
        for r in qs
    ]
