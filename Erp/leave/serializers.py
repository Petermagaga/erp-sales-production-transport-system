from rest_framework import serializers
from .models import LeaveType,LeaveRequest,LeaveBalance

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = "__all__"

class LeaveRequestSerializer(serializers.ModelSerializer):

    user_name=serializers.CharField(
        source="user.username",read_only=True)
    leave_type_name =serializers.CharField(
        source="leave_type.name",read_only=True)
    
    class Meta:
        model=LeaveRequest
        
        exclude=("user","company")
        read_only_fields=(
            "status",
            "total_days",
            "decision_by",
            "decision_at",
        )

    def validate(self, data):
        user = self.context["request"].user
        leave_type = data["leave_type"]
        start = data["start_date"]
        end = data["end_date"]

        if start > end:
            raise serializers.ValidationError({
                "end_date": "End date cannot be before start date"
            })

        overlapping = LeaveRequest.objects.filter(
            user=user,
            status__in=["pending", "approved"],
            start_date__lte=end,
            end_date__gte=start,
        )

        if self.instance:
            overlapping=overlapping.exclude(pk=self.instance.pk)

        if overlapping.exists():
            raise serializers.ValidationError(
                "You already have a leave during this period"
            )

        total_days = (end - start).days + 1

        if leave_type.requires_balance:
            try:
                balance = LeaveBalance.objects.get(
                    user=user,
                    leave_type=leave_type
                )
            except LeaveBalance.DoesNotExist:
                raise serializers.ValidationError(
                    "No leave balance available"
                )

            if balance.remaining_days < total_days:
                raise serializers.ValidationError(
                    "Insufficient leave balance"
                )

        return data


class LeaveBalanceSerializer(serializers.ModelSerializer):
    remaining_days=serializers.IntegerField(read_only=True)

    class Meta:
        model=LeaveBalance
        fields="__all__"