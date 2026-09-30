import re


CATEGORY_CODES = {
    "fastener": "FST",
    "piping": "PIP",
    "valve": "VLV",
    "bearing": "BRG",
    "sealing": "SLG",
    "electrical": "ELE",
    "rotating_equipment": "ROT",
    "filtration": "FLT",
    "instrumentation": "INS",
    "heat_transfer": "HTX",
    "ppe": "PPE",
    "other": "OTH"
}


TYPE_CODES = {
    "bolt": "BLT",
    "screw": "SCR",
    "stud": "STD",
    "nut": "NUT",
    "washer": "WSR",
    "pipe": "PIP",
    "tube": "TBE",
    "valve": "VLV",
    "bearing": "BRG",
    "gasket": "GSK",
    "seal": "SEL"
}


MATERIAL_CODES = {
    "stainless steel": "SS",
    "mild steel": "MS",
    "carbon steel": "CS",
    "alloy steel": "AS",
    "cast iron": "CI",
    "ductile iron": "DI",
    "aluminium": "AL",
    "copper": "CU",
    "brass": "BR"
}


def clean_code_value(value: str) -> str:
    """
    Convert a value into a safe code component.
    """

    if not value:
        return ""

    value = str(value).upper()

    value = re.sub(
        r"[^A-Z0-9]",
        "",
        value
    )

    return value


def dimension_code(value: str) -> str:
    """
    Convert a dimension such as '10 mm'
    into a compact code component.
    """

    if not value:
        return ""

    numbers = re.findall(
        r"\d+(?:\.\d+)?",
        str(value)
    )

    if not numbers:
        return ""

    number = numbers[0]

    if "." in number:

        number = number.replace(
            ".",
            "P"
        )

    else:

        number = number.zfill(3)

    return number


def get_category_code(category: str) -> str:

    if not category:
        return "OTH"

    return CATEGORY_CODES.get(
        category.lower(),
        "OTH"
    )


def get_type_code(material_type: str) -> str:

    if not material_type:
        return "UNK"

    return TYPE_CODES.get(
        material_type.lower(),
        clean_code_value(material_type)[:4]
    )


def get_material_code(material: str) -> str:

    if not material:
        return "UNSPEC"

    material = material.lower().strip()

    return MATERIAL_CODES.get(
        material,
        clean_code_value(material)[:4]
    )


def generate_national_code(
    standardized_material: dict,
    classification: dict = None
) -> dict:
    """
    Generate a deterministic recommended
    Common National Material Code.

    This is a proposed prototype coding framework.
    Final code governance should be controlled by
    the national material master / backend.
    """

    attributes = standardized_material.get(
        "attributes",
        {}
    )

    category = standardized_material.get(
        "category",
        "other"
    )

    material_type = standardized_material.get(
        "subcategory"
    )

    material = attributes.get(
        "material"
    )

    grade = attributes.get(
        "grade"
    )

    diameter = attributes.get(
    "diameter"
)

    nominal_diameter = attributes.get(
        "nominal_diameter"
)   

    length = attributes.get(
        "length"
    )

    thickness = attributes.get(
        "thickness"
    )

    standard = attributes.get(
        "standard"
    )

    bearing_code = attributes.get(
        "bearing_code"
    )

    # =====================================================
    # CODE COMPONENTS
    # =====================================================

    category_code = get_category_code(
        category
    )

    type_code = get_type_code(
        material_type
    )

    material_code = get_material_code(
        material
    )

    # =====================================================
    # BEARING
    # =====================================================

    if bearing_code:

        code = (
            f"{category_code}-"
            f"{type_code}-"
            f"{clean_code_value(bearing_code)}"
        )

    else:

        components = [
            category_code,
            type_code,
            material_code
        ]

        # -------------------------------------------------
        # GRADE
        # -------------------------------------------------

        if grade:

            components.append(
                clean_code_value(grade)
            )

        # -------------------------------------------------
        # DIAMETER
        # -------------------------------------------------

        if diameter:

            components.append(
                 f"D{dimension_code(diameter)}"
                 )

        elif nominal_diameter:

            components.append(
                 f"DN{dimension_code(nominal_diameter)}"
                )

        # -------------------------------------------------
        # LENGTH
        # -------------------------------------------------

        if length:

            components.append(
                f"L{dimension_code(length)}"
            )

        # -------------------------------------------------
        # THICKNESS
        # -------------------------------------------------

        if thickness:

            components.append(
                f"T{dimension_code(thickness)}"
            )

        # -------------------------------------------------
        # STANDARD
        # -------------------------------------------------

        if standard:

            components.append(
                clean_code_value(standard)
            )

        code = "-".join(components)

    # =====================================================
    # COMPLETENESS
    # =====================================================

    completeness = standardized_material.get(
        "completeness",
        0.0
    )

    # =====================================================
# CONFIDENCE
# =====================================================

    if completeness >= 1.0:
        completeness_confidence = 0.95

    elif completeness >= 0.75:
        completeness_confidence = 0.80

    elif completeness >= 0.50:
        completeness_confidence = 0.60

    else:
        completeness_confidence = 0.40


    if classification:
        classification_confidence = float(
            classification.get(
                "confidence",
                0.0
            )
        )

        confidence = min(
            completeness_confidence,
            classification_confidence
    )

    else:
        confidence = completeness_confidence

    # =====================================================
    # RESULT
    # =====================================================

    return {

        "recommended_national_code": code,

        "code_framework": "PROPOSED",

        "confidence": confidence,

        "requires_human_validation": (
    completeness < 1.0
    or (
        classification is not None
        and float(
            classification.get(
                "confidence",
                0.0
            )
        ) < 0.70
    )
),

        "code_components": {
            "category": category_code,
            "type": type_code,
            "material": material_code,
            "grade": clean_code_value(grade),
            "diameter": dimension_code(diameter),
            "nominal_diameter": dimension_code(
                nominal_diameter
            ),
            "length": dimension_code(length),
            "thickness": dimension_code(thickness),
            "standard": clean_code_value(standard),
            "bearing_code":
                clean_code_value(bearing_code)
        }
    }