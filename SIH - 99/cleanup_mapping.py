from database.database import SessionLocal
from database import models

db = SessionLocal()

mapping = (
    db.query(models.MaterialMapping)
    .filter(models.MaterialMapping.id == 3)
    .first()
)

if mapping:
    db.delete(mapping)
    db.commit()
    print("Mapping 3 deleted successfully")
else:
    print("Mapping 3 not found")

db.close()