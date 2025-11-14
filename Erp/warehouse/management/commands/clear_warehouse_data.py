from django.core.management.base import BaseCommand
from warehouse.models import DailyInventory, WarehouseAnalytics

class Command(BaseCommand):
    help = "Delete all warehouse-related data before re-importing"

    def handle(self, *args, **kwargs):
        confirm = input("⚠️  This will delete ALL Warehouse data. Type 'yes' to confirm: ")
        if confirm.lower() == "yes":
            DailyInventory.objects.all().delete()
            WarehouseAnalytics.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("✅ Warehouse data deleted successfully."))
        else:
            self.stdout.write(self.style.WARNING("❌ Operation cancelled."))
