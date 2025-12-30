from .models import Notification
from accounts.models import User

def notify_user(
  *,
  user,
  company,
  title,
  message,
  notification_type="info",
  module="",
  object_id=None,
):
    Notification.objects.Create(
        user=user,
        company=company,
        title=title,
        message=message,
        notification_type=notification_type,
        module=module,
        object_id=object_id,
    )


def notify_role(
        *,
        role,
        company,
        title,
        message,
        module="",
        object_id=None
):
    users= User.objects.filter(
        role=role,
        company=company,
        is_active=True
    )

    for user in users:
        notify_user(

            user=user,
            company=company,
            title=title,
            message=message,
            module=module,
            object_id=object_id,
        )