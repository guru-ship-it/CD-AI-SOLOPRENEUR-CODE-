from sqlalchemy import Column, Integer, String, Boolean, DateTime, CheckConstraint
from sqlalchemy.sql import func
from .database import Base

class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String, unique=True, index=True, nullable=False)
    tenant_id = Column(Integer, index=True, nullable=True) # Link to Tenant
    
    applicant_name = Column(String, nullable=False)
    applicant_id = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    
    status = Column(String, default="PENDING") # PENDING, PROCESSING, COMPLETED, FAILED, UNDER_REVIEW
    
    # Results
    pdf_path = Column(String, nullable=True)
    face_verified = Column(Boolean, nullable=True)
    face_confidence = Column(String, nullable=True) # Stored as string to avoid float precision issues if needed
    failure_reason = Column(String, nullable=True) # For AI Explainability
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'UNDER_REVIEW')", name="valid_status"),
    )

class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(Integer, primary_key=True, index=True)
    verification_id = Column(Integer, nullable=False) # Helper link to verification ID if needed, though foreign key is better, keeping simple for now
    task_id = Column(String, index=True, nullable=False) # Link to verification task_id
    
    description = Column(String, nullable=False)
    status = Column(String, default="OPEN") # OPEN, RESOLVED, REJECTED
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Tenant(Base):
    __tablename__ = "tenants"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    region = Column(String, default="asia-south1") # asia-south1 (India), africa-south1 (South Africa)
    
    # DPO Details (POPIA / NDPR)
    dpo_name = Column(String, nullable=True)
    dpo_email = Column(String, nullable=True)
    dpo_phone = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=True)
    description = Column(String, nullable=False)
    reported_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String, default="OPEN") # OPEN, REPORTED, CLOSED
    
    # 72-Hour Deadline
    report_deadline = Column(DateTime(timezone=True))

