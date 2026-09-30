import numpy as np
import faiss


class MaterialVectorSearch:

    def __init__(self, embedding_model):
        self.embedding_model = embedding_model
        self.materials = []
        self.index = None

    def add_materials(self, materials):
        """
        Add material records to the vector index.

        Each material should be a dictionary containing at least:

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

            description = material.get("description", "")

            embedding = self.embedding_model.encode(description)

            embeddings.append(embedding)

        embeddings = np.array(
            embeddings,
            dtype="float32"
        )

        dimension = embeddings.shape[1]

        # Inner Product + normalized embeddings
        # = cosine similarity
        self.index = faiss.IndexFlatIP(dimension)

        self.index.add(embeddings)

        self.materials = materials

    def search(self, query, top_k=5):
        """
        Search the material database using semantic similarity.
        """

        if self.index is None:
            return []

        query_embedding = self.embedding_model.encode(query)

        query_embedding = np.array(
            [query_embedding],
            dtype="float32"
        )

        number_of_results = min(
            top_k,
            len(self.materials)
        )

        scores, indices = self.index.search(
            query_embedding,
            number_of_results
        )

        results = []

        for score, index in zip(
            scores[0],
            indices[0]
        ):

            if index < 0:
                continue

            material = self.materials[index]

            results.append({
                "material_id": material.get("material_id"),
                "cpse": material.get("cpse"),
                "original_code": material.get("original_code"),
                "description": material.get("description"),
                "similarity": round(
                    float(score),
                    4
                )
            })

        return results