from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings
from cores.models import Company,Branch
from cores.querysets import CompanyQuerySet

user = get_user_model()

# --- CHOICES ---

CATEGORY_CHOICES = [
     
        ("raw_material", "Raw Material"),
        ("final_product", "Final Product"),
        ("by_product", "By-Product"),
        ("stock_out", "Stock out"),
        ("Balance_In_Store", "Balance In Store"),
    ]
UNIT_CHOICES = [
    ("kg", "Kilograms"),
    ("pcs", "Pieces"),
    ("bag", "Bags"),
]

SHIFT_CHOICES = [
    ("shift_1", "Shift 1"),
    ("shift_2", "Shift 2"),
    ("shift_3", "Shift 3"),
]





# --- CORE MODELS ---

class Material(models.Model):
    """
    Represents any item tracked — raw, finished, or by-product.
    """

    STATUS_CHOICES = (
        ("draft", "Draft"),
        ("pending", "Pending Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES, default="kg")

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

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
        related_name="approved_materials"
    )

    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together=('name','category')
        ordering =['name']

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class DailyInventory(models.Model):
    """
    Records daily stock levels for a specific material.
    Auto-calculates closing balance and variance.
    """
    company=models.ForeignKey(Company,on_delete=models.CASCADE,null=True,blank=True)
    branch= models.ForeignKey(Branch,on_delete=models.CASCADE,null=True,blank=True)
    
    date = models.DateField(default=timezone.now)
    material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name="daily_records")

    opening_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    raw_in = models.DecimalField(max_digits=14, decimal_places=2, default=0, help_text="Raw material received/produced")
    shift_1 = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    shift_2 = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    shift_3 = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    total_shift_output = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    closing_balance = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    variance = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by=models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null= True,
        related_name="materials"
    )
    objects =CompanyQuerySet.as_manager()

    class Meta:
        unique_together = ("material", "date")
        ordering = ["-date"]

    def calculate_totals(self):
        used = (self.shift_1 or 0) + (self.shift_2 or 0) + (self.shift_3 or 0)
        closing = (self.opening_balance or 0) + (self.raw_in or 0) - used
        variance = closing - ((self.opening_balance or 0) + (self.raw_in or 0) - used)
        return used, closing, variance

    def save(self, *args, **kwargs):
        used, closing, variance = self.calculate_totals()
        self.total_shift_output = used
        self.closing_balance = closing
        self.variance = variance
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.date} | {self.material.name}"


class WarehouseAnalytics(models.Model):
    """
    Daily aggregated analytics for dashboards and reports.
    """
    date = models.DateField(default=timezone.now, unique=True)
    total_raw_in = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_output = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total_waste = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    efficiency_rate = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    def calculate_efficiency(self):
        if self.total_raw_in==0:
            return 0
        return (self.total_output / self.total_raw_in * 100) if self.total_raw_in > 0 else 0

    def save(self, *args, **kwargs):
        self.efficiency_rate = self.calculate_efficiency()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Analytics {self.date}"
