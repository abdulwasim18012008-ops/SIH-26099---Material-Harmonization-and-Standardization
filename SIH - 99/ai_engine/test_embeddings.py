from embeddings import MaterialEmbeddingModel
from sklearn.metrics.pairwise import cosine_similarity


model = MaterialEmbeddingModel()


materials = [
    "stainless steel bolt m10 x 50 mm",
    "m10 stainless steel hex bolt 50mm",
    "carbon steel pipe 25 mm diameter",
]


embeddings = []

for material in materials:
    vector = model.encode(material)
    embeddings.append(vector)


similarity_matrix = cosine_similarity(embeddings)


print("\nSIMILARITY MATRIX")
print("=" * 60)

for i in range(len(materials)):
    for j in range(len(materials)):

        print(
            f"{i} vs {j}: "
            f"{similarity_matrix[i][j]:.4f}"
        )

print("\nMATERIALS")
print("=" * 60)

for i, material in enumerate(materials):
    print(f"{i}: {material}")