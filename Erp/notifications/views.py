from rest_framework import permissions
from rest_framework.viewsets import ReadOnlyModelViewSet
from .serializers import NotificationSerializer
from .models import Notification

class NotificationViewset(ReadOnlyModelViewSet):
    serializer_class=NotificationSerializer
    permission_classes=permissions.IsAuthenticated

    def get_queryset(self):
        user=self.request.user
        return Notification.objects.filter(
            user=user,
            company=user.company
        )
    

    