from ai_engine.embeddings import MaterialEmbeddingModel
from ai_engine.pipeline import MaterialAIPipeline
from ai_engine.batch_processor import MaterialBatchProcessor


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


print("Loading AI engine...")

embedding_model = MaterialEmbeddingModel()

pipeline = MaterialAIPipeline(
    embedding_model
)

processor = MaterialBatchProcessor(
    pipeline
)


print("\nProcessing CPSE materials...")

result = processor.process(
    materials
)


print("\n" + "=" * 70)
print("BATCH MATERIAL HARMONIZATION")
print("=" * 70)


print(
    "\nTotal Materials:",
    result["total_materials"]
)

print(
    "Total Groups:",
    result["total_groups"]
)


for group in result["groups"]:

    print("\n" + "-" * 70)

    print(
        "Group:",
        group["group_id"]
    )

    print(
        "Match Type:",
        group["match_type"]
    )

    print(
        "Standardized Description:",
        group["standardized_description"]
    )

    print(
        "Category:",
        group["category"]
    )

    print(
        "Subcategory:",
        group["subcategory"]
    )

    print(
        "National Code:",
        group["recommended_national_code"]
    )

    print(
        "Confidence:",
        group["national_code_confidence"]
    )

    print(
        "Member Count:",
        group["member_count"]
    )

    print("\nOriginal CPSE Materials:")

    for member in group["members"]:

        print(
            f"  {member['cpse']} | "
            f"{member['original_code']} | "
            f"{member['description']}"
        )