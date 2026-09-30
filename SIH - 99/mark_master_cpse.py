from main import SessionLocal, models

db = SessionLocal()

master_codes = [
    "CPCL", "IOCL", "ONGC", "BPCL", "HPCL",
    "NTPC", "POWERGRID", "NHPC", "SAIL", "NMDC",
    "CIL", "BHEL", "HAL", "EIL"
]

updated = 0

for code in master_codes:
    cpse = (
        db.query(models.CPSE)
        .filter(models.CPSE.code == code)
        .first()
    )

    if cpse:
        cpse.is_master = True
        cpse.owner_id = None
        updated += 1
        print("MASTER:", cpse.name, cpse.code)

db.commit()

print("\nMaster CPSEs updated:", updated)

db.close()