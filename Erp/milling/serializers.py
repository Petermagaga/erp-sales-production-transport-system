from rest_framework import serializers
from core.serializers import RoleAwareSerializer
from .models import MillingBatch

class MillingBatchSerializer(RoleAwareSerializer):
    class Meta:
        model = MillingBatch
        fields= "__all__"

    role_field_permissions ={

        "*":{
            "read_only":[
                "efficiency",
                "total_output_kg",
                "created_at",
                "updated_at",
            ],
        },

        "warehouse":{
            "read_only_on_update":[
                "batch_no",
                "date",
                "shift",
            ],
        },

        "sales":{
            "read_only":[

                "premix_kg",
                "maize_milled_kg",
                "waste_kg",
                "maize_germ_kg",
                "maize_chaffs_kg",
                "bales",

            ],
        },

    }





    def validate(self,attrs):

        attrs.pop("efficiency",None)
        attrs.pop("total_output_kg",None)

        instance = self.instance

        def get_value(field):
            if field in attrs:
                return attrs[field]
            
            if instance:
                return getattr(instance, field)
            return 0

        numeric_fields = [
            "premix_kg",
            "maize_milled_kg",
            "maize_germ_kg",
            "maize_chaffs_kg",
            "waste_kg",
            "bales",
        ]
        
        for field in numeric_fields:
            value = get_value(field)
            if value is not None and value< 0:
                raise serializers.ValidationError(
                    {
                        field: "value cannot be negative"
                    }
                )

        total_output = (
            get_value("maize_germ_kg") +
            get_value("maize_chaffs_kg") +
            get_value("waste_kg")
        )

        maize_milled = get_value("maize_milled_kg")

        if maize_milled and total_output > maize_milled:
            raise serializers.ValidationError(
                "Total output cannot exceed maize milled."
            )


        return super().validate(attrs)
    
    def validate_expiry_date(self,value):

        from django.utils import timezone

        if value < timezone.now().date():
            raise serializers.ValidationError(
                "Expiry date cannot be in the past."
            )
        return value
    

# =====================================================
# MILLING ANALYTICS (READ-ONLY)
# =====================================================
class MillingAnalyticsSerializer(serializers.Serializer):
    date = serializers.DateField(read_only=True)
    shift = serializers.CharField(read_only=True)

    total_maize_milled = serializers.FloatField(read_only=True)
    total_premix = serializers.FloatField(read_only=True)

    total_germ = serializers.FloatField(read_only=True)
    total_chaff = serializers.FloatField(read_only=True)
    total_waste = serializers.FloatField(read_only=True)

    total_bales = serializers.IntegerField(read_only=True)
    avg_efficiency = serializers.FloatField(read_only=True)
