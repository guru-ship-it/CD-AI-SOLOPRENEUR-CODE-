from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
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
from database import get_db, get_compliance_db
from models import Verification, Grievance, Tenant, Incident, ActionApproval, AuditLog, DPDPConsent, ComplianceVault, VerifiedReport
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import desc, select
from fastapi import Depends, Header
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="ComplianceDesk API (Async)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow Firebase Hosting & Localhost
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

def load_niti_wizard():
    from services.niti_wizard import NitiWizardService
    return NitiWizardService

police_verifier = LazyProxy(load_police_verifier)
pvc_app_engine = LazyProxy(load_pvc_engine)
pvc_status_checker = LazyProxy(load_pvc_checker)
pvc_validator = LazyProxy(load_pvc_validator)
niti_wizard = LazyProxy(load_niti_wizard)

# Mock Session State (For Demo Purpose Only)
# In production, use Redis or DB
USER_SESSIONS = {}

class VerificationRequest(BaseModel):
    name: str
    id: str
    mobile_number: str
    image_url: str
    country: Optional[str] = "IN" 

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
    image_url: Optional[str] = None

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
    # save Initial State to DB
    # Generate Vault Token (Since Models enforce Vault Isolation)
    vault_token = f"VT-{uuid.uuid4().hex[:12].upper()}"

    verification = Verification(
        task_id=task_id,
        tenant_id=tenant_id,
        mobile_number=request.mobile_number,
        applicant_name=request.name, # RESTORED: Model updated to support this
        applicant_id=final_id,       # RESTORED
        image_url=request.image_url, # RESTORED
        vault_token=vault_token,    
        status="PROCESSING"
    )
    db.add(verification)
    await db.commit()

    # --- TRUTH SOURCE INTEGRATION (MOCK PHASE 1) ---
    from services.mock_provider_service import MockProviderService
    
    # Simulate Calling Protean/NSDL
    truth_resp = MockProviderService.verify_id("AADHAAR", request.id)
    
    if truth_resp["status"] == "SUCCESS":
        verification.status = "COMPLETED"
        verification.face_verified = True # Simulated Face Match
        verification.face_confidence = "98.5"
        
        # --- SYNC TO MASTER DATABASE (VerifiedReport) ---
        from models import VerifiedReport
        from datetime import datetime, timedelta
        
        # Simulate an expiry date (e.g., 1 year from now)
        expiry_date = datetime.utcnow() + timedelta(days=365)
        
        verified_report = VerifiedReport(
            mobile_number=request.mobile_number,
            applicant_name=request.name,
            id_type="AADHAAR", # In real scenario, get from request
            id_number=final_id,
            pdf_path=f"/tmp/contract_{final_id}.pdf",
            expiry_date=expiry_date,
            tenant_id=tenant_id
        )
        db.add(verified_report)
    else:
        verification.status = "FAILED"
        verification.failure_reason = truth_resp.get("message", "Identity Verification Failed")
    
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
        "face_task_id": face_task.id,
        "truth_source_status": truth_resp["status"]
    }

@app.post("/whatsapp/hook")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks, db_compliance: AsyncSession = Depends(get_compliance_db)):
    """
    The Master Gatekeeper for WhatsApp (Interakt Integration)
    """
    payload = await request.json()
    
    # 1. Security & Event Filtering
    if payload.get('type') != 'message_received':
        return {"status": "ignored_event"}

    data = payload.get('data', {})
    user_phone = data.get('customer', {}).get('channel_phone_number', '')
    message_text = data.get('message', {}).get('text', '').strip()
    msg_upper = message_text.upper()
    
    # Clean phone (Extract last 10 digits for DB lookup)
    clean_phone = user_phone[-10:] if user_phone else ""
    if not clean_phone:
        return {"status": "invalid_phone"}

    # --- 2. CLASH DETECTION (The Registry Check) ---
    result = await db_compliance.execute(
        select(VerifiedReport).filter(VerifiedReport.mobile_number.like(f"%{clean_phone}"))
    )
    existing_user = result.scalars().first()
    
    # Get session/state
    session = USER_SESSIONS.get(user_phone, {"state": "START", "context": {}})
    state = session["state"]

    if existing_user and state == "START":
        from services.interakt import send_interakt_reply, send_support_alert_email
        
        if msg_upper == "NITI":
            # 🛑 PATH A: EXISTING USER - NITI (Redirect to Support)
            reply_msg = (f"Hello {existing_user.applicant_name}, you are already verified! "
                         "For changes or support, please contact our helpline: +91-9999999999")
            background_tasks.add_task(send_interakt_reply, user_phone, reply_msg)
            
            background_tasks.add_task(
                send_support_alert_email, 
                subject=f"Existing User Contact: {clean_phone}",
                body=f"User {existing_user.applicant_name} tried to access NITI. Redirected to helpline."
            )
            return {"status": "redirected_to_support"}
            
        elif "POLICE" in msg_upper:
            # 🟢 PATH C: PVC UPDATE Logic (Preserving your previous enhancement)
            from services.individual_vault import IndividualVaultService
            latest_pvc = IndividualVaultService.get_latest_pvc(user_phone)
            
            reply_msg = "👮‍♂️ Welcome back. We found an existing PVC record for you.\n\n"
            if latest_pvc:
                 reply_msg += f"Last Certificate: {latest_pvc[2]} (Verdict: {latest_pvc[6]})\n\n"
            
            reply_msg += (
                "What would you like to do?\n"
                "1. UPDATE certificate (Upload New)\n"
                "2. CHECK STATUS of application\n"
                "3. RELINK with another location"
            )
            USER_SESSIONS[user_phone] = {"state": "PVC_EXISTING_OPTIONS", "context": {}}
            background_tasks.add_task(send_interakt_reply, user_phone, reply_msg)
            return {"status": "pvc_options_sent"}

    # --- 3. PATH B: NEW USER OR ACTIVE SESSION ---
    # Extract optional image URL
    image_url = None
    if data.get('message', {}).get('type') == 'Image':
        image_url = data.get('message', {}).get('attachment', {}).get('url')

    # Delegate to Background Task for AI/Logic Processing
    from services.whatsapp_processor import WhatsAppProcessor
    background_tasks.add_task(
        WhatsAppProcessor.process_interaction, 
        user_phone, 
        message_text, 
        image_url
    )

    return {"status": "processing_started"}

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
    deadline = datetime.now() + timedelta(hours=6)
    
    incident = Incident(
        description=request.description,
        report_deadline=deadline,
        status="PENDING_INTERNAL_REVIEW" # Human Guardrails - NO AUTO REPORTING
    )
    db.add(incident)
    await db.commit()
    
    # Simulate INTERNAL Red Alert (SMS/Call to Guru)
    print(f"🚨 SECURITY INCIDENT SUSPECTED: {request.description}")
    print(f"📱 TRIGGERING INTERNAL RED ALERT: SMS sent to Guru (+91-9999999999).")
    print(f"⚠️ 6-Hour Countdown Started. ACTION REQUIRED: Verify False Positive or Click 'Escalate to CERT-In'.")
    
    return {
        "message": "Incident Logged - Internal Alert Triggered", 
        "status": "PENDING_INTERNAL_REVIEW",
        "deadline": deadline.isoformat(),
        "action_required": "Verify and Manually Escalate if Semantic"
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

from database import get_db, get_compliance_db, engine_app, engine_compliance, Base, BaseCompliance
from datetime import datetime, timedelta

# --- MIGRATION ON STARTUP ---
@app.on_event("startup")
async def startup():
    # Initialise both databases
    async with engine_app.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with engine_compliance.begin() as conn:
        await conn.run_sync(BaseCompliance.metadata.create_all)

# --- STRICT COMPLIANCE DEPENDENCIES ---
async def verify_admin_mfa(x_mfa_token: str = Header(None)):
    """
    Enforces Multi-Factor Authentication for Sensitive Ops.
    In prod, check this token against TOTP/Authenticator service.
    """
    if not x_mfa_token:
        # For Demo, we accept '123456' as the MFA key
        raise HTTPException(status_code=403, detail="MFA_REQUIRED: Missing X-MFA-Token header")
    if x_mfa_token != "123456":
         raise HTTPException(status_code=403, detail="INVALID_MFA_TOKEN")
    return x_mfa_token

async def require_compliance_officer(x_user_email: str = Header(None)):
    """
    STRICT RBAC: Only Guru and Durga are allowed access.
    """
    ALLOWED_OFFICERS = ["guru@compliancedesk.ai", "durga@compliancedesk.ai"]
    
    if not x_user_email or x_user_email.lower() not in ALLOWED_OFFICERS:
        raise HTTPException(status_code=403, detail="ACCESS_DENIED: User not authorized for Compliance Assets.")
    return x_user_email

# --- COMPLIANCE ENDPOINTS ---

@app.post("/niti/chat")
async def niti_chat(request: dict, db: AsyncSession = Depends(get_compliance_db)):
    """
    Niti AI Assistant Chat Handler with Gemini Integration.
    Writes Audit Logs to SEPARATE Compliance Database.
    """
    import os
    import google.generativeai as genai
    
    user_query = request.get("query", "").lower()
    user_id = request.get("user_id", "guest")
    
    # Static Rules First (Speed & Determinism)
    response = {
        "text": "",
        "action": None
    }
    
    if "dpdp" in user_query and "consent" in user_query:
        response["text"] = "The Digital Personal Data Protection (DPDP) Act 2023 mandates explicit consent. I can help you sign the form now."
        response["action"] = "SHOW_DPDP_FORM"
    elif "pricing" in user_query:
        response["text"] = "We offer flexible plans starting at ₹99/check. Check out our Pricing section for more details."
        response["action"] = "SCROLL_PRICING"
    elif "verify" in user_query and "options" in user_query:
         response["text"] = "I can help you verify an identity. We support Individual (KYC) and Business (KYB) verification."
         response["action"] = "SHOW_VERIFY_OPTIONS"
    
    # Fallback to Gemini AI if no static rule matches
    if not response["text"]:
        api_key = os.environ.get("GEMINI_API_KEY")
        if api_key:
            try:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-pro')
                
                # Contextualize the AI with strict guardrails
                system_prompt = (
                    "You are Niti, the AI Compliance Assistant for ComplianceDesk.ai. "
                    "You are an expert on the DPDP Act 2023. Compliance Desk AI is the Data Fiduciary. "
                    "The Data Protection Officer (DPO) can be reached at dpo@compliancedesk.ai. "
                    "Users have rights to access, correct, and withdraw consent easily. "
                    "You are ONLY allowed to answer questions related to: "
                    "1. Indian Identity Verification (Aadhaar, PAN, etc.) "
                    "2. DPDP Act 2023 and Data Privacy "
                    "3. Forensic Checks and Police Verifications "
                    "4. Compliance Desk AI platform features. "
                    "If asked about DPDP, explain that we only collect Name, ID numbers, and facial biometrics for the sole purpose of identity verification and fraud prevention. "
                    "If a user asks a general question, or anything unrelated to these topics, "
                    "politely explain that you are a specialized compliance assistant and cannot "
                    "answer general world knowledge or LLM-style creative queries. "
                    "Keep answers concise (under 50 words)."
                    "User Query: "
                )
                
                chat_response = model.generate_content(system_prompt + user_query)
                response["text"] = chat_response.text
            except Exception as e:
                print(f"Gemini Error: {e}")
                response["text"] = "I'm having trouble connecting to my knowledge base right now. Please try again later."
        else:
            response["text"] = "I'm still learning (Gemini API Key missing). Please ask about 'Pricing', 'DPDP', or 'Verification'."

    # Audit Log for Interaction -> WRITTEN TO COMPLIANCE_VAULT.DB
    audit = AuditLog(
        actor_id=user_id,
        action="NITI_QUERY",
        resource_id="GEMINI" if not response["action"] else "STATIC_RULE",
        ip_address="127.0.0.1",
        retention_until=datetime.utcnow() + timedelta(days=365*5) # 5 Year Retention
    )
    db.add(audit)
    await db.commit()
    
    return response

async def tokenize_compliance_pii(db: AsyncSession, pii_value: str) -> str:
    """
    FAT 5.1: Vault Pattern for Compliance DB.
    Checks if PII already exists in vault, returns token.
    Otherwise creates new token and stores in ComplianceVault.
    """
    import json
    # Use HMAC or consistent hash for demo-level tokenization
    import hashlib
    token = f"COMP-VT-{hashlib.sha256(pii_value.encode()).hexdigest()[:16].upper()}"
    
    # Check if exists
    stmt = select(ComplianceVault).filter(ComplianceVault.token == token)
    result = await db.execute(stmt)
    if result.scalars().first():
        return token
    
    # Store in Vault
    entry = ComplianceVault(token=token, pii_json=json.dumps({"raw": pii_value}))
    db.add(entry)
    # We don't commit here, let the parent task commit
    return token

async def detokenize_compliance_pii(db: AsyncSession, token: str) -> str:
    """
    FAT 5.1: Vault Pattern - Detokenization.
    Retrieves raw PII from ComplianceVault.
    """
    import json
    if not token or not token.startswith("COMP-VT-"):
        return token
    
    stmt = select(ComplianceVault).filter(ComplianceVault.token == token)
    result = await db.execute(stmt)
    entry = result.scalars().first()
    if entry:
        data = json.loads(entry.pii_json)
        return data.get("raw", token)
    return token

@app.post("/dpdp/sign")
async def sign_dpdp_consent(request: dict, db: AsyncSession = Depends(get_compliance_db)):
    """
    Digital Signature Handler -> WRITTEN TO COMPLIANCE_VAULT.DB
    """
    import hashlib
    user_id = request.get("user_id")
    signature_data = request.get("signature") # Base64
    
    if not user_id or not signature_data:
        raise HTTPException(status_code=400, detail="Missing signature data")
        
    # Create Form Hash (Immutable Proof of what the user actually saw)
    form_content = request.get("form_text", "Standard DPDP Consent Form v1.0")
    form_hash = hashlib.sha256(form_content.encode()).hexdigest()
    
    # Tokenize sensitive fields
    user_token = await tokenize_compliance_pii(db, user_id)
    sig_token = await tokenize_compliance_pii(db, signature_data)
    ip_token = await tokenize_compliance_pii(db, "127.0.0.1")

    consent = DPDPConsent(
        user_id_token=user_token,
        form_hash=form_hash,
        signature_token=sig_token,
        ip_token=ip_token,
        retention_until=datetime.utcnow() + timedelta(days=365*5) # 5 Year Retention
    )
    db.add(consent)
    
    # Audit Log -> WRITTEN TO COMPLIANCE_VAULT.DB
    audit = AuditLog(
        actor_token=user_token,
        action="CONSENT_SIGNED",
        resource_id=str(consent.form_hash)[:8],
        ip_token=ip_token,
        retention_until=datetime.utcnow() + timedelta(days=365*5) # 5 Year Retention
    )
    db.add(audit)
    
    await db.commit()
    
    return {"status": "success", "message": "Consent Recorded in Compliance Vault", "hash": form_hash}

# --- SECURE ADMIN ACCESS (MFA + RBAC) ---
@app.get("/admin/audit-logs")
async def get_audit_logs(
    db: AsyncSession = Depends(get_compliance_db),
    officer: str = Depends(require_compliance_officer),
    mfa: str = Depends(verify_admin_mfa)
):
    """
    Restricted Access: Only for Compliance Officers with MFA.
    """
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50))
    logs = result.scalars().all()
    
    # Detokenize for Officer View
    de_logs = []
    for log in logs:
        log_dict = {
            "id": log.id,
            "action": log.action,
            "resource_id": log.resource_id,
            "timestamp": log.timestamp,
            "actor_id": await detokenize_compliance_pii(db, log.actor_token),
            "ip_address": await detokenize_compliance_pii(db, log.ip_token)
        }
        de_logs.append(log_dict)
    return de_logs

@app.get("/admin/consents")
async def get_consents(
    db: AsyncSession = Depends(get_compliance_db),
    officer: str = Depends(require_compliance_officer),
    mfa: str = Depends(verify_admin_mfa)
):
    """
    Restricted Access: View Detokenized Consents.
    """
    result = await db.execute(select(DPDPConsent).order_by(DPDPConsent.timestamp.desc()).limit(50))
    consents = result.scalars().all()
    
    de_consents = []
    for c in consents:
        de_consents.append({
            "id": c.id,
            "user_id": await detokenize_compliance_pii(db, c.user_id_token),
            "form_hash": c.form_hash,
            "timestamp": c.timestamp,
            "ip_address": await detokenize_compliance_pii(db, c.ip_token)
            # signature_token excluded for extra security, can be added if needed
        })
    return de_consents

# --- TOOLS & UTILITIES ---

@app.get("/users/search")
async def search_users(mobile: str, db: AsyncSession = Depends(get_db)):
    """
    Search users using mobile search string approach.
    Matches documented response format.
    """
    result = await db.execute(
        select(VerifiedReport).filter(VerifiedReport.mobile_number.like(f"%{mobile}%"))
    )
    user = result.scalars().first()
    
    if user:
        return {
            "status": "found",
            "applicant_name": user.applicant_name,
            "verified_at": user.created_at.isoformat() if user.created_at else None,
            "expiry_date": user.expiry_date.isoformat() if user.expiry_date else None,
            "tenant_owner": f"Tenant_{user.tenant_id}",
            "registry_id": user.id
        }
    
    return {
        "status": "not_found",
        "detail": "User does not exist in the Master Registry."
    }

@app.get("/admin/expiry-check")
async def manual_expiry_check(db: AsyncSession = Depends(get_db)):
    """
    Manually triggers the expiry notification sweep.
    In Prod, this runs via a daily cron.
    """
    now = datetime.utcnow()
    day_30 = now + timedelta(days=30)
    day_15 = now + timedelta(days=15)
    
    # 1. Check for 30-day alerts
    res_30 = await db.execute(
        select(VerifiedReport).filter(
            VerifiedReport.expiry_date >= day_30.replace(hour=0, minute=0, second=0),
            VerifiedReport.expiry_date < (day_30 + timedelta(days=1)).replace(hour=0, minute=0, second=0)
        )
    )
    reports_30 = res_30.scalars().all()
    
    # 2. Check for daily alerts (<= 15 days)
    res_15 = await db.execute(
        select(VerifiedReport).filter(
            VerifiedReport.expiry_date <= day_15,
            VerifiedReport.expiry_date > now
        )
    )
    reports_15 = res_15.scalars().all()
    
    notifications_sent = 0
    from services.interakt import send_interakt_reply, send_support_alert_email

    for r in reports_30:
        # WhatsApp Template (Scenario 1)
        wa_msg = (
            "⚠️ Compliance Alert: Hello! Your verified ID document is expiring in 30 days.\n\n"
            "Please contact your company Admin to submit a renewal. Staying compliant means staying on the job! ✅"
        )
        send_interakt_reply(r.mobile_number, wa_msg)

        # Email Template
        subject = f"⚠️ Action Needed: Compliance Expiry Alert for {r.applicant_name}"
        body = (
            f"Dear Admin,\n\n"
            f"The following user in your Verified Registry is approaching document expiry:\n\n"
            f"Name: {r.applicant_name}\n"
            f"Mobile: {r.mobile_number}\n"
            f"Document Type: IDENTITY\n"
            f"Expiry Date: {r.expiry_date}\n"
            f"Days Remaining: 30\n\n"
            f"System Action: We have sent a WhatsApp alert to the user. "
            f"Please coordinate with them to upload the renewed document to avoid service disruption.\n\n"
            f"This is an automated message from the ComplianceDesk Registry."
        )
        send_support_alert_email(subject, body)
        notifications_sent += 1
        
    for r in reports_15:
        days_left = (r.expiry_date - now).days
        # WhatsApp Template (Scenario 2)
        wa_msg = (
            "🚨 URGENT ACTION REQUIRED\n\n"
            f"Your ID expires in {days_left} days. If you do not renew this immediately, your verification status will be suspended.\n\n"
            "📞 Call Helpline: +91-9999999999 📍 Action: Visit your HR/Admin office today."
        )
        send_interakt_reply(r.mobile_number, wa_msg)

        # Email Template
        subject = f"🚨 URGENT: Compliance Expiry for {r.applicant_name}"
        body = (
            f"Dear Admin,\n\n"
            f"The following user in your Verified Registry is approaching document expiry:\n\n"
            f"Name: {r.applicant_name}\n"
            f"Mobile: {r.mobile_number}\n"
            f"Document Type: IDENTITY\n"
            f"Expiry Date: {r.expiry_date}\n"
            f"Days Remaining: {days_left}\n\n"
            f"System Action: We have sent an URGENT WhatsApp alert to the user. "
            f"Please coordinate with them immediately to avoid service disruption.\n\n"
            f"This is an automated message from the ComplianceDesk Registry."
        )
        send_support_alert_email(subject, body)
        notifications_sent += 1
    
    return {"status": "success", "notifications_sent": notifications_sent}

class ParseRequest(BaseModel):
    raw_text: str

@app.post("/tools/smart-parse")
async def smart_parse_ocr(request: ParseRequest, db: AsyncSession = Depends(get_db)):
    """
    Uses Gemini Pro to clean and structure raw OCR text.
    Useful for cleaning Google Vision output.
    """
    from services.gemini_parser import GeminiParserService
    
    result = GeminiParserService.parse_id_card(request.raw_text)
    return result


class TranslateRequest(BaseModel):
    text: str
    source_hint: str = "Auto-Detect"
    target_language: str = "English"

@app.post("/tools/translate")
async def translate_content(request: TranslateRequest, db: AsyncSession = Depends(get_db)):
    """
    Translates text to/from Indian Regional Languages.
    """
    from services.translation_service import TranslationService
    
    result = TranslationService.translate_text(request.text, request.source_hint, request.target_language)
    return result




@app.get("/")
async def root():
    return {"message": "ComplianceDesk API is running"}
