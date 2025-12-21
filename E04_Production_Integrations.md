# Mission: Third-Party Integrations
**Role:** Integration Architect

## 1. Secret Manager Rotation
* Store **Real** Production Keys in Google Secret Manager:
    * `PROTEAN_PROD_API_KEY`
    * `WHATSAPP_PROD_TOKEN`
    * `UIDAI_CERTIFICATE_P12`
* **Mounting:** Mount secrets as *Volumes* in Cloud Run (More secure than Env Vars).

## 2. The Protean Gateway
* Update `app/gateways/protean.py`:
    * Implement **JWS Signature** (Required for Prod API).
    * Implement **Encryption** (AES-256 for request body).
    * **Circuit Breaker:** If Protean fails 5 times, auto-switch to "Queue Mode" (Don't reject user, just delay processing).
