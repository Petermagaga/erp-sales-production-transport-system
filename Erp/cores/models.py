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
