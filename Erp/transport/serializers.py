from rest_framework import serializers
from core.serializers import RoleAwareSerializer
from .models import Vehicle, TransportRecord


# =====================================================
# VEHICLE
# =====================================================

class VehicleSerializer(RoleAwareSerializer):
    """
    Fleet vehicles.
    """
    class Meta:
        model = Vehicle
        fields = [
            "id",
            "name",
            "plate_number",
            "category",
            "driver_name",
            "active",
            
        ]

    role_field_permissions = {
        # Transport team can edit operational fields
        "transporter": {
            "read_only": ["active"],
        },

        # Everyone
        "*": {
            "read_only": ["created_at"],
        }
    }


# =====================================================
# TRANSPORT RECORD
# =====================================================

class TransportRecordSerializer(RoleAwareSerializer):
    """
    Fuel + service costs per vehicle per day.
    """

    # 🔗 Readable vehicle info
    vehicle_name = serializers.CharField(
        source="vehicle.name",
        read_only=True
    )
    vehicle_plate = serializers.CharField(
        source="vehicle.plate_number",
        read_only=True
    )

    # 🔑 Write-only vehicle assignment
    vehicle_id = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        source="vehicle",
        write_only=True,
        required=True,
    )

    # 💰 System-calculated
    total_cost = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = TransportRecord
        fields = [
            "id",
            "vehicle",
            "vehicle_id",
            "vehicle_name",
            "vehicle_plate",
            "date",
            "fuel_cost",
            "service_cost",
            "mechanical_issues",
            "total_cost",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "vehicle",
            "vehicle_name",
            "vehicle_plate",
            "total_cost",
            "created_at",
        ]

    role_field_permissions = {
        # Transport staff: can log costs, cannot alter history
        "transporter": {
            "read_only_on_update": ["date", "vehicle"],
        },

        # Sales & others: view only
        "sales": {
            "read_only": "__all__",
        },

        # Everyone
        "*": {
            "read_only": ["created_at"],
        }
    }

    def get_total_cost(self, obj):
        """
        Always calculated from model method.
        """
        return float(obj.total_cost())
