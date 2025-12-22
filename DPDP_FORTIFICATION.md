# DPDP & CERT-In Fortification Strategy

## 1. The Consent Ledger (DPDP Section 6 Compliance)
**Objective:** Maintain verifiable proof of user consent.

* **Database Structure:** Create a Firestore collection `consent_ledger`.
* **Record Format:**
    ```typescript
    interface ConsentRecord {
      userId: string;
      timestamp: Date;
      policyVersion: string; // e.g., "v1.2_2025"
      purpose: "IDENTITY_VERIFICATION";
      ipAddress: string;
      deviceId: string;
      action: "GRANTED" | "WITHDRAWN";
    }
    ```
* **Requirement:** Block any verification API call unless a valid `GRANTED` record exists for that user in the last 24 hours.

## 2. Automated Data Bleaching (TTL Policy)
**Objective:** Strict "Storage Limitation" - delete raw ID images automatically.

* **Mechanism:** Use Google Cloud Storage **Lifecycle Policies** or a Scheduled Cloud Function.
* **Rule:**
    * `raw_uploads/{userId}/*` -> Delete after **24 Hours**.
    * `processed_data/{userId}/extracted_text` -> Keep until account deletion.
* **Implementation:** Configure the bucket lifecycle via `gsutil` or Terraform.

## 3. Field-Level Encryption (Plausible Deniability)
**Objective:** Protect sensitive PII (Aadhaar/PAN numbers) at rest.

* **Library:** Use `crypto-js` (or Node `crypto` module in Cloud Functions).
* **Key Storage:** Store the encryption key (DEK) in **Google Secret Manager** (`projects/antigravitycompliancedeskai/secrets/PII_ENCRYPTION_KEY`).
* **Logic:**
    * **Write:** `encrypt(aadhaarNumber, secretKey)` -> Save to Firestore.
    * **Read:** Fetch from Firestore -> `decrypt(cipherText, secretKey)` -> Send to authorized Admin.

## 4. The "Panic Mode" (Kill Switch)
**Objective:** Instant containment of security breaches.

* **Config:** A global Firestore document `system_config/security_status`.
* **Field:** `status: "ACTIVE" | "LOCKDOWN"`.
* **Enforcement:**
    * **Firestore Rules:** Add a check `if get(/databases/$(database)/documents/system_config/security_status).data.status == 'ACTIVE'` to ALL read/write rules.
    * **API Gateway:** If `LOCKDOWN` is true, all Cloud Functions must return `503 Service Unavailable` immediately.
