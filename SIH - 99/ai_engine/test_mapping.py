from ai_engine.mapping import MaterialMappingManager


manager = MaterialMappingManager()

national_code = "FST-BLT-SS-D010-L050"
description = "STAINLESS STEEL BOLT DIA 10 mm LENGTH 50 mm"


manager.create_mapping(
    national_code=national_code,
    standardized_description=description,
    cpse="CPCL",
    original_code="CPCL-BOLT-001",
    material_id="MAT001"
)

manager.create_mapping(
    national_code=national_code,
    standardized_description=description,
    cpse="IOCL",
    original_code="IOCL-BOLT-045",
    material_id="MAT002"
)

manager.create_mapping(
    national_code=national_code,
    standardized_description=description,
    cpse="HPCL",
    original_code="HPCL-BOLT-782",
    material_id="MAT003"
)


print("\n=== NATIONAL CODE LOOKUP ===")

result = manager.get_national_material(national_code)

print(result)


print("\n=== CPSE CODE LOOKUP ===")

result = manager.get_by_cpse_code(
    "IOCL",
    "IOCL-BOLT-045"
)

print(result)


print("\n=== ALL MAPPINGS ===")

for mapping in manager.get_all_mappings():
    print(mapping)