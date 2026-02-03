from rest_framework import viewsets,permissions,status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.timezone import now

from .models import LeaveRequest,LeaveBalance
from .serializers import LeaveBalanceSerializer,LeaveRequestSerializer
from accounts.permissions import (BaseModulePermission,
                                  IsownerOrAdmin,
                                  ApprovalWorkflowPermission)


class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class=LeaveRequestSerializer
    permission_classes=[BaseModulePermission,
                        IsownerOrAdmin,
                        ApprovalWorkflowPermission]

    module_name="leave"

    def get_queryset(self):
        user=self.request.user

        if user.IsownerOrAdmin() or user.is_superuser:
            return LeaveRequest.objects.filter(company=user.company)
        
        return LeaveRequest.objects.filter(user=user)
    
    def perform_create(self,serializer):
        serializer.save(
            user=self.request.user,
            company=self.request.user.company,
            status="pending",
            submitted_at=now(),

        )
        @action(detail=True,
                methods=["post"],
                permission_classes=[BaseModulePermission],
                )
        def approve(self,request,pk=None):
            leave= self.get_object()

            if request.user.role not in ["admin","hr"] and not request.user.is_superuser:
                return Response(
                    {"detail":"Only HR or Admin can approve leave"},
                    status=403,
                )
            leave.status="approved"
            leave.decision_by= request.user
            leave.decision_at =now()
            leave.save()

            return Response({"status":"approved"})
        
        @action(detail=True,
                methods=["post"],
                permission_classes=[IsownerOrAdmin],
                )
        def reject(self,request,pk=None):
            leave= self.get_object()

            if request.user.role not in ["admin","hr"] and not request.user.is_superuser:
                return Response(
                    {"detail":"ONly Hr or Admin can reject leave"}
                )
            leave.status= "rejected"
            leave.decision_by=request.user
            leave.decision_at= now()
            leave.decision_comment=request.data.get("comment","")
            leave.save()

            return Response({"status":"rejected"})

class LeaveBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class=LeaveBalanceSerializer
    permission_classes=[BaseModulePermission]

    module_name= "leave"

    def get_queryset(self):
        return LeaveBalance.objects.filter(user=self.request.user)
    
