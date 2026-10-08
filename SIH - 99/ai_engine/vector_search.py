import numpy as np


class MaterialVectorSearch:

    def __init__(self, embedding_model):
        self.embedding_model = embedding_model
        self.materials = []
        self.embeddings = None

    def add_materials(self, materials):
        """
        Add material records to the vector search.

        Each material should contain:

        {
            "material_id": "...",
            "cpse": "...",
            "original_code": "...",
            "description": "..."
        }
        """

        if not materials:
            return

        embeddings = []

        for material in materials:

            description = material.get(
                "description",
                ""
            )

            embedding = self.embedding_model.encode(
                description
            )

            embeddings.append(embedding)

        self.embeddings = np.asarray(
            embeddings,
            dtype="float32"
        )

        self.materials = materials

    def search(self, query, top_k=5):
        """
        Search materials using cosine similarity.
        """

        if self.embeddings is None:
            return []

        query_embedding = self.embedding_model.encode(
            query
        )

        query_embedding = np.asarray(
            query_embedding,
            dtype="float32"
        )

        # Embeddings are already normalized,
        # so dot product gives cosine similarity.
        scores = self.embeddings @ query_embedding

        number_of_results = min(
            top_k,
            len(self.materials)
        )

        if number_of_results == 0:
            return []

        top_indices = np.argsort(
            scores
        )[::-1][:number_of_results]

        results = []

        for index in top_indices:

            material = self.materials[int(index)]

            results.append({
                "material_id": material.get(
                    "material_id"
                ),

                "cpse": material.get(
                    "cpse"
                ),

                "original_code": material.get(
                    "original_code"
                ),

                "description": material.get(
                    "description"
                ),

                "similarity": round(
                    float(scores[index]),
                    4
                )
            })

        return results
