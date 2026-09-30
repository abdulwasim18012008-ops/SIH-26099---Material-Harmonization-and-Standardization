from ai_engine.preprocessing import normalize_text
from ai_engine.extraction import extract_attributes
from ai_engine.embeddings import MaterialEmbeddingModel
from ai_engine.matching import (
    compare_attributes,
    calculate_match_score
)
from ai_engine.functional import (
    check_functional_equivalence
)
from ai_engine.classification import (
    classify_material
)
from ai_engine.standardization import (
    standardize_material
)
from ai_engine.national_code import (
    generate_national_code
)


class MaterialAIEngine:

    def __init__(self):

        print("Initializing Material AI Engine...")

        self.embedding_model = MaterialEmbeddingModel()

        print("Material AI Engine ready.")

    def analyze(self, material_a: str, material_b: str):
        """
        Complete AI analysis pipeline for two materials.
        """

        # =====================================================
        # STEP 1 — NORMALIZATION
        # =====================================================

        normalized_a = normalize_text(material_a)
        normalized_b = normalize_text(material_b)

        # =====================================================
        # STEP 2 — ATTRIBUTE EXTRACTION
        # =====================================================

        attributes_a = extract_attributes(
            normalized_a
        )

        attributes_b = extract_attributes(
            normalized_b
        )

        # =====================================================
        # STEP 3 — CLASSIFICATION
        # =====================================================

        classification_a = classify_material(
            attributes_a
        )

        classification_b = classify_material(
            attributes_b
        )

        # =====================================================
        # STEP 4 — STANDARDIZATION
        # =====================================================

        standardized_a = standardize_material(
            attributes_a
        )

        standardized_b = standardize_material(
            attributes_b
        )

        # =====================================================
        # STEP 5 — NATIONAL CODE RECOMMENDATION
        # =====================================================

        national_code_a = generate_national_code(
            standardized_a
        )

        national_code_b = generate_national_code(
            standardized_b
        )

        # =====================================================
        # STEP 6 — SEMANTIC EMBEDDINGS
        # =====================================================

        embedding_a = self.embedding_model.encode(
            normalized_a
        )

        embedding_b = self.embedding_model.encode(
            normalized_b
        )

        # =====================================================
        # STEP 7 — SEMANTIC SIMILARITY
        # =====================================================

        # Embeddings are normalized, therefore the
        # dot product gives cosine similarity.

        semantic_similarity = float(
            embedding_a @ embedding_b
        )

        semantic_similarity = round(
            semantic_similarity,
            4
        )

        # =====================================================
        # STEP 8 — ATTRIBUTE COMPARISON
        # =====================================================

        attribute_result = compare_attributes(
            attributes_a,
            attributes_b
        )

        # =====================================================
        # STEP 9 — HYBRID MATCHING
        # =====================================================

        match_result = calculate_match_score(
            semantic_similarity,
            attribute_result
        )

        # =====================================================
        # STEP 10 — FUNCTIONAL ANALYSIS
        # =====================================================

        functional_result = check_functional_equivalence(
            attributes_a,
            attributes_b,
            semantic_similarity
        )

        # =====================================================
        # STEP 11 — FINAL RESULT
        # =====================================================

        return {

            "material_a": {

                "original":
                    material_a,

                "normalized":
                    normalized_a,

                "attributes":
                    attributes_a,

                "classification":
                    classification_a,

                "standardization":
                    standardized_a,

                "national_code":
                    national_code_a
            },

            "material_b": {

                "original":
                    material_b,

                "normalized":
                    normalized_b,

                "attributes":
                    attributes_b,

                "classification":
                    classification_b,

                "standardization":
                    standardized_b,

                "national_code":
                    national_code_b
            },

            "semantic_similarity":
                semantic_similarity,

            "attribute_analysis":
                attribute_result,

            "match_analysis":
                match_result,

            "functional_analysis":
                functional_result,

            "final_decision":
                match_result["match_type"],

            "confidence":
                match_result["hybrid_score"],

            "explanation":
                match_result["explanation"]
        }