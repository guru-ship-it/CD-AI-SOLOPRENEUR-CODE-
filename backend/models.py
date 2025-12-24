from sqlalchemy import Column, Integer, String, Boolean, DateTime, CheckConstraint
from sqlalchemy.sql import func
from database import Base, BaseCompliance

class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String, unique=True, index=True, nullable=False)
    tenant_id = Column(Integer, index=True, nullable=True) # Link to Tenant
    
    # FAT 5.1: Vault Isolation - No naked PII in verifications table
    vault_token = Column(String, unique=True, index=True, nullable=False) 
    
    # Dashboard Display Fields (Masked/Redacted in Prod, Plain for Demo)
    applicant_name = Column(String, nullable=True) 
    applicant_id = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
 
    
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

class ActionApproval(Base):
    __tablename__ = "action_approvals"
    
    id = Column(Integer, primary_key=True, index=True)
    action_type = Column(String, nullable=False) # e.g., "DELETE_TENANT", "EXPORT_DATA"
    payload = Column(String, nullable=False) # JSON string of action details
    
    requester_id = Column(String, nullable=False)
    approver_id = Column(String, nullable=True) # ID of admin who approved
    
    status = Column(String, default="PENDING") # PENDING, APPROVED, REJECTED
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    deadline = Column(DateTime(timezone=True)) # 1-hour expiry

class Vault(Base):
    __tablename__ = "secure_vault"
    
    # FAT 5.1: The physical vault containing the actual PII
    token = Column(String, primary_key=True, index=True) # Linked to vault_token in verifications
    pii_json = Column(String, nullable=False) # Encrypted PII (Name, ID, etc.)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


from database import Base, BaseCompliance

# ... existing operational models using Base ...

class AuditLog(BaseCompliance):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(String, nullable=False, index=True) # User ID or System
    action = Column(String, nullable=False) # READ, WRITE, EXPORT, DELETE
    resource_id = Column(String, nullable=True) # ID of the resource accessed
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # 5-Year Retention Policy
    retention_until = Column(DateTime(timezone=True), index=True) 

class DPDPConsent(BaseCompliance):
    __tablename__ = "dpdp_consents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    form_hash = Column(String, nullable=False) # Checksum of the agreed terms
    signature_base64 = Column(String, nullable=False) # Digital Signature representation
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String, nullable=True)
    
    # 5-Year Retention Policy
    retention_until = Column(DateTime(timezone=True), index=True)
