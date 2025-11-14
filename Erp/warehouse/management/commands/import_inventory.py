import os
import re
from decimal import Decimal, InvalidOperation
from datetime import datetime
import pandas as pd

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from warehouse.models import Material, DailyInventory, WarehouseAnalytics


class Command(BaseCommand):
    help = (
        "📦 Import daily warehouse inventory data from Excel.\n"
        "Handles multi-sheet files, multi-date blocks per sheet, vertical/horizontal layouts, "
        "category detection, and replaces existing records cleanly."
    )

    def add_arguments(self, parser):
        parser.add_argument("excel_path", type=str, help="Path to the Excel file")
        parser.add_argument("--sheet", type=str, default=None, help="Import only a specific sheet")
        parser.add_argument("--date", type=str, default=None, help="Manually set date (for single-sheet imports)")
        parser.add_argument("--dry-run", action="store_true", help="Simulate import without saving to DB")

    # =====================
    # ⚙️ MAIN HANDLER
    # =====================

    def handle(self, *args, **options):
        excel_path = options["excel_path"]
        target_sheet = options["sheet"]
        manual_date = options["date"]
        dry_run = options["dry_run"]

        if not os.path.exists(excel_path):
            raise CommandError(f"Excel file not found: {excel_path}")

        try:
            xl = pd.ExcelFile(excel_path)
        except Exception as e:
            raise CommandError(f"Failed to open Excel file: {e}")

        sheet_names = [target_sheet] if target_sheet else xl.sheet_names
        self.stdout.write(self.style.NOTICE(f"📘 Found {len(sheet_names)} sheet(s): {', '.join(sheet_names)}"))

        total_summary = {"created": 0, "updated": 0, "skipped": 0, "errors": 0}
        failed_sheets = []

        for sheet in sheet_names:
            self.stdout.write(self.style.HTTP_INFO(f"\n=== Processing Sheet: {sheet} ==="))
            try:
                df = xl.parse(sheet_name=sheet, header=None)
                if df.empty:
                    self.stdout.write(self.style.WARNING(f"⚠️ Skipping empty sheet: {sheet}"))
                    continue

                # Detect sheet-level category and optional date
                date = self.parse_manual_or_detect(manual_date, sheet, df)
                category = self.detect_category(sheet)

                # Detect vertical layout
                if self.is_vertical_layout(df):
                    self.stdout.write(self.style.WARNING("↕️ Vertical layout detected — transposing..."))
                    df = self.transpose_vertical(df)

                # Split sheet into date-based blocks (e.g. DATE: 1/9/2025 ... DATE: 2/9/2025 ...)
                blocks = self.split_by_date_blocks(df)
                if not blocks:
                    self.stdout.write(self.style.WARNING("⚠️ No 'DATE:' blocks found — processing entire sheet as one"))
                    blocks = [(date, df)]

                # Process each block individually
                for block_date, block_df in blocks:
                    self.stdout.write(self.style.SUCCESS(f"\n🗓 Processing date block: {block_date}"))

                    # Replace existing records for that date
                    if not dry_run:
                        DailyInventory.objects.filter(date=block_date).delete()
                        self.stdout.write(self.style.WARNING(f"♻️ Existing records for {block_date} cleared before import."))

                    sheet_summary = self.process_sheet(block_df, block_date, category, dry_run)
                    for k, v in sheet_summary.items():
                        total_summary[k] += v

            except Exception as e:
                failed_sheets.append(sheet)
                self.stdout.write(self.style.ERROR(f"❌ Error processing '{sheet}': {e}"))
                continue

        # === Final Summary ===
        self.stdout.write(self.style.SUCCESS("\n=== FINAL SUMMARY ==="))
        for k, v in total_summary.items():
            self.stdout.write(f"{k.capitalize()}: {v}")

        if failed_sheets:
            self.stdout.write(self.style.ERROR(f"\n❌ Failed sheets: {', '.join(failed_sheets)}"))

        if dry_run:
            self.stdout.write(self.style.WARNING("\nDry run mode: No data saved."))
        else:
            self.stdout.write(self.style.SUCCESS("\n✅ Import completed successfully."))

    # =====================
    # 🔧 Utility Functions
    # =====================

    def detect_category(self, sheet_name):
        name = sheet_name.lower()
        if "raw" in name:
            return "raw_material"
        elif any(k in name for k in ["final", "finished"]):
            return "final_product"
        elif "by" in name:
            return "by_product"
        elif any(k in name for k in ["store", "stock"]):
            return "stock_in_store"
        return "unknown"

    def parse_manual_or_detect(self, manual_date, sheet_name, df):
        if manual_date:
            return self.parse_date(manual_date)
        match = re.search(r"(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})", sheet_name)
        if match:
            try:
                return self.parse_date(match.group(1))
            except Exception:
                pass
        detected = self.detect_date(df)
        if detected:
            return detected
        self.stdout.write(self.style.WARNING(f"⚠️ No date found for '{sheet_name}', using today"))
        return timezone.now().date()

    def parse_date(self, value):
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%m/%d/%Y"):
            try:
                return datetime.strptime(str(value), fmt).date()
            except ValueError:
                continue
        raise CommandError(f"Invalid date format: {value}")

    def detect_date(self, df):
        date_pattern = re.compile(r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})")
        for row in df.iloc[:5].astype(str).values.flatten():
            match = date_pattern.search(row)
            if match:
                try:
                    return self.parse_date(match.group(1))
                except Exception:
                    continue
        return None

    def is_vertical_layout(self, df):
        col_values = [str(v).strip().upper() for v in df.iloc[:, 0].dropna().head(10)]
        keywords = ["OPENING", "RAW", "SHIFT", "CLOSING"]
        return any(any(k in v for k in keywords) for v in col_values)

    def transpose_vertical(self, df):
        start_row = None
        for i, val in enumerate(df.iloc[:, 0].astype(str).str.upper()):
            if "OPENING" in val:
                start_row = i
                break
        if start_row is None:
            raise CommandError("Could not locate 'OPENING BALANCE' row in vertical layout.")

        keys = df.iloc[start_row:, 0].astype(str).str.strip().tolist()
        data_block = df.iloc[start_row:, 1:]
        materials = df.columns[1:]
        transposed = []
        for idx, material in enumerate(materials):
            if not str(material).strip():
                continue
            record = {"material": str(material).strip()}
            for key, val in zip(keys, data_block.iloc[:, idx]):
                record[key.strip().lower()] = val
            transposed.append(record)
        return pd.DataFrame(transposed)

    def find_header_row(self, df):
        header_keywords = ["opening", "raw in", "shift 1", "closing"]
        for idx, row in df.iterrows():
            text = " ".join(str(x).lower() for x in row.values)
            if any(k in text for k in header_keywords):
                return idx
        return None

    def safe_decimal(self, val):
        if pd.isna(val) or val in ["", None]:
            return Decimal("0")
        try:
            return Decimal(str(val).replace(",", ""))
        except InvalidOperation:
            return Decimal("0")

    # =====================
    # 📆 Split by Date Blocks
    # =====================

    def split_by_date_blocks(self, df):
        """Split a DataFrame into smaller DataFrames per 'DATE:' block."""
        blocks = []
        current_block = []
        current_date = None

        for _, row in df.iterrows():
            text = " ".join(str(x) for x in row.tolist() if pd.notna(x)).strip()
            if text.upper().startswith("DATE:"):
                if current_block and current_date:
                    blocks.append((current_date, pd.DataFrame(current_block)))
                date_match = re.search(r"(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})", text)
                if date_match:
                    current_date = self.parse_date(date_match.group(1))
                current_block = []
            else:
                if any(pd.notna(x) for x in row):
                    current_block.append(row.tolist())

        if current_block and current_date:
            blocks.append((current_date, pd.DataFrame(current_block)))

        return blocks

    # =====================
    # 💾 Sheet Processor
    # =====================

    def process_sheet(self, df, date, category, dry_run=False):
        results = {"created": 0, "updated": 0, "skipped": 0, "errors": 0}

        header_row_idx = self.find_header_row(df)
        if header_row_idx is not None:
            df.columns = [str(c).strip().lower() for c in df.iloc[header_row_idx]]
            df = df.iloc[header_row_idx + 1:].reset_index(drop=True)

        rename_map = {
            "item": "material",
            "material": "material",
            "opening": "opening_balance",
            "opening balance": "opening_balance",
            "raw materia in": "raw_in",
            "raw material in": "raw_in",
            "shift 1": "shift_1",
            "shift1": "shift_1",
            "shift 2": "shift_2",
            "shift2": "shift_2",
            "shift 3": "shift_3",
            "shift3": "shift_3",
            "closing": "closing_balance",
            "closing balance": "closing_balance",
            "remarks": "remarks",
        }
        df.rename(columns=lambda x: rename_map.get(str(x).lower().strip(), str(x).lower().strip()), inplace=True)

        required_cols = ["material", "opening_balance", "raw_in"]
        for col in required_cols:
            if col not in df.columns:
                raise CommandError(f"Missing required column: {col}")

        if dry_run:
            self.stdout.write(self.style.WARNING("🚧 Dry-run mode — transactions will be rolled back."))

        try:
            with transaction.atomic():
                for _, row in df.iterrows():
                    material_name = str(row.get("material", "")).strip()
                    if not material_name or material_name.lower() in ["nan", "none"]:
                        results["skipped"] += 1
                        continue

                    material, _ = Material.objects.get_or_create(
                        name=material_name,
                        category=category,
                        defaults={"unit": "kg"},
                    )

                    inv_data = {
                        "opening_balance": self.safe_decimal(row.get("opening_balance")),
                        "raw_in": self.safe_decimal(row.get("raw_in")),
                        "shift_1": self.safe_decimal(row.get("shift_1")),
                        "shift_2": self.safe_decimal(row.get("shift_2")),
                        "shift_3": self.safe_decimal(row.get("shift_3")),
                        "remarks": str(row.get("remarks", "")).strip() or None,
                    }

                    inv, created = DailyInventory.objects.update_or_create(
                        material=material,
                        date=date,
                        defaults=inv_data,
                    )
                    results["created" if created else "updated"] += 1

                if not dry_run:
                    self.update_analytics(date)
                else:
                    raise transaction.TransactionManagementError("Dry-run rollback")

        except transaction.TransactionManagementError:
            pass
        except Exception as e:
            results["errors"] += 1
            raise CommandError(f"Failed to import data for {date}: {e}")

        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Imported {date} | {category}: Created={results['created']}, Updated={results['updated']}, Skipped={results['skipped']}"
            )
        )
        return results

    def update_analytics(self, date):
        inventories = DailyInventory.objects.filter(date=date)
        total_raw_in = sum(i.raw_in for i in inventories)
        total_output = sum(i.total_shift_output for i in inventories)
        total_waste = sum(max(Decimal("0"), i.raw_in - i.total_shift_output) for i in inventories)

        efficiency_rate = Decimal("0")
        if total_raw_in > 0:
            efficiency_rate = (total_output / total_raw_in) * 100

        WarehouseAnalytics.objects.update_or_create(
            date=date,
            defaults={
                "total_raw_in": total_raw_in,
                "total_output": total_output,
                "total_waste": total_waste,
                "efficiency_rate": efficiency_rate,
            },
        )
        self.stdout.write(self.style.SUCCESS(f"📊 Analytics updated for {date} ({efficiency_rate:.2f}% efficiency)"))
