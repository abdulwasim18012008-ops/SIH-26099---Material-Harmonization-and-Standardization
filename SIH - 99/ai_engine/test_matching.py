from preprocessing import normalize_text
from extraction import extract_attributes
from embeddings import MaterialEmbeddingModel

from matching import (
    compare_attributes,
    calculate_match_score
)

from sklearn.metrics.pairwise import cosine_similarity


# =========================================================
# LOAD MODEL
# =========================================================

embedding_model = MaterialEmbeddingModel()


# =========================================================
# MATERIAL PAIRS
# =========================================================

pairs = [

    (
        "SS BOLT M10 X 50 MM",
        "M10 S.S. HEX BOLT 50MM"
    ),

    (
        "SS BOLT M10 X 50 MM",
        "SS BOLT M10 X 60 MM"
    ),

    (
        "SS BOLT M10 X 50 MM",
        "CARBON STEEL PIPE 25 MM DIA"
    )
]


# =========================================================
# TEST EACH PAIR
# =========================================================

for material_a, material_b in pairs:

    print("\n")
    print("=" * 70)

    print("MATERIAL A:")
    print(material_a)

    print("MATERIAL B:")
    print(material_b)


    # -----------------------------------------------------
    # NORMALIZE
    # -----------------------------------------------------

    normalized_a = normalize_text(material_a)
    normalized_b = normalize_text(material_b)


    # -----------------------------------------------------
    # EXTRACT ATTRIBUTES
    # -----------------------------------------------------

    attributes_a = extract_attributes(normalized_a)
    attributes_b = extract_attributes(normalized_b)


    # -----------------------------------------------------
    # CREATE EMBEDDINGS
    # -----------------------------------------------------

    embedding_a = embedding_model.encode(normalized_a)
    embedding_b = embedding_model.encode(normalized_b)


    # -----------------------------------------------------
    # SEMANTIC SIMILARITY
    # -----------------------------------------------------

    semantic_similarity = cosine_similarity(
        [embedding_a],
        [embedding_b]
    )[0][0]


    semantic_similarity = float(semantic_similarity)


    # -----------------------------------------------------
    # ATTRIBUTE COMPARISON
    # -----------------------------------------------------

    attribute_result = compare_attributes(
        attributes_a,
        attributes_b
    )


    # -----------------------------------------------------
    # HYBRID MATCH
    # -----------------------------------------------------

    result = calculate_match_score(
        semantic_similarity,
        attribute_result
    )


    # -----------------------------------------------------
    # DISPLAY
    # -----------------------------------------------------

    print("\nSemantic similarity:")
    print(round(semantic_similarity, 4))

    print("\nAttribute score:")
    print(attribute_result["attribute_score"])

    print("\nMatched attributes:")
    print(attribute_result["matched"])

    print("\nMismatched attributes:")
    print(attribute_result["mismatched"])

    print("\nFINAL RESULT:")
    print(result["match_type"])

    print("Hybrid score:")
    print(result["hybrid_score"])

    print("\nExplanation:")

    for explanation in result["explanation"]:
        print("-", explanation)