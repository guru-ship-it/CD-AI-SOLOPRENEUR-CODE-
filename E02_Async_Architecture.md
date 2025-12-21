# Mission: Asynchronous Worker Pattern
**Stack:** Python 3.11, Celery, Redis

## 1. The Split
* **Service A: `compliancedesk-api`**
    * Role: Receives HTTP requests, validates input, pushes Task ID to Redis.
    * Timeout: 5 seconds (Strict).
* **Service B: `compliancedesk-worker`**
    * Role: Listens to Redis/PubSub.
    * Tasks:
        * `generate_legal_pdf(data)` (CPU Heavy).
        * `verify_face_with_vertex(image)` (Network Heavy).
    * Timeout: 15 minutes.

## 2. Terraform Update
* Provision **Cloud MemoryStore (Redis)** for the task queue.
* Deploy **Two** Cloud Run services:
    * `api` -> Scaled by HTTP Traffic.
    * `worker` -> Scaled by Queue Depth (CPU).
