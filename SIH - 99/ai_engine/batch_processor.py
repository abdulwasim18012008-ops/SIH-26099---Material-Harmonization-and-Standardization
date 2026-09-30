from ai_engine.standardization import standardize_material
from ai_engine.national_code import generate_national_code


class MaterialBatchProcessor:

    def __init__(self, pipeline):
        self.pipeline = pipeline

    def process(self, materials):
        """
        Process multiple CPSE material records.

        Each record should contain:

        {
            "material_id": "...",
            "cpse": "...",
            "original_code": "...",
            "description": "..."
        }

        Materials are grouped only when their AI-generated
        standardized representation and proposed national
        code are identical.
        """

        if not materials:
            return {
                "total_materials": 0,
                "total_groups": 0,
                "groups": []
            }

        # --------------------------------------------------
        # STEP 1: ADD ALL MATERIALS TO SEARCH INDEX
        # --------------------------------------------------

        self.pipeline.add_materials(
            materials
        )

        # --------------------------------------------------
        # STEP 2: ANALYZE EVERY MATERIAL
        # --------------------------------------------------

        analyses = []

        for material in materials:

            description = material.get(
                "description",
                ""
            )

            analysis = self.pipeline.analyze_material(
                description,
                top_k=5
            )

            analyses.append({
                "record": material,
                "analysis": analysis
            })

        # --------------------------------------------------
        # STEP 3: CREATE CANONICAL GROUPS
        # --------------------------------------------------

        grouped_materials = {}

        for item in analyses:

            record = item["record"]
            analysis = item["analysis"]

            standardization = analysis[
                "standardization"
            ]

            national_code = analysis[
                "national_code"
            ]

            standardized_description = (
                standardization[
                    "standardized_description"
                ]
            )

            recommended_code = (
                national_code[
                    "recommended_national_code"
                ]
            )

           # ------------------------------------------
            # CANONICAL IDENTITY
            # ------------------------------------------
            # Materials with the same AI-proposed national
            # code and classification are treated as one
            # harmonization group.

# Original descriptions remain preserved inside
# each member for traceability.

            canonical_key = (
                recommended_code,
                standardization["category"],
                standardization["subcategory"]
                )

            if canonical_key not in grouped_materials:

                grouped_materials[
                    canonical_key
                ] = {

                    "standardized_description":
                        standardized_description,

                    "category":
                        standardization[
                            "category"
                        ],

                    "subcategory":
                        standardization[
                            "subcategory"
                        ],

                    "recommended_national_code":
                        recommended_code,

                                        "national_code_confidence":
                        national_code[
                            "confidence"
                        ],

                    "classification_explanation":
                        analysis[
                            "understanding"
                        ][
                            "classification"
                        ].get(
                            "explanation",
                            ""
                        ),

                    "members": []
                }

            grouped_materials[
                canonical_key
            ]["members"].append(
                record
            )

        # --------------------------------------------------
        # STEP 4: BUILD FINAL GROUP LIST
        # --------------------------------------------------

        groups = []

        for group_data in grouped_materials.values():

            member_count = len(
                group_data["members"]
            )

            if member_count > 1:

                match_type = (
                    "IDENTICAL_GROUP"
                )

            else:

                match_type = (
                    "SINGLE_MATERIAL"
                )

            groups.append({

                "group_id":
                    f"GROUP-{len(groups) + 1:04d}",

                "match_type":
                    match_type,

                "standardized_description":
                    group_data[
                        "standardized_description"
                    ],

                "category":
                    group_data[
                        "category"
                    ],

                "subcategory":
                    group_data[
                        "subcategory"
                    ],

                "recommended_national_code":
                    group_data[
                        "recommended_national_code"
                    ],

                                "national_code_confidence":
                    group_data[
                        "national_code_confidence"
                    ],

                "classification_explanation":
                    group_data[
                        "classification_explanation"
                    ],

                "member_count":
                    member_count,

                "members":
                    group_data[
                        "members"
                    ]
            })

        # --------------------------------------------------
        # STEP 5: FINAL RESULT
        # --------------------------------------------------

        return {

            "total_materials":
                len(materials),

            "total_groups":
                len(groups),

            "groups":
                groups
        }