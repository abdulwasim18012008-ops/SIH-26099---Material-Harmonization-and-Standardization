STANDARD_TEMPLATES = {

    "bolt": {
        "category": "fastener",
        "required_fields": [
            "material",
            "type",
            "diameter",
            "length"
        ]
    },

    "screw": {
        "category": "fastener",
        "required_fields": [
            "material",
            "type",
            "diameter",
            "length"
        ]
    },

    "stud": {
        "category": "fastener",
        "required_fields": [
            "material",
            "type",
            "diameter",
            "length"
        ]
    },

    "nut": {
        "category": "fastener",
        "required_fields": [
            "material",
            "type",
            "diameter"
        ]
    },

    "washer": {
        "category": "fastener",
        "required_fields": [
            "material",
            "type",
            "diameter"
        ]
    },

    "pipe": {
        "category": "piping",
        "required_fields": [
            "material",
            "type",
            "diameter"
        ]
    },

    "tube": {
        "category": "piping",
        "required_fields": [
            "material",
            "type",
            "diameter"
        ]
    },

    "valve": {
        "category": "valve",
        "required_fields": [
            "material",
            "type",
            "nominal_diameter"
        ]
    },

    "bearing": {
        "category": "bearing",
        "required_fields": [
            "type",
            "bearing_code"
        ]
    },

    "gasket": {
        "category": "sealing",
        "required_fields": [
            "material",
            "type"
        ]
    },

    "transformer": {
        "category": "electrical",
        "required_fields": [
            "type"
        ]
    },

    "motor": {
        "category": "electrical",
        "required_fields": [
            "type"
        ]
    },

    "elbow": {
        "category": "piping",
        "required_fields": [
            "type",
            "nominal_diameter"
        ]
    },

    "reducer": {
        "category": "piping",
        "required_fields": [
            "type",
            "nominal_diameter"
        ]
    },

    "tee": {
        "category": "piping",
        "required_fields": [
            "type",
            "nominal_diameter"
        ]
    },

    "flange": {
        "category": "piping",
        "required_fields": [
            "type",
            "nominal_diameter"
        ]
    },

    "gate valve": {
        "category": "valve",
        "required_fields": [
            "type",
            "nominal_diameter"
        ]
    },

    "ball valve": {
        "category": "valve",
        "required_fields": [
            "type",
            "nominal_diameter"
        ]
    },

    "butterfly valve": {
        "category": "valve",
        "required_fields": [
            "type",
            "nominal_diameter"
        ]
    }
}


def build_standard_description(attributes: dict) -> str:
    """
    Build a deterministic standardized material description
    from extracted technical attributes.
    """

    material = attributes.get("material")
    material_type = attributes.get("type")
    grade = attributes.get("grade")
    diameter = attributes.get("diameter")
    length = attributes.get("length")
    width = attributes.get("width")
    thickness = attributes.get("thickness")
    standard = attributes.get("standard")
    bearing_code = attributes.get("bearing_code")
    nominal_diameter = attributes.get("nominal_diameter")
    pressure = attributes.get("pressure")
    voltage = attributes.get("voltage")
    power = attributes.get("power")
    frequency = attributes.get("frequency")
    schedule = attributes.get("schedule")
    angle = attributes.get("angle")
    thread = attributes.get("thread")
    head_type = attributes.get("head_type")

    parts = []

    # MATERIAL
    if material:
        parts.append(str(material).upper())

    # TYPE
    if material_type:
        parts.append(str(material_type).upper())

    # GRADE
    if grade:
        parts.append(f"GRADE {str(grade).upper()}")

    # DIMENSIONS
    if diameter:
        parts.append(f"DIA {diameter}")

    if length:
        parts.append(f"LENGTH {length}")

    if width:
        parts.append(f"WIDTH {width}")

    if thickness:
        parts.append(f"THK {thickness}")

    # STANDARD
    if standard:
        parts.append(f"STANDARD {str(standard).upper()}")

    # ADDITIONAL TECHNICAL PARAMETERS
    if nominal_diameter:
        parts.append(f"NOMINAL DIA {nominal_diameter}")

    if pressure:
        parts.append(f"PRESSURE {pressure}")

    if voltage:
        parts.append(f"VOLTAGE {voltage}")

    if power:
        parts.append(f"POWER {power}")

    if frequency:
        parts.append(f"FREQUENCY {frequency}")

    if schedule:
        parts.append(f"SCHEDULE {schedule}")

    if angle:
        parts.append(f"ANGLE {angle}")

    if thread:
        parts.append(f"THREAD {thread}")

    if head_type:
        parts.append(f"HEAD {str(head_type).upper()}")

    # BEARING CODE
    if bearing_code:
        parts.append(f"CODE {bearing_code}")

    return " ".join(parts)


def standardize_material(
    attributes: dict,
    classification: dict = None
) -> dict:
    """
    Convert extracted material attributes into a
    standardized structured representation.
    """

    if not isinstance(attributes, dict):
        attributes = {}

    # --------------------------------------------------
    # USE SEMANTIC CLASSIFICATION WHEN TYPE IS MISSING
    # --------------------------------------------------

    if classification and isinstance(classification, dict):

        semantic_type = classification.get("subcategory")
        semantic_category = classification.get("category")

        if not attributes.get("type") and semantic_type:
            attributes = attributes.copy()
            attributes["type"] = semantic_type

        if semantic_category and not attributes.get("category"):
            attributes = attributes.copy()
            attributes["category"] = semantic_category

    # --------------------------------------------------
    # NORMALIZE TYPE
    # --------------------------------------------------

    material_type = attributes.get("type")

    normalized_type = (
        str(material_type).strip().lower()
        if material_type
        else None
    )

    # --------------------------------------------------
    # TEMPLATE LOOKUP
    # --------------------------------------------------

    template = STANDARD_TEMPLATES.get(
        normalized_type
    )

    # Unknown material type
    if template is None:
        template = {
            "category": (
                attributes.get("category")
                or "other"
            ),
            "required_fields": []
        }

    # --------------------------------------------------
    # STANDARDIZED DESCRIPTION
    # --------------------------------------------------

    standard_description = build_standard_description(
        attributes
    )

    # --------------------------------------------------
    # REQUIRED FIELD VALIDATION
    # --------------------------------------------------

    missing_fields = []

    for field in template["required_fields"]:

        value = attributes.get(field)

        if value is None or str(value).strip() == "":
            missing_fields.append(field)

    # --------------------------------------------------
    # COMPLETENESS
    # --------------------------------------------------

    total_required = len(
        template["required_fields"]
    )

    if total_required == 0:
        completeness = 0.0
    elif len(missing_fields) == 0:
        completeness = 1.0
    else:
        completeness = (
            total_required - len(missing_fields)
        ) / total_required

    # --------------------------------------------------
    # FINAL RESULT
    # --------------------------------------------------

    return {
        "standardized_description": standard_description,
        "category": template["category"],
        "subcategory": (
            normalized_type
            if normalized_type
            else None
        ),
        "attributes": attributes,
        "required_fields": template["required_fields"],
        "missing_fields": missing_fields,
        "completeness": round(completeness, 4)
    }