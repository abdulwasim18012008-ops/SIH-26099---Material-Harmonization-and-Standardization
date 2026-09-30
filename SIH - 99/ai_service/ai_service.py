from ai_engine.embeddings import MaterialEmbeddingModel
from ai_engine.pipeline import MaterialAIPipeline


# Load the embedding model only once.
# This prevents the model from being loaded for every API request.
_embedding_model = None
_pipeline = None


def get_ai_pipeline():
    global _embedding_model, _pipeline

    if _pipeline is None:
        _embedding_model = MaterialEmbeddingModel()
        _pipeline = MaterialAIPipeline(_embedding_model)

    return _pipeline


def analyze_material(description: str):
    """
    Run the existing AI engine on one material description.

    Returns the complete AI analysis result.
    """

    if not description or not description.strip():
        raise ValueError("Material description cannot be empty")

    pipeline = get_ai_pipeline()

    result = pipeline.analyze_material(description)

    return {
        "input": result.get("input"),
        "understanding": result.get("understanding"),
        "standardization": result.get("standardization"),
        "national_code": result.get("national_code"),
        "candidate_matches": result.get("candidate_matches", [])
    }

def analyze_batch(materials):
    """
    Analyze a complete batch of CPSE materials.

    Each material should contain:
        material_id
        cpse
        original_code
        description
    """

    from ai_engine.master_workflow import MaterialMasterWorkflow
    from ai_engine.batch_master_workflow import BatchMasterWorkflow

    pipeline = get_ai_pipeline()

    workflow = MaterialMasterWorkflow(pipeline)
    batch_workflow = BatchMasterWorkflow(workflow)

    result = batch_workflow.process_batch(materials)

    return result
def analyze_batch(materials):
    """
    Analyze a complete batch of CPSE materials.

    Each material should contain:
        material_id
        cpse
        original_code
        description
    """

    from ai_engine.master_workflow import MaterialMasterWorkflow
    from ai_engine.batch_master_workflow import BatchMasterWorkflow

    pipeline = get_ai_pipeline()

    workflow = MaterialMasterWorkflow(pipeline)
    batch_workflow = BatchMasterWorkflow(workflow)

    result = batch_workflow.process_batch(materials)

    return result