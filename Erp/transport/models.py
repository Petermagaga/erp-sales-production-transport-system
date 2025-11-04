from django.db import models

class Vehicle(models.Model):
    name=models.CharField(max_length=100)
    plate_number=models.CharField(max_length=100)
    category=models.CharField(
        max_length=50,
        choices=[
            ('lorry','Lorry'),
            ('probox','Probox'),
            ('landcruiser','landcruiser'),
        ],
        default="probox"
    )

    driver_name=models.CharField(max_length=60)
    active=models.BooleanField(default=True)

    class Meta:
        ordering=['plate_number']
    def __str__(self):
        return f"{self.plate_number} -{self.name}"
    


class TransportRecord(models.Model):
    
    """
    DAILY traNSPORT/LOGISTICS COSTS FOR A VEHICLE
    """
    vehicle=models.ForeignKey(Vehicle,on_delete=models.CASCADE,related_name='records')
    date=models.DateField()
    fuel_cost=models.DecimalField(max_digits=10,decimal_places=2,default=0)
    service_cost=models.DecimalField(max_digits=10,decimal_places=2,default=0)
    mechanical_issues=models.TextField(blank=True,null=True)
    created_at=models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering=['-date']
        unique_together=('vehicle','date')

    def __str__(self):
        return f"{self.Vehicle.plate_number} - {self.date.isoformat()}"

    def total_cost(self):
        return (self.fuel_cost or 0)+(self.service_cost or 0)

