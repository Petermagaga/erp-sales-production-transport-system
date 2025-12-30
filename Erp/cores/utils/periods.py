from cores.models import AccountingPeriod

def is_period_locked(*,company,date):

    period = AccountingPeriod.objects.filter(
        company=company,
        year=date.year,
        month=date.month,
        is_locked=True

    ).first()

    return period is not None