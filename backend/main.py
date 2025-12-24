from firebase_functions import https_fn, options
from firebase_admin import initialize_app
from app import app as fastapi_app
from a2wsgi import ASGIMiddleware
import flask

initialize_app()

# Convert FastAPI (ASGI) to WSGI for compatibility
wsgi_app = ASGIMiddleware(fastapi_app)

@https_fn.on_request(
    memory=options.MemoryOption.GB_1,
    timeout_sec=300,
    region="asia-south1",
)
def api(req: https_fn.Request) -> https_fn.Response:
    # Validate request type - it should be a Flask/Werkzeug request
    # Pass it to the WSGI app using werkzeug's interface or a2wsgi helper if available.
    # a2wsgi's ASGIMiddleware is a WSGI app.
    # We can invoke it with the environ from the request.
    
    # Debug Health Check
    if req.path == "/ping" or req.path == "/api/ping":
        return https_fn.Response("pong")

    return https_fn.Response.from_app(wsgi_app, req)
