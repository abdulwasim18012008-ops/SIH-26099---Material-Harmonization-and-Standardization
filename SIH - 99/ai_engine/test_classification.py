from preprocessing import normalize_text
from extraction import extract_attributes
from classification import classify_material


materials = [
    "SS BOLT M10 X 50 MM",
    "SS NUT M10",
    "MS WASHER M12",
    "CARBON STEEL PIPE 25 MM DIA X 3 MTR",
    "SS304 PIPE 50 MM X 2 MM THK",
    "SS VALVE 25 MM",
    "BALL BEARING 6205",
]


for material in materials:

    normalized = normalize_text(material)

    attributes = extract_attributes(
        normalized
    )

    classification = classify_material(
        attributes
    )

    print("\nMaterial:")
    print(material)

    print("Attributes:")
    print(attributes)

    print("Classification:")
    print(classification)

    print("-" * 60)