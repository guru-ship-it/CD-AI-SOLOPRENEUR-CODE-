from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from celery.result import AsyncResult
from .celery_config import celery_app
from .tasks import generate_legal_pdf, verify_face_with_vertex

app = FastAPI(title="ComplianceDesk API (Async)")

class VerificationRequest(BaseModel):
    name: str
    id: str
    image_url: str

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
