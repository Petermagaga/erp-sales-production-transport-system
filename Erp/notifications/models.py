from django.db import models
from django.conf import settings
from cores.models import Company

class Notification(models.Model):
    TYPE_CHOICES = (
        ("info","Info"),
        ("success","Success"),
        ("warning","Warning"),
        ("error","Error"),
    )


    user= models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"

    )

    Company=models.ForeignKey(
        Company,on_delete=models.CASCADE,
    )

    title=models.CharField(max_length=255)
    message=models.TextField()
    notification_type=models.CharField(
        max_length=20,
        choices= TYPE_CHOICES,
        default="info"
    )

    is_read= models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)

    module= models.CharField(max_length=50,blank=True)
    object_id=models.PositiveIntegerField(null=True,blank=True)
    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} - {self.title}"
    