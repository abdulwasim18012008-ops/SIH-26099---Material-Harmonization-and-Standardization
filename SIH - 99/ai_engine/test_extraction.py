from preprocessing import normalize_text
from extraction import extract_attributes


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
    "IS 1363 HEX HEAD BOLT M12 X 60 MM",
]

for material in materials:

    normalized = normalize_text(material)
    attributes = extract_attributes(normalized)

    print("Original   :", material)
    print("Normalized :", normalized)
    print("Attributes :", attributes)
    print("-" * 60)