from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from cores.models import Company,Branch
from cores.querysets import CompanyQuerySet


User=get_user_model()


SHIFT_CHOICES =[
    ('morning','Morning'),
    ('evening',"Evening"),
]


class MillingBatch(models.Model):
    """
    Tracks milling production per shift and batch for MillingBatch
    """


    company=models.ForeignKey(Company,on_delete=models.CASCADE,null=True,blank=True)
    branch=models.ForeignKey(Branch,on_delete=models.CASCADE,null=True,blank=True)

    date=models.DateField()
    shift=models.CharField(max_length=30,choices=SHIFT_CHOICES)
    batch_no=models.CharField(max_length=78,unique=True,db_index=True)
    expiry_date=models.DateField()

    premix_kg=models.FloatField(default=0)
    maize_milled_kg=models.FloatField(default=0,validators=[MinValueValidator(0)])

    maize_germ_kg =models.FloatField(default=0,validators=[MinValueValidator(0)])
    maize_chaffs_kg =models.FloatField(default=0,validators=[MinValueValidator(0)])
    waste_kg=models.FloatField(default=0)

    bales=models.PositiveIntegerField(default=0)

    supervisor=models.ForeignKey(
        User,on_delete=models.SET_NULL,null=True,blank=True
    )

    efficiency = models.FloatField(default=0, blank=True, null=True)

    total_output_kg =models.FloatField(default=0,editable=False)
    objects= CompanyQuerySet.as_manager()

    def save(self, *args, **kwargs):
        """
        Auto-calculate total output and efficiency.
        """

        # ✅ Total output
        self.total_output_kg = (
            self.maize_chaffs_kg +
            self.maize_germ_kg +
            self.waste_kg
        )

        # ✅ Efficiency calculation
        try:
            if self.maize_milled_kg > 0:
                produced_kg = self.bales * 25   # assuming 25kg per bale
                self.efficiency = (produced_kg / self.maize_milled_kg) * 100
            else:
                self.efficiency = 0
        except Exception as e:
            print(f"⚠️ Efficiency calculation error: {e}")
            self.efficiency = 0

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.batch_no} | {self.date} | {self.shift}"