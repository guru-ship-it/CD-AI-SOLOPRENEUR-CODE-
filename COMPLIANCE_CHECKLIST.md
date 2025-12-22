# Master Verification Checklist: ComplianceDesk.ai

**Project:** ComplianceDesk.ai (Identity Verification Platform)
**Standard:** Banking-Grade / CERT-In / ISO 27001
**Status:** Pre-Production Audit

---

## 🎨 Section 1: Frontend & Visual Experience
*Verifying the "Crystal & Clean" Aesthetic and Usability.*

- [x] **Theme Application:**
    - [x] Global background is **Clean White** (`bg-slate-50`), NOT dark mode.
    - [x] Sidebar uses **"Crystal Glass"** effect (`bg-white/80` + `backdrop-blur-xl`).
    - [x] Primary Brand Color is **Emerald Green** (`text-emerald-600`).
- [x] **Typography:**
    - [x] Font is **Plus Jakarta Sans** or **Inter**.
    - [x] Numbers in data tables use `tabular-nums` for alignment.
- [x] **Micro-Interactions:**
    - [x] Buttons have a "tactile" feel (scale down slightly on click via `framer-motion`).
    - [x] Dashboard widgets load with a staggered entry animation.
- [x] **Accessibility (WCAG):**
    - [x] High Contrast Toggle is present and functional.
    - [x] All images have `alt` tags (verified via `eslint-plugin-jsx-a11y`).

---

## 🔐 Section 2: Access Control & Identity
*Verifying the Role-Based Architecture.*

- [x] **Dynamic Sidebar:**
    - [x] Sidebar displays the **Current User's Name** and Email at the bottom (No hardcoded "Guru").
    - [x] **Master Admin Badge** appears only for users with `role: 'MASTER_ADMIN'`.
    - [x] **Company Admin Badge** appears for tenant users.
- [x] **Navigation Logic:**
    - [x] "Tenant Manager" & "Global Audit" links are **HIDDEN** for non-Master Admins.
- [ ] **MFA Guard (The Gate):**
    - [ ] clicking a protected route (e.g., "Delete Tenant") triggers the **Google Authenticator Modal**.
    - [ ] System rejects access if the TOTP code is incorrect.
- [ ] **Session Security:**
    - [ ] Auto-logout triggers after 15 minutes of inactivity.
    - [ ] Concurrent login detection (logging in from Device B logs out Device A).

---

## 🛡️ Section 3: Core Security & Infrastructure (CERT-In)
*Verifying the "Hacking Infrastructure" Defense.*

- [x] **API "Air-Gap":**
    - [x] **CRITICAL:** No Google Vision/Protean API keys are visible in the frontend source code.
    - [x] All verification calls route through `functions/verifyIdentity`.
- [ ] **Region Locking:**
    - [ ] Firebase Project location is strictly **`asia-south1` (Mumbai)**.
    - [ ] No data buckets exist in US/EU regions (Data Sovereignty).
- [x] **Hacking Defenses:**
    - [x] **Honeypot:** Accessing `/admin-super-login` bans the IP address.
    - [ ] **App Check:** Requests to Firestore fail without a valid reCAPTCHA Enterprise token.
    - [ ] **Headers:** `firebase.json` includes `HSTS`, `X-Frame-Options`, and `CSP`.

---

## 🏦 Section 4: Data Privacy & The "Vault"
*Verifying Skyflow-style Architecture and DPDP Compliance.*

- [x] **The Vault Pattern:**
    - [x] PII (Aadhaar/PAN) is stored in the `secure_vault` collection.
    - [x] Public `users` collection contains ONLY Tokens (UUIDs), not real data.
- [x] **Encryption:**
    - [x] Data in Firestore is **Field-Level Encrypted** (AES-256).
    - [x] Admins see "Decrypted" data only on demand.
- [ ] **Data Lifecycle (Bleaching):**
    - [ ] Raw ID card images in Storage are auto-deleted after **24 Hours**.
    - [x] **Consent Ledger:** Every verification log includes a "Consent Granted" timestamp.

---

## 🌍 Section 5: Global Compliance Modules
*Verifying International Standards.*

- [ ] **Global Files:**
    - [ ] `public/.well-known/security.txt` is live and points to `support@compliancedesk.ai`.
- [x] **Singapore (PDPA):**
    - [x] Uploading a Singapore ID triggers **NRIC Masking**.
    - [x] Result shows `*****123A` instead of full ID.
- [x] **Africa (POPIA/NDPR):**
    - [x] "Company Settings" requires a **Data Protection Officer (DPO)** name/phone.
    - [ ] Data for African tenants is pinned to `africa-south1` (if configured).
- [x] **GDPR:**
    - [x] "Export Data" button generates a ZIP file of all tenant data.

---

## ☢️ Section 6: Governance & "Nuclear" Safeguards
*Verifying Insider Threat Prevention.*

- [x] **Forensic Watermark:**
    - [x] Faint text (`UserEmail - IP - Timestamp`) is visible diagonally across the screen.
    - [x] Watermark is `pointer-events-none` (clicks pass through).
- [x] **Four-Eyes Principle:**
    - [x] Clicking "Delete" on a user creates a **"Pending Approval"** request.
    - [x] Item is NOT deleted until a 2nd Admin approves it.
- [x] **Ransomware Immunity:**
    - [x] **WORM Storage:** Terraform config confirms the Backup Bucket in `asia-south2` (Delhi) has a **90-Day Retention Lock**.

---

## 🤖 Section 7: "Niti" AI & WhatsApp
*Verifying the Omni-Channel Experience.*

- [ ] **The Mascot:**
    - [ ] **"Niti"** (Glass Visor Robot) appears on the Dashboard/Login.
    - [ ] Hovering over Niti triggers the "Hi, I'm Niti" animation.
- [x] **WhatsApp Integration:**
    - [x] Sending an image to the WhatsApp number triggers **Google Vision**.
    - [x] Sending text triggers the **"Niti" Persona** (Professional/Polite response).
    - [ ] Abusive language triggers the "Professionalism Filter" response.

---

## ✅ Final Sign-Off

| Role | Name | Signature | Date |
| :--- | :--- | :--- | :--- |
| **Master Admin** | __________________ | __________________ | ________ |
| **Security Auditor** | __________________ | __________________ | ________ |
| **Legal/DPO** | __________________ | __________________ | ________ |
