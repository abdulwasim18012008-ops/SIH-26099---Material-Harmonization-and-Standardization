from ai_engine.preprocessing import normalize_text
from ai_engine.extraction import extract_attributes
from ai_engine.standardization import standardize_material
from ai_engine.national_code import generate_national_code


materials = [

    "SS BOLT M10 X 50 MM",

    "M10 S.S. HEX BOLT 50MM",

    "STAINLESS STEEL BOLT 10 DIA 50 LG",

    "SS NUT M10",

    "MS WASHER M12",

    "CARBON STEEL PIPE 25 MM DIA X 3 MTR",

    "SS304 PIPE 50 MM X 2 MM THK",

    "SS VALVE 25 MM",

    "BALL BEARING 6205",

    "ASTM A193 GR B7 BOLT M16 X 80 MM",

    "IS 1363 HEX HEAD BOLT M12 X 60 MM"
]


for material in materials:

    normalized = normalize_text(
        material
    )

    attributes = extract_attributes(
        normalized
    )

    standardized = standardize_material(
        attributes
    )

    national_code = generate_national_code(
        standardized
    )

    print("\n")
    print("=" * 75)

    print("ORIGINAL:")
    print(material)

    print("\nSTANDARDIZED:")
    print(
        standardized[
            "standardized_description"
        ]
    )

    print("\nNATIONAL CODE:")
    print(
        national_code[
            "recommended_national_code"
        ]
    )

    print("\nCODE COMPONENTS:")
    print(
        national_code[
            "code_components"
        ]
    )

    print("\nCONFIDENCE:")
    print(
        national_code[
            "confidence"
        ]
    )

    print("\nHUMAN VALIDATION REQUIRED:")
    print(
        national_code[
            "requires_human_validation"
        ]
    )