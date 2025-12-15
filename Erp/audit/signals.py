from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.apps import apps
from django.utils.timezone import now

from core.middleware import get_current_request
from .models import AuditLog


# Only audit business apps (VERY IMPORTANT)
AUDITED_APPS = {
    "sales",
    "warehouse",
    "transport",
    "marketing",
}


def should_audit(sender):
    return (
        sender._meta.app_label in AUDITED_APPS
        and sender._meta.model_name != "auditlog"
    )


def serialize_instance(instance):
    """
    Safe serialization for audit logs
    """
    data = {}
    for field in instance._meta.fields:
        value = getattr(instance, field.name, None)
        data[field.name] = str(value) if value is not None else None
    return data


def get_request_context():
    request = get_current_request()
    if not request:
        return None, None, None

    user = request.user if request.user.is_authenticated else None
    ip = request.META.get("REMOTE_ADDR")
    ua = request.META.get("HTTP_USER_AGENT")

    return user, ip, ua


# =========================
# PRE SAVE — capture OLD DATA
# =========================
@receiver(pre_save)
def audit_pre_save(sender, instance, **kwargs):
    if not should_audit(sender):
        return

    if not instance.pk:
        instance._audit_old_data = None
        return

    try:
        old = sender.objects.get(pk=instance.pk)
        instance._audit_old_data = serialize_instance(old)
    except sender.DoesNotExist:
        instance._audit_old_data = None


# =========================
# POST SAVE — CREATE / UPDATE
# =========================
@receiver(post_save)
def audit_post_save(sender, instance, created, **kwargs):
    if not should_audit(sender):
        return

    user, ip, ua = get_request_context()

    AuditLog.objects.create(
        user=user,
        action="CREATE" if created else "UPDATE",
        module=sender._meta.app_label,
        model_name=sender.__name__,
        object_id=str(instance.pk),
        old_data=None if created else getattr(instance, "_audit_old_data", None),
        new_data=serialize_instance(instance),
        ip_address=ip,
        user_agent=ua,
    )


# =========================
# PRE DELETE — capture OLD DATA
# =========================
@receiver(pre_delete)
def audit_pre_delete(sender, instance, **kwargs):
    if not should_audit(sender):
        return

    instance._audit_old_data = serialize_instance(instance)


# =========================
# POST DELETE — DELETE LOG
# =========================
@receiver(post_delete)
def audit_post_delete(sender, instance, **kwargs):
    if not should_audit(sender):
        return

    user, ip, ua = get_request_context()

    AuditLog.objects.create(
        user=user,
        action="DELETE",
        module=sender._meta.app_label,
        model_name=sender.__name__,
        object_id=str(instance.pk),
        old_data=getattr(instance, "_audit_old_data", None),
        new_data=None,
        ip_address=ip,
        user_agent=ua,
    )
