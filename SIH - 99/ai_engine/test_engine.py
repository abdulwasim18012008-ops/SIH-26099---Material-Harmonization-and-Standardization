from ai_engine.engine import MaterialAIEngine


engine = MaterialAIEngine()


tests = [

    (
        "SS BOLT M10 X 50 MM",
        "M10 S.S. HEX BOLT 50MM"
    ),

    (
        "SS BOLT M10 X 50 MM",
        "SS BOLT M10 X 60 MM"
    ),

    (
        "SS BOLT M10 X 50 MM",
        "CARBON STEEL PIPE 25 MM"
    ),

    (
        "BALL BEARING 6205",
        "BALL BEARING 6305"
    ),

    (
        "SS HEX BOLT M10 X 50 MM",
        "SS CAP SCREW M10 X 50 MM"
    )
]


for material_a, material_b in tests:

    print("\n")
    print("=" * 80)

    print("MATERIAL A:")
    print(material_a)

    print("MATERIAL B:")
    print(material_b)

    result = engine.analyze(
        material_a,
        material_b
    )

    print("\nNORMALIZED A:")
    print(
        result["material_a"]["normalized"]
    )

    print("\nNORMALIZED B:")
    print(
        result["material_b"]["normalized"]
    )

    print("\nCLASSIFICATION A:")
    print(
        result["material_a"]["classification"]
    )

    print("\nCLASSIFICATION B:")
    print(
        result["material_b"]["classification"]
    )

    print("\nSTANDARDIZED A:")
    print(
        result["material_a"]
        ["standardization"]
        ["standardized_description"]
    )

    print("\nSTANDARDIZED B:")
    print(
        result["material_b"]
        ["standardization"]
        ["standardized_description"]
    )

    print("\nNATIONAL CODE A:")
    print(
        result["material_a"]
        ["national_code"]
        ["recommended_national_code"]
    )

    print("\nNATIONAL CODE B:")
    print(
        result["material_b"]
        ["national_code"]
        ["recommended_national_code"]
    )

    print("\nSEMANTIC SIMILARITY:")
    print(
        result["semantic_similarity"]
    )

    print("\nMATCH RESULT:")
    print(
        result["final_decision"]
    )

    print("\nCONFIDENCE:")
    print(
        result["confidence"]
    )

    print("\nFUNCTIONAL RESULT:")
    print(
        result["functional_analysis"]
    )

    print("\nEXPLANATION:")

    for reason in result["explanation"]:

        print(
            "-",
            reason
        )