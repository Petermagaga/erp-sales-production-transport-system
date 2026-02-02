from django.db.models.signals import post_save

from django.dispatch import receiver
from .models import LeaveBalance,LeaveRequest

@receiver(post_save,sender=LeaveRequest)
def update_leave_balance(sender,instance,created,**kwargs):
    if instance.status =="approved":
        balance = LeaveBalance.objects.get(
            user=instance.user,
            leave_type=instance.leave_type
        )

        if balance.used_days + instance.total_days <= balance.earned_days:
            balance.used_days+=instance.total_days
            balance.save()