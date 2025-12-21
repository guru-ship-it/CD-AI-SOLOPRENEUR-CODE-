import time
import random
from .celery_config import celery_app

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
    confidence = random.uniform(0.8, 0.99)
    is_verified = confidence > 0.85
    
    print(f"[{verify_face_with_vertex.name}] Verification complete. Verified: {is_verified}")
    return {"verified": is_verified, "confidence": confidence}
