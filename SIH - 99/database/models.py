from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from datetime import datetime
from database.database import Base


# ============================================================
# USERS
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)


# ============================================================
# CPSE
# ============================================================

class CPSE(Base):
    __tablename__ = "cpse"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    sector = Column(String)

    # True = one of the 14 master/reference CPSEs
    # False = CPSE uploaded/created by a user
    is_master = Column(Boolean, default=False, nullable=False)

    # User who owns this CPSE when it is uploaded
    # NULL for the 14 master CPSEs
    owner_id = Column(Integer, nullable=True)


# ============================================================
# ORIGINAL MATERIAL
# ============================================================

class OriginalMaterial(Base):
    __tablename__ = "original_materials"

    id = Column(Integer, primary_key=True, index=True)

    # User workspace
    owner_id = Column(Integer, nullable=False)

    cpse_id = Column(Integer, nullable=False)

    material_code = Column(String, nullable=False)

    original_description = Column(Text)

    original_specifications = Column(Text)

    original_unit = Column(String)

    category = Column(String, nullable=True)

    technical_parameters = Column(Text, nullable=True)

    raw_record = Column(Text, nullable=True)


# ============================================================
# STANDARDIZED / NATIONAL MATERIAL
# ============================================================

class StandardizedMaterial(Base):
    __tablename__ = "standardized_materials"

    id = Column(Integer, primary_key=True, index=True)

    # User workspace
    owner_id = Column(Integer, nullable=False)

    # NOT globally unique anymore.
    # Different users can have the same national code.
    national_code = Column(String, nullable=False)

    standard_description = Column(Text)

    category = Column(String)

    status = Column(String, default="PENDING")


# ============================================================
# MATERIAL MAPPING
# ============================================================

class MaterialMapping(Base):
    __tablename__ = "material_mappings"

    id = Column(Integer, primary_key=True, index=True)

    # User workspace
    owner_id = Column(Integer, nullable=False)

    original_material_id = Column(Integer, nullable=False)

    national_material_id = Column(Integer, nullable=False)

    match_type = Column(String)

    confidence = Column(String)

    explanation = Column(Text, nullable=True)

    status = Column(String, default="PENDING")


# ============================================================
# AUDIT LOG
# ============================================================

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    # User workspace
    owner_id = Column(Integer, nullable=True)

    # Kept for compatibility with existing mapping audit records
    mapping_id = Column(Integer, nullable=True)

    # Entity affected by the action
    entity_id = Column(Integer, nullable=True)

    action = Column(String, nullable=False)

    # Values before and after the change
    old_value = Column(Text, nullable=True)

    new_value = Column(Text, nullable=True)

    # Who performed the action
    user = Column(String, nullable=True)

    timestamp = Column(DateTime, default=datetime.utcnow)

    # Why the change happened
    reason = Column(Text, nullable=True)


# ============================================================
# MATERIAL VERSION
# ============================================================

class MaterialVersion(Base):
    __tablename__ = "material_versions"

    id = Column(Integer, primary_key=True, index=True)

    # User workspace
    owner_id = Column(Integer, nullable=False)

    national_material_id = Column(Integer, nullable=False)

    version_number = Column(Integer, nullable=False)

    standard_description = Column(Text)

    category = Column(String)

    status = Column(String)

    changed_by = Column(String)

    change_reason = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)