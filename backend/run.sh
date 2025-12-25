#!/bin/bash
set -e

echo "--- [BOOT] COMPLIANCEDESK INSTANT-LISTEN MODE ---"
echo "[BOOT] Port: ${PORT:-8080}"
echo "[BOOT] Working Directory: $(pwd)"

# Start Uvicorn immediately. Heavy setup is deferred to app.py startup events and lifespan.
exec uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080} --log-level debug --access-log --workers 1
