from rest_framework import serializers
from.models import RawMaterial,FlourOutput

class RawMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = RawMaterial
        fields = '__all__'


class FlourOutputSerializer(serializers.ModelSerializer):
    class Meta:
        model = FlourOutput
        fields = '__all__'


class MergedProductionSerializer(serializers.Serializer):
    date = serializers.DateField()
    shift = serializers.CharField()
    premix = serializers.FloatField(allow_null=True)
    maize = serializers.FloatField(allow_null=True)
    soya = serializers.FloatField(allow_null=True)
    sugar = serializers.FloatField(allow_null=True)
    sorghum = serializers.FloatField(allow_null=True)
    total_raw = serializers.FloatField(allow_null=True)
    flour_output = serializers.FloatField(allow_null=True)
    flour_spillage = serializers.FloatField(allow_null=True)
    maize_germ = serializers.FloatField(allow_null=True)
    maize_chaff = serializers.FloatField(allow_null=True)
    sorghum_waste = serializers.FloatField(allow_null=True)
    efficiency = serializers.FloatField(allow_null=True)
