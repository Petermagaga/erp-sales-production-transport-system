from django.contrib.auth.models import AbstractUser,Group,Permission
from django.db import models
from django.conf import settings
from cores.models import Branch,Company

class User(AbstractUser):
    ROLE_CHOICES= (
        ('admin','Admin'),
        ('transporter','Transporter'),
        ('warehouse','Warehouse'),
        ('sales','Sales'),
        ('marketing','Marketing'),
    )

    DEPARTMENT=(
        ('administration',"Administration"),
        ('field','Field'),
        ('warehousing','Warehousing'),
        ('transport','Transport'),
    )

    role=models.CharField(max_length=30,choices=ROLE_CHOICES,default='sales')
    phone=models.CharField(max_length=34,blank=True,null=True)

    department=models.CharField(max_length=20,choices=DEPARTMENT,default='field')
    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    is_deleted =models.BooleanField(default=False)
    company=models.ForeignKey(Company,on_delete=models.CASCADE,null=True,blank=True)
    branch=models.ForeignKey(Branch,on_delete=models.CASCADE,null=True,blank=True)
    
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    def is_company_admin(self):
        return self.role == "admin"
    
    def is_branch_user(self):
        return self.branch is not None

    
    def is_admin(self):
        return self.role=='admin' or self.is_superuser
    
    def is_sales(self):
        return self.role=='sales'
    
    def is_transport(self):
        return self.role=="transporter"
    
    def is_warehouse(self):
        return self.role=="warehouse"
    
    def is_marketing(self):
        return self.role=="marketing"
    
