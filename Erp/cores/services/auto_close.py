from django.utils.timezone import now
from cores.models import AccountingPeriod
from cores.services.period_closing import can_close_period
from notifications.services import notify_role

def auto_close_period(company, year, month):
    period, _ = AccountingPeriod.objects.get_or_create(
        company=company,
        year=year,
        month=month
    )

    if period.is_locked:
        return False

    if not can_close_period(company, year, month):
        return False

    period.is_locked = True
    period.locked_at = now()
    period.locked_by = None  # system
    period.save()

    notify_role(
        role="admin",
        company=company,
        title="Period closed automatically",
        message=f"The accounting period {year}-{month} has been automatically locked.",
        module="accounting"
    )

    return True
