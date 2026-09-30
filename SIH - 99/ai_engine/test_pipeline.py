from ai_engine.embeddings import MaterialEmbeddingModel
from ai_engine.pipeline import MaterialAIPipeline


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
        "description": "SS BOLT M10 X 60 MM"
    },

    {
        "material_id": "MAT003",
        "cpse": "HPCL",
        "original_code": "HPCL-NUT-010",
        "description": "SS NUT M10"
    },

    {
        "material_id": "MAT004",
        "cpse": "BPCL",
        "original_code": "BPCL-PIPE-020",
        "description": "CARBON STEEL PIPE 25 MM DIA"
    },

    {
        "material_id": "MAT005",
        "cpse": "ONGC",
        "original_code": "ONGC-BEAR-6205",
        "description": "BALL BEARING 6205"
    },

    {
        "material_id": "MAT006",
        "cpse": "GAIL",
        "original_code": "GAIL-PIPE-050",
        "description": "SS304 PIPE 50 MM X 2 MM THK"
    }
]


print("Creating AI pipeline...")

embedding_model = MaterialEmbeddingModel()

pipeline = MaterialAIPipeline(
    embedding_model
)

pipeline.add_materials(
    materials
)


query = "M10 S.S. HEX BOLT 50MM"


print("\n" + "=" * 60)
print("MATERIAL AI ANALYSIS")
print("=" * 60)


print("\nInput Material:")
print(query)


result = pipeline.analyze_material(
    query,
    top_k=5
)


# --------------------------------------------------
# NORMALIZATION
# --------------------------------------------------

print("\n--- NORMALIZED ---")

print(
    result["input"]["normalized"]
)


# --------------------------------------------------
# ATTRIBUTE EXTRACTION
# --------------------------------------------------

print("\n--- EXTRACTED ATTRIBUTES ---")

for key, value in result[
    "understanding"
]["attributes"].items():

    print(
        f"{key}: {value}"
    )


# --------------------------------------------------
# CLASSIFICATION
# --------------------------------------------------

print("\n--- CLASSIFICATION ---")

print(
    result[
        "understanding"
    ]["classification"]
)


# --------------------------------------------------
# STANDARDIZATION
# --------------------------------------------------

print("\n--- STANDARDIZATION ---")

print(
    result[
        "standardization"
    ]["standardized_description"]
)


# --------------------------------------------------
# NATIONAL CODE
# --------------------------------------------------

print("\n--- NATIONAL CODE ---")

print(
    result[
        "national_code"
    ]["recommended_national_code"]
)

print(
    "Confidence:",
    result[
        "national_code"
    ]["confidence"]
)


# --------------------------------------------------
# CANDIDATE MATCHES
# --------------------------------------------------

print("\n--- CANDIDATE MATCHES ---")


for index, candidate in enumerate(
    result["candidate_matches"],
    start=1
):

    print(
        f"\n{index}. "
        f"{candidate['material']}"
    )

    print(
        f"   CPSE: "
        f"{candidate['cpse']}"
    )

    print(
        f"   Original Code: "
        f"{candidate['original_code']}"
    )

    print(
        f"   Hybrid Score: "
        f"{candidate['hybrid_score']}"
    )

    print(
        f"   Match Type: "
        f"{candidate['match_type']}"
    )

    print(
        "   Functional Analysis:"
    )

    print(
        f"   {candidate['functional_analysis']}"
    )