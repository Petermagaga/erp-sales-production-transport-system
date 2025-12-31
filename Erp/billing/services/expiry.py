from django.utils.timezone import now

def update_subscription_status(subscription):
    today = now().date()

    if today > subscription.end_date:
        if subscription.status == "active":
            subscription.status = "past_due"
        elif subscription.status == "past_due":
            subscription.status = "suspended"
        subscription.save()
