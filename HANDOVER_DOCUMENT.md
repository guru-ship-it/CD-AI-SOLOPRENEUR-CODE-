# Project Handover Document: ComplianceDesk.ai
**Date:** December 23, 2025
**Version:** 1.0 (Production Candidate)
**Status:** Build Complete & FAT Verified

---

## 1. Executive Summary
ComplianceDesk.ai is a "Nuclear-Grade" Enterprise Identity Platform designed for Indian sovereignty and global privacy compliance (DPDP, GDPR, POPIA). The platform features a unified verification engine, a secure tokenized vault for PII, and an Omni-channel AI assistant ("Niti").

## 2. Platform Architecture

### A. Unified Identity Gateway (Firebase v2)
- **Pattern**: Adapter Pattern.
- **Goal**: One endpoint (`verifyDocument`) to handle 25+ verification types.
- **Implemented Adapters**: PAN, Driving License, DigiLocker, Singapore NRIC, Vision OCR.
- **Security**: Protean API keys and Bearer tokens are stored in **Firebase Secret Manager**.

### B. The Vault Pattern (Skyflow-style)
- **PII Isolation**: All sensitive data (Names, IDs) is stored in the `secure_vault` table.
- **Tokenization**: The `verifications` table contains only UUID tokens, ensuring that a database breach reveals no PII.
- **Bleaching Protocol**: An automated script (`bleachOldDocs`) deletes raw ID images from Cloud Storage after 24 hours to satisfy DPDP Act mandates.

### C. Infrastructure & Security
- **Region Lock**: Physically pinned to `asia-south1` (Mumbai) for data sovereignty.
- **Honeypot Trap**: `/admin-super-login` triggers immediate IP logging and blacklisting.
- **Ransomware Immunity**: WORM (Write Once, Read Many) policies applied to production backups.

### D. Commercial Billing (Prepaid Wallet)
- **Model**: "Pay-As-You-Go" at **99 INR per verification**.
- **Wallet Service**: Atomic credit deduction performed *before* identity processing using a standardized `checkAndDeductCredits` helper.
- **Top-up**: Integrated functional top-up simulation via `topUpWallet` Cloud Function.
- **Alerts**: Proactive WhatsApp/Dashboard alerts triggered when balance drops below threshold (default 1000 INR).

---

## 3. Role-Based Access Control (RBAC)

| Role | Access Level | UI Identifiers | MFA Requirement |
| :--- | :--- | :--- | :--- |
| **Master Admin** | Global Governance, Tenant Creation, Cross-Tenant Audit. | Blue Verified Badge, "Master Terminal" Header. | **Mandatory** (Google Authenticator) |
| **Company Admin** | Tenant-specific dashboard, User management, Billing. | Emerald Badge, Tenant Isolation enabled. | **Mandatory** |
| **DPO / Auditor** | Read-only access to Consent Ledgers and Audit Trails. | Gray Badge. | **Mandatory** |

---

## 4. Key Build Updates (Changelog)

### Phase 1: Foundation
- Scaffolder Firebase Functions in TypeScript.
- Integrated `firebase-admin` and `firebase-functions/v2`.

### Phase 2: Verification Engine
- Developed the `VerificationAdapter` interface.
- Implemented `PanAdapter` with name-mapping logic for Protean UAT.
- Implemented `DLAdapter` with strict Date of Birth (DD-MM-YYYY) validation.
- Implemented `DigiLockerAdapter` with OAuth handshake.

### Phase 3: Privacy & Security
- Migrated all functions to region `asia-south1`.
- Implemented the **Honeypot Trap** for unauthorized admin access.
- Implemented **Forensic Watermarking** on the frontend (IP + Email + Timestamp).
- Refactored SQLAlchemy models for **Vault Isolation**.

### Phase 4: UX & AI ("Project Niti")
- Implemented the **Niti Mascot** with custom Framer Motion animations.
- Built the **Bharat Layer** (`BhashaSwitcher`) for instant language translation.
- Integrated **Niti Chatbot** on WhatsApp for automated KYC and profanity filtering.

---

## 5. Deployment & Handover Steps

### Secrets Setup
Execute the following to seed the production secrets:
```bash
firebase functions:secrets:set PROTEAN_API_KEY
firebase functions:secrets:set PROTEAN_BEARER_TOKEN
firebase functions:secrets:set WHATSAPP_ACCESS_TOKEN
firebase functions:secrets:set GEMINI_API_KEY
```

### Deployment
```bash
# Frontend
npm run build && firebase deploy --only hosting

# Backend Functions
firebase deploy --only functions
```

### Remaining Roadmap
1. Implement the remaining 20+ Protean Adapters (Voter ID, PASSPORT, GST).
2. Complete the "Four-Eyes Approval" workflow for sensitive data exports.
3. Conduct external CERT-In security audit.

---
**Handed Over By:** Antigravity AI
**Received By:** ______________________
