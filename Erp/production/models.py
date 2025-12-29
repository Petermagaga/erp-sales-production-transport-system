from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from cores.models import Company, Branch
from cores.querysets import CompanyQuerySet

User = get_user_model()

SHIFT_CHOICES = [
    ('morning', 'Morning'),
    ('evening', 'Evening'),
    ('night', 'Night'),
]


class RawMaterial(models.Model):
    """Tracks daily raw materials input per shift."""
    company = models.ForeignKey(Company, on_delete=models.CASCADE,null=True,blank=True)
    branch = models.ForeignKey(Branch, on_delete=models.CASCADE,null=True,blank=True)

    date = models.DateField()
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES)
    maize_kg = models.FloatField(default=0)
    soya_kg = models.FloatField(default=0)
    sugar_kg = models.FloatField(default=0)
    sorghum_kg = models.FloatField(default=0)
    premix_kg = models.FloatField(default=0)
    total_raw_material = models.FloatField(default=0)
    supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    objects=CompanyQuerySet.as_manager()

    def save(self, *args, **kwargs):
        self.total_raw_material = (
            self.maize_kg + self.soya_kg + self.sugar_kg +
            self.sorghum_kg + self.premix_kg
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.date} - {self.shift}"


class FlourOutput(models.Model):
    """Tracks flour production and by-products per shift."""
    date = models.DateField()
    shift = models.CharField(max_length=20, choices=SHIFT_CHOICES)
    product_name = models.CharField(max_length=100, default="NACONEK CSB 25KG")
    total_bags = models.IntegerField(default=0)
    spillage_kg = models.FloatField(default=0)
    germ_kg = models.FloatField(default=0)
    chaff_kg = models.FloatField(default=0)
    waste_kg = models.FloatField(default=0)
    supervisor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    efficiency=models.FloatField(null=True,blank=True,default=0)

    def save(self, *args, **kwargs):
        # import here to avoid circular import
        from .models import RawMaterial

        try:
            raw = RawMaterial.objects.filter(date=self.date, shift=self.shift).first()
            if raw and raw.total_raw_material > 0:
                self.efficiency_rate = (self.total_bags * 25 / raw.total_raw_material) * 100
            else:
                self.efficiency_rate = None
        except Exception as e:
            print(f"⚠️ Efficiency calculation error: {e}")

        # ✅ call the actual parent save() to store it — not self.save()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} ({self.date} - {self.shift})"

