from django.contrib.contenttypes.models import ContentType
from auditt.models import AuditLog


def log_action(request, action, instance):
    content_type = ContentType.objects.get_for_model(instance.__class__)

    AuditLog.objects.create(
        user=request.user,
        action=action,
        app_label=instance._meta.app_label,
        model=instance.__class__.__name__,
        object_id=instance.pk,
        content_type=content_type,
        ip_address=get_client_ip(request),
    )


def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0]
    return request.META.get("REMOTE_ADDR")
