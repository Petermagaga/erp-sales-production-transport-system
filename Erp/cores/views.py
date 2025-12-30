from django.shortcuts import render

# Create your views here.
from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import action
from django.utils.timezone import now
from cores.models import AccountingPeriod

class AccountingPeriodViewSet(ModelViewSet):
    queryset = AccountingPeriod.objects.all()
    permission_classes = [IsAdminUser]

    @action(detail=True, methods=["post"])
    def lock(self, request, pk=None):
        period = self.get_object()
        period.is_locked = True
        period.locked_at = now()
        period.locked_by = request.user
        period.save()
        return Response({"status": "locked"})

    @action(detail=True, methods=["post"])
    def unlock(self, request, pk=None):
        period = self.get_object()
        period.is_locked = False
        period.locked_at = None
        period.locked_by = None
        period.save()
        return Response({"status": "unlocked"})
