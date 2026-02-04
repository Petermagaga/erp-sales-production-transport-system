from rest_framework import serializers
from .models import LeaveType,LeaveRequest,LeaveBalance

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = "__all__"

class LeaveRequestSerializer(serializers.ModelSerializer):

    user_name=serializers.CharField(source="user.username",read_only=True)
    leave_type_name =serializers.CharField(source="user.username",read_only=True)
    
    class Meta:
        model=LeaveRequest
        
        exclude=("user","company")
        read_only_fields=(
            "status",
            "total_days",
            "decision_by",
            "decision_at",
        )

class LeaveBalanceSerializer(serializers.ModelSerializer):
    remaining_days=serializers.IntegerField(read_only=True)

    class Meta:
        model=LeaveBalance
        fields="__all__"