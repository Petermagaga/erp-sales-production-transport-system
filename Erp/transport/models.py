from django.db import models
from django.conf import settings
from cores.models import Company, Branch
from cores.querysets import CompanyQuerySet




class Vehicle(models.Model):
    name = models.CharField(max_length=100)
    plate_number = models.CharField(max_length=100)
    category = models.CharField(
        max_length=50,
        choices=[
            ('lorry', 'Lorry'),
            ('probox', 'Probox'),
            ('landcruiser', 'Land Cruiser'),
        ],
        default="probox"
    )
    driver_name = models.CharField(max_length=60)
    created_at=models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)

    class Meta:
        ordering = ['plate_number']

    def __str__(self):
        return f"{self.plate_number} - {self.name}"


class TransportRecord(models.Model):
    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("pending", "Pending Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )   

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='records')
    date = models.DateField()
    fuel_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    service_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    mechanical_issues = models.TextField(blank=True, null=True)
    company=models.ForeignKey(Company,on_delete=models.CASCADE)
    branch= models.ForeignKey(Branch,on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by=models.ForeignKey(settings.AUTH_USER_MODEL,on_delete=models.SET_NULL,null=True,related_name="transport_records")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="draft"
    )

    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_transport_records"
    )

    approved_at = models.DateTimeField(null=True, blank=True)

    objects= CompanyQuerySet.as_manager()
    
    class Meta:
        ordering = ['-date']
        constraints = [
            models.UniqueConstraint(fields=['vehicle', 'date'], name='unique_vehicle_date')
        ]

    def __str__(self):
        return f"{self.vehicle.plate_number} - {self.date}"

    def total_cost(self):
        return (self.fuel_cost or 0) + (self.service_cost or 0)
    