from celery import shared_task
from .models import Subscription
from .services import update_subscription_status  # or utils

@shared_task
def check_subscriptions():
    for sub in Subscription.objects.all():
        update_subscription_status(sub)
