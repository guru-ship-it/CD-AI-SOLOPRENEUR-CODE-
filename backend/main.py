from firebase_functions import https_fn, options
from firebase_admin import initialize_app
from firebase_functions.params import SecretParam
from app import app as fastapi_app
from a2wsgi import ASGIMiddleware
import os

initialize_app()

# Define the Secret Name
try:
    protean_key = SecretParam('PROTEAN_API_KEY')
except Exception as e:
    print(f"[BOOT] SecretParam failed: {e}")
    protean_key = type('MockSecret', (), {'value': 'PENDING_GST_APPROVAL'})()

# Convert FastAPI (ASGI) to WSGI for compatibility
app = fastapi_app
wsgi_app = ASGIMiddleware(fastapi_app)

@https_fn.on_request(
    memory=options.MemoryOption.GB_1,
    timeout_sec=300,
    region="asia-south1",
    secrets=[protean_key] if hasattr(protean_key, "name") else []
)
def api(req: https_fn.Request) -> https_fn.Response:
    # Securely fetch the key from the vault
    try:
        current_key = protean_key.value
    except:
        current_key = "PENDING_GST_APPROVAL"
    
    # Check if we are in "Pending" mode
    if current_key == "PENDING_GST_APPROVAL":
        return https_fn.Response("ComplianceDesk API is Live. Waiting for GST Keys to activate Verification.")

    # Debug Health Check
    if req.path == "/ping" or req.path == "/api/ping":
        return https_fn.Response("pong")

    return https_fn.Response.from_app(wsgi_app, req)
