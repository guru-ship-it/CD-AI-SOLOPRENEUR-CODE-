# --- BASE STAGE ---
FROM python:3.11-slim AS base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from backend/ (Build context is project root)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright
RUN playwright install chromium
RUN playwright install-deps

# Copy backend code
COPY backend/ .

# Set environment variables
ENV PYTHONPATH=/app
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379

# --- API STAGE ---
FROM base AS api
EXPOSE 8080
# Use shell format for environment variable expansion
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080}

# --- WORKER STAGE ---
FROM base AS worker
CMD ["celery", "-A", "tasks", "worker", "--loglevel=info"]
