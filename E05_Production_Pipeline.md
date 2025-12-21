# Mission: DevSecOps Pipeline
**Tool:** Cloud Build

## 1. The Pipeline (`cloudbuild.prod.yaml`)
* **Trigger:** Push to `main` branch.
* **Steps:**
    1.  **Test:** Run `pytest`. (Must pass 100%).
    2.  **Scan:** Run `trivy` (Container Security) & `bandit` (Code Security).
    3.  **Build:** Build `api` and `worker` images.
    4.  **Migrate:** Run `alembic upgrade head` (DB Schema).
    5.  **Deploy:**
        * Deploy to `compliancedesk-prod-api`.
        * Deploy to `compliancedesk-prod-worker`.
    6.  **Verify:** Run a "Health Check" script against the live URL.
    7.  **Notify:** Send a Slack/Email alert: "🚀 Production Deployment Successful"
