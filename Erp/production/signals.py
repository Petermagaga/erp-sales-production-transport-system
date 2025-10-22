from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import RawMaterial, FlourOutput

@receiver(post_save, sender=FlourOutput)
@receiver(post_save, sender=RawMaterial)
def calculate_efficiency(sender, instance, **kwargs):
    # ✅ now safe — no circular import
    try:
        raw = RawMaterial.objects.filter(date=instance.date, shift=instance.shift).first()
        flour = FlourOutput.objects.filter(date=instance.date, shift=instance.shift).first()

        if raw and flour:
            total_input = (
                raw.maize_kg + raw.soya_kg + raw.sugar_kg +
                raw.sorghum_kg + raw.premix_kg
            )
            total_output = (
                (flour.total_bags * 25) + flour.spillage_kg +
                flour.germ_kg + flour.chaff_kg + flour.waste_kg
            )

            efficiency = (total_output / total_input) * 100 if total_input else 0
            flour.efficiency = round(efficiency, 2)
            flour.save(update_fields=["efficiency"])

    except Exception as e:
        print("⚠️ Efficiency calculation error:", e)
