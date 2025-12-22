from auditt.models import AuditLog

def log_action(request,action,instance):
    AuditLog.objects.create(
        user=request.user,
        module=request.path.split("/")[1],
        action=action,
        object_name=instance.__class__.__name__,
        object_id=instance.id,
        ip_address=request.META.get("REMOTE_ADDR")

    )