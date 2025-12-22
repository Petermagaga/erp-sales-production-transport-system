from auditt.models import AuditLog

def log_action(
    user,
    action,
    module,
    model_name,
    object_id=None,
    old_data=None,
    new_data=None,
    request=None,
):
    AuditLog.objects.create(
        user=user,
        action=action,
        module=module,
        model_name=model_name,
        object_id=object_id,
        old_data=old_data,
        new_data=new_data,
        ip_address=getattr(request, "META", {}).get("REMOTE_ADDR"),
        user_agent=getattr(request, "META", {}).get("HTTP_USER_AGENT"),
    )
