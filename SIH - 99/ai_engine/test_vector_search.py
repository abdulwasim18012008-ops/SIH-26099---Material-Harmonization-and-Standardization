from ai_engine.embeddings import MaterialEmbeddingModel
from ai_engine.vector_search import MaterialVectorSearch


embedding_model = MaterialEmbeddingModel()

search_engine = MaterialVectorSearch(
    embedding_model
)


materials = [

    "SS BOLT M10 X 50 MM",

    "SS BOLT M10 X 60 MM",

    "SS NUT M10",

    "MS WASHER M12",

    "CARBON STEEL PIPE 25 MM",

    "SS304 PIPE 50 MM X 2 MM",

    "SS VALVE 25 MM",

    "BALL BEARING 6205",

    "BALL BEARING 6305",

    "ASTM A193 B7 BOLT M16 X 80 MM"
]


search_engine.add_materials(
    materials
)


queries = [

    "M10 S.S. HEX BOLT 50MM",

    "STAINLESS STEEL PIPE 50 MM",

    "BALL BEARING 6205"
]


for query in queries:

    print("\n")
    print("=" * 70)

    print("QUERY:")
    print(query)

    results = search_engine.search(
        query,
        top_k=5
    )

    print("\nTOP MATCHES:")

    for result in results:

        print(
            f"{result['similarity']:.4f}"
            f"  →  "
            f"{result['material']}"
        )