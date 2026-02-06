from django.db.models.signals import post_save
from cores.models import Company
from django.dispatch import receiver
from .models import LeaveBalance,LeaveRequest,LeaveType
from django.contrib.auth import get_user_model

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

@receiver(post_save,sender=Company)
def create_default_leave_types(sender,instance,created,**kwargs):
    if not created:
        return
    
    LeaveType.objects.bulk_create(
        [
            LeaveType(
                company=instance,
                name="Annual Leave",
                max_days_per_year=21,
            ),
            LeaveType(
                company=instance,
                name="sick leave",
                max_days_per_year=14,
            ),
            LeaveType(
                company=instance,
                name="Maternity LEAVE",
                max_days_per_year=90,
                requires_balance=False,

            ),
        ]
    )



User =get_user_model()

@receiver(post_save,sender=LeaveType)
def create_balnces_for_leave_type(sender,instance,created,**kwargs):
    if not created:
        return
    
    users=User.objects.filter(company=instance.company)
    for user in users:
        LeaveBalance.objects.get_or_create(
            user=user,
            company=instance.company,
            leave_type=instance,
            defaults={"earned_days":instance.max_days_per_year}
        )