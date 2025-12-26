from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, Depends, Header
from contextlib import asynccontextmanager
import uuid
import os
import shutil
import traceback
from typing import List, Optional
from pydantic import BaseModel

IS_WINDOWS = os.name == "nt"

# --- 1. INSTANT-LISTEN CORE ---
app = FastAPI(title="ComplianceDesk API (Async)")

@app.get("/health")
async def health_check():
    return {"status": "ok", "environment": "Cloud" if not IS_WINDOWS else "Local", "timestamp": str(uuid.uuid4())[:8]}

@app.get("/ping")
async def ping():
    return "pong"

# --- 2. DEFERRED INITIALIZATION HELPERS ---

def sync_databases():
    if not IS_WINDOWS:
        try:
            print("--- [BOOT] DATABASE SYNC START ---")
            base_dir = os.path.dirname(os.path.abspath(__file__))
            dbs = ["main.db", "compliance_vault.db"]
            for db in dbs:
                src = os.path.join(base_dir, db)
                dest = os.path.join("/tmp", db)
                if os.path.exists(src):
                    print(f"[BOOT] Copying {src} -> {dest}")
                    shutil.copy2(src, dest)
                else:
                    if not os.path.exists(dest):
                        with open(dest, "a") as f: pass
            print("--- [BOOT] DATABASE SYNC OK ---")
        except Exception as e:
            print(f"[BOOT] DB SYNC FAILED: {e}")
            traceback.print_exc()

_ACTIVATION_STATUS = None
def get_secret(secret_name: str, default: str = None) -> str:
    """
    Unified helper to fetch secrets from Env or Secret Manager.
    """
    key = os.environ.get(secret_name)
    if key: return key
    try:
        from firebase_functions.params import SecretParam
        return SecretParam(secret_name).value
    except:
        return default

def get_activation_key():
    global _ACTIVATION_STATUS
    if _ACTIVATION_STATUS: return _ACTIVATION_STATUS
    key = get_secret("PROTEAN_API_KEY", "PENDING_GST_APPROVAL")
    _ACTIVATION_STATUS = key
    return key

@app.middleware("http")
async def activation_gatekeeper(request: Request, call_next):
    immune_paths = ["/", "/ping", "/api/ping", "/health", "/favicon.ico", "/privacy-policy"]
    if request.url.path in immune_paths: return await call_next(request)
    key = get_activation_key()
    if key == "PENDING_GST_APPROVAL":
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=503, content={"detail": "ComplianceDesk API is Live. Waiting for GST Keys to activate Verification."})
    return await call_next(request)

def cleanup_local_file(file_path: str):
    """
    FAT 5.1: Empty Vault - Purges raw documents after processing.
    """
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            print(f"[SECURITY] Purged raw document: {file_path}")
    except Exception as e:
        print(f"[SECURITY] Cleanup Failed: {e}")

@app.get("/privacy-policy")
async def privacy_policy():
    from fastapi.responses import HTMLResponse
    content = """
    <html><body>
    <h1>Privacy Policy - ComplianceDesk AI</h1>
    <p>We adhere to the DPDP Act 2023. All ID documents are processed via an 'Empty Vault' architecture and purged immediately after verification.</p>
    </body></html>
    """
    return HTMLResponse(content=content)

class LazyProxy:
    def __init__(self, import_func):
        self._import_func = import_func
        self._obj = None
    def __getattr__(self, name):
        if self._obj is None:
            factory_class = self._import_func()
            self._obj = factory_class()
        return getattr(self._obj, name)

async def get_db_async():
    from database import get_db
    async for db in get_db(): yield db

async def get_compliance_db_async():
    from database import get_compliance_db
    async for db in get_compliance_db(): yield db

# Lazy Services
def load_police_verifier(): from verifiers.factory import PoliceVerifier; return PoliceVerifier
def load_pvc_engine(): from services.pvc_application import PVCApplicationEngine; return PVCApplicationEngine
def load_pvc_checker(): from services.pvc_status_checker import PVCStatusChecker; return PVCStatusChecker
def load_pvc_validator(): from verifiers.pvc_validator import PVCValidator; return PVCValidator
def load_niti_wizard(): from services.niti_wizard import NitiWizardService; return NitiWizardService

police_verifier = LazyProxy(load_police_verifier)
pvc_app_engine = LazyProxy(load_pvc_engine)
pvc_status_checker = LazyProxy(load_pvc_checker)
pvc_validator = LazyProxy(load_pvc_validator)
niti_wizard = LazyProxy(load_niti_wizard)

from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- 3. MODELS & SCHEMAS ---
class VerificationRequest(BaseModel):
    name: str; id: str; mobile_number: str; image_url: str; country: Optional[str] = "IN"

class VerificationResponse(BaseModel):
    task_id: str; applicant_name: str; status: str; face_verified: Optional[bool]; face_confidence: Optional[str]; failure_reason: Optional[str]; created_at: str
    class Config: from_attributes = True

class GrievanceRequest(BaseModel): task_id: str; description: str
class DPOUpdateRequest(BaseModel): name: str; dpo_name: str; dpo_email: str; dpo_phone: str; region: str
class IncidentRequest(BaseModel): description: str; tenant_name: str
class ApprovalRequest(BaseModel): action_type: str; payload: dict; requester: str

# --- 4. ROUTES ---

@app.post("/verify")
async def request_verification(request: VerificationRequest, db = Depends(get_db_async)):
    from models import Verification, Tenant, VerifiedReport
    from sqlalchemy import select
    from services.mock_provider_service import MockProviderService
    from datetime import datetime, timedelta
    
    tenant_id = 1 
    result = await db.execute(select(Tenant).filter(Tenant.id == tenant_id))
    tenant = result.scalars().first()
    
    task_id = str(uuid.uuid4())
    vault_token = f"VT-{uuid.uuid4().hex[:12].upper()}"

    # FAT 5.1: Tokenize ID before persistence
    from services.security_utils import SecurityUtils
    tokenized_id = SecurityUtils.encrypt_pii(request.id)

    verification = Verification(
        task_id=task_id, tenant_id=tenant_id, mobile_number=request.mobile_number,
        applicant_name=request.name, applicant_id=tokenized_id, image_url=request.image_url,
        vault_token=vault_token, status="PROCESSING"
    )
    db.add(verification)
    await db.commit()

    truth_resp = MockProviderService.verify_id("AADHAAR", request.id)
    if truth_resp["status"] == "SUCCESS":
        verification.status = "COMPLETED"
        verification.face_verified = True
        verification.face_confidence = "98.5"
        expiry_date = datetime.utcnow() + timedelta(days=365)
        verified_report = VerifiedReport(
            mobile_number=request.mobile_number, applicant_name=request.name,
            id_type="AADHAAR", id_number=tokenized_id, pdf_path=f"/tmp/contract_{request.id}.pdf",
            expiry_date=expiry_date, tenant_id=tenant_id
        )
        db.add(verified_report)
    else:
        verification.status = "FAILED"
        verification.failure_reason = truth_resp.get("message", "Identity Verification Failed")
    
    await db.commit()

    # FAT 5.1: Empty Vault - Purge local image if applicable
    background_tasks.add_task(cleanup_local_file, request.image_url)

    return {"message": "Verification processing started", "task_id": task_id}

@app.post("/whatsapp/hook")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks, db_compliance = Depends(get_compliance_db_async)):
    from models import VerifiedReport
    from sqlalchemy import select
    from services.whatsapp_processor import WhatsAppProcessor
    from services.interakt import send_interakt_reply, send_support_alert_email

    payload = await request.json()
    if payload.get('type') != 'message_received': return {"status": "ignored"}
    
    data = payload.get('data', {})
    user_phone = data.get('customer', {}).get('channel_phone_number', '')
    message_text = data.get('message', {}).get('text', '').strip()
    image_url = data.get('message', {}).get('attachment', {}).get('url') if data.get('message', {}).get('type') == 'Image' else None
    clean_phone = user_phone[-10:] if user_phone else ""

    # Simple clash check
    result = await db_compliance.execute(select(VerifiedReport).filter(VerifiedReport.mobile_number.like(f"%{clean_phone}")))
    if result.scalars().first() and message_text.upper() == "NITI":
        reply_msg = "Hello, you are already verified! For support, contact +91-9999999999"
        background_tasks.add_task(send_interakt_reply, user_phone, reply_msg)
        return {"status": "redirected"}

    background_tasks.add_task(WhatsAppProcessor.process_interaction, user_phone, message_text, image_url)
    return {"status": "processing"}

@app.post("/razorpay/webhook")
async def razorpay_webhook(request: Request, background_tasks: BackgroundTasks, db = Depends(get_db_async)):
    from services.finance_service import GSTCalculator, InvoiceService
    from models import SalesRegister
    import json

    payload = await request.body()
    data = json.loads(payload)
    
    if data.get("event") != "payment.captured":
        return {"status": "ignored"}

    payment = data["payload"]["payment"]["entity"]
    amount = payment["amount"] / 100 # In INR
    payment_id = payment["id"]
    order_id = payment.get("order_id", "N/A")
    mobile = payment.get("contact", "")
    email = payment.get("email", "")
    
    # Place of Supply Detection
    customer_state_name = "Telangana" # Default
    clean_phone = mobile[-10:] if mobile else ""
    from app import USER_SESSIONS
    session = USER_SESSIONS.get(clean_phone)
    if session and session.get("context", {}).get("ocr_text"):
        customer_state_name = GSTCalculator.detect_state_from_ocr(session["context"]["ocr_text"])
    
    # FAT 5.1: Tokenize PII before persistence
    from services.security_utils import SecurityUtils
    tokenized_mobile = SecurityUtils.encrypt_pii(mobile)
    tokenized_name = SecurityUtils.encrypt_pii(email.split("@")[0] if email else "Customer")

    gst_data = GSTCalculator.calculate_gst(customer_state_name)
    gst_data.update({
        "payment_id": payment_id,
        "order_id": order_id,
        "customer_name": tokenized_name,
        "mobile_number": tokenized_mobile
    })

    pdf_path = InvoiceService.generate_pdf_invoice(gst_data)
    
    # Save to Sales Register
    register_entry = SalesRegister(
        order_id=order_id,
        payment_id=payment_id,
        mobile_number=tokenized_mobile,
        customer_name=tokenized_name,
        state_code=gst_data["state_code"],
        place_of_supply=gst_data["state_name"],
        total_amount=str(gst_data["total"]),
        base_amount=str(gst_data["base_price"]),
        gst_amount=str(gst_data["gst_total"]),
        cgst=str(gst_data["cgst"]),
        sgst=str(gst_data["sgst"]),
        igst=str(gst_data["igst"]),
        tax_type=gst_data["tax_type"],
        pdf_path=pdf_path
    )
    db.add(register_entry)
    await db.commit()

    # WhatsApp the Invoice
    from services.whatsapp_processor import WhatsAppProcessor
    background_tasks.add_task(WhatsAppProcessor.send_invoice, mobile, pdf_path)

    return {"status": "success", "invoice": pdf_path}

@app.get("/verifications", response_model=List[VerificationResponse])
async def list_verifications(skip: int = 0, limit: int = 20, db = Depends(get_db_async)):
    from models import Verification
    from sqlalchemy import desc, select
    result = await db.execute(select(Verification).order_by(desc(Verification.created_at)).offset(skip).limit(limit))
    verifications = result.scalars().all()
    return [{
        "task_id": v.task_id, "applicant_name": v.applicant_name, "status": v.status,
        "face_verified": v.face_verified, "face_confidence": v.face_confidence,
        "failure_reason": v.failure_reason, "created_at": v.created_at.strftime("%Y-%m-%d %H:%M:%S") if v.created_at else ""
    } for v in verifications]

@app.post("/grievances")
async def report_grievance(request: GrievanceRequest, db = Depends(get_db_async)):
    from models import Verification, Grievance
    from sqlalchemy import select
    res = await db.execute(select(Verification).filter(Verification.task_id == request.task_id))
    v = res.scalars().first()
    if not v: raise HTTPException(status_code=404, detail="Not found")
    v.status = "UNDER_REVIEW"
    db.add(Grievance(verification_id=v.id, task_id=request.task_id, description=request.description))
    await db.commit()
    return {"message": "Grievance submitted"}

@app.post("/tenants/dpo")
async def update_dpo(request: DPOUpdateRequest, db = Depends(get_db_async)):
    from models import Tenant
    from sqlalchemy import select
    res = await db.execute(select(Tenant).filter(Tenant.name == request.name))
    tenant = res.scalars().first()
    if not tenant: tenant = Tenant(name=request.name); db.add(tenant)
    tenant.dpo_name, tenant.dpo_email, tenant.dpo_phone, tenant.region = request.dpo_name, request.dpo_email, request.dpo_phone, request.region
    await db.commit()
    return {"message": "DPO Updated"}

@app.post("/incidents")
async def report_incident(request: IncidentRequest, db = Depends(get_db_async)):
    from models import Incident
    from datetime import datetime, timedelta
    deadline = datetime.now() + timedelta(hours=6)
    db.add(Incident(description=request.description, report_deadline=deadline, status="PENDING_INTERNAL_REVIEW"))
    await db.commit()
    return {"message": "Incident Logged", "deadline": deadline.isoformat()}

@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    from celery.result import AsyncResult
    from celery_config import celery_app
    res = AsyncResult(task_id, app=celery_app)
    return {"task_id": task_id, "status": res.status, "result": res.result if res.ready() else None}

@app.post("/approvals")
async def create_approval(request: ApprovalRequest, db = Depends(get_db_async)):
    from models import ActionApproval
    import json
    from datetime import datetime, timedelta
    deadline = datetime.now() + timedelta(hours=1)
    approval = ActionApproval(action_type=request.action_type, payload=json.dumps(request.payload), requester_id=request.requester, status="PENDING", deadline=deadline)
    db.add(approval)
    await db.commit()
    return {"id": approval.id, "status": "PENDING"}

@app.get("/users/search")
async def search_users(mobile: str, db = Depends(get_db_async)):
    from models import VerifiedReport
    from sqlalchemy import select
    result = await db.execute(select(VerifiedReport).filter(VerifiedReport.mobile_number.like(f"%{mobile}%")))
    user = result.scalars().first()
    if user: return {"status": "found", "applicant_name": user.applicant_name, "verified_at": user.created_at.isoformat() if user.created_at else None, "expiry_date": user.expiry_date.isoformat() if user.expiry_date else None, "registry_id": user.id}
    return {"status": "not_found"}

@app.post("/niti/chat")
async def niti_chat(request: dict, db = Depends(get_compliance_db_async)):
    from models import AuditLog
    from datetime import datetime, timedelta
    # Minimal static mock for speed
    query = request.get("query", "").lower()
    resp = {"text": "I can help with DPDP and identity verification.", "action": None}
    if "dpdp" in query: resp["text"] = "DPDP Act mandates explicit consent."; resp["action"] = "SHOW_DPDP_FORM"
    db.add(AuditLog(actor_id=request.get("user_id", "guest"), action="NITI_QUERY", resource_id="MOCK", retention_until=datetime.utcnow() + timedelta(days=1825)))
    await db.commit()
    return resp

@app.post("/tools/smart-parse")
async def smart_parse_ocr(request: dict):
    from services.gemini_parser import GeminiParserService
    return GeminiParserService.parse_id_card(request.get("raw_text", ""))

@app.post("/tools/translate")
async def translate_content(request: dict):
    from services.translation_service import TranslationService
    return TranslationService.translate_text(request.get("text", ""), request.get("source_hint", "Auto"), request.get("target_language", "English"))

# --- 5. INITIALIZATION RUNNER ---
@app.on_event("startup")
async def startup_event():
    sync_databases()
    try:
        from database import engine_app, engine_compliance, Base, BaseCompliance
        async with engine_app.begin() as conn: await conn.run_sync(Base.metadata.create_all)
        async with engine_compliance.begin() as conn: await conn.run_sync(BaseCompliance.metadata.create_all)
    except Exception as e: print(f"[BOOT] Migration failed: {e}")

@app.get("/")
async def root(): return {"message": "ComplianceDesk API is running"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
