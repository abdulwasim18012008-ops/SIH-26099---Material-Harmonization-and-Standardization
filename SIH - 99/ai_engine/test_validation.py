from ai_engine.validation import create_validation_record


ai_recommendation = {
    "standardized_description":
        "STAINLESS STEEL BOLT DIA 10 mm LENGTH 50 mm",

    "recommended_national_code":
        "FST-BLT-SS-D010-L050",

    "confidence": 0.95
}


print("\n=== PENDING VALIDATION ===")

pending = create_validation_record(
    group_id="GROUP-0001",
    ai_recommendation=ai_recommendation
)

print(pending)


print("\n=== APPROVED VALIDATION ===")

approved = create_validation_record(
    group_id="GROUP-0001",
    ai_recommendation=ai_recommendation,
    status="APPROVED",
    reviewer="Reviewer-001",
    comment="AI recommendation verified."
)

print(approved)


print("\n=== MODIFIED VALIDATION ===")

modified = create_validation_record(
    group_id="GROUP-0001",
    ai_recommendation=ai_recommendation,
    status="MODIFIED",
    reviewer="Reviewer-001",
    modified_description=
        "SS HEX BOLT DIA 10 mm LENGTH 50 mm",
    comment="Updated description according to technical specification."
)

print(modified)


print("\n=== REJECTED VALIDATION ===")

rejected = create_validation_record(
    group_id="GROUP-0002",
    ai_recommendation=ai_recommendation,
    status="REJECTED",
    reviewer="Reviewer-002",
    comment="Material requires separate classification."
)

print(rejected)