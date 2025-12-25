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

# Handle SecretParam object for the decorator metadata
try:
    from firebase_functions.params import SecretParam
    protean_secret = SecretParam('PROTEAN_API_KEY')
except:
    protean_secret = None

protean_key_val = get_secret_val()

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
