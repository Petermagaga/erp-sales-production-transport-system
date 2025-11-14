from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Sum
from .models import DailyInventory, WarehouseAnalytics


def update_warehouse_analytics( date,):
    """
    Helper function to update or create WarehouseAnalytics for a given warehouse and date.
    """
    # Get all inventory entries for that warehouse & date
    records = DailyInventory.objects.filter( date=date,)

    # Aggregate totals
    totals = records.aggregate(
        total_raw_in=Sum("raw_in") or 0,
        total_output=Sum("shift_1") + Sum("shift_2") + Sum("shift_3"),
        total_waste=Sum("opening_balance") + Sum("raw_in") - Sum("closing_balance"),
    )

    # Handle None values safely
    total_raw_in = totals["total_raw_in"] or 0
    total_output = totals["total_output"] or 0
    total_waste = totals["total_waste"] or 0

    # Update or create analytics record
    analytics, created = WarehouseAnalytics.objects.update_or_create(
        
        date=date,
        defaults={
            "total_raw_in": total_raw_in,
            "total_output": total_output,
            "total_waste": total_waste,
        },
    )

    # Efficiency is auto-calculated in model.save()
    analytics.save()


@receiver(post_save, sender=DailyInventory)
def update_analytics_on_save(sender, instance, **kwargs):
    """
    Trigger analytics update whenever a DailyInventory is created or updated.
    """
    update_warehouse_analytics( instance.date,)


@receiver(post_delete, sender=DailyInventory)
def update_analytics_on_delete(sender, instance, **kwargs):
    """
    Trigger analytics recalculation when a DailyInventory is deleted.
    """
    update_warehouse_analytics( instance.date,)
