def compare_attributes(attributes_a: dict, attributes_b: dict) -> dict:
    """
    Compare technical attributes of two materials.
    """

    fields = [
    "material",
    "type",
    "grade",
    "diameter",
    "length",
    "width",
    "thickness",
    "standard",
    "bearing_code",
    "nominal_diameter",
    "pressure",
    "voltage",
    "power",
    "frequency",
    "schedule",
    "angle",
    "thread",
    "head_type"
]

    matched = []
    mismatched = []
    unavailable = []

    for field in fields:

        value_a = attributes_a.get(field)
        value_b = attributes_b.get(field)

        # Both materials don't have this attribute
        if value_a is None and value_b is None:
            unavailable.append(field)
            continue

        # One material has it, the other doesn't
        if value_a is None or value_b is None:
            mismatched.append({
                "field": field,
                "value_a": value_a,
                "value_b": value_b
            })
            continue

        # Both have the attribute and values match
        if str(value_a).lower() == str(value_b).lower():

            matched.append({
                "field": field,
                "value": value_a
            })

        # Both have the attribute but values differ
        else:

            mismatched.append({
                "field": field,
                "value_a": value_a,
                "value_b": value_b
            })

    # Only compare fields where at least one material
    # provided a value
    comparable_count = len(matched) + len(mismatched)

    if comparable_count == 0:
        attribute_score = 0.0
    else:
        attribute_score = len(matched) / comparable_count

    return {
        "attribute_score": round(attribute_score, 4),
        "matched": matched,
        "mismatched": mismatched,
        "unavailable": unavailable
    }


def calculate_match_score(
    semantic_similarity: float,
    attribute_result: dict
) -> dict:
    """
    Combine semantic similarity with technical attribute matching.
    """

    attribute_score = attribute_result["attribute_score"]
    mismatched = attribute_result["mismatched"]

    # ---------------------------------------------------------
    # FIELD CATEGORIES
    # ---------------------------------------------------------

    # Differences in these fields usually indicate that
    # the materials/components are fundamentally different.
    fundamental_fields = {
    "material",
    "type",
    "bearing_code"
}

    specification_fields = {
        "grade",
        "diameter",
        "length",
        "width",
        "thickness",
        "standard",
        "nominal_diameter",
        "pressure",
        "voltage",
        "power",
        "frequency",
        "schedule",
        "angle",
        "thread",
        "head_type"
}

    fundamental_conflicts = []
    specification_conflicts = []

    for mismatch in mismatched:

        field = mismatch["field"]

        if field in fundamental_fields:

            fundamental_conflicts.append(mismatch)

        elif field in specification_fields:

            specification_conflicts.append(mismatch)

    # ---------------------------------------------------------
    # HYBRID SCORE
    # ---------------------------------------------------------

    # Semantic understanding = 55%
    # Technical attributes = 45%
    hybrid_score = (
        0.55 * semantic_similarity
        +
        0.45 * attribute_score
    )

    hybrid_score = round(hybrid_score, 4)

    # ---------------------------------------------------------
    # CLASSIFICATION
    # ---------------------------------------------------------

    # Fundamental difference:
    # Example:
    # stainless steel bolt vs carbon steel pipe
    if fundamental_conflicts:

        match_type = "DIFFERENT"

    # Same basic component but specification differs:
    # Example:
    # M10 x 50 bolt vs M10 x 60 bolt
    elif specification_conflicts:

        match_type = "NEAR_DUPLICATE"

    # Strong semantic + technical agreement
    elif hybrid_score >= 0.85:

        match_type = "IDENTICAL"

    # Moderate similarity
    elif hybrid_score >= 0.65:

        match_type = "NEAR_DUPLICATE"

    # Low similarity
    else:

        match_type = "DIFFERENT"

    # ---------------------------------------------------------
    # EXPLANATION
    # ---------------------------------------------------------

    explanation = []

    explanation.append(
        f"Semantic similarity: {semantic_similarity:.4f}"
    )

    explanation.append(
        f"Technical attribute score: {attribute_score:.4f}"
    )

    # Explain fundamental conflicts
    if fundamental_conflicts:

        for conflict in fundamental_conflicts:

            explanation.append(
                f"Fundamental conflict in "
                f"{conflict['field']}: "
                f"{conflict['value_a']} vs "
                f"{conflict['value_b']}"
            )

    # Explain specification conflicts
    if specification_conflicts:

        for conflict in specification_conflicts:

            explanation.append(
                f"Specification conflict in "
                f"{conflict['field']}: "
                f"{conflict['value_a']} vs "
                f"{conflict['value_b']}"
            )

    # No conflicts
    if not fundamental_conflicts and not specification_conflicts:

        explanation.append(
            "No critical specification conflicts detected."
        )

    # ---------------------------------------------------------
    # FINAL RESULT
    # ---------------------------------------------------------

    return {
        "hybrid_score": hybrid_score,
        "match_type": match_type,
        "fundamental_conflicts": fundamental_conflicts,
        "specification_conflicts": specification_conflicts,
        "explanation": explanation
    }