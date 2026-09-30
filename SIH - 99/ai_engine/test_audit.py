from ai_engine.audit import AuditTrail


audit = AuditTrail()


print("\n=== AI ANALYSIS ===")

audit.log_action(
    action="AI_ANALYSIS",
    material_id="MAT001",
    group_id="GROUP-0001",
    actor="AI_ENGINE",
    details={
        "description": "SS BOLT M10 X 50 MM",
        "confidence": 0.95
    },
    timestamp="2026-09-26T13:00:00"
)


print("\n=== VALIDATION ===")

audit.log_action(
    action="VALIDATION_APPROVED",
    material_id="MAT001",
    group_id="GROUP-0001",
    actor="Reviewer-001",
    details={
        "comment": "AI recommendation verified."
    },
    timestamp="2026-09-26T13:10:00"
)


print("\n=== MAPPING ===")

audit.log_action(
    action="NATIONAL_MAPPING_CREATED",
    material_id="MAT001",
    group_id="GROUP-0001",
    actor="Reviewer-001",
    details={
        "national_code": "FST-BLT-SS-D010-L050",
        "cpse": "CPCL",
        "original_code": "CPCL-BOLT-001"
    },
    timestamp="2026-09-26T13:15:00"
)


print("\n=== VERSION UPDATE ===")

audit.log_action(
    action="VERSION_CREATED",
    material_id="MAT001",
    group_id="GROUP-0001",
    actor="Reviewer-002",
    details={
        "version": 2,
        "reason": "Description updated after technical review."
    },
    timestamp="2026-09-26T14:00:00"
)


print("\n=== ALL AUDIT RECORDS ===")

for record in audit.get_all_records():
    print(record)


print("\n=== MATERIAL HISTORY ===")

for record in audit.get_by_material("MAT001"):
    print(record)


print("\n=== APPROVAL ACTIONS ===")

for record in audit.get_by_action("VALIDATION_APPROVED"):
    print(record)