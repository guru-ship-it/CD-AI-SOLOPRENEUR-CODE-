import time
import random
from celery_config import celery_app

@celery_app.task
def generate_legal_pdf(applicant_data: dict):
    """
    Simulates a CPU-heavy task: Generating a legal PDF contract.
    """
    print(f"[{generate_legal_pdf.name}] Starting PDF generation for {applicant_data.get('name')}...")
    
    # Simulate CPU work
    time.sleep(5)  # Sleep for 5 seconds to simulate work
    
    # In a real scenario, we would use reportlab or similar to generate a PDF
    pdf_path = f"/tmp/contract_{applicant_data.get('id')}.pdf"
    
    print(f"[{generate_legal_pdf.name}] PDF generated at {pdf_path}")
    return {"status": "success", "pdf_path": pdf_path}

@celery_app.task
def verify_face_with_vertex(image_url: str):
    """
    Simulates a Network-heavy task: Calling Vertex AI for face verification.
    """
    print(f"[{verify_face_with_vertex.name}] Verifying face from {image_url}...")
    
    # Simulate Network latency
    time.sleep(2)
    
    # Mock result
    confidence = random.uniform(0.60, 0.99) # Increased range to trigger failures
    
    is_verified = False
    reason = None
    
    # Explainability Logic
    if confidence < 0.70:
        is_verified = False
        reason = "Face Does Not Match ID Photo"
    elif confidence < 0.80:
         # Simulate blurry or low quality sometimes
         if random.choice([True, False]):
             is_verified = False
             reason = "Image Quality Low / Blurry"
         else:
             is_verified = True
    else:
        is_verified = True

    print(f"[{verify_face_with_vertex.name}] Verification complete. Verified: {is_verified}, Reason: {reason}")
    return {"verified": is_verified, "confidence": f"{confidence:.2%}", "reason": reason}

@celery_app.task
def run_expiry_check():
    """
    Background worker task to trigger expiry notifications.
    In production, this would be called by Celery Beat.
    """
    import asyncio
    from app import manual_expiry_check
    from database import SessionLocalCompliance
    
    # We use the existing logic in app.py but run it via a dedicated session
    # (Simplified for the demo environment)
    print("[TASK] Running Automated Expiry Notification Sweep...")
    # In a real sync task, we'd use a synchronous version of the logic
    # or run the async loop.
    return {"status": "sweep_initiated"}
