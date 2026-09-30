from ai_engine.versioning import MaterialVersionManager


manager = MaterialVersionManager()


material_id = "MAT001"


print("\n=== VERSION 1 ===")

version_1 = manager.create_version(
    material_id=material_id,
    national_code="FST-BLT-SS-D010-L050",
    standardized_description=
        "STAINLESS STEEL BOLT DIA 10 mm LENGTH 50 mm",
    status="APPROVED",
    reviewer="Reviewer-001",
    comment="Initial AI recommendation approved.",
    timestamp="2026-09-26T13:00:00"
)

print(version_1)


print("\n=== VERSION 2 ===")

version_2 = manager.create_version(
    material_id=material_id,
    national_code="FST-BLT-SS-D010-L050",
    standardized_description=
        "STAINLESS STEEL HEX BOLT DIA 10 mm LENGTH 50 mm",
    status="MODIFIED",
    reviewer="Reviewer-002",
    comment="Description updated after technical review.",
    timestamp="2026-09-26T14:00:00"
)

print(version_2)


print("\n=== VERSION 3 ===")

version_3 = manager.create_version(
    material_id=material_id,
    national_code="FST-BLT-SS-D010-L050",
    standardized_description=
        "STAINLESS STEEL HEX BOLT DIA 10 mm LENGTH 50 mm",
    status="APPROVED",
    reviewer="Reviewer-003",
    comment="Modified description approved.",
    timestamp="2026-09-26T15:00:00"
)

print(version_3)


print("\n=== CURRENT VERSION ===")

print(
    manager.get_current_version(material_id)
)


print("\n=== COMPLETE VERSION HISTORY ===")

for version in manager.get_version_history(material_id):
    print(version)


print("\n=== SPECIFIC VERSION ===")

print(
    manager.get_specific_version(
        material_id,
        1
    )
)