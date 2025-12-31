from datetime import timedelta,date
from billing.models import Plan,Subscription

def create_trial_subscription(company):
    
    plan= Plan.objects.get(name="Trial")
    subscription=Subscription.objects.create(
        company=company,
        plan=plan,
        status="trial",
        start_date=date.today(),
        end_date=date.today() + timedelta(days=14),
    )
