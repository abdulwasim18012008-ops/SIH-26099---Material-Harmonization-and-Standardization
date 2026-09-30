from ai_engine.preprocessing import normalize_text
from ai_engine.extraction import extract_attributes
from ai_engine.semantic_classifier import SemanticMaterialClassifier
from ai_engine.standardization import standardize_material
from ai_engine.national_code import generate_national_code
from ai_engine.functional import check_functional_equivalence
from ai_engine.candidate_search import MaterialCandidateSearch


class MaterialAIPipeline:

    def __init__(self, embedding_model):

        self.embedding_model = embedding_model

        self.semantic_classifier = SemanticMaterialClassifier(
            embedding_model
        )

        self.candidate_search = MaterialCandidateSearch(
            embedding_model
        )

    def add_materials(self, materials):
        """
        Add existing CPSE material records
        to the AI candidate search index.
        """

        if not materials:
            return

        self.candidate_search.add_materials(materials)

    def analyze_material(self, material, top_k=5):

        if not material or not str(material).strip():
            raise ValueError("Material description cannot be empty")

        # --------------------------------------------------
        # 1. PREPROCESSING
        # --------------------------------------------------

        normalized = normalize_text(material)

        # --------------------------------------------------
        # 2. TECHNICAL ATTRIBUTE EXTRACTION
        # --------------------------------------------------

        attributes = extract_attributes(normalized)

        # --------------------------------------------------
        # 3. SEMANTIC CLASSIFICATION
        # --------------------------------------------------

        classification = self.semantic_classifier.classify(
            normalized
        )

        # --------------------------------------------------
        # 4. STANDARDIZATION
        # --------------------------------------------------

        standardization = standardize_material(
            attributes,
            classification
        )

        # --------------------------------------------------
        # 5. NATIONAL MATERIAL CODE
        # --------------------------------------------------

        national_code = generate_national_code(
            standardization,
            classification
        )

        # --------------------------------------------------
        # 6. CANDIDATE SEARCH
        # --------------------------------------------------

        candidate_result = self.candidate_search.search(
            normalized,
            top_k=top_k
        )

        candidates = candidate_result.get(
            "results",
            []
        )

        # --------------------------------------------------
        # 7. FUNCTIONAL ANALYSIS
        # --------------------------------------------------

        for candidate in candidates:

            candidate_attributes = candidate.get(
                "attributes",
                {}
            )

            semantic_similarity = candidate.get(
                "semantic_similarity",
                0.0
            )

            match_type = candidate.get(
                "match_type",
                "UNKNOWN"
            )

            functional_result = check_functional_equivalence(
                attributes,
                candidate_attributes,
                semantic_similarity,
                match_type
            )

            candidate["functional_analysis"] = (
                functional_result
            )

        # --------------------------------------------------
        # 8. SELECT BEST RECOMMENDATION
        # --------------------------------------------------

        recommendation = None

        if candidates:

            # Candidate search should already return
            # candidates ordered by relevance.
            best = candidates[0]

            recommendation = {
                "match_type": best.get(
                    "match_type",
                    "UNKNOWN"
                ),

                "confidence": best.get(
                    "confidence",
                    best.get("semantic_similarity", 0.0)
                ),

                "semantic_similarity": best.get(
                    "semantic_similarity",
                    0.0
                ),

                "matched_attributes": best.get(
                    "matched_attributes",
                    []
                ),

                "conflicting_attributes": best.get(
                    "conflicting_attributes",
                    []
                ),

                "candidate": best,

                "human_validation_required": (
                    best.get("confidence", 0.0) < 0.90
                )
            }

        else:

            # IMPORTANT:
            # Do not fake a recommendation when there
            # is no candidate material to compare against.

            recommendation = {
                "match_type": "NO_MATCH_FOUND",
                "confidence": 0.0,
                "semantic_similarity": 0.0,
                "matched_attributes": [],
                "conflicting_attributes": [],
                "candidate": None,
                "human_validation_required": True
            }

        # --------------------------------------------------
        # 9. FINAL RESULT
        # --------------------------------------------------

        return {

            "input": {
                "original": material,
                "normalized": normalized
            },

            "understanding": {
                "attributes": attributes,
                "classification": classification
            },

            "recommendation": recommendation,

            "standardization": standardization,

            "national_code": national_code,

            "candidate_matches": candidates
        }