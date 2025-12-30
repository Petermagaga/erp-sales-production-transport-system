from django.db import models

class Company(models.Model):
    name=models.CharField(max_length=255,unique=True)
    registration_number= models.CharField(max_length=100,blank=True)
    is_active=models.BooleanField(default=True)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    


class Branch(models.Model):
    company=models.ForeignKey(Company,on_delete=models.CASCADE,related_name="branches")
    name=models.CharField(max_length=233)
    location=models.CharField(max_length=33)
    is_active=models.BooleanField(default=True)


    class Meta:
        unique_together=("company","name")

    
    def __str__(self):
        return f"{self.company.name} - {self.name}"


class AccountingPeriod(models.Model):
    company=models.ForeignKey("cores.company",on_delete=models.CASCADE)
    year=models.PositiveIntegerField()
    month=models.PositiveIntegerField()
    is_locked=models.BooleanField(default=False)

    locked_at=models.DateTimeField(null=True,blank=True)
    locked_by=models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    class Meta:
        unique_together= ("company","year","month")
        ordering= ["-year","-month"]


    def __str__(self):
        status = "Locked" if self.is_locked else "Open"

        return f"{self.company} - {self.year}-{self.month} ({status})"