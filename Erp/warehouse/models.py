from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone


user=get_user_model()

CATEGORY_CHOICES=[
    ("raw", "Raw Material"),
    ("finished", "Finished Product"),
    ("byproduct", "By-product"),
]

UNIT_CHOICES=[
    ("kg","Kilograms"),
    ('pcs',"pieces"),
    ("bag","Bags"),
]

SHIFT_CHOICES=[
    ("shift_1","Shift 1"),
    ("shift_2","Shift 2"),
    ("shift_3","Shift 3"),
]


class Warehouse(models.Model):
    categories=models.CharField(max_length=100,unique=True)
    location=models.CharField(max_length=250,blank=True,null=True)
    
    def __str__(self):
        return self.name
    

class Material(models.Model):
    """
    Represents all items tracked raw finished or byproduct
    """

    name=models.CharField(max_length=200)
    category=models.CharField(max_length=100,choices=CATEGORY_CHOICES)
    unit=models.CharField(max_length=10,choices=UNIT_CHOICES,default="kg")

    def __str__(self):
        return f"{self.name} ({self.category})"
    

class DailyInventory(models.Model):
    """
    Records each day stock for a specific product.
    mirrors your Excel format.
    """
    date=models.DateField(default=timezone.now)
    warehouse=models.ForeignKey(Warehouse,on_delete=models.CASCADE,related_name="daily_inventory")
    material=models.ForeignKey(Material,on_delete=models.CASCADE,related_name="daily_records")

    opening_balance=models.DecimalField(max_digits=14,decimal_places=2,default=0)
    raw_in =models.DecimalField(max_digits=14,decimal_places=2,default=0,help_text="Raw material received/produced")
    shift_1=models.DecimalField(max_digits=14,decimal_places=2,default=0)
    shift_2=models.DecimalField(max_digits=14,decimal_places=2,default=0)
    shift_3=models.DecimalField(max_digits=14,decimal_places=2,default=0)
    closing_balance=models.DecimalField(max_digits=14,decimal_places=2,default=0)

    created_at=models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together=("warehouse","material","date")
        ordering=["-date"]

    def calculate_closing(self):
        used=(self.shift_1 or 0) + (self.shift_2 or 0) +(self.shift_3 or 0)
        return(self.opening_balance or 0) + (self.raw_in or 0)-used
    def save(self,*args,**kwargs):
        self.closing_balance=self.calculate_closing()
        super().save(*args,**kwargs)

    def __str__(self):
        return f"{self.date} | {self.Warehouse.name} | {self.material.name}"
    


class WarehouseAnalytics(models.Model):
    """
    Aggregated analytics per day-helps generate dashboard graphs
    """

    date=models.DateField(default=timezone.now)
    warehouse=models.ForeignKey(Warehouse,on_delete=models.CASCADE,related_name="analytics")
    total_raw_in=models.DecimalField(max_digits=14,decimal_places=2,default=0)
    total_output=models.DecimalField(max_digits=14,decimal_places=2,default=0)
    total_waste=models.DecimalField(max_digits=14,decimal_places=2,default=0)
    efficiency_rate=models.DecimalField(max_digits=14,default=0,decimal_places=2)

    def calculate_effiency(self):
        if self.total_raw_in>0:
            return (self.total_output/self.total_raw_in)*100
        return 0
    
    def save(self,*args,**kwargs):
        self.efficiency_rate=self.calculate_effiency()
        super().save(*args,**kwargs)

    def __str__(self):
        return f"Analytics {self.date} - {self.warehouse.name}"
    
