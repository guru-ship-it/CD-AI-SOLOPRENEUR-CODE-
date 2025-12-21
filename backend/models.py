from sqlalchemy import Column, Integer, String, Boolean, DateTime, CheckConstraint
from sqlalchemy.sql import func
from .database import Base

class Verification(Base):
    __tablename__ = "verifications"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(String, unique=True, index=True, nullable=False)
    
    applicant_name = Column(String, nullable=False)
    applicant_id = Column(String, nullable=False)
    image_url = Column(String, nullable=False)
    
    status = Column(String, default="PENDING") # PENDING, PROCESSING, COMPLETED, FAILED
    
    # Results
    pdf_path = Column(String, nullable=True)
    face_verified = Column(Boolean, nullable=True)
    face_confidence = Column(String, nullable=True) # Stored as string to avoid float precision issues if needed
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')", name="valid_status"),
    )
