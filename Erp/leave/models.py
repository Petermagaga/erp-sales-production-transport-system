from django.db import models
from cores.models import Company
from django.core.exceptions import ValidationError
from django.conf import settings

class LeaveType(models.Model):
    company=models.ForeignKey(Company,on_delete=models.CASCADE)
    name=models.CharField(max_length=50)
    description=models.TextField(blank=True)

    max_days_per_year = models.PositiveBigIntegerField()
    requires_balance = models.BooleanField(default=True)
    active =models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.company.name})"


class LeaveRequest(models.Model):
    STATUS_CHOICES=(
        ("draft","Draft"),
        ("pending","Pending"),
        ("approved","Approved"),
        ("rejected","Rejected")
    )

    company=models.ForeignKey(Company,on_delete=models.CASCADE)
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)

    leave_type= models.ForeignKey(LeaveType,on_delete=models.PROTECT)

    start_date= models.DateField()
    end_date=models.DateField()
    total_days=models.PositiveBigIntegerField(editable=False)

    reason=models.TextField()

    status=models.CharField(
        max_length=20,choices=STATUS_CHOICES,default="draft"
    )
    submitted_at=models.DateTimeField(null=True,blank=True)

    decision_by=models.ForeignKey(
    settings.AUTH_USER_MODEL,
    null=True,
    blank=True,
    related_name="leave_decisions",
    on_delete=models.SET_NULL
    )
    decision_at =models.DateTimeField(null=True,blank=True)
    decision_comment=models.TextField(blank=True)

    created_at=models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.start_date>self.end_date:
            raise ValidationError("End date cannot be before start date")
    
    def save(self,*args,**kwargs):
        self.total_days=(self.end_date - self.start_date).days+1
        super().save(*args,**kwargs)

    def __str__(self):
        return f"{self.user} - {self.leave_type.name} ({self.status})"

class LeaveBalance(models.Model):
    company=models.ForeignKey(Company,on_delete=models.CASCADE)
    user=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.CASCADE)
    leave_type=models.ForeignKey(LeaveType,on_delete=models.CASCADE)

    earned_days = models.PositiveIntegerField(default=0)
    used_days=models.PositiveIntegerField(default=0)
    class Meta:
        unique_together =("user","leave_type")

    @property
    def remaining_days(self):
        return self.earned_days -self.used_days
    
    def __str__(self):
        return f"{self.user} - {self.leave_type.name}: {self.remaining_days}"
    

    

