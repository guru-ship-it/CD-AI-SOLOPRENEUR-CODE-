from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from celery.result import AsyncResult
from .celery_config import celery_app
from .tasks import generate_legal_pdf, verify_face_with_vertex

# PVC Imports
from .verifiers.factory import PoliceVerifier
from .services.pvc_application import PVCApplicationEngine
from .services.pvc_status_checker import PVCStatusChecker
from .verifiers.pvc_validator import PVCValidator

app = FastAPI(title="ComplianceDesk API (Async)")

# Services Initialization
police_verifier = PoliceVerifier()
pvc_app_engine = PVCApplicationEngine()
pvc_status_checker = PVCStatusChecker()
pvc_validator = PVCValidator()

# Mock Session State (For Demo Purpose Only)
# In production, use Redis or DB
USER_SESSIONS = {}

class VerificationRequest(BaseModel):
    name: str
    id: str
    image_url: str

class WhatsAppPayload(BaseModel):
    user_id: str
    message: str
    image_url: str = None

@app.post("/verify")
async def request_verification(request: VerificationRequest):
    """
    Enqueues verification tasks to the worker.
    Returns immediately with task IDs.
    """
    # 1. Trigger PDF Generation (CPU Heavy)
    pdf_task = generate_legal_pdf.delay(request.model_dump())
    
    # 2. Trigger Face Verification (Network Heavy)
    face_task = verify_face_with_vertex.delay(request.image_url)
    
    return {
        "message": "Verification processing started",
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
        status_result = pvc_status_checker.check_status_sync(state_code, app_id)
        
        response_text = f"👮‍♂️ Current Status for {app_id}:\n{status_result}"
        next_state = "START"

    # Update Session
    USER_SESSIONS[user_id] = {"state": next_state, "context": context}

    return {"response": response_text, "next_state": next_state}

@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    """
    Poll task status.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    return {
        "task_id": task_id,
        "status": task_result.status,
        "result": task_result.result if task_result.ready() else None
    }

@app.get("/")
async def root():
    return {"message": "ComplianceDesk API is running"}
