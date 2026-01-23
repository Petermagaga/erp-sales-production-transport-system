from django.contrib.contenttypes.models import ContentType
from auditt.models import AuditLog


def log_action(request, action, instance, old_data=None, new_data=None):
    content_type = ContentType.objects.get_for_model(instance.__class__)

    AuditLog.objects.create(
        user=request.user if request.user.is_authenticated else None,
        action=action.lower(),  # enforce consistency
        module=instance._meta.app_label,
        model_name=instance.__class__.__name__,
        content_type=content_type,
        object_id=instance.pk,
        object_name=str(instance),
        old_data=old_data,
        new_data=new_data,
        ip_address=get_client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT"),
    )

def get_client_ip(request):
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0]
    return request.META.get("REMOTE_ADDR")
