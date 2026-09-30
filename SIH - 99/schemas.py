from pydantic import BaseModel


class MaterialCreate(BaseModel):
    cpse_id: int
    material_code: str
    original_description: str
    original_specifications: str | None = None
    original_unit: str | None = None
    category: str | None = None
    technical_parameters: str | None = None
    raw_record: str | None = None


class CPSECreate(BaseModel):
    name: str
    code: str
    sector: str | None = None
    
class StandardizedMaterialCreate(BaseModel):
    national_code: str
    standard_description: str
    category: str | None = None
    status: str = "PENDING"
    
class MaterialMappingCreate(BaseModel):
    original_material_id: int
    national_material_id: int
    match_type: str
    confidence: str
    explanation: str | None = None
    status: str = "PENDING"
    
class AIRecommendationCreate(BaseModel):
    original_material_id: int
    national_material_id: int
    match_type: str
    confidence: str
    explanation: str