#!/bin/bash
set -e

echo "--- [PRE-FLIGHT] STARTING COMPLIANCEDESK BOOT SEQUENCE ---"
echo "[PRE-FLIGHT] Hostname: $(hostname)"
echo "[PRE-FLIGHT] User: $(whoami)"
echo "[PRE-FLIGHT] PWD: $(pwd)"
echo "[PRE-FLIGHT] Port: ${PORT:-8080}"

# Verify app.py exists
if [ ! -f "app.py" ]; then
    echo "[PRE-FLIGHT] ERROR: app.py not found in $(pwd)"
    ls -la
    exit 1
fi

echo "[PRE-FLIGHT] Launching Uvicorn..."
# Use exec to ensure signals are passed
exec uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080} --log-level debug --access-log --workers 1
