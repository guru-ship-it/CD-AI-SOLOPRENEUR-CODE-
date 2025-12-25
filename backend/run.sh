#!/bin/bash
set -e

echo "--- [PRE-FLIGHT] STARTING COMPLIANCEDESK BOOT SEQUENCE ---"
echo "[PRE-FLIGHT] Current User: $(whoami)"
echo "[PRE-FLIGHT] Working Directory: $(pwd)"
echo "[PRE-FLIGHT] Target Port (from env): $PORT"

# Ensure /tmp/ databases are initialized if they don't exist
# This is a fallback to the python-based sync_databases
echo "[PRE-FLIGHT] Checking filesystem..."
ls -R /app

# Check if main.db exists in the build
if [ -f "main.db" ]; then
    echo "[PRE-FLIGHT] main.db found in /app. Ready for sync."
else
    echo "[PRE-FLIGHT] WARNING: main.db NOT found in /app."
fi

echo "[PRE-FLIGHT] Starting Uvicorn Gateway..."
# Use exec to ensure signals are passed to uvicorn and it manages the process lifecycle
exec uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080} --log-level debug --access-log
