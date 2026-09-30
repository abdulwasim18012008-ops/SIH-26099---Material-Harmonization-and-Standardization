FUNCTIONAL_GROUPS = {

    "fastener": {
        "bolt",
        "screw",
        "stud",
        "fastener"
    },

    "pipe": {
        "pipe",
        "tube"
    },

    "valve": {
        "valve"
    },

    "bearing": {
        "bearing"
    },

    "washer": {
        "washer"
    },

    "nut": {
        "nut"
    },

    "gasket": {
        "gasket",
        "seal"
    }
}


def get_functional_group(material_type):
    """
    Determine the functional group of a material.
    """

    if not material_type:
        return None

    material_type = material_type.lower().strip()

    for group, types in FUNCTIONAL_GROUPS.items():

        if material_type in types:
            return group

    return None


def check_functional_equivalence(
    attributes_a: dict,
    attributes_b: dict,
    semantic_similarity: float,
    match_type: str = None
) -> dict:
    """
    Determine whether two materials are functionally equivalent.

    match_type comes from the main technical matching engine.

    IDENTICAL:
        Materials are technically identical and therefore
        functionally equivalent.

    NEAR_DUPLICATE:
        Materials perform a similar function but have
        specification differences.

    DIFFERENT:
        Materials are not considered functionally equivalent.
    """

    type_a = attributes_a.get("type")
    type_b = attributes_b.get("type")

    group_a = get_functional_group(type_a)
    group_b = get_functional_group(type_b)

    reasons = []
    specification_conflicts = []

    # --------------------------------------------------
    # 1. UNKNOWN FUNCTIONAL GROUP
    # --------------------------------------------------

    if group_a is None or group_b is None:

        return {
            "decision": "NOT_EQUIVALENT",
            "functional_group_a": group_a,
            "functional_group_b": group_b,
            "confidence": 0.0,
            "reasons": [
                "Unable to determine functional group."
            ],
            "specification_conflicts": []
        }

    # --------------------------------------------------
    # 2. DIFFERENT FUNCTIONAL GROUPS
    # --------------------------------------------------

    if group_a != group_b:

        return {
            "decision": "NOT_EQUIVALENT",
            "functional_group_a": group_a,
            "functional_group_b": group_b,
            "confidence": 0.0,
            "reasons": [
                f"Different functional groups: "
                f"{group_a} vs {group_b}"
            ],
            "specification_conflicts": []
        }

    reasons.append(
        f"Both materials belong to the "
        f"'{group_a}' functional group."
    )

    # --------------------------------------------------
    # 3. IDENTICAL MATERIAL
    # --------------------------------------------------

    if match_type == "IDENTICAL":

        reasons.append(
            "Technical matching classified the materials "
            "as IDENTICAL."
        )

        reasons.append(
            "Materials are considered functionally equivalent."
        )

        return {
            "decision": "FUNCTIONALLY_EQUIVALENT",
            "functional_group_a": group_a,
            "functional_group_b": group_b,
            "confidence": 1.0,
            "reasons": reasons,
            "specification_conflicts": []
        }

    # --------------------------------------------------
    # 4. MATERIAL CONFLICT
    # --------------------------------------------------

    material_a = attributes_a.get("material")
    material_b = attributes_b.get("material")

    if (
        material_a is not None
        and material_b is not None
        and str(material_a).lower()
        != str(material_b).lower()
    ):

        reasons.append(
            f"Material difference: "
            f"{material_a} vs {material_b}"
        )

        reasons.append(
            "Material differences require human validation."
        )

        return {
            "decision": "FUNCTIONAL_CANDIDATE",
            "functional_group_a": group_a,
            "functional_group_b": group_b,
            "confidence": 0.50,
            "reasons": reasons,
            "specification_conflicts": []
        }

    # --------------------------------------------------
    # 5. BEARING CODE CONFLICT
    # --------------------------------------------------

    bearing_code_a = attributes_a.get(
        "bearing_code"
    )

    bearing_code_b = attributes_b.get(
        "bearing_code"
    )

    if (
        bearing_code_a is not None
        and bearing_code_b is not None
        and str(bearing_code_a).lower()
        != str(bearing_code_b).lower()
    ):

        reasons.append(
            f"Bearing code difference: "
            f"{bearing_code_a} vs {bearing_code_b}"
        )

        return {
            "decision": "NOT_EQUIVALENT",
            "functional_group_a": group_a,
            "functional_group_b": group_b,
            "confidence": 0.0,
            "reasons": reasons,
            "specification_conflicts": []
        }

    # --------------------------------------------------
    # 6. SPECIFICATION CONFLICTS
    # --------------------------------------------------

    specification_fields = [
        "grade",
        "diameter",
        "length",
        "width",
        "thickness",
        "standard"
    ]

    for field in specification_fields:

        value_a = attributes_a.get(field)
        value_b = attributes_b.get(field)

        if (
            value_a is not None
            and value_b is not None
            and str(value_a).lower()
            != str(value_b).lower()
        ):

            specification_conflicts.append({
                "field": field,
                "value_a": value_a,
                "value_b": value_b
            })

    # --------------------------------------------------
    # 7. NEAR-DUPLICATE / FUNCTIONAL CANDIDATE
    # --------------------------------------------------

    if specification_conflicts:

        reasons.append(
            f"Moderate semantic similarity: "
            f"{semantic_similarity:.4f}"
        )

        for conflict in specification_conflicts:

            reasons.append(
                f"Specification conflict in "
                f"{conflict['field']}: "
                f"{conflict['value_a']} vs "
                f"{conflict['value_b']}"
            )

        reasons.append(
            "Technical specification differences "
            "require human validation."
        )

        confidence = round(
            semantic_similarity * 0.7,
            4
        )

        return {
            "decision": "FUNCTIONAL_CANDIDATE",
            "functional_group_a": group_a,
            "functional_group_b": group_b,
            "confidence": confidence,
            "reasons": reasons,
            "specification_conflicts":
                specification_conflicts
        }

    # --------------------------------------------------
    # 8. NO SPECIFICATION CONFLICTS
    # --------------------------------------------------

    if semantic_similarity >= 0.80:

        reasons.append(
            f"High semantic similarity: "
            f"{semantic_similarity:.4f}"
        )

        reasons.append(
            "Materials may perform the same function."
        )

        return {
            "decision": "FUNCTIONALLY_EQUIVALENT",
            "functional_group_a": group_a,
            "functional_group_b": group_b,
            "confidence": round(
                semantic_similarity,
                4
            ),
            "reasons": reasons,
            "specification_conflicts": []
        }

    if semantic_similarity >= 0.65:

        reasons.append(
            f"Moderate semantic similarity: "
            f"{semantic_similarity:.4f}"
        )

        reasons.append(
            "Potential functional equivalence. "
            "Human validation recommended."
        )

        return {
            "decision": "FUNCTIONAL_CANDIDATE",
            "functional_group_a": group_a,
            "functional_group_b": group_b,
            "confidence": round(
                semantic_similarity,
                4
            ),
            "reasons": reasons,
            "specification_conflicts": []
        }

    # --------------------------------------------------
    # 9. LOW SEMANTIC SIMILARITY
    # --------------------------------------------------

    reasons.append(
        f"Low semantic similarity: "
        f"{semantic_similarity:.4f}"
    )

    return {
        "decision": "NOT_EQUIVALENT",
        "functional_group_a": group_a,
        "functional_group_b": group_b,
        "confidence": 0.0,
        "reasons": reasons,
        "specification_conflicts": []
    }