import pandas as pd
from production.models import RawMaterial, FlourOutput

def import_production_excel(file_or_df):
    # Support both uploaded file and DataFrame directly
    if isinstance(file_or_df, pd.DataFrame):
        df = file_or_df
    else:
        df = pd.read_excel(file_or_df)

    for _, row in df.iterrows():
        date = row.get("DATE")
        shift = str(row.get("SHIFT")).strip().upper() if row.get("SHIFT") else None

        if not date or not shift:
            continue  # skip invalid rows

        RawMaterial.objects.get_or_create(
            date=date,
            shift=shift,
            defaults={
                "premix_kg": row.get("PREMIX[kg]", 0) or 0,
                "maize_kg": row.get("MAIZE[kg]", 0) or 0,
                "soya_kg": row.get("SOYA[kg]", 0) or 0,
                "sugar_kg": row.get("SUGAR[kg]", 0) or 0,
                "sorghum_kg": row.get("SOGHURM[kg]", 0) or 0,
            },
        )

        FlourOutput.objects.update_or_create(
            date=date,
            shift=shift,
            defaults={
                "csb_25kg_bags": row.get("CSB25KGS(bags)", 0) or 0,
                "spillage_kg": row.get("FLOUR SPILLAGE(kg)", 0) or 0,
                "germ_kg": row.get("MAIZE GERM(kg)", 0) or 0,
                "chaff_kg": row.get("MAIZE CHAFF(kg)", 0) or 0,
                "waste_kg": row.get("SORGHUM WASTE(kg)", 0) or 0,
            },
        )

    return len(df)
