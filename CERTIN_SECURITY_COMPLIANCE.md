# CERT-In Security & Compliance Standards

## 1. Objective
Build the application to pass a CERT-In Level 1 Vulnerability Assessment and Penetration Test (VAPT). The code must adhere to **OWASP Top 10** and **India DPDP Act 2023** standards.

## 2. Mandatory HTTP Security Headers (Firebase Config)
The Agent must configure `firebase.json` to serve these headers on ALL responses. This prevents Clickjacking, XSS, and MIME-sniffing attacks.

* `Strict-Transport-Security` (HSTS): `max-age=31536000; includeSubDomains`
* `X-Content-Type-Options`: `nosniff`
* `X-Frame-Options`: `DENY` (Prevents embedding in iframes - Anti-Clickjacking)
* `X-XSS-Protection`: `1; mode=block`
* `Content-Security-Policy`: (Strict policy allowing only Google APIs and self)
* `Referrer-Policy`: `strict-origin-when-cross-origin`

## 3. Data Protection (DPDP Act Compliance)
* **PII Masking:** No sensitive ID numbers (Aadhaar/PAN) should ever be displayed in plain text on the frontend logs or console (`console.log`).
* **Encryption at Rest:** All data stored in Firestore must leverage Google Cloud's default encryption.
* **Encryption in Transit:** Enforce TLS 1.2 or higher (Handled by Firebase Hosting default, but must be verified).

## 4. Input Sanitization (Anti-Injection)
* **Forms:** All React inputs must use controlled components with strict typing.
* **Sanitization:** Use libraries like `dompurify` before rendering any user-generated content to prevent Cross-Site Scripting (XSS).
* **Validation:** Regex validation for Indian Mobile Numbers (`^[6-9]\d{9}$`) and Email (`guru@compliancedesk.ai`) must happen **client-side AND server-side**.

## 5. Authentication & Session Management
* **MFA Enforcement:** As defined in `SIDEBAR_ARCHITECTURE.md`, High-Privilege actions (Master Admin) MUST require MFA (TOTP).
* **Session Timeout:** Auto-logout users after 15 minutes of inactivity (Critical for financial/compliance tools).
* **Cookie Flags:** If cookies are used, they must be flagged `HttpOnly` and `Secure`.

## 6. Audit Logging (Forensics)
* **Immutable Logs:** Every "Verify", "Login", and "Export" action must be logged to a separate Firestore collection (`audit_logs`) with:
    * Timestamp (ISO UTC)
    * User ID / IP Address
    * Action Type
    * Success/Failure Status
* **Alerting:** Failed login attempts > 3 must trigger a temporary account lock (Brute Force Protection).

## 7. Infrastructure Hardening
* **API Keys:** No API keys hardcoded in `src`. All keys must be environment variables (`import.meta.env`).
* **Least Privilege:** The Service Account `antigravity-deployer` must strictly follow the IAM roles defined earlier.
