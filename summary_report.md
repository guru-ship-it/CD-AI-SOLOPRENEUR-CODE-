# Enterprise Architecture Summary

## 1. Core Infrastructure (The Fortress)
*   **Networking**: Custom VPC (`compliancedesk-prod-vpc`) with strict subnet isolation (Public Ingress, Private App, Private Data).
*   **Security**: Cloud Armor (WAF) policies, Private IP-only databases, and strict Firewall rules.
*   **Compute**: Serverless Cloud Run services (`api`, `worker`) with auto-scaling.

## 2. Event-Driven Application (Async)
*   **Architecture**: Producer-Consumer pattern using **Celery** and **Redis**.
*   **Performance**: Fast API response (<200ms) by offloading PDF generation and AI verification to background workers.
*   **Resilience**: Circuit Breakers implemented for external APIs (Protean).

## 3. Data & Reliability
*   **Database**: Cloud SQL Enterprise Plus (PostgreSQL 15) with High Availability (HA) and Point-in-Time Recovery (PITR).
*   **Secrets**: All API keys and tokens managed via Google Secret Manager and mounted as volumes.

## 4. Automation & DevSecOps
*   **CI/CD**: `cloudbuild.prod.yaml` defines a 7-step zero-touch pipeline:
    *   Test (`pytest`) -> Security Scan (`bandit`) -> Build -> Migrate -> Deploy -> Verify.
*   **Verification**: Automated health checks (`scripts/health_check.py`) post-deployment.

## 5. Feature Modules
*   **Identity Verification**: JWS-signed, AES-encrypted gateway for Protean integrations.
*   **Police Verification (Phase 10)**: State-specific routing strategy for Telangana, Karnataka, Tamil Nadu, and Andhra Pradesh. Includes:
    *   **Strategy Factory**: Routes logic by state.
    *   **Form Automator**: Generates PDF applications.
    *   **Status Checker**: Scrapes portals using Headless Browser.
    *   **Validator**: Detects fake certificates using OCR/QR comparison.

## Status
*   **Codebase**: Enterprise-Ready Python 3.11 (FastAPI + Celery).
*   **Infrastructure**: Fully codified in Terraform.
*   **Deployment**: Ready for `terraform apply` and Cloud Build triggers.
