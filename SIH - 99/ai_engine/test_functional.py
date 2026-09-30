from preprocessing import normalize_text
from extraction import extract_attributes
from embeddings import MaterialEmbeddingModel
from functional import check_functional_equivalence

from sklearn.metrics.pairwise import cosine_similarity


model = MaterialEmbeddingModel()


pairs = [

    (
        "SS HEX BOLT M10 X 50 MM",
        "SS CAP SCREW M10 X 50 MM"
    ),

    (
        "SS BOLT M10 X 50 MM",
        "CARBON STEEL PIPE 25 MM"
    ),

    (
        "BALL BEARING 6205",
        "BALL BEARING 6305"
    )
]


for material_a, material_b in pairs:

    print("\n")
    print("=" * 70)

    print("MATERIAL A:")
    print(material_a)

    print("MATERIAL B:")
    print(material_b)

    # Normalize
    normalized_a = normalize_text(material_a)
    normalized_b = normalize_text(material_b)

    # Extract attributes
    attributes_a = extract_attributes(normalized_a)
    attributes_b = extract_attributes(normalized_b)

    # Embeddings
    embedding_a = model.encode(normalized_a)
    embedding_b = model.encode(normalized_b)

    # Semantic similarity
    similarity = cosine_similarity(
        [embedding_a],
        [embedding_b]
    )[0][0]

    similarity = float(similarity)

    # Functional analysis
    result = check_functional_equivalence(
        attributes_a,
        attributes_b,
        similarity
    )

    print("\nAttributes A:")
    print(attributes_a)

    print("\nAttributes B:")
    print(attributes_b)

    print("\nSemantic similarity:")
    print(round(similarity, 4))

    print("\nFUNCTIONAL RESULT:")
    print(result)