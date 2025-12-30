from celery import shared_task
from datetime import date
from cores.models import Company
from cores.services.auto_close import auto_close_period

@shared_task
def auto_close_last_month():
    today = date.today()
    year = today.year
    month = today.month - 1 or 12
    if today.month == 1:
        year -= 1

    for company in Company.objects.all():
        auto_close_period(company, year, month)
