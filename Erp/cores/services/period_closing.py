from transport.models import TransportRecord
from warehouse.models import DailyInventory
from notifications.services import notify_role

def can_close_period(company,year,month):
    pending_transport=TransportRecord.objects.filter(
        company=company,
        date__year=year,
        date__month=month,
        status__in=["draft","pending"]

    ).exists()

    pending_inventory = DailyInventory.objects.filter(
        company=company,
        date__year=year,
        date__month=month,
        status__in=["draft","pending"]
    ).exists()


    return not (pending_transport or pending_inventory)

def notify_pre_close(company, year, month):
    notify_role(
        role="admin",
        company=company,
        title="Period closing soon",
        message=f"The accounting period {year}-{month} will auto-close soon. Please finalize pending records",
        module="accounting"

    )

