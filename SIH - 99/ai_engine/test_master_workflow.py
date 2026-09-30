from ai_engine.embeddings import MaterialEmbeddingModel
from ai_engine.pipeline import MaterialAIPipeline
from ai_engine.master_workflow import MaterialMasterWorkflow


materials = [
    {
        "material_id": "MAT001",
        "cpse": "CPCL",
        "original_code": "CPCL-BOLT-001",
        "description": "SS BOLT M10 X 50 MM"
    },
    {
        "material_id": "MAT002",
        "cpse": "IOCL",
        "original_code": "IOCL-BOLT-045",
        "description": "M10 S.S. HEX BOLT 50MM"
    }
]


print("\n=== CREATING AI PIPELINE ===")

embedding_model = MaterialEmbeddingModel()

pipeline = MaterialAIPipeline(
    embedding_model
)

workflow = MaterialMasterWorkflow(
    pipeline
)


print("\n=== LOADING MATERIALS ===")

pipeline.add_materials(materials)


print("\n=== PROCESSING MATERIAL 1 ===")

result = workflow.process_material(
    materials[0],
    group_id="GROUP-0001"
)

print("\nAI ANALYSIS:")
print(result["analysis"])

print("\nVALIDATION:")
print(result["validation"])


print("\n=== APPROVING MATERIAL 1 ===")

approval = workflow.approve_material(
    material=materials[0],
    analysis=result["analysis"],
    group_id="GROUP-0001",
    reviewer="Reviewer-001",
    comment="AI recommendation verified."
)

print("\nVALIDATION RESULT:")
print(approval["validation"])

print("\nMAPPING:")
print(approval["mapping"])

print("\nVERSION:")
print(approval["version"])


print("\n=== COMPLETE MATERIAL HISTORY ===")

history = workflow.get_material_history(
    "MAT001"
)

print("\nVERSIONS:")
for version in history["versions"]:
    print(version)

print("\nMAPPINGS:")
for mapping in history["mappings"]:
    print(mapping)

print("\nAUDIT TRAIL:")
for record in history["audit"]:
    print(record)