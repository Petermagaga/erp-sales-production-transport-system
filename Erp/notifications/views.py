from rest_framework import permissions
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response

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
    
    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({"status": "read"})

