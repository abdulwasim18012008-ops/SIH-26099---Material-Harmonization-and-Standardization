from main import SessionLocal, models

db = SessionLocal()

try:
    test_materials = (
        db.query(models.OriginalMaterial)
        .filter(models.OriginalMaterial.material_code.like("TEST-%"))
        .all()
    )

    material_ids = [m.id for m in test_materials]

    mappings = []
    if material_ids:
        mappings = (
            db.query(models.MaterialMapping)
            .filter(
                models.MaterialMapping.original_material_id.in_(material_ids)
            )
            .all()
        )

    mapping_ids = [m.id for m in mappings]

    test_codes = [
        "FST-BLT-SS-D010-L050",
        "FST-BLT-SS-D010-L060",
        "PIP-PIP-CS-DN100",
        "ELE-RELA-UNSPEC"
    ]

    national_materials = (
        db.query(models.StandardizedMaterial)
        .filter(
            models.StandardizedMaterial.national_code.in_(test_codes)
        )
        .all()
    )

    national_ids = [n.id for n in national_materials]

    # Delete audit logs
    if mapping_ids:
        audits = (
            db.query(models.AuditLog)
            .filter(models.AuditLog.mapping_id.in_(mapping_ids))
            .all()
        )
        for audit in audits:
            db.delete(audit)

    if national_ids:
        audits = (
            db.query(models.AuditLog)
            .filter(models.AuditLog.entity_id.in_(national_ids))
            .all()
        )
        for audit in audits:
            db.delete(audit)

    # Delete versions
    if national_ids:
        versions = (
            db.query(models.MaterialVersion)
            .filter(
                models.MaterialVersion.national_material_id.in_(national_ids)
            )
            .all()
        )
        for version in versions:
            db.delete(version)

    # Delete mappings
    for mapping in mappings:
        db.delete(mapping)

    # Delete materials
    for material in test_materials:
        db.delete(material)

    # Delete TEST CPSEs
    test_cpse = (
        db.query(models.CPSE)
        .filter(models.CPSE.name.like("TEST-%"))
        .all()
    )

    for cpse in test_cpse:
        db.delete(cpse)

    # Delete test national materials
    for national_material in national_materials:
        db.delete(national_material)

    db.commit()

    print("========================================")
    print("TEST DATA CLEANUP COMPLETED")
    print("Materials deleted:", len(test_materials))
    print("Mappings deleted:", len(mappings))
    print("National materials deleted:", len(national_materials))
    print("CPSEs deleted:", len(test_cpse))
    print("========================================")

except Exception as e:
    db.rollback()
    print("CLEANUP FAILED:", e)

finally:
    db.close()
