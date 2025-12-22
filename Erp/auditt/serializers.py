from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    content_type = serializers.CharField(source="content_type.model", read_only=True)

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user",
            "action",
            "module",
            "content_type",
            "object_id",
            "changes",
            "ip_address",
            "user_agent",
            "created_at",
        ]
        read_only_fields = fields

    def get_user(self, obj):
        """
        Safely serialize user info without coupling to a specific UserSerializer
        """
        if not obj.user:
            return None

        return {
            "id": obj.user.id,
            "username": getattr(obj.user, "username", None),
            "email": getattr(obj.user, "email", None),
        }
