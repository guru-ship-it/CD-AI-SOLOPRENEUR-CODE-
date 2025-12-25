# Use official Python runtime
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies (if needed later for PDF generation)
# RUN apt-get update && apt-get install -y ...

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers (Phase 10)
RUN playwright install chromium
RUN playwright install-deps

# Copy application code
COPY . .

# Set environment variables (Defaults, can be overridden)
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379

# Entry point is handled by Cloud Run arguments or CMD override
# Default to API
# Start application via python to trigger internal boot logic
CMD uvicorn app:app --host 0.0.0.0 --port ${PORT:-8080}
