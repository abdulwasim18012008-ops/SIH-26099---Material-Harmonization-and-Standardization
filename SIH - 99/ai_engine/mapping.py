class MaterialMappingManager:
    """
    Maintains bidirectional traceability between a proposed
    National Material Code and original CPSE material codes.
    """

    def __init__(self):
        self.mappings = []

    def create_mapping(
        self,
        national_code,
        standardized_description,
        cpse,
        original_code,
        material_id,
        status="APPROVED"
    ):
        mapping = {
            "national_code": national_code,
            "standardized_description": standardized_description,
            "cpse": cpse,
            "original_code": original_code,
            "material_id": material_id,
            "status": status
        }

        self.mappings.append(mapping)

        return mapping

    def get_by_national_code(self, national_code):
        return [
            mapping
            for mapping in self.mappings
            if mapping["national_code"] == national_code
        ]

    def get_by_cpse_code(self, cpse, original_code):
        return [
            mapping
            for mapping in self.mappings
            if (
                mapping["cpse"] == cpse
                and mapping["original_code"] == original_code
            )
        ]

    def get_all_mappings(self):
        return self.mappings

    def get_national_material(self, national_code):
        mappings = self.get_by_national_code(national_code)

        if not mappings:
            return None

        return {
            "national_code": national_code,
            "standardized_description": mappings[0][
                "standardized_description"
            ],
            "cpse_count": len(mappings),
            "cpse_mappings": mappings
        }