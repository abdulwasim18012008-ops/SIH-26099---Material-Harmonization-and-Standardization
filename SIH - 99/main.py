from fastapi import FastAPI, UploadFile, File, HTTPException, Header,Depends
import csv
import io
from fastapi.responses import StreamingResponse
import pandas as pd
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from database.database import engine, Base, SessionLocal
from database import models
from schemas import (
    MaterialCreate,
    CPSECreate,
    StandardizedMaterialCreate,
    MaterialMappingCreate,
    AIRecommendationCreate
)

from ai_service.ai_service import analyze_material, analyze_batch
from pydantic import BaseModel

Base.metadata.create_all(bind=engine)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
class UserRegister(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


@app.post("/auth/register")
def register_user(data: UserRegister):
    db: Session = SessionLocal()

    existing = (
        db.query(models.User)
        .filter(models.User.username == data.username)
        .first()
    )

    if existing:
        db.close()
        return {
            "success": False,
            "message": "Username already exists"
        }

    user = models.User(
        username=data.username,
        password=data.password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    response = {
        "success": True,
        "user_id": user.id,
        "username": user.username
    }

    db.close()
    return response

@app.post("/auth/login")
def login_user(data: UserLogin):
    db: Session = SessionLocal()

    username = data.username.strip()

    if not username:
        db.close()
        return {
            "success": False,
            "message": "Username is required"
        }

    # ---------------------------------------------------------
    # FIND EXISTING USER
    # ---------------------------------------------------------

    user = (
        db.query(models.User)
        .filter(
            models.User.username == username
        )
        .first()
    )

    # ---------------------------------------------------------
    # CREATE NEW USER IF NOT FOUND
    # ---------------------------------------------------------

    if user is None:

        user = models.User(
            username=username,
            password=data.password
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    # ---------------------------------------------------------
    # LOGIN SUCCESS
    # ---------------------------------------------------------

    response = {
        "success": True,
        "user_id": user.id,
        "username": user.username
    }

    db.close()

    return response
def get_current_user_id(
    x_user_id: int = Header(..., alias="X-User-ID")
):
    db: Session = SessionLocal()

    user = (
        db.query(models.User)
        .filter(
            models.User.id == x_user_id
        )
        .first()
    )

    db.close()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or missing user"
        )

    return x_user_id
@app.get("/")
def home():
    return {
        "message": "SIH 26099 Backend is running!"
    }

@app.post("/materials")
def create_material(
    material: MaterialCreate,
    current_user_id: int = Depends(get_current_user_id)
):
    db: Session = SessionLocal()

    new_material = models.OriginalMaterial(
        owner_id=current_user_id,
        cpse_id=material.cpse_id,
        material_code=material.material_code,
        original_description=material.original_description,
        original_specifications=material.original_specifications,
        original_unit=material.original_unit,
        category=material.category,
        technical_parameters=material.technical_parameters,
        raw_record=material.raw_record
    )

    db.add(new_material)
    db.commit()
    db.refresh(new_material)

    response = {
        "message": "Material saved successfully",
        "material_id": new_material.id,
        "material_code": new_material.material_code
    }

    db.close()

    return response
@app.post("/cpse")
def create_cpse(
    cpse: CPSECreate,
    current_user_id: int = Depends(get_current_user_id)
):
    db: Session = SessionLocal()

    new_cpse = models.CPSE(
        name=cpse.name,
        code=cpse.code,
        sector=cpse.sector,
        is_master=False,
        owner_id=current_user_id
    )

    db.add(new_cpse)
    db.commit()
    db.refresh(new_cpse)

    response = {
        "message": "CPSE saved successfully",
        "cpse_id": new_cpse.id,
        "name": new_cpse.name,
        "code": new_cpse.code
    }

    db.close()

    return response
@app.get("/cpse")
def get_cpse(current_user_id: int = Depends(get_current_user_id)):
    db: Session = SessionLocal()

    cpse_list = (
        db.query(models.CPSE)
        .filter(
            (models.CPSE.is_master == True) |
            (models.CPSE.owner_id == current_user_id)
        )
        .all()
    )

    results = []

    for cpse in cpse_list:
        results.append({
            "id": cpse.id,
            "name": cpse.name,
            "code": cpse.code,
            "sector": cpse.sector,
            "is_master": cpse.is_master,
            "owner_id": cpse.owner_id
        })

    db.close()

    return results
@app.get("/materials")
def get_materials(
    current_user_id: int = Depends(get_current_user_id)
):
    db: Session = SessionLocal()

    materials = (
        db.query(models.OriginalMaterial)
        .filter(
            models.OriginalMaterial.owner_id == current_user_id
        )
        .all()
    )

    db.close()

    return materials
@app.get("/materials/{material_id}")
def get_material(
    material_id: int,
    current_user_id: int = Depends(get_current_user_id)
):
    db: Session = SessionLocal()

    material = (
        db.query(models.OriginalMaterial)
        .filter(
            models.OriginalMaterial.id == material_id,
            models.OriginalMaterial.owner_id == current_user_id
        )
        .first()
    )

    if material is None:
        db.close()
        raise HTTPException(status_code=404, detail="Material not found")

    result = {
        "id": material.id,
        "material_code": material.material_code,
        "original_description": material.original_description,
        "original_specifications": material.original_specifications,
        "original_unit": material.original_unit,
        "category": material.category,
        "technical_parameters": material.technical_parameters,
        "raw_record": material.raw_record,
        "owner_id": material.owner_id,
        "cpse_id": material.cpse_id
    }

    db.close()
    return result
@app.post("/national-materials")
def create_national_material(
    material:StandardizedMaterialCreate,
    current_user_id: int = Depends(get_current_user_id)
):
    db: Session = SessionLocal()

    new_material = models.StandardizedMaterial(
        owner_id=current_user_id,
        national_code=material.national_code,
        standard_description=material.standard_description,
        category=material.category,
        status=material.status
    )

    db.add(new_material)
    db.commit()
    db.refresh(new_material)

    response = {
        "message": "National material saved successfully",
        "material_id": new_material.id,
        "national_code": new_material.national_code
    }

    db.close()
    return response
@app.post("/mappings")
def create_mapping(
    mapping: MaterialMappingCreate,
    current_user_id: int = Depends(get_current_user_id)
):
    db: Session = SessionLocal()

    original_material = (
        db.query(models.OriginalMaterial)
        .filter(
            models.OriginalMaterial.id == mapping.original_material_id,
            models.OriginalMaterial.owner_id == current_user_id
        )
        .first()
    )

    national_material = (
        db.query(models.StandardizedMaterial)
        .filter(
            models.StandardizedMaterial.id == mapping.national_material_id,
            models.StandardizedMaterial.owner_id == current_user_id
        )
        .first()
    )

    if original_material is None:
        db.close()
        return {"message": "Original material not found"}

    if national_material is None:
        db.close()
        return {"message": "National material not found"}

    new_mapping = models.MaterialMapping(
        owner_id=current_user_id,
        original_material_id=mapping.original_material_id,
        national_material_id=mapping.national_material_id,
        match_type=mapping.match_type,
        confidence=mapping.confidence,
        explanation=mapping.explanation,
        status=mapping.status
    )

    db.add(new_mapping)
    db.flush()

    audit = models.AuditLog(
        owner_id=current_user_id,
        mapping_id=new_mapping.id,
        entity_id=new_mapping.id,
        action="MAPPING_CREATED",
        old_value=None,
        new_value=f"Mapping {new_mapping.id}",
        user=f"User {current_user_id}",
        reason="Material mapping created"
    )

    db.add(audit)
    db.commit()
    db.refresh(new_mapping)

    response = {
        "message": "Mapping saved successfully",
        "mapping_id": new_mapping.id,
        "status": new_mapping.status
    }

    db.close()
    return response

@app.post("/ai/recommendation")
def create_ai_recommendation(data: AIRecommendationCreate):

    db: Session = SessionLocal()

    # Check whether this mapping already exists
    existing_mapping = (
        db.query(models.MaterialMapping)
        .filter(
            models.MaterialMapping.original_material_id
            == data.original_material_id,
            models.MaterialMapping.national_material_id
            == data.national_material_id
        )
        .first()
    )

    if existing_mapping is not None:
        db.close()

        return {
            "message": "AI recommendation already exists",
            "mapping_id": existing_mapping.id,
            "status": existing_mapping.status
        }

    # Create AI recommendation as a pending mapping
    mapping = models.MaterialMapping(
        original_material_id=data.original_material_id,
        national_material_id=data.national_material_id,
        match_type=data.match_type,
        confidence=data.confidence,
        explanation=data.explanation,
        status="PENDING"
    )

    db.add(mapping)
    db.commit()
    db.refresh(mapping)

    # Record AI recommendation in audit trail
    audit = models.AuditLog(
        mapping_id=mapping.id,
        entity_id=mapping.id,
        action="AI_RECOMMENDATION",
        old_value=None,
        new_value=f"Match: {data.match_type}; Confidence: {data.confidence}",
        user="AI_ENGINE",
        reason=data.explanation
    )

    db.add(audit)
    db.commit()

    response = {
        "message": "AI recommendation saved successfully",
        "mapping_id": mapping.id,
        "original_material_id": mapping.original_material_id,
        "national_material_id": mapping.national_material_id,
        "match_type": mapping.match_type,
        "confidence": mapping.confidence,
        "explanation": mapping.explanation,
        "status": mapping.status
    }

    db.close()

    return response


@app.get("/mappings")
def get_mappings(
    current_user_id: int = Depends(get_current_user_id)
):

    db: Session = SessionLocal()

    mappings = db.query(models.MaterialMapping).filter(
    models.MaterialMapping.owner_id == current_user_id
).all()

    db.close()

    return mappings
@app.get("/materials/{material_id}/national-code")
def get_national_code(
    material_id: int,
    current_user_id: int = Depends(get_current_user_id)
):
    db: Session = SessionLocal()

    material = (
        db.query(models.OriginalMaterial)
        .filter(
            models.OriginalMaterial.id == material_id,
            models.OriginalMaterial.owner_id == current_user_id
        )
        .first()
    )

    if material is None:
        db.close()
        raise HTTPException(status_code=404, detail="Material not found")

    mapping = (
        db.query(models.MaterialMapping)
        .filter(
            models.MaterialMapping.original_material_id == material_id,
            models.MaterialMapping.owner_id == current_user_id
        )
        .order_by(models.MaterialMapping.id.desc())
        .first()
    )

    if mapping is None:
        db.close()
        return {
            "original_material_id": material_id,
            "national_code": None,
            "message": "No national mapping found"
        }

    national = (
        db.query(models.StandardizedMaterial)
        .filter(
            models.StandardizedMaterial.id == mapping.national_material_id,
            models.StandardizedMaterial.owner_id == current_user_id
        )
        .first()
    )

    if national is None:
        db.close()
        return {
            "original_material_id": material_id,
            "national_code": None,
            "message": "National material not found"
        }

    result = {
        "original_material_id": material_id,
        "national_code": national.national_code,
        "standard_description": national.standard_description,
        "match_type": mapping.match_type,
        "confidence": mapping.confidence,
        "status": mapping.status
    }

    db.close()
    return result
@app.put("/mappings/{mapping_id}/approve")
def approve_mapping(
    mapping_id: int,
    user: str = "Dharshini",
    reason: str = "Human approval of mapping",
    current_user_id: int = Depends(get_current_user_id)
):

    db: Session = SessionLocal()

    # ---------------------------------------------------------
    # FIND MAPPING ONLY INSIDE CURRENT USER'S WORKSPACE
    # ---------------------------------------------------------

    mapping = (
        db.query(models.MaterialMapping)
        .filter(
            models.MaterialMapping.id == mapping_id,
            models.MaterialMapping.owner_id == current_user_id
        )
        .first()
    )

    if mapping is None:
        db.close()
        return {
            "message": "Mapping not found"
        }

    old_status = mapping.status

    mapping.status = "APPROVED"

    # ---------------------------------------------------------
    # CREATE VERSION FOR THE NATIONAL MATERIAL
    # ---------------------------------------------------------

    national_material = (
        db.query(models.StandardizedMaterial)
        .filter(
            models.StandardizedMaterial.id
            == mapping.national_material_id,
            models.StandardizedMaterial.owner_id
            == current_user_id
        )
        .first()
    )

    version = None

    if national_material is not None:

        latest_version = (
            db.query(models.MaterialVersion)
            .filter(
                models.MaterialVersion.national_material_id
                == national_material.id,
                models.MaterialVersion.owner_id
                == current_user_id
            )
            .order_by(
                models.MaterialVersion.version_number.desc()
            )
            .first()
        )

        next_version = (
            1
            if latest_version is None
            else latest_version.version_number + 1
        )

        version = models.MaterialVersion(
            owner_id=current_user_id,
            national_material_id=national_material.id,
            version_number=next_version,
            standard_description=
                national_material.standard_description,
            category=national_material.category,
            status="APPROVED",
            changed_by=user,
            change_reason=reason
        )

        db.add(version)
        db.flush()

    # ---------------------------------------------------------
    # APPROVAL AUDIT
    # ---------------------------------------------------------

    approval_audit = models.AuditLog(
        owner_id=current_user_id,
        mapping_id=mapping.id,
        entity_id=mapping.id,
        action="APPROVED",
        old_value=old_status,
        new_value="APPROVED",
        user=user,
        reason=reason
    )

    db.add(approval_audit)

    # ---------------------------------------------------------
    # VERSION AUDIT
    # ---------------------------------------------------------

    version_audit = None

    if version is not None:

        version_audit = models.AuditLog(
            owner_id=current_user_id,
            mapping_id=mapping.id,
            entity_id=national_material.id,
            action="VERSION_CREATED",
            old_value=None,
            new_value=f"Version {version.version_number}",
            user=user,
            reason=reason
        )

        db.add(version_audit)

    db.commit()

    db.refresh(mapping)

    if version is not None:
        db.refresh(version)

    response = {
        "message": "Mapping approved successfully",
        "mapping_id": mapping.id,
        "status": mapping.status,
        "version": (
            {
                "version_id": version.id,
                "version_number": version.version_number
            }
            if version is not None
            else None
        )
    }

    db.close()

    return response
@app.put("/mappings/{mapping_id}/reject")
def reject_mapping(
    mapping_id: int,
    user: str = "Dharshini",
    reason: str = "Human rejection of mapping",
    current_user_id: int = Depends(get_current_user_id)
):

    db: Session = SessionLocal()

    # ---------------------------------------------------------
    # FIND MAPPING ONLY INSIDE CURRENT USER'S WORKSPACE
    # ---------------------------------------------------------

    mapping = (
        db.query(models.MaterialMapping)
        .filter(
            models.MaterialMapping.id == mapping_id,
            models.MaterialMapping.owner_id == current_user_id
        )
        .first()
    )

    if mapping is None:
        db.close()
        return {
            "message": "Mapping not found"
        }

    old_status = mapping.status

    mapping.status = "REJECTED"

    # ---------------------------------------------------------
    # REJECTION AUDIT
    # ---------------------------------------------------------

    audit = models.AuditLog(
        owner_id=current_user_id,
        mapping_id=mapping.id,
        entity_id=mapping.id,
        action="REJECTED",
        old_value=old_status,
        new_value="REJECTED",
        user=user,
        reason=reason
    )

    db.add(audit)

    db.commit()
    db.refresh(mapping)

    response = {
        "message": "Mapping rejected successfully",
        "mapping_id": mapping.id,
        "status": mapping.status
    }

    db.close()

    return response

@app.get("/audit-logs")
def get_audit_logs(
    current_user_id: int = Depends(get_current_user_id),
    limit: int = 100,
    offset: int = 0,
    mapping_id: int | None = None,
    action: str | None = None
):

    db: Session = SessionLocal()

    # Keep requests safe for large datasets
    limit = max(1, min(limit, 500))
    offset = max(0, offset)

    # IMPORTANT:
    # Only return audit logs belonging to the logged-in user's workspace
    query = db.query(models.AuditLog).filter(
        models.AuditLog.owner_id == current_user_id
    )

    # Optional filtering by mapping
    if mapping_id is not None:
        query = query.filter(
            models.AuditLog.mapping_id == mapping_id
        )

    # Optional filtering by action
    if action is not None:
        query = query.filter(
            models.AuditLog.action == action
        )

    # Newest audit records first
    logs = (
        query
        .order_by(models.AuditLog.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    results = []

    for log in logs:
        results.append({
            "id": log.id,
            "mapping_id": log.mapping_id,
            "entity_id": log.entity_id,
            "action": log.action,
            "old_value": log.old_value,
            "new_value": log.new_value,
            "user": log.user,
            "timestamp": log.timestamp,
            "reason": log.reason
        })

    db.close()

    return results
@app.post("/national-materials/{material_id}/version")
def create_material_version(
    material_id: int,
    changed_by: str,
    change_reason: str,
    current_user_id: int = Depends(get_current_user_id)
):

    db: Session = SessionLocal()

    # ---------------------------------------------------------
    # FIND NATIONAL MATERIAL ONLY IN CURRENT USER'S WORKSPACE
    # ---------------------------------------------------------

    material = (
        db.query(models.StandardizedMaterial)
        .filter(
            models.StandardizedMaterial.id == material_id,
            models.StandardizedMaterial.owner_id == current_user_id
        )
        .first()
    )

    if material is None:
        db.close()
        return {
            "message": "National material not found"
        }

    # ---------------------------------------------------------
    # FIND LATEST VERSION ONLY IN CURRENT USER'S WORKSPACE
    # ---------------------------------------------------------

    latest_version = (
        db.query(models.MaterialVersion)
        .filter(
            models.MaterialVersion.national_material_id
            == material_id,
            models.MaterialVersion.owner_id
            == current_user_id
        )
        .order_by(
            models.MaterialVersion.version_number.desc()
        )
        .first()
    )

    next_version = (
        1
        if latest_version is None
        else latest_version.version_number + 1
    )

    # ---------------------------------------------------------
    # CREATE VERSION
    # ---------------------------------------------------------

    version = models.MaterialVersion(
        owner_id=current_user_id,
        national_material_id=material_id,
        version_number=next_version,
        standard_description=material.standard_description,
        category=material.category,
        status=material.status,
        changed_by=changed_by,
        change_reason=change_reason
    )

    db.add(version)

    # ---------------------------------------------------------
    # VERSION AUDIT
    # ---------------------------------------------------------

    audit = models.AuditLog(
        owner_id=current_user_id,
        mapping_id=0,
        entity_id=material_id,
        action="VERSION_CREATED",
        old_value=None,
        new_value=f"Version {next_version}",
        user=changed_by,
        reason=change_reason
    )

    db.add(audit)

    db.commit()
    db.refresh(version)

    response = {
        "message": "Material version created successfully",
        "material_id": material_id,
        "version_id": version.id,
        "version_number": version.version_number
    }

    db.close()

    return response
@app.put("/national-materials/{material_id}")
def update_national_material(
    material_id: int,
    national_code: str,
    standard_description: str,
    category: str | None = None,
    status: str | None = None,
    changed_by: str = "Dharshini",
    change_reason: str = "Manual material update",
    current_user_id: int = Depends(get_current_user_id)
):

    db: Session = SessionLocal()

    # ---------------------------------------------------------
    # FIND MATERIAL ONLY IN CURRENT USER'S WORKSPACE
    # ---------------------------------------------------------

    material = (
        db.query(models.StandardizedMaterial)
        .filter(
            models.StandardizedMaterial.id == material_id,
            models.StandardizedMaterial.owner_id == current_user_id
        )
        .first()
    )

    if material is None:
        db.close()
        return {
            "message": "National material not found"
        }

    # ---------------------------------------------------------
    # SAVE OLD VALUES FOR TRACEABILITY
    # ---------------------------------------------------------

    old_value = {
        "national_code": material.national_code,
        "standard_description": material.standard_description,
        "category": material.category,
        "status": material.status
    }

    # ---------------------------------------------------------
    # UPDATE MATERIAL
    # ---------------------------------------------------------

    material.national_code = national_code
    material.standard_description = standard_description
    material.category = category

    if status is not None:
        material.status = status

    # ---------------------------------------------------------
    # FIND CURRENT LATEST VERSION
    # ---------------------------------------------------------

    latest_version = (
        db.query(models.MaterialVersion)
        .filter(
            models.MaterialVersion.national_material_id == material_id,
            models.MaterialVersion.owner_id == current_user_id
        )
        .order_by(
            models.MaterialVersion.version_number.desc()
        )
        .first()
    )

    next_version = (
        1
        if latest_version is None
        else latest_version.version_number + 1
    )

    # ---------------------------------------------------------
    # CREATE NEW VERSION
    # ---------------------------------------------------------

    version = models.MaterialVersion(
        owner_id=current_user_id,
        national_material_id=material_id,
        version_number=next_version,
        standard_description=material.standard_description,
        category=material.category,
        status=material.status,
        changed_by=changed_by,
        change_reason=change_reason
    )

    db.add(version)

    # ---------------------------------------------------------
    # MATERIAL UPDATE AUDIT
    # ---------------------------------------------------------

    new_value = {
        "national_code": material.national_code,
        "standard_description": material.standard_description,
        "category": material.category,
        "status": material.status
    }

    update_audit = models.AuditLog(
        owner_id=current_user_id,
        mapping_id=0,
        entity_id=material_id,
        action="MATERIAL_UPDATED",
        old_value=str(old_value),
        new_value=str(new_value),
        user=changed_by,
        reason=change_reason
    )

    db.add(update_audit)

    # ---------------------------------------------------------
    # VERSION CREATION AUDIT
    # ---------------------------------------------------------

    version_audit = models.AuditLog(
        owner_id=current_user_id,
        mapping_id=0,
        entity_id=material_id,
        action="VERSION_CREATED",
        old_value=None,
        new_value=f"Version {next_version}",
        user=changed_by,
        reason=change_reason
    )

    db.add(version_audit)

    # ---------------------------------------------------------
    # SAVE
    # ---------------------------------------------------------

    db.commit()

    db.refresh(material)
    db.refresh(version)

    response = {
        "message": "National material updated successfully",
        "material": {
            "id": material.id,
            "national_code": material.national_code,
            "standard_description": material.standard_description,
            "category": material.category,
            "status": material.status
        },
        "version": {
            "version_id": version.id,
            "version_number": version.version_number
        }
    }

    db.close()

    return response
@app.get("/national-materials")
def get_national_materials(
    current_user_id: int = Depends(get_current_user_id)
):
    db: Session = SessionLocal()

    materials = (
        db.query(models.StandardizedMaterial)
        .filter(
            models.StandardizedMaterial.owner_id == current_user_id
        )
        .all()
    )

    results = []

    for material in materials:
        results.append({
            "id": material.id,
            "national_code": material.national_code,
            "standard_description": material.standard_description,
            "category": material.category,
            "status": material.status
        })

    db.close()

    return results
@app.get("/national-materials/{material_id}")
def get_national_material(
    material_id: int,
    current_user_id: int = Depends(get_current_user_id)
):
    db: Session = SessionLocal()

    material = (
        db.query(models.StandardizedMaterial)
        .filter(
            models.StandardizedMaterial.id == material_id,
            models.StandardizedMaterial.owner_id == current_user_id
        )
        .first()
    )

    if material is None:
        db.close()
        return {
            "message": "National material not found"
        }

    result = {
        "id": material.id,
        "national_code": material.national_code,
        "standard_description": material.standard_description,
        "category": material.category,
        "status": material.status
    }

    db.close()

    return result
@app.get("/national-materials/{material_id}/versions")
def get_material_versions(
    material_id: int,
    current_user_id: int = Depends(get_current_user_id)
):
    db: Session = SessionLocal()

    material = (
        db.query(models.StandardizedMaterial)
        .filter(
            models.StandardizedMaterial.id == material_id,
            models.StandardizedMaterial.owner_id == current_user_id
        )
        .first()
    )

    if material is None:
        db.close()
        return {
            "message": "National material not found"
        }

    versions = (
        db.query(models.MaterialVersion)
        .filter(
            models.MaterialVersion.national_material_id == material_id,
            models.MaterialVersion.owner_id == current_user_id
        )
        .order_by(
            models.MaterialVersion.version_number.desc()
        )
        .all()
    )

    results = []

    for version in versions:
        results.append({
            "id": version.id,
            "version_number": version.version_number,
            "standard_description": version.standard_description,
            "category": version.category,
            "status": version.status,
            "changed_by": version.changed_by,
            "change_reason": version.change_reason,
            "created_at": version.created_at
        })

    db.close()

    return results

@app.post("/materials/upload")
async def upload_materials(
    file: UploadFile = File(...),
    current_user_id: int = Depends(get_current_user_id)
):

    filename = file.filename.lower()

    if not (
        filename.endswith(".csv")
        or filename.endswith(".xlsx")
        or filename.endswith(".xls")
        or filename.endswith(".json")
    ):
        raise HTTPException(
            status_code=400,
            detail="Only CSV, Excel (.xlsx/.xls), and JSON files are supported"
        )

    contents = await file.read()

    # ---------------------------------------------------------
    # STEP 1: READ UPLOADED FILE
    # ---------------------------------------------------------

    try:

        if filename.endswith(".csv"):

            df = pd.read_csv(io.BytesIO(contents))

        elif filename.endswith(".xlsx") or filename.endswith(".xls"):

            df = pd.read_excel(io.BytesIO(contents))

        else:

            import json

            data = json.loads(contents.decode("utf-8"))

            if isinstance(data, dict):
                data = data.get("materials", data)

            df = pd.DataFrame(data)

    except Exception as e:

        raise HTTPException(
            status_code=400,
            detail=f"Could not read file: {str(e)}"
        )

    # ---------------------------------------------------------
    # STEP 2: NORMALIZE COLUMN NAMES
    # ---------------------------------------------------------

    original_columns = list(df.columns)

    normalized_columns = {}

    for column in df.columns:

        normalized = (
            str(column)
            .strip()
            .lower()
            .replace(" ", "_")
            .replace("-", "_")
        )

        normalized_columns[column] = normalized

    df = df.rename(columns=normalized_columns)

    # ---------------------------------------------------------
    # STEP 3: FIND REQUIRED MATERIAL COLUMNS
    # ---------------------------------------------------------

    def find_column(possible_names):

        for name in possible_names:

            if name in df.columns:
                return name

        return None

    cpse_column = find_column([
        "cpse",
        "cpse_name",
        "cpse_code",
        "company",
        "company_name",
        "organization",
        "organisation"
    ])

    material_code_column = find_column([
        "material_code",
        "materialcode",
        "material",
        "material_id",
        "code",
        "item_code",
        "itemcode"
    ])

    description_column = find_column([
    "original_description",
    "description",
    "material_description",
    "material_desc",
    "item_description",
    "item_desc",
    "raw_description",
    "standardized_description"
])

    if cpse_column is None:

        raise HTTPException(
            status_code=400,
            detail={
                "message": "Could not identify CPSE column",
                "expected_examples": [
                    "CPSE",
                    "CPSE Name",
                    "CPSE Code",
                    "Company"
                ],
                "received_columns": original_columns
            }
        )

    if material_code_column is None:

        raise HTTPException(
            status_code=400,
            detail={
                "message": "Could not identify material code column",
                "expected_examples": [
                    "Material Code",
                    "Material_Code",
                    "Code"
                ],
                "received_columns": original_columns
            }
        )

    if description_column is None:

        raise HTTPException(
            status_code=400,
            detail={
                "message": "Could not identify description column",
                "expected_examples": [
                    "Description",
                    "Material Description",
                    "Original Description"
                ],
                "received_columns": original_columns
            }
        )

    # ---------------------------------------------------------
    # STEP 4: OPTIONAL COLUMNS
    # ---------------------------------------------------------

    specifications_column = find_column([
        "original_specifications",
        "specifications",
        "specification",
        "specs"
    ])

    unit_column = find_column([
        "original_unit",
        "unit",
        "uom",
        "unit_of_measure"
    ])

    category_column = find_column([
        "category",
        "material_category",
        "item_category"
    ])

    technical_parameters_column = find_column([
        "technical_parameters",
        "technical_parameter",
        "technical_specs",
        "parameters"
    ])

    # ---------------------------------------------------------
    # STEP 5: DATABASE
    # ---------------------------------------------------------

    db: Session = SessionLocal()

    created_materials = []
    created_cpse_records = {}

    try:

        # -----------------------------------------------------
        # PROCESS EVERY UPLOADED ROW
        # -----------------------------------------------------

        for _, row in df.iterrows():

            # Preserve the complete original row
            raw_record = row.to_dict()

            cpse_value = row.get(cpse_column)

            if pd.isna(cpse_value):

                continue

            cpse_value = str(cpse_value).strip()

            if not cpse_value:

                continue

            # -------------------------------------------------
            # FIND OR CREATE CPSE
            # -------------------------------------------------

            cpse = (
                db.query(models.CPSE)
                .filter(
                    models.CPSE.name.ilike(cpse_value)
                )
                .first()
            )

            if cpse is None:

                cpse = (
                    db.query(models.CPSE)
                    .filter(
                        models.CPSE.code.ilike(cpse_value)
                    )
                    .first()
                )

            if cpse is None:

                # Generate a safe CPSE code
                generated_code = (
                    cpse_value
                    .upper()
                    .replace(" ", "_")
                    .replace("-", "_")
                )

                # Make sure the generated code is unique
                base_code = generated_code
                counter = 2

                while (
                    db.query(models.CPSE)
                    .filter(models.CPSE.code == generated_code)
                    .first()
                    is not None
                ):

                    generated_code = f"{base_code}_{counter}"
                    counter += 1

                cpse = models.CPSE(
                     name=cpse_value,
                      code=generated_code,
                    sector="Oil & Gas",
                    is_master=False,
                    owner_id=current_user_id
                        )

                db.add(cpse)
                db.flush()

            created_cpse_records[cpse.id] = {
                "id": cpse.id,
                "name": cpse.name,
                "code": cpse.code
            }

            # -------------------------------------------------
            # EXTRACT MATERIAL DATA
            # -------------------------------------------------

            material_code = str(
                row[material_code_column]
            ).strip()

            original_description = str(
                row[description_column]
            ).strip()

            original_specifications = None

            if (
                specifications_column
                and pd.notna(row[specifications_column])
            ):

                original_specifications = str(
                    row[specifications_column]
                )

            original_unit = None

            if (
                unit_column
                and pd.notna(row[unit_column])
            ):

                original_unit = str(
                    row[unit_column]
                )

            category = None

            if (
                category_column
                and pd.notna(row[category_column])
            ):

                category = str(
                    row[category_column]
                )

            technical_parameters = None

            if (
                technical_parameters_column
                and pd.notna(row[technical_parameters_column])
            ):

                technical_parameters = str(
                    row[technical_parameters_column]
                )

            # -------------------------------------------------
            # SAVE ORIGINAL MATERIAL
            # -------------------------------------------------

            material = models.OriginalMaterial(
                owner_id=current_user_id,
                cpse_id=cpse.id,

                material_code=material_code,

                original_description=original_description,

                original_specifications=original_specifications,

                original_unit=original_unit,

                category=category,

                technical_parameters=technical_parameters,

                raw_record=str(raw_record)
            )

            db.add(material)
            db.flush()

            created_materials.append({
                "id": material.id,

                "cpse_id": cpse.id,

                "cpse_name": cpse.name,

                "cpse_code": cpse.code,

                "material_code": material.material_code,

                "original_description":
                    material.original_description
            })

        db.commit()

    except Exception as e:

        db.rollback()
        db.close()

        raise HTTPException(
            status_code=500,
            detail=f"Database error during material upload: {str(e)}"
        )

    db.close()

    # ---------------------------------------------------------
    # STEP 6: PREPARE MATERIALS FOR OUR AI
    # ---------------------------------------------------------

    ai_materials = []

    for material in created_materials:

        ai_materials.append({

            "material_id":
                f"DB-{material['id']}",

            "cpse":
                material["cpse_name"],

            "cpse_code":
                material["cpse_code"],

            "original_code":
                material["material_code"],

            "description":
                material["original_description"]
        })

    # ---------------------------------------------------------
    # STEP 7: RUN OUR LOCAL AI
    # ---------------------------------------------------------

    try:
        BATCH_SIZE = 20
        all_groups = []

        for start in range(0, len(ai_materials), BATCH_SIZE):
            batch = ai_materials[start:start + BATCH_SIZE]
            batch_result = analyze_batch(batch)

            if isinstance(batch_result, dict):
                if "groups" in batch_result:
                    batch_groups = batch_result["groups"]
                elif "group_id" in batch_result:
                    batch_groups = [batch_result]
                elif "validation_queue" in batch_result:
                    batch_groups = batch_result["validation_queue"]
                else:
                    batch_groups = []

            elif isinstance(batch_result, list):
                batch_groups = batch_result

            else:
                batch_groups = []

            all_groups.extend(batch_groups)

        ai_result = {
            "groups": all_groups
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"AI analysis failed: {str(e)}"
        )

    # ---------------------------------------------------------
    # STEP 8: NORMALIZE AI RESULT
    # ---------------------------------------------------------

    if isinstance(ai_result, dict):

        if "groups" in ai_result:

            groups = ai_result["groups"]

        elif "group_id" in ai_result:

            groups = [ai_result]

        elif "validation_queue" in ai_result:

            groups = ai_result["validation_queue"]

        else:

            groups = []

    elif isinstance(ai_result, list):

        groups = ai_result

    else:

        groups = []

    # ---------------------------------------------------------
    # STEP 9: SAVE AI RESULTS
    # ---------------------------------------------------------

    saved_national_materials = []
    saved_mappings = []
    saved_audits = []

    db = SessionLocal()

    try:

        for group in groups:

            if not isinstance(group, dict):
                continue

            recommendation = group.get(
                "ai_recommendation",
                {}
            )

            if not isinstance(recommendation, dict):

                recommendation = {}

            national_code = (
                recommendation.get(
                    "recommended_national_code"
                )
                or recommendation.get(
                    "national_code"
                )
                or group.get(
                    "recommended_national_code"
                )
                or group.get(
                    "national_code"
                )
            )

            standard_description = (
                recommendation.get(
                    "standardized_description"
                )
                or recommendation.get(
                    "standard_description"
                )
                or group.get(
                    "standardized_description"
                )
                or group.get(
                    "standard_description"
                )
            )

            confidence = (
                recommendation.get("confidence")
                or group.get("confidence")
                or group.get("national_code_confidence")
                or 0
            )

            match_type = (
                group.get("match_type")
                or recommendation.get("match_type")
                or "AI_RECOMMENDED"
            )

            explanation = (
    recommendation.get("classification_explanation")
    or recommendation.get("explanation")
    or group.get("classification_explanation")
    or group.get("explanation")
    or (
        f"AI recommendation generated for "
        f"{standard_description or 'material'} "
        f"with confidence {confidence}"
    )
)

            if not national_code:
                continue

            # -------------------------------------------------
            # CREATE OR REUSE NATIONAL MATERIAL
            # -------------------------------------------------

            national_material = (
    db.query(models.StandardizedMaterial)
    .filter(
        models.StandardizedMaterial.national_code
        == str(national_code),
        models.StandardizedMaterial.owner_id
        == current_user_id
    )
    .first()
)

            if national_material is None:

                national_material = models.StandardizedMaterial(
                    owner_id=current_user_id,
                    national_code=str(national_code),

                    standard_description=(
                        str(standard_description)
                        if standard_description
                        else None
                    ),

                    category=None,

                    status="PENDING"
                )

                db.add(national_material)
                db.flush()

                saved_national_materials.append({
                    "id": national_material.id,
                    "national_code":
                        national_material.national_code
                })

            # -------------------------------------------------
            # PROCESS GROUP MEMBERS
            # -------------------------------------------------

            members = group.get("members", [])

            if not isinstance(members, list):
                members = []

            for member in members:

                if not isinstance(member, dict):
                    continue

                raw_material_id = member.get("material_id")

                if raw_material_id is None:
                    continue

                try:

                    original_material_id = int(
                        str(raw_material_id)
                        .split("-")[-1]
                    )

                except Exception:

                    continue

                original_material = (
                    db.query(
                        models.OriginalMaterial
                    )
                    .filter(
                        models.OriginalMaterial.id
                        == original_material_id
                    )
                    .first()
                )

                if original_material is None:
                    continue

                existing_mapping = (
                    db.query(
                        models.MaterialMapping
                    )
                    .filter(
                        models.MaterialMapping.original_material_id
                        == original_material_id,

                        models.MaterialMapping.national_material_id
                        == national_material.id
                    )
                    .first()
                )

                if existing_mapping is not None:
                    continue

                mapping = models.MaterialMapping(
    owner_id=current_user_id,
    original_material_id=original_material_id,
    national_material_id=national_material.id,
    match_type=str(match_type),
    confidence=str(confidence),
    explanation=str(explanation),
    status="PENDING"
)

                db.add(mapping)
                db.flush()

                saved_mappings.append({

                    "mapping_id":
                        mapping.id,

                    "original_material_id":
                        original_material_id,

                    "national_material_id":
                        national_material.id,

                    "status":
                        "PENDING"
                })

                audit = models.AuditLog(
    owner_id=current_user_id,
    mapping_id=mapping.id,
    entity_id=mapping.id,
    action="AI_RECOMMENDATION",

                    old_value=None,

                    new_value=(
                        f"National Code: {national_code}; "
                        f"Match Type: {match_type}; "
                        f"Confidence: {confidence}"
                    ),

                    user="AI_ENGINE",

                    reason=str(explanation)
                )

                db.add(audit)
                db.flush()

                saved_audits.append({

                    "audit_id":
                        audit.id,

                    "mapping_id":
                        mapping.id,

                    "action":
                        "AI_RECOMMENDATION"
                })

        db.commit()

    except Exception as e:

        db.rollback()
        db.close()

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to save AI recommendations: "
                f"{str(e)}"
            )
        )

    db.close()

    # ---------------------------------------------------------
    # STEP 10: RETURN COMPLETE RESULT
    # ---------------------------------------------------------

    return {

        "message":
            "Materials uploaded, analyzed and AI recommendations saved successfully",

        "filename":
            file.filename,

        "cpse_created_or_found":
            list(created_cpse_records.values()),

        "records_created":
            len(created_materials),

        "materials":
            created_materials,

        "national_materials_created":
            saved_national_materials,

        "mappings_created":
            saved_mappings,

        "audit_logs_created":
            saved_audits,

        "ai_analysis":
            ai_result
    }
@app.get("/national-materials/{national_material_id}/cpse-materials")
def get_cpse_materials_for_national_material(
    national_material_id: int,
    current_user_id: int = Depends(get_current_user_id)
):
    db: Session = SessionLocal()

    # ---------------------------------------------------------
    # FIND NATIONAL MATERIAL ONLY IN CURRENT USER'S WORKSPACE
    # ---------------------------------------------------------

    national_material = (
        db.query(models.StandardizedMaterial)
        .filter(
            models.StandardizedMaterial.id == national_material_id,
            models.StandardizedMaterial.owner_id == current_user_id
        )
        .first()
    )

    if national_material is None:
        db.close()
        return {
            "message": "National material not found"
        }

    # ---------------------------------------------------------
    # FIND ONLY CURRENT USER'S APPROVED/PENDING MAPPINGS
    # ---------------------------------------------------------

    mappings = (
        db.query(models.MaterialMapping)
        .filter(
            models.MaterialMapping.national_material_id
            == national_material_id,
            models.MaterialMapping.owner_id == current_user_id
        )
        .all()
    )

    results = []

    for mapping in mappings:

        material = (
            db.query(models.OriginalMaterial)
            .filter(
                models.OriginalMaterial.id
                == mapping.original_material_id,
                models.OriginalMaterial.owner_id
                == current_user_id
            )
            .first()
        )

        if material is None:
            continue

        cpse = (
            db.query(models.CPSE)
            .filter(
                models.CPSE.id == material.cpse_id,
                (
                    (models.CPSE.is_master == True)
                    |
                    (models.CPSE.owner_id == current_user_id)
                )
            )
            .first()
        )

        results.append({
            "category": material.category,
            "mapping_id": mapping.id,
            "material_id": material.id,
            "material_code": material.material_code,
            "original_description": material.original_description,
            "original_specifications": material.original_specifications,
            "original_unit": material.original_unit,
            "cpse_id": material.cpse_id,
            "cpse_name": cpse.name if cpse else None,
            "cpse_code": cpse.code if cpse else None,
            "match_type": mapping.match_type,
            "confidence": mapping.confidence,
            "mapping_status": mapping.status
        })

    db.close()

    return {
        "national_material_id": national_material.id,
        "national_code": national_material.national_code,
        "standard_description": national_material.standard_description,
        "results": results
    }
    
@app.get("/analytics")
def get_analytics(
    current_user_id: int = Depends(get_current_user_id)
):

    db: Session = SessionLocal()

    # Shared master CPSEs + this user's own uploaded CPSEs
    total_cpse = (
        db.query(models.CPSE)
        .filter(
            (models.CPSE.is_master == True) |
            (models.CPSE.owner_id == current_user_id)
        )
        .count()
    )

    # Only this user's uploaded materials
    total_materials = (
        db.query(models.OriginalMaterial)
        .filter(
            models.OriginalMaterial.owner_id == current_user_id
        )
        .count()
    )

    # Only this user's standardized materials
    total_national_materials = (
        db.query(models.StandardizedMaterial)
        .filter(
            models.StandardizedMaterial.owner_id == current_user_id
        )
        .count()
    )

    # Only this user's mappings
    total_mappings = (
        db.query(models.MaterialMapping)
        .filter(
            models.MaterialMapping.owner_id == current_user_id
        )
        .count()
    )

    # Approved mappings belonging to this user
    approved_mappings = (
        db.query(models.MaterialMapping)
        .filter(
            models.MaterialMapping.status == "APPROVED",
            models.MaterialMapping.owner_id == current_user_id
        )
        .count()
    )

    # Pending mappings belonging to this user
    pending_mappings = (
        db.query(models.MaterialMapping)
        .filter(
            models.MaterialMapping.status == "PENDING",
            models.MaterialMapping.owner_id == current_user_id
        )
        .count()
    )

    # Rejected mappings belonging to this user
    rejected_mappings = (
        db.query(models.MaterialMapping)
        .filter(
            models.MaterialMapping.status == "REJECTED",
            models.MaterialMapping.owner_id == current_user_id
        )
        .count()
    )

    # Only this user's audit logs
    total_audit_logs = (
        db.query(models.AuditLog)
        .filter(
            models.AuditLog.owner_id == current_user_id
        )
        .count()
    )

    db.close()

    return {
        "total_cpse": total_cpse,
        "total_materials": total_materials,
        "total_national_materials": total_national_materials,
        "total_mappings": total_mappings,
        "approved_mappings": approved_mappings,
        "pending_mappings": pending_mappings,
        "rejected_mappings": rejected_mappings,
        "total_audit_logs": total_audit_logs
    }
    
@app.get("/search")
def search_materials(
    query: str,
    current_user_id: int = Depends(get_current_user_id)
):

    db: Session = SessionLocal()

    # Only search materials belonging to the logged-in user
    materials = (
        db.query(models.OriginalMaterial)
        .filter(
            (
                models.OriginalMaterial.material_code.ilike(
                    f"%{query}%"
                )
            )
            |
            (
                models.OriginalMaterial.original_description.ilike(
                    f"%{query}%"
                )
            ),
            models.OriginalMaterial.owner_id == current_user_id
        )
        .all()
    )

    results = []

    for material in materials:

        # Only mappings belonging to the same user
        mappings = (
            db.query(models.MaterialMapping)
            .filter(
                models.MaterialMapping.original_material_id
                == material.id,
                models.MaterialMapping.owner_id
                == current_user_id
            )
            .all()
        )

        for mapping in mappings:

            # Only access this user's national material
            national = (
                db.query(models.StandardizedMaterial)
                .filter(
                    models.StandardizedMaterial.id
                    == mapping.national_material_id,
                    models.StandardizedMaterial.owner_id
                    == current_user_id
                )
                .first()
            )

            results.append({
                "category": (
    national.category
    if national
    else material.category
),
                "material_id": material.id,
                "material_code": material.material_code,
                "original_description":
                    material.original_description,
                "cpse_id": material.cpse_id,
                "national_code": (
                    national.national_code
                    if national
                    else None
                ),
                "standard_description": (
                    national.standard_description
                    if national
                    else None
                ),
                "mapping_status": mapping.status,
                "confidence": mapping.confidence
            })

    db.close()

    return {
        "query": query,
        "results": results
    }

@app.get("/migration/export")
def export_migration_mapping(
    status: str = "APPROVED",
    current_user_id: int = Depends(get_current_user_id)
):

    db: Session = SessionLocal()

    query = (
        db.query(
            models.CPSE.name.label("cpse_name"),
            models.CPSE.code.label("cpse_code"),
            models.OriginalMaterial.material_code.label(
                "original_material_code"
            ),
            models.OriginalMaterial.original_description.label(
                "original_description"
            ),
            models.OriginalMaterial.original_specifications.label(
                "original_specifications"
            ),
            models.OriginalMaterial.original_unit.label(
                "original_unit"
            ),
            models.StandardizedMaterial.national_code.label(
                "national_code"
            ),
            models.StandardizedMaterial.standard_description.label(
                "standard_description"
            ),
            models.StandardizedMaterial.category.label(
                "category"
            ),
            models.MaterialMapping.match_type.label(
                "match_type"
            ),
            models.MaterialMapping.confidence.label(
                "confidence"
            ),
            models.MaterialMapping.status.label(
                "mapping_status"
            )
        )
        .join(
            models.OriginalMaterial,
            models.OriginalMaterial.cpse_id
            == models.CPSE.id
        )
        .join(
            models.MaterialMapping,
            models.MaterialMapping.original_material_id
            == models.OriginalMaterial.id
        )
        .join(
            models.StandardizedMaterial,
            models.StandardizedMaterial.id
            == models.MaterialMapping.national_material_id
        )
    )

    # IMPORTANT:
    # Export only the logged-in user's workspace
    query = query.filter(
        models.MaterialMapping.owner_id == current_user_id,
        models.OriginalMaterial.owner_id == current_user_id,
        models.StandardizedMaterial.owner_id == current_user_id
    )

    if status.upper() != "ALL":
        query = query.filter(
            models.MaterialMapping.status == status.upper()
        )

    rows = query.all()

    db.close()

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "CPSE Name",
        "CPSE Code",
        "Original Material Code",
        "Original Description",
        "Original Specifications",
        "Original Unit",
        "National Material Code",
        "Standardized Description",
        "Category",
        "Match Type",
        "Confidence",
        "Mapping Status"
    ])

    for row in rows:
        writer.writerow([
            row.cpse_name,
            row.cpse_code,
            row.original_material_code,
            row.original_description,
            row.original_specifications,
            row.original_unit,
            row.national_code,
            row.standard_description,
            row.category,
            row.match_type,
            row.confidence,
            row.mapping_status
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
            'attachment; filename="national_material_migration.csv"'
        }
    )
@app.post("/integration/erp/sync/{national_material_id}")
def sync_material_to_erp(
    national_material_id: int,
    current_user_id: int = Depends(get_current_user_id)
):

    db: Session = SessionLocal()

    # Only access the national material from this user's workspace
    national_material = (
        db.query(models.StandardizedMaterial)
        .filter(
            models.StandardizedMaterial.id == national_material_id,
            models.StandardizedMaterial.owner_id == current_user_id
        )
        .first()
    )

    if not national_material:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="National material not found"
        )

    # Only retrieve approved mappings belonging to this user
    approved_mappings = (
        db.query(models.MaterialMapping)
        .filter(
            models.MaterialMapping.national_material_id
            == national_material_id,
            models.MaterialMapping.status == "APPROVED",
            models.MaterialMapping.owner_id == current_user_id
        )
        .all()
    )

    # ERP/SAP-ready material master payload
    erp_payload = {
        "material_master": {
            "national_material_code":
                national_material.national_code,
            "description":
                national_material.standard_description,
            "category":
                national_material.category,
            "status":
                national_material.status,
            "source":
                "SIH_26099_NATIONAL_MATERIAL_MASTER"
        },

        "legacy_mappings": [
            {
                "original_material_id":
                    mapping.original_material_id,
                "mapping_id":
                    mapping.id,
                "match_type":
                    mapping.match_type,
                "confidence":
                    mapping.confidence
            }
            for mapping in approved_mappings
        ],

        "integration": {
            "target_system": "SAP_ERP",
            "mode": "SIMULATED",
            "sync_status": "SUCCESS"
        }
    }

    # Record integration event in audit trail
    audit = models.AuditLog(
        owner_id=current_user_id,
        mapping_id=0,
        entity_id=national_material_id,
        action="ERP_SYNC_SIMULATED",
        old_value=None,
        new_value=str(erp_payload),
        user="ERP_INTEGRATION",
        reason="National material prepared for SAP/ERP integration"
    )

    db.add(audit)
    db.commit()

    db.close()

    return erp_payload

# ============================================================
# MATERIAL INTELLIGENCE ASSISTANT
# ============================================================

@app.post("/assistant/query")
def assistant_query(data: dict):

    query = str(data.get("query", "")).strip()

    if not query:
        return {
            "answer": "Please ask a question about a material, process, mapping, national code, or the material master."
        }

    normalized = query.lower().strip()

    # --------------------------------------------------------
    # BASIC CONVERSATION
    # --------------------------------------------------------

    if normalized in {
        "hi",
        "hello",
        "hey",
        "hi there",
        "hello there",
        "hey there",
    }:
        return {
            "answer": (
                "Hello! I'm the Material Intelligence Assistant. "
                "I can help you understand materials, find material "
                "records, explain mappings, national codes, "
                "standardization, matching and the migration process."
            )
        }

    if normalized in {
        "help",
        "what can you do",
        "what do you do",
        "how can you help me",
    }:
        return {
            "answer": (
                "I can help with material descriptions, technical "
                "attributes, material matching, duplicate and "
                "near-duplicate detection, standardization, "
                "national material codes, CPSE mappings, "
                "approval, traceability, versioning, audit and ERP migration."
            )
        }

    # --------------------------------------------------------
    # PROCESS / SYSTEM KNOWLEDGE
    # --------------------------------------------------------

    process_answers = {

        "standardization": (
            "Material standardization converts different CPSE descriptions "
            "of the same or equivalent material into a common standardized "
            "description and national material code. The system first "
            "normalizes the description, extracts technical attributes, "
            "classifies the material, compares it with existing materials, "
            "and then generates the standardized representation."
        ),

                "near duplicate": (
            "A near duplicate is a material that is very similar to another "
            "material but has an important difference, such as dimension, "
            "grade, pressure rating or another technical attribute. "
            "The AI compares semantic similarity together with structured "
            "technical attributes before making the recommendation."
        ),

        "near duplicates": (
            "A near duplicate is a material that is very similar to another "
            "material but has an important difference, such as dimension, "
            "grade, pressure rating or another technical attribute. "
            "The AI compares semantic similarity together with structured "
            "technical attributes before making the recommendation."
        ),

        "duplicate": (
            "Duplicate detection identifies material records that represent "
            "the same material even when their descriptions differ because "
            "of abbreviations, word order, synonyms or formatting."
        ),

        "matching": (
            "Material matching combines semantic similarity with extracted "
            "technical attributes. The system can identify identical, "
            "near-duplicate, different and functionally equivalent materials. "
            "Critical attribute conflicts can prevent an otherwise similar "
            "description from being treated as identical."
        ),

        "classification": (
            "Material classification determines the material category and "
            "subcategory using semantic understanding of the material "
            "description rather than relying only on a keyword."
        ),

        "approval": (
            "AI recommendations are intended for human validation. "
            "A reviewer can approve or reject a proposed mapping. "
            "The decision is stored in the database and recorded in the "
            "audit trail."
        ),

        "traceability": (
            "Traceability keeps the relationship between an original CPSE "
            "material and its standardized national material. This allows "
            "users to move from a CPSE material to its national code and "
            "from a national material back to the contributing CPSE records."
        ),

        "national code": (
            "The national material code is the standardized identifier "
            "generated for the harmonized material. It is derived from "
            "the standardized material information and remains associated "
            "with the CPSE mappings."
        ),

        "national material code": (
            "The national material code is the standardized identifier "
            "generated for the harmonized material. It is derived from "
            "the standardized material information and remains associated "
            "with the CPSE mappings."
        ),
        

        "version": (
            "Version control preserves changes made to a standardized "
            "material. A new version can record the previous value, new "
            "value, user, timestamp and reason without deleting the "
            "original history."
        ),

        "audit": (
            "The audit trail records important system actions such as "
            "mapping decisions, approvals, rejections, version creation "
            "and ERP integration events."
        ),

        "erp": (
            "The ERP integration prepares the standardized national material "
            "and its approved legacy mappings in an SAP/ERP-ready payload. "
            "The current SIH implementation uses a simulated ERP integration "
            "rather than a live SAP connection."
        ),

        "migration": (
            "Migration takes an approved material mapping and prepares the "
            "standardized national material and its legacy CPSE relationship "
            "for transfer into an ERP/material-master environment."
        ),

        "functional equivalence": (
            "Functional equivalence means two materials may be different in "
            "description or some attributes but can perform the same intended "
            "function. It is considered separately from exact identity."
        ),

        "ai": (
            "The material intelligence pipeline uses NLP normalization, "
            "technical attribute extraction, transformer embeddings, "
            "semantic classification, vector search and hybrid matching. "
            "The result includes a match decision, confidence and explanation."
        ),
    }

    # Match process questions by concept
    for topic, answer in process_answers.items():

        if topic in normalized:
            return {
                "answer": answer,
                "source": "Material Intelligence System"
            }

    # --------------------------------------------------------
    # BASIC MANUFACTURING / MATERIAL PROCESS KNOWLEDGE
    # --------------------------------------------------------

    if "bolt" in normalized and any(
        word in normalized
        for word in {
            "manufacture",
            "manufacturing",
            "made",
            "making",
            "process"
        }
    ):
        return {
            "answer": (
                "A typical bolt manufacturing process is: "
                "wire/rod preparation → cutting or heading → "
                "thread formation → heat treatment when required → "
                "surface treatment/coating when required → inspection. "
                "The exact process depends on the bolt material, grade, "
                "size and required standard."
            )
        }

    if "pipe" in normalized and "process" in normalized:
        return {
            "answer": (
                "Pipe manufacturing generally involves forming the raw "
                "material into the required pipe geometry, followed by "
                "welding for welded pipes or forming/drawing processes "
                "for seamless pipes, then sizing, heat treatment or "
                "surface treatment when required, and inspection."
            )
        }

    if "bearing" in normalized and "process" in normalized:
        return {
            "answer": (
                "A typical bearing manufacturing flow includes ring "
                "manufacturing, heat treatment, precision grinding, "
                "ball or roller preparation, assembly and final inspection. "
                "The exact process depends on the bearing type and specification."
            )
        }

    # --------------------------------------------------------
    # DATABASE SEARCH
    # --------------------------------------------------------

    db: Session = SessionLocal()

    try:

        import re
        from sqlalchemy import or_, and_

        # ----------------------------------------------------
        # NATIONAL CODE SEARCH
        # ----------------------------------------------------

        national_match = re.search(
            r"\b[A-Z]{2,6}-[A-Z0-9-]+\b",
            query.upper()
        )

        if national_match:

            possible_code = national_match.group(0)

            national = (
                db.query(models.StandardizedMaterial)
                .filter(
                    models.StandardizedMaterial.national_code.ilike(
                        possible_code
                    )
                )
                .first()
            )

            if national:

                mappings = (
                    db.query(models.MaterialMapping)
                    .filter(
                        models.MaterialMapping.national_material_id
                        == national.id
                    )
                    .all()
                )

                results = []

                for mapping in mappings:

                    material = (
                        db.query(models.OriginalMaterial)
                        .filter(
                            models.OriginalMaterial.id
                            == mapping.original_material_id
                        )
                        .first()
                    )

                    if material:
                        results.append({
                            "material_code": material.material_code,
                            "description": material.original_description,
                            "mapping_status": mapping.status,
                            "match_type": mapping.match_type,
                            "confidence": mapping.confidence
                        })

                return {
                    "answer": (
                        f"National material {national.national_code} is "
                        f"'{national.standard_description}'. "
                        f"It has {len(results)} CPSE mapping(s)."
                    ),
                    "national_material": {
                        "id": national.id,
                        "national_code": national.national_code,
                        "standard_description":
                            national.standard_description,
                        "category": national.category,
                        "status": national.status
                    },
                    "mappings": results
                }

        # ----------------------------------------------------
        # CPSE / MATERIAL CODE SEARCH
        # ----------------------------------------------------

        code_match = re.search(
            r"\b(?:CPCL|IOCL|ONGC|HPCL|BPCL|CP|IO|ON|HP|BP)-?[A-Z0-9]+\b",
            query.upper()
        )

        if code_match:

            material_code = code_match.group(0)

            aliases = {
                "CPCL-": "CP-",
                "IOCL-": "IO-",
                "ONGC-": "ON-",
                "HPCL-": "HP-",
                "BPCL-": "BP-"
            }

            for prefix, replacement in aliases.items():

                if material_code.startswith(prefix):
                    material_code = (
                        replacement
                        + material_code[len(prefix):]
                    )
                    break

            material = (
                db.query(models.OriginalMaterial)
                .filter(
                    models.OriginalMaterial.material_code.ilike(
                        material_code
                    )
                )
                .first()
            )

            if material:

                mapping = (
                    db.query(models.MaterialMapping)
                    .filter(
                        models.MaterialMapping.original_material_id
                        == material.id
                    )
                    .order_by(
                        models.MaterialMapping.id.desc()
                    )
                    .first()
                )

                national = None

                if mapping:

                    national = (
                        db.query(models.StandardizedMaterial)
                        .filter(
                            models.StandardizedMaterial.id
                            == mapping.national_material_id
                        )
                        .first()
                    )

                return {
                    "answer": (
                        f"Material {material.material_code}: "
                        f"{material.original_description}. "
                        f"Mapping status: "
                        f"{mapping.status if mapping else 'NOT MAPPED'}."
                    ),
                    "material": {
                        "id": material.id,
                        "material_code": material.material_code,
                        "description":
                            material.original_description,
                        "specifications":
                            material.original_specifications,
                        "unit": material.original_unit,
                        "category": material.category
                    },
                    "mapping": (
                        {
                            "status": mapping.status,
                            "match_type": mapping.match_type,
                            "confidence": mapping.confidence,
                            "national_code":
                                national.national_code
                                if national else None,
                            "standard_description":
                                national.standard_description
                                if national else None
                        }
                        if mapping
                        else None
                    )
                }

        # ----------------------------------------------------
        # GENERAL MATERIAL SEARCH
        # ----------------------------------------------------

        ignored_words = {
            "find",
            "show",
            "give",
            "tell",
            "about",
            "the",
            "all",
            "material",
            "materials",
            "material?",
            "equivalent",
            "equivalents",
            "across",
            "cpse",
            "cpses",
            "what",
            "which",
            "is",
            "are",
            "for",
            "me",
            "does",
            "this",
            "that",
            "how",
            "why"
        }

        terms = [
            term
            for term in re.findall(
                r"[a-zA-Z0-9.]+",
                normalized
            )
            if term not in ignored_words
            and len(term) >= 2
        ]

        if terms:

            conditions = []

            for term in terms:

                pattern = f"%{term}%"

                conditions.append(
                    or_(
                        models.OriginalMaterial.material_code.ilike(
                            pattern
                        ),
                        models.OriginalMaterial.original_description.ilike(
                            pattern
                        ),
                        models.OriginalMaterial.original_specifications.ilike(
                            pattern
                        ),
                        models.OriginalMaterial.technical_parameters.ilike(
                            pattern
                        )
                    )
                )

            materials = (
                db.query(models.OriginalMaterial)
                .filter(and_(*conditions))
                .limit(10)
                .all()
            )

            if materials:

                results = []

                for material in materials:

                    mapping = (
                        db.query(models.MaterialMapping)
                        .filter(
                            models.MaterialMapping.original_material_id
                            == material.id
                        )
                        .order_by(
                            models.MaterialMapping.id.desc()
                        )
                        .first()
                    )

                    national = None

                    if mapping:

                        national = (
                            db.query(
                                models.StandardizedMaterial
                            )
                            .filter(
                                models.StandardizedMaterial.id
                                == mapping.national_material_id
                            )
                            .first()
                        )

                    results.append({
                        "material_code":
                            material.material_code,
                        "description":
                            material.original_description,
                        "national_code":
                            national.national_code
                            if national else None,
                        "standard_description":
                            national.standard_description
                            if national else None,
                        "mapping_status":
                            mapping.status
                            if mapping else None,
                        "match_type":
                            mapping.match_type
                            if mapping else None,
                        "confidence":
                            mapping.confidence
                            if mapping else None
                    })

                return {
                    "answer": (
                        f"I found {len(results)} material record(s) "
                        f"matching your query."
                    ),
                    "results": results
                }

        # ----------------------------------------------------
        # FALLBACK
        # ----------------------------------------------------

        return {
            "answer": (
                "I couldn't find a matching material record for that "
                "query. Try a material code, national code, material "
                "description, or ask about standardization, matching, "
                "approval, traceability, versioning or ERP migration."
            )
        }

    finally:
        db.close()