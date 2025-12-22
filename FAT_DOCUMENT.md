# Final Acceptance Test (FAT) Document
**Project:** ComplianceDesk.ai (Enterprise Identity Platform)
**Version:** 1.0 (Release Candidate)
**Date:** December 23, 2025
**Auditor:** ______________________

---

## 1. Authentication & Access Control (The "God View")
*Objective: Verify strict role-based access and MFA enforcement.*

| ID | Test Case | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **1.1** | **Master Admin Login** | User `guru@compliancedesk.ai` logs in and sees the "Master Admin" Badge with a Blue Checkmark. | [ ] |
| **1.2** | **Tenant Isolation** | A standard "Company Admin" CANNOT see the "Global Audit" or "Tenant Manager" sidebar links. | [ ] |
| **1.3** | **MFA Guard (Trigger)** | Clicking "Delete Tenant" triggers the **Google Authenticator Modal** (Glassmorphism style). | [ ] |
| **1.4** | **MFA Guard (Validation)** | Entering an incorrect TOTP code blocks the action and logs a "Failed Auth" event. | [ ] |
| **1.5** | **Session Timeout** | User is auto-logged out after 15 minutes of inactivity. | [ ] |

---

## 2. Frontend Experience (Visuals & Localization)
*Objective: Verify the "Crystal" aesthetic, Watermarking, and Bharat Layer.*

| ID | Test Case | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **2.1** | **Crystal UI** | Sidebar has `backdrop-blur-xl`. Content scrolling behind it appears frosted/blurred. | [ ] |
| **2.2** | **Forensic Watermark** | Faint diagonal text (`UserEmail + IP + Timestamp`) is visible across the entire app. It cannot be clicked/selected. | [ ] |
| **2.3** | **Niti Mascot** | The `NitiMascot` (Green Visor Robot) is visible. Hovering over it triggers the "Hi, I'm Niti!" animation. | [ ] |
| **2.4** | **Bharat Layer (Lang)** | Clicking the Language Switcher and selecting "Tamil" changes the interface to Tamil instantly (no reload). | [ ] |
| **2.5** | **Accessibility** | High Contrast Mode toggle works. All images have `alt` tags (checked via inspection). | [ ] |

---

## 3. Verification Engine (Unified Gateway)
*Objective: Verify the "Adapter Pattern" and Government integrations.*

| ID | Test Case | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **3.1** | **Unified Gateway** | The frontend calls ONE function `verifyDocument` for PAN, DL, and Voter ID. No separate endpoints. | [ ] |
| **3.2** | **Protean PAN Check** | Uploading a valid PAN returns "Verified" with the official name fetched from NSDL. | [ ] |
| **3.3** | **DigiLocker Connect** | Clicking "Fetch from DigiLocker" opens the OAuth flow. Successful return populates Name/Address/Photo. | [ ] |
| **3.4** | **Google Vision OCR** | Uploading a blurry ID returns a "Low Confidence" warning (Explainable AI). | [ ] |
| **3.5** | **Singapore Masking** | Selecting "Singapore" and uploading an ID masks the NRIC to `*****567A` in the result card. | [ ] |

---

## 4. Security & Infrastructure ("Nuclear-Grade")
*Objective: Verify CERT-In compliance and Ransomware immunity.*

| ID | Test Case | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **4.1** | **API Air-Gap** | Inspecting the browser Network Tab shows NO direct calls to `vision.googleapis.com` or `risewithprotean.io`. All go via Cloud Functions. | [ ] |
| **4.2** | **WORM Backups** | Attempting to delete a backup file in the `asia-south2` bucket fails (Retention Policy Locked). | [ ] |
| **4.3** | **Honeypot Trap** | Visiting `/admin-super-login` results in an immediate IP ban. | [ ] |
| **4.4** | **Four-Eyes Lock** | Master Admin A clicks "Delete User". System sets status to "Pending Approval". Data is NOT deleted until Admin B approves. | [ ] |
| **4.5** | **Region Pinning** | Verify that all Cloud Functions are executing in `asia-south1` (Mumbai). | [ ] |

---

## 5. Data Privacy & Governance (The Vault)
*Objective: Verify DPDP Act and Skyflow-style architecture.*

| ID | Test Case | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **5.1** | **Vault Isolation** | The main `users` collection contains ONLY Tokens (UUIDs). PII is found ONLY in `secure_vault`. | [ ] |
| **5.2** | **Bleaching Script** | Raw ID card images uploaded >24 hours ago are automatically deleted from Storage. | [ ] |
| **5.3** | **Consent Ledger** | Every verification request has a corresponding entry in `consent_logs` with a timestamp. | [ ] |
| **5.4** | **Right to Correction** | User clicking "Report Issue" flags the profile as `DISPUTED` and notifies the DPO. | [ ] |

---

## 6. Omni-Channel Integrations (WhatsApp)
*Objective: Verify "Niti" and the WhatsApp Business API.*

| ID | Test Case | Expected Outcome | Status |
| :--- | :--- | :--- | :--- |
| **6.1** | **Niti Chatbot** | Sending "Hi" to the WhatsApp number triggers the "Namaste! I am Niti..." welcome message. | [ ] |
| **6.2** | **Image KYC** | Sending a photo of a PAN card on WhatsApp triggers OCR and returns "Verification Successful" within 5 seconds. | [ ] |
| **6.3** | **Profanity Filter** | Sending abusive text triggers Niti's "Let's remain professional" response. | [ ] |

---

## ✅ FAT Sign-Off

**We certify that the ComplianceDesk.ai platform has passed all critical test cases listed above and is ready for Production Deployment.**

| Role | Name | Signature | Date |
| :--- | :--- | :--- | :--- |
| **Lead Developer** | __________________ | __________________ | ________ |
| **Security Auditor** | __________________ | __________________ | ________ |
| **Product Owner** | __________________ | __________________ | ________ |
