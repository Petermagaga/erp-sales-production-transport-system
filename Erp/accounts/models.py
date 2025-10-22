from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('sales', 'Sales'),
        ('marketing', 'Marketing'),
    )
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='sales')
    phone = models.CharField(max_length=20, blank=True, null=True)

    def is_admin(self):
        return self.role == 'admin' or self.is_superuser

    def is_sales(self):
        return self.role == 'sales'

    def is_marketing(self):
        return self.role == 'marketing'
