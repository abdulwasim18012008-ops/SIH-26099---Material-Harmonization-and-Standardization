from ai_engine.preprocessing import normalize_text
from ai_engine.extraction import extract_attributes
from ai_engine.vector_search import MaterialVectorSearch
from ai_engine.matching import (
    compare_attributes,
    calculate_match_score
)


class MaterialCandidateSearch:

    def __init__(self, embedding_model):

        self.embedding_model = embedding_model

        self.vector_search = MaterialVectorSearch(
            embedding_model
        )

    def add_materials(self, materials):

        self.vector_search.add_materials(
            materials
        )

    def search(
        self,
        query,
        top_k=5,
        candidate_pool=10
    ):

        normalized_query = normalize_text(
            query
        )

        query_attributes = extract_attributes(
            normalized_query
        )

        vector_results = self.vector_search.search(
            query,
            top_k=candidate_pool
        )

        results = []

        for candidate in vector_results:

            candidate_material = candidate.get(
                "description",
                ""
            )

            semantic_similarity = candidate.get(
                "similarity",
                0.0
            )

            normalized_candidate = normalize_text(
                candidate_material
            )

            candidate_attributes = extract_attributes(
                normalized_candidate
            )

            attribute_result = compare_attributes(
                query_attributes,
                candidate_attributes
            )

            match_result = calculate_match_score(
                semantic_similarity,
                attribute_result
            )

            results.append({

                "material_id": candidate.get(
                    "material_id"
                ),

                "cpse": candidate.get(
                    "cpse"
                ),

                "original_code": candidate.get(
                    "original_code"
                ),

                "material": candidate_material,

                "semantic_similarity": semantic_similarity,

                "attribute_score": attribute_result[
                    "attribute_score"
                ],

                "hybrid_score": match_result[
                    "hybrid_score"
                ],

                "match_type": match_result[
                    "match_type"
                ],

                "attributes": candidate_attributes,

                "matched_attributes": attribute_result[
                    "matched"
                ],

                "mismatched_attributes": attribute_result[
                    "mismatched"
                ],

                "explanation": match_result[
                    "explanation"
                ]
            })

        results.sort(
            key=lambda x: x["hybrid_score"],
            reverse=True
        )

        return {
            "query": query,

            "normalized_query": normalized_query,

            "query_attributes": query_attributes,

            "results": results[:top_k]
        }