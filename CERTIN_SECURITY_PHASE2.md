# CERT-In Security Phase 2: Infrastructure Hardening

## 1. API Security Architecture (The "Air Gap")
* **Objective:** Prevent Exposure of Google Vision & Protean API Keys in the browser.
* **Rule:** NO direct calls to Google Vision, Protean, or any third-party API from the React frontend (`src/`).
* **Implementation:**
    * Create a **Firebase Cloud Function** proxy (e.g., `/functions/verifyIdentity`).
    * **Flow:** React App sends image -> Cloud Function validates Auth -> Cloud Function calls Vision AI -> Returns JSON.
    * **Storage:** Store API Keys **only** in Cloud Secret Manager or Firebase Environment Config (`.env`), never in the git repository.

## 2. Bot Protection (Firebase App Check)
* **Service:** Enable **Firebase App Check**.
* **Provider:** Use **reCAPTCHA Enterprise** for the web provider.
* **Enforcement:** Enforce App Check on **Firestore** (Database) and **Cloud Storage** (Image Buckets) immediately. Requests without a valid token must be rejected.
* **Legal:** Display the reCAPTCHA Terms/Privacy badge in the footer.

## 3. Data Sovereignty (DPDP Act Compliance)
* **Region Lock:** All cloud resources MUST be provisioned in **`asia-south1` (Mumbai)**.
* **Config:**
    * Firebase Functions: `region: 'asia-south1'`
    * Firestore Database: `location: 'asia-south1'`
    * Cloud Storage: `location: 'asia-south1'`
* **Constraint:** Ensure no backup buckets or replicas are created in US/EU regions.

## 4. Rate Limiting (DDoS Prevention)
* **Login Endpoint:** Hard limit: 5 attempts per 15 minutes per IP.
* **Verification Endpoint:** Limit: 10 verifications per minute per user (prevents wallet draining).
* **Dependency:** Use a Redis instance or Firestore atomic counter to track usage.

## 5. Dependency Scanning
* **Pipeline:** Add `npm audit` to the `package.json` build script.
* **Policy:** Fail the build if any vulnerability found is classified as "High" or "Critical".
