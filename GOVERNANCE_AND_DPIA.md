# Governance & Process Safeguards (DPDP/ISO Compliant)

## 1. Right to Correction (Grievance Redressal)
* **UI Component:** Add a "Report Issue" button on the Verification Result card.
* **Backend Logic:**
    * Create collection `grievances`.
    * On submission: Set `verificationStatus` to `UNDER_REVIEW`.
    * Notify `support@compliancedesk.ai`.
* **SLA:** Auto-escalate to Master Admin if not resolved in 24 hours.

## 2. AI Transparency (Explainability)
* **Requirement:** Never return a generic "Failed" message.
* **Logic:**
    * If `vision_score < 80`: Return "Image Quality Low / Blurry".
    * If `face_match < 60`: Return "Face Does Not Match ID Photo".
    * If `ocr_mismatch`: Return "Name on ID does not match Input".
* **Storage:** Log these specific reasons in `audit_logs` for dispute resolution.

## 3. Synthetic Data (Safe Testing)
* **Tool:** Use `@faker-js/faker` in the `dev` environment.
* **Script:** Create `scripts/seed-db.ts` to populate the dashboard with 50 fake verified users so we don't need to use real IDs during demos.

## 4. Automated DPIA Report
* **Script:** `npm run generate-compliance-report`
* **Output:** A Markdown/PDF file summarizing the current security posture (Encryption status, Region, Access Control) for auditors.
