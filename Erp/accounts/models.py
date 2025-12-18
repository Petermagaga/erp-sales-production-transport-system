from django.contrib.auth.models import AbstractUser,Group,Permission
from django.db import models
from django.conf import settings

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

    def __str__(self):
        return f"{self.username} ({self.role})"
    
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
    
class AuditLog(models.Model):
    ACTIONS = (
        ("CREATE", "CREATE"),
        ("UPDATE", "UPDATE"),
        ("DELETE", "DELETE"),
        ("LOGIN", "LOGIN"),
        ("LOGOUT", "LOGOUT"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    module = models.CharField(max_length=50)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=50, null=True, blank=True)

    action = models.CharField(max_length=20, choices=ACTIONS)

    old_data = models.JSONField(null=True, blank=True)
    new_data = models.JSONField(null=True, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} {self.action} {self.model_name} ({self.object_id})"
