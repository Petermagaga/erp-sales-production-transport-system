from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from .models import AuditLog
from .middleware import get_current_user

def serialize_instance(instance):
    data = {}
    for field in instance._meta.fields:
        data[field.name] = str(getattr(instance, field.name))
    return data

@receiver(pre_save)
def capture_before_update(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old = sender.objects.get(pk=instance.pk)
        instance._old_data = serialize_instance(old)
    except Exception:
        instance._old_data = None

@receiver(post_save)
def log_save(sender, instance, created, **kwargs):
    if sender is AuditLog:
        return

    ct = ContentType.objects.get_for_model(sender, for_concrete_model=True)
    if not ct:
        return

    user = get_current_user()
    if user and not user.is_authenticated:
        user = None

    action = "create" if created else "update"

    changes = None
    if hasattr(instance, "_old_data") and instance._old_data:
        new_data = serialize_instance(instance)
        changes = {
            k: {"from": instance._old_data.get(k), "to": new_data.get(k)}
            for k in new_data
            if instance._old_data.get(k) != new_data.get(k)
        }

    AuditLog.objects.create(
        user=user,
        action=action,
        module=sender._meta.app_label,
        content_type=ct,
        object_id=instance.pk,
        changes=changes,
    )

@receiver(post_delete)
def log_delete(sender, instance, **kwargs):
    if sender is AuditLog:
        return

    ct = ContentType.objects.get_for_model(sender, for_concrete_model=True)
    if not ct:
        return

    user = get_current_user()
    if user and not user.is_authenticated:
        user = None

    AuditLog.objects.create(
        user=user,
        action="delete",
        module=sender._meta.app_label,
        content_type=ct,
        object_id=instance.pk,
        changes=serialize_instance(instance),
    )
