from django.db import models
from cores.models import Company

# Create your models here.
class Plan(models.Model):
    INTERVAL_CHOICES = (
        ("monthly","Monthly"),
        ("yearly","Yearly"),
    )

    name = models.CharField(max_length=100,unique=True)
    price= models.DecimalField(max_digits=10,decimal_places=2)
    interval =models.CharField(max_length=23,choices=INTERVAL_CHOICES)

    max_users = models.PositiveIntegerField()
    max_branches=models.PositiveIntegerField()

    enable_transport=models.BooleanField(default=True)
    enable_warehouse=models.BooleanField(default=True)
    enable_sales=models.BooleanField(default=True)
    enable_marketing= models.BooleanField(default=True)

    is_active=models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Subscription(models.Model):
    STATUS_CHOICE =(

        ("trial","Trial"),
        ("active","Active"),
        ("past_due","Past_due"),
        ("suspended","Suspended"),
        ("cancelled","Cancelled"),
    )

    company=models.ForeignKey(Company,on_delete=models.CASCADE)
    status=models.CharField(max_length=20,choices=STATUS_CHOICE)

    start_date=models.DateField()
    end_date=models.DateField()

    grace_period_days=models.PositiveIntegerField(default=7)

    def is_valid(self):
        return self.status in ["trial","active"]
    
    def __str__(self):
        return f"{self.company} - {self.plan}"
