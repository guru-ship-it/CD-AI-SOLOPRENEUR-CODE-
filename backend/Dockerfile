# --- BASE STAGE ---
# Switching from slim to full python to ensure all system libs (OpenCV, Playwright) are present
FROM python:3.11 AS base

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

# Give execution permissions to run.sh
RUN chmod +x run.sh

# Set environment variables
ENV PYTHONPATH=/app
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379

# --- API STAGE ---
FROM base AS api
EXPOSE 8080
# Use run.sh for hyper-verbose boot logging
CMD ["./run.sh"]

# --- WORKER STAGE ---
FROM base AS worker
CMD ["celery", "-A", "tasks", "worker", "--loglevel=info"]
