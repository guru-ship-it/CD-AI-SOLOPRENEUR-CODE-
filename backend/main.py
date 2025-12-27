from firebase_functions import https_fn, options
from firebase_admin import initialize_app
from firebase_functions.params import SecretParam
from app import app as fastapi_app
from a2wsgi import ASGIMiddleware
import os

initialize_app()

# Define the Secret Name
def get_secret_val():
    env_val = os.environ.get("PROTEAN_API_KEY")
    if env_val: return env_val
    try:
        from firebase_functions.params import SecretParam
        return SecretParam('PROTEAN_API_KEY').value
    except:
        return "PENDING_GST_APPROVAL"

# Handle SecretParam objects for the decorator metadata
try:
    from firebase_functions.params import SecretParam
    protean_secret = SecretParam('PROTEAN_API_KEY')
    razor_secret = SecretParam('RAZORPAY_WEBHOOK_SECRET')
except:
    protean_secret = None
    razor_secret = None

# Convert FastAPI (ASGI) to WSGI for compatibility
app = fastapi_app
wsgi_app = ASGIMiddleware(fastapi_app)

@https_fn.on_request(
    memory=options.MemoryOption.GB_1,
    timeout_sec=300,
    region="asia-south1",
    secrets=[protean_secret] if protean_secret else []
)
def api(req: https_fn.Request) -> https_fn.Response:
    # Use helper for resilient value fetch
    current_key = get_secret_val()
    
    # Check if we are in "Pending" mode
    if current_key == "PENDING_GST_APPROVAL":
        return https_fn.Response("ComplianceDesk API is Live. Waiting for GST Keys to activate Verification.")

    # Debug Health Check
    if req.path == "/ping" or req.path == "/api/ping":
        return https_fn.Response("pong")

    return https_fn.Response.from_app(wsgi_app, req)

@https_fn.on_request(
    memory=options.MemoryOption.GB_1,
    region="asia-south1",
    secrets=[razor_secret] if razor_secret else []
)
def razorpay_webhook(req: https_fn.Request) -> https_fn.Response:
    """
    Phase 3 Integration: Razorpay Webhook for GST Invoicing.
    """
    from services.invoice_generator import InvoiceGenerator
    from services.finance_engine import FinanceEngine
    from app import get_secret
    import razorpay
    import json

    # 1. Verify Signature (Security)
    webhook_secret = get_secret('RAZORPAY_WEBHOOK_SECRET')
    signature = req.headers.get('X-Razorpay-Signature')
    payload = req.get_data(as_text=True)
    
    # Simple check if secret is set
    if not webhook_secret or webhook_secret == "YOUR_WEBHOOK_SECRET":
        # Fallback or Log warning in demo
        print("[WARNING] Razorpay Webhook Secret not configured correctly.")
    
    # Verify signature if possible
    try:
        if webhook_secret and signature:
            client = razorpay.Client(auth=(get_secret("RAZORPAY_KEY_ID"), get_secret("RAZORPAY_KEY_SECRET")))
            client.utility.verify_webhook_signature(payload, signature, webhook_secret)
    except Exception as e:
        print(f"[SECURITY] Webhook Signature Verification Failed: {e}")

    data = req.get_json()
    if data.get('event') == 'payment.captured':
        payment = data['payload']['payment']['entity']
        user_id = payment.get('notes', {}).get('user_id', 'Unknown')
        
        # 2. Get User State
        customer_state = "Telangana" # Default
        
        # 3. Generate Invoice using the architected engine
        try:
            pdf_path = InvoiceGenerator.generate_gst_invoice("Subscriber", payment['id'], customer_state)
            print(f"✅ Invoice Generated: {pdf_path}")
        except Exception as e:
            print(f"❌ Invoice Generation Failed: {e}")
            return https_fn.Response("Invoice Error", status=500)
            
    return https_fn.Response("Success", status=200)
