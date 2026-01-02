from django.db.models import Sum
from datetime import date
from sales.models import Sale
from transport.models import TransportRecord
from warehouse.models import DailyInventory

def get_company_kpis(company, start_date, end_date):
    sales = Sale.objects.filter(
        salesperson__company=company,
        date__range=[start_date, end_date]
    )

    transport = TransportRecord.objects.filter(
        company=company,
        date__range=[start_date, end_date]
    )

    inventory = DailyInventory.objects.filter(
        company=company,
        date__range=[start_date, end_date]
    )

    total_revenue = sales.aggregate(
        total=Sum("total_amount")
    )["total"] or 0

    transport_cost = transport.aggregate(
        total=Sum("fuel_cost") + Sum("service_cost")
    )["total"] or 0

    inventory_waste = inventory.aggregate(
        total=Sum("raw_in") - Sum("closing_balance")
    )["total"] or 0

    profit = total_revenue - transport_cost

    return {
        "revenue": float(total_revenue),
        "transport_cost": float(transport_cost),
        "inventory_waste": float(inventory_waste),
        "profit": float(profit),
    }
