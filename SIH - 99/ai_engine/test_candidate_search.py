from ai_engine.embeddings import MaterialEmbeddingModel
from ai_engine.candidate_search import MaterialCandidateSearch


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


print("Loading embedding model...")

embedding_model = MaterialEmbeddingModel()

search_engine = MaterialCandidateSearch(
    embedding_model
)

search_engine.add_materials(
    materials
)


query = "M10 S.S. HEX BOLT 50MM"

print("\nQuery:")
print(query)

result = search_engine.search(
    query,
    top_k=5
)


print("\nCandidate Results:")

for index, candidate in enumerate(
    result["results"],
    start=1
):

    print(f"\n{index}. {candidate['material']}")

    print(
        f"   Material ID: "
        f"{candidate['material_id']}"
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
        f"   Semantic Similarity: "
        f"{candidate['semantic_similarity']}"
    )

    print(
        f"   Attribute Score: "
        f"{candidate['attribute_score']}"
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
        f"   Matched Attributes: "
        f"{candidate['matched_attributes']}"
    )

    print(
        f"   Mismatched Attributes: "
        f"{candidate['mismatched_attributes']}"
    )