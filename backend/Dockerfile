# --- BASE STAGE ---
FROM python:3.11 AS base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright
RUN playwright install chromium
RUN playwright install-deps

# Copy backend code
COPY backend/ .

# Set environment variables
ENV PYTHONPATH=/app
ENV PORT=8080

# --- WORKER STAGE ---
# Defined before API so API is the default final stage
FROM base AS worker
CMD ["celery", "-A", "tasks", "worker", "--loglevel=info"]

# --- API STAGE (DEFAULT) ---
FROM base AS api
EXPOSE 8080
# Use exec to ensure signals are handled correctly
CMD exec uvicorn app:app --host 0.0.0.0 --port ${PORT} --log-level debug --access-log --workers 1
