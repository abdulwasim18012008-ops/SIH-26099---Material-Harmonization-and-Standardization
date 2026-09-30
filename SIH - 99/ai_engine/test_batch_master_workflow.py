from ai_engine.embeddings import MaterialEmbeddingModel
from ai_engine.pipeline import MaterialAIPipeline
from ai_engine.master_workflow import MaterialMasterWorkflow
from ai_engine.batch_master_workflow import BatchMasterWorkflow


materials = [
    {
        "material_id": "MAT001",
        "cpse": "CPCL",
        "original_code": "CPCL-BOLT-001",
        "description": "SS BOLT M10 X 50 MM"
    },
    {
        "material_id": "MAT002",
        "cpse": "IOCL",
        "original_code": "IOCL-BOLT-045",
        "description": "M10 S.S. HEX BOLT 50MM"
    },
    {
        "material_id": "MAT003",
        "cpse": "HPCL",
        "original_code": "HPCL-BOLT-782",
        "description": "SS BOLT 10 DIA 50 LG"
    },
    {
        "material_id": "MAT004",
        "cpse": "BPCL",
        "original_code": "BPCL-BOLT-100",
        "description": "SS BOLT M10 X 60 MM"
    },
    {
        "material_id": "MAT005",
        "cpse": "GAIL",
        "original_code": "GAIL-NUT-010",
        "description": "SS NUT M10"
    },
    {
        "material_id": "MAT006",
        "cpse": "ONGC",
        "original_code": "ONGC-PIPE-050",
        "description": "SS304 PIPE 50 MM X 2 MM THK"
    }
]


print("\n=== CREATING AI PIPELINE ===")

embedding_model = MaterialEmbeddingModel()

pipeline = MaterialAIPipeline(
    embedding_model
)

master_workflow = MaterialMasterWorkflow(
    pipeline
)

batch_workflow = BatchMasterWorkflow(
    master_workflow
)


print("\n=== PROCESSING CPSE BATCH ===")

result = batch_workflow.process_batch(
    materials
)


print("\n=== BATCH SUMMARY ===")

print(
    "Total materials:",
    result["total_materials"]
)

print(
    "Total groups:",
    result["total_groups"]
)


print("\n=== HARMONIZED GROUPS ===")

for group in result["groups"]:

    print("\nGroup:", group["group_id"])

    print(
        "Type:",
        group["match_type"]
    )

    print(
        "Description:",
        group["standardized_description"]
    )

    print(
        "National Code:",
        group["recommended_national_code"]
    )

    print(
        "Members:",
        group["member_count"]
    )

    for member in group["members"]:

        print(
            "  ",
            member["cpse"],
            "→",
            member["original_code"]
        )


print("\n=== VALIDATION QUEUE ===")

for item in result["validation_queue"]:

    validation = item["validation"]

    print(
        item["group_id"],
        "→",
        validation["status"]
    )


print("\n=== APPROVING FIRST GROUP ===")

first_group = result["groups"][0]

approval = batch_workflow.approve_group(
    group=first_group,
    reviewer="Reviewer-001",
    comment="Harmonized group verified."
)


print("\nApproval status:")
print(
    approval["validation"]["status"]
)

print(
    "National Code:",
    approval["national_code"]
)

print(
    "Mappings created:",
    len(approval["mappings"])
)

print(
    "Versions created:",
    len(approval["versions"])
)


print("\n=== CREATED MAPPINGS ===")

for mapping in approval["mappings"]:
    print(mapping)


print("\n=== CREATED VERSIONS ===")

for version in approval["versions"]:
    print(version)


print("\n=== AUDIT TRAIL ===")

for record in master_workflow.audit_trail.get_all_records():
    print(record)