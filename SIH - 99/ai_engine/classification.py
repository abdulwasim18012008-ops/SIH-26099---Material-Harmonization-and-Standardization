CATEGORY_MAP = {

    "fastener": {
        "bolt",
        "screw",
        "stud",
        "nut",
        "washer",
        "fastener"
    },

    "piping": {
        "pipe",
        "tube",
        "hose"
    },

    "valve": {
        "valve"
    },

    "bearing": {
        "bearing"
    },

    "sealing": {
        "gasket",
        "seal"
    },

    "rotating_equipment": {
        "pump",
        "motor",
        "compressor",
        "fan",
        "blower",
        "gearbox",
        "coupling",
        "shaft"
    },

    "electrical_equipment": {
        "transformer",
        "circuit_breaker",
        "contactor",
        "relay",
        "cable",
        "wire"
    },

    "filtration": {
        "filter"
    },

    "ppe": {
        "safety_goggles",
        "safety_gloves",
        "safety_helmet",
        "safety_shoes"
    },

    "piping_component": {
        "flange"
    }
}


def classify_material(attributes: dict) -> dict:
    """
    Classify an industrial material/component using
    extracted technical attributes.
    """

    material_type = attributes.get("type")

    if not material_type:

        return {
            "category": "unknown",
            "subcategory": None,
            "confidence": 0.0
        }

    material_type = (
        material_type
        .lower()
        .strip()
    )

    for category, types in CATEGORY_MAP.items():

        if material_type in types:

            return {
                "category": category,
                "subcategory": material_type,
                "confidence": 0.95
            }

    return {
        "category": "other",
        "subcategory": material_type,
        "confidence": 0.60
    }