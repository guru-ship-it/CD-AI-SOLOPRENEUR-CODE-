from fastapi import FastAPI, HTTPException, Request
import uuid
from pydantic import BaseModel
# from celery.result import AsyncResult
# from celery_config import celery_app
# from tasks import generate_legal_pdf, verify_face_with_vertex


# PVC Imports
# PVC Imports (Moved to lazy loaders)
# from verifiers.factory import PoliceVerifier
# from services.pvc_application import PVCApplicationEngine
# from services.pvc_status_checker import PVCStatusChecker
# from verifiers.pvc_validator import PVCValidator
from database import get_db
from models import Verification, Grievance, Tenant, Incident, ActionApproval
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select
from fastapi import Depends
from datetime import datetime, timedelta
from typing import List, Optional

app = FastAPI(title="ComplianceDesk API (Async)")

# Lazy Loading Proxy to prevent Timeout during Discovery
class LazyProxy:
    def __init__(self, import_func):
        self._import_func = import_func
        self._obj = None
    
    def __getattr__(self, name):
        if self._obj is None:
            # Import and instantiate on first access
            factory_class = self._import_func()
            self._obj = factory_class()
        return getattr(self._obj, name)

# Services Initialization (Lazily with Import)
def load_police_verifier():
    from verifiers.factory import PoliceVerifier
    return PoliceVerifier

def load_pvc_engine():
    from services.pvc_application import PVCApplicationEngine
    return PVCApplicationEngine

def load_pvc_checker():
    from services.pvc_status_checker import PVCStatusChecker
    return PVCStatusChecker

def load_pvc_validator():
    from verifiers.pvc_validator import PVCValidator
    return PVCValidator

police_verifier = LazyProxy(load_police_verifier)
pvc_app_engine = LazyProxy(load_pvc_engine)
pvc_status_checker = LazyProxy(load_pvc_checker)
pvc_validator = LazyProxy(load_pvc_validator)

# Mock Session State (For Demo Purpose Only)
# In production, use Redis or DB
USER_SESSIONS = {}

class VerificationRequest(BaseModel):
    name: str
    id: str
    image_url: str
    country: Optional[str] = "IN" # Default to India

class VerificationResponse(BaseModel):
    task_id: str
    applicant_name: str
    status: str
    face_verified: Optional[bool]
    face_confidence: Optional[str]
    failure_reason: Optional[str]
    created_at: str

    class Config:
        from_attributes = True

class GrievanceRequest(BaseModel):
    task_id: str
    description: str

class DPOUpdateRequest(BaseModel):
    name: str # Tenant Name identifier for simple lookup
    dpo_name: str
    dpo_email: str
    dpo_phone: str
    region: str

class IncidentRequest(BaseModel):
    description: str
    tenant_name: str

class ApprovalRequest(BaseModel):
    action_type: str
    payload: dict
    requester: str

class WhatsAppPayload(BaseModel):
    user_id: str
    message: str
    image_url: str = None

@app.post("/verify")
async def request_verification(request: VerificationRequest, db: AsyncSession = Depends(get_db)):
    """
    Enqueues verification tasks to the worker.
    Returns immediately with task IDs.
    """
    # 0. NRIC Masking Protocol (Singapore PDPA)
    final_id = request.id
    if request.country == "SG":
        # Keep only last 4 chars (e.g. S1234567A -> *****567A)
        if len(request.id) > 4:
            masked_part = "*" * (len(request.id) - 4)
            visible_part = request.id[-4:]
            final_id = f"{masked_part}{visible_part}"
    
    # 0.5 POPIA/NDPR Enforcement: Check DPO for high volume
    # Mocking Tenant ID 1 for this demo (In real auth, get from token)
    tenant_id = 1 
    result = await db.execute(select(Tenant).filter(Tenant.id == tenant_id))
    tenant = result.scalars().first()
    
    if tenant:
        # Check volume
        count_result = await db.execute(select(Verification).filter(Verification.tenant_id == tenant_id))
        v_count = len(count_result.scalars().all()) # Simplified count for demo
        if v_count > 100:
            if not tenant.dpo_name or not tenant.dpo_email:
                 raise HTTPException(
                     status_code=403, 
                     detail="POPIA COMPLIANCE BLOCK: You have exceeded 100 verifications. You MUST appoint an Information Officer (DPO) to continue processing."
                 )

    # Generate Task ID
    task_id = str(uuid.uuid4())
    
    # Save Initial State to DB
    verification = Verification(
        task_id=task_id,
        tenant_id=tenant_id,
        applicant_name=request.name,
        applicant_id=final_id, # Stored Masked if SG
        image_url=request.image_url,
        status="PROCESSING"
    )
    db.add(verification)
    await db.commit()

    # 1. Trigger PDF Generation (CPU Heavy)
    from tasks import generate_legal_pdf
    pdf_task = generate_legal_pdf.delay({"name": request.name, "id": final_id})
    
    # 2. Trigger Face Verification (Network Heavy)
    from tasks import verify_face_with_vertex
    face_task = verify_face_with_vertex.delay(request.image_url)
    
    return {
        "message": "Verification processing started",
        "task_id": task_id,
        "pdf_task_id": pdf_task.id,
        "face_task_id": face_task.id
    }

@app.post("/whatsapp/hook")
async def whatsapp_webhook(payload: WhatsAppPayload):
    """
    Simulates a WhatsApp Webhook for Police Verification Flow.
    """
    user_id = payload.user_id
    msg = payload.message.strip().upper()
    
    # Get current state or start fresh
    state = USER_SESSIONS.get(user_id, {}).get("state", "START")
    context = USER_SESSIONS.get(user_id, {}).get("context", {})

    response_text = ""
    next_state = state

    if state == "START":
        if "POLICE" in msg:
            response_text = (
                "Select your Work Location for Police Verification:\n"
                "1. Hyderabad (TS)\n"
                "2. Bangalore (KA)\n"
                "3. Chennai (TN)\n"
                "4. Andhra (AP)"
            )
            next_state = "SELECT_LOCATION"
        else:
            response_text = "Welcome to ComplianceDesk. Type 'POLICE' to start Police Verification."

    elif state == "SELECT_LOCATION":
        state_map = {"1": "TS", "2": "KA", "3": "TN", "4": "AP"}
        selected_state = state_map.get(msg)
        
        if selected_state:
            context["state_code"] = selected_state
            # Verify basic eligibility using factory (Strategy Check)
            try:
                strategy_info = police_verifier.verify_candidate(selected_state, {})
                portal_info = strategy_info.get('portal', 'Unknown Portal')
                
                response_text = (
                    f"Selected: {selected_state} ({portal_info}).\n"
                    "Do you already have a Police Certificate? (YES / NO / APPLIED)"
                )
                next_state = "CHECK_EXISTING"
            except Exception as e:
                 response_text = f"Error: {str(e)}. Please select again."
        else:
            response_text = "Invalid selection. Please reply 1, 2, 3, or 4."

    elif state == "CHECK_EXISTING":
        if msg == "YES":
            response_text = "Please upload a photo of your Police Certificate."
            next_state = "AWAITING_CERT_UPLOAD"
            
        elif msg == "NO":
            response_text = (
                "We will help you apply.\n"
                "Please send your Full Name to generate the application form."
            )
            next_state = "AWAITING_NAME_FOR_APP"
            
        elif msg == "APPLIED":
            response_text = "Please enter your Application/Petition Number."
            next_state = "AWAITING_APP_ID"
            
        else:
            response_text = "Please reply with YES, NO, or APPLIED."

    elif state == "AWAITING_CERT_UPLOAD":
        if payload.image_url:
            # Trigger Validator
            validation_result = pvc_validator.validate_certificate_image(payload.image_url)
            
            verdict = validation_result.get("verdict")
            details = validation_result.get("data", {})
            
            response_text = (
                f"Certificate Analysis: {verdict}\n"
                f"Name: {details.get('name', 'N/A')}\n"
                f"Status: {validation_result.get('state_verified', False)}"
            )
            # Reset after completion
            next_state = "START"
        else:
            response_text = "Please upload an image."

    elif state == "AWAITING_NAME_FOR_APP":
        # Generate Application
        state_code = context.get("state_code", "TS")
        user_data = {"name": msg, "id": user_id}
        
        result = pvc_app_engine.generate_application(state_code, user_data)
        
        response_text = (
            f"✅ Form Generated: {result.get('file_path')}\n"
            f"{result.get('instructions')}\n\n"
            "Once applied, type 'POLICE' again and select 'APPLIED' to track status."
        )
        next_state = "START"

    elif state == "AWAITING_APP_ID":
        state_code = context.get("state_code", "TS")
        app_id = msg
        
        # Check Status
        status_result = await pvc_status_checker.check_status(state_code, app_id)
        
        response_text = f"👮‍♂️ Current Status for {app_id}:\n{status_result}"
        next_state = "START"

    # Update Session
    USER_SESSIONS[user_id] = {"state": next_state, "context": context}

    return {"response": response_text, "next_state": next_state}

    return {"response": response_text, "next_state": next_state}


@app.get("/verifications", response_model=List[VerificationResponse])
async def list_verifications(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    """
    Get recent verifications for the dashboard.
    """
    result = await db.execute(
        select(Verification).order_by(desc(Verification.created_at)).offset(skip).limit(limit)
    )
    verifications = result.scalars().all()
    # Manual mapping to simple string for datetime if needed, or rely on pydantic
    results = []
    for v in verifications:
        results.append({
            "task_id": v.task_id,
            "applicant_name": v.applicant_name,
            "status": v.status,
            "face_verified": v.face_verified,
            "face_confidence": v.face_confidence,
            "failure_reason": v.failure_reason,
            "created_at": v.created_at.strftime("%Y-%m-%d %H:%M:%S") if v.created_at else ""
        })
    return results

@app.post("/grievances")
async def report_grievance(request: GrievanceRequest, db: AsyncSession = Depends(get_db)):
    """
    Submit a grievance for a verification.
    """
    # 1. Verify task exists
    result = await db.execute(select(Verification).filter(Verification.task_id == request.task_id))
    verification = result.scalars().first()
    if not verification:
        raise HTTPException(status_code=404, detail="Verification not found")
    
    # 2. Update status to UNDER_REVIEW
    verification.status = "UNDER_REVIEW"
    
    # 3. Create Grievance record
    grievance = Grievance(
        verification_id=verification.id,
        task_id=request.task_id,
        description=request.description
    )
    db.add(grievance)
    await db.commit()
    
    # SLA & Notification
    print(f"[EMAIL SERVICE] 📧 Sending High Priority Alert to support@compliancedesk.ai for Task {request.task_id}")
    print(f"[EMAIL SERVICE] ⏳ SLA Timer Started: 24 Hours for Resolution.")
    
    return {"message": "Grievance submitted", "status": "UNDER_REVIEW"}

@app.post("/tenants/dpo")
async def update_dpo(request: DPOUpdateRequest, db: AsyncSession = Depends(get_db)):
    """
    Update/Create Tenant with DPO details.
    """
    result = await db.execute(select(Tenant).filter(Tenant.name == request.name))
    tenant = result.scalars().first()
    if not tenant:
        tenant = Tenant(name=request.name)
        db.add(tenant)
    
    tenant.dpo_name = request.dpo_name
    tenant.dpo_email = request.dpo_email
    tenant.dpo_phone = request.dpo_phone
    tenant.region = request.region
    
    await db.commit()
    await db.refresh(tenant)
    return {"message": "DPO Details Updated", "region": tenant.region}

@app.post("/incidents")
async def report_incident(request: IncidentRequest, db: AsyncSession = Depends(get_db)):
    """
    Report a security incident (72-hour timer).
    """
    deadline = datetime.now() + timedelta(hours=72)
    
    incident = Incident(
        description=request.description,
        report_deadline=deadline,
        status="OPEN"
    )
    db.add(incident)
    await db.commit()
    
    # Simulate Regulator Email
    print(f"🚨 SECURITY INCIDENT DECLARED: {request.description}")
    print(f"📧 Drafting email to Data Protection Regulator...")
    print(f"⏱️ 72-Hour Countown Started. Deadline: {deadline}")
    
    return {
        "message": "Incident Declared", 
        "deadline": deadline.isoformat(),
        "deadline_hours": 72
    }

@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    """
    Poll task status.
    """
    from celery.result import AsyncResult
    from celery_config import celery_app
    task_result = AsyncResult(task_id, app=celery_app)
    return {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result if task_result.ready() else None
    }

@app.post("/approvals")
async def create_approval(request: ApprovalRequest, db: AsyncSession = Depends(get_db)):
    import json
    deadline = datetime.now() + timedelta(hours=1)
    
    approval = ActionApproval(
        action_type=request.action_type,
        payload=json.dumps(request.payload),
        requester_id=request.requester,
        status="PENDING",
        deadline=deadline
    )
    db.add(approval)
    await db.commit()
    await db.refresh(approval)
    
    print(f"👁️ FOUR-EYES ALERT: {request.requester} requested {request.action_type}. Awaiting second admin approval.")
    return {"id": approval.id, "status": "PENDING", "message": "Approval Request Created"}

@app.get("/approvals")
async def list_approvals(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ActionApproval).filter(ActionApproval.status == "PENDING"))
    return result.scalars().all()

@app.put("/approvals/{id}")
async def process_approval(id: int, status: str, approver: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ActionApproval).filter(ActionApproval.id == id))
    approval = result.scalars().first()
    
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    
    if approval.requester_id == approver:
        raise HTTPException(status_code=403, detail="Four-Eyes Violation: Requester cannot be the Approver")
        
    approval.status = status
    approval.approver_id = approver
    
    await db.commit()
    
    if status == "APPROVED":
        print(f"✅ ACTION AUTHORIZED: {approval.action_type} execution triggered by {approver}.")
    
    return {"id": id, "status": status}

@app.get("/")
async def root():
    return {"message": "ComplianceDesk API is running"}
