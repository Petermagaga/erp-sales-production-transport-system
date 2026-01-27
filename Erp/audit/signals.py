from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.contenttypes.models import ContentType
from django.db import transaction

from auditt.models import AuditLog
from auditt.middleware import get_current_user

AUDITED_APPS = {
    "transport",
    "sales",
    "warehouse",
    "production",
    "milling",
}


def serialize_instance(instance):
    return {
        field.name: str(getattr(instance, field.name))
        for field in instance._meta.fields
    }


@receiver(pre_save)
def audit_pre_save(sender, instance, **kwargs):
    if sender._meta.app_label not in AUDITED_APPS:
        return

    if not instance.pk:
        return

    try:
        old = sender.objects.get(pk=instance.pk)
        instance._old_data = serialize_instance(old)
    except sender.DoesNotExist:
        instance._old_data = None


@receiver(post_save)
def audit_post_save(sender, instance, created, **kwargs):

    if sender is AuditLog:
        return

    if sender._meta.app_label not in AUDITED_APPS:
        return

    user = get_current_user()
    if user and not user.is_authenticated:
        user = None

    ct = ContentType.objects.get_for_model(
        sender,
        for_concrete_model=False,
    )

    action = "create" if created else "update"

    changes = None
    if hasattr(instance, "_old_data") and instance._old_data:
        new_data = serialize_instance(instance)
        changes = {
            k: {"from": instance._old_data[k], "to": new_data[k]}
            for k in new_data
            if instance._old_data.get(k) != new_data.get(k)
        }

    with transaction.atomic():
        AuditLog.objects.create(
            user=user,
            action=action,
            module=sender._meta.app_label,
            content_type=ct,
            object_id=instance.pk,
            changes=changes,
        )


@receiver(post_delete)
def audit_post_delete(sender, instance, **kwargs):

    if sender._meta.app_label not in AUDITED_APPS:
        return

    ct = ContentType.objects.get_for_model(
        sender,
        for_concrete_model=False,
    )

    user = get_current_user()
    if user and not user.is_authenticated:
        user = None

    with transaction.atomic():
        AuditLog.objects.create(
            user=user,
            action="delete",
            module=sender._meta.app_label,
            content_type=ct,
            object_id=instance.pk,
            changes=serialize_instance(instance),
        )
