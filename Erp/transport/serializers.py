from .models import Vehicle,TransportRecord

from rest_framework import serializers


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model= Vehicle
        fields=['id','name','plate_number','category','driver_name','active']

class TransportRecordSerializer(serializers.ModelSerializer):
    vehicle_plate=serializers.CharField(source='vehicle.plate_number',read_only=True)
    vehicle_name=serializers.CharField(source='vehicle.name',read_only=True)
    total_cost=serializers.SerializerMethodField()

    vehicle_id=serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        source='vehicle',
        write_only=True,
        required=True,
    )

    class Meta:
        model=TransportRecord
        fields=[
            'id','vehicle','vehicle_id','vehicle_plate','vehicle_name',
            'date','fuel_cost','service_cost','mechanical_issues',
            'total_cost','created_at'
        ]
        read_only_fields=['id','vehicle','vehicle_plate','vehicle_name','total_cost','created_at']
    
    def get_total_cost(self,obj):
        return float(obj.total_cost())

