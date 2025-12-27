# Handover Report: ComplianceDesk.ai (V1.0)
**Date:** December 27, 2025
**Author:** Antigravity AI
**Status:** Production Ready (Staging)

---

## 1. Executive Summary
ComplianceDesk.ai is a compliance-first Identity Verification and Police Verification automation platform designed for the Indian market. Built on a serverless architecture, it integrates cutting-edge AI (Google Vision + Gemini Pro) with strict DPDP Act 2023 compliance protocols. The system automates onboarding, GST invoicing, and secure data retention.

---

## 2. Technical Stack
*   **Frontend:** HTML5, Tailwind CSS (Mobile-first landing pages).
*   **Backend:** Python 3.11, FastAPI (REST API), Google Cloud Functions (Serverless).
*   **Database:** Dual SQLite Architecture (Operational vs. Compliance Vault) with SQLAlchemy ORM.
*   **AI Engine:** Google Generative AI (Gemini Pro), Google Vision API.
*   **Security:** AES-256 Tokenization, Google Cloud Secret Manager.
*   **Communications:** Interakt (WhatsApp Business API Integration).

---

## 3. Core Backend Architecture
The backend is split between operational logic and specialized serverless functions:

### A. Main Application (`app.py` / `main.py`)
- **FastAPI Core**: Handles high-performance verification requests.
- **Firebase Bridge**: Uses `a2wsgi` to serve the FastAPI app as a serverless Google Cloud Function.
- **Lazy Loading**: Implements proxy pattern for heavy modules (Police Verifiers) to ensure <500ms startup times.

### B. AI Parsing & OCR (`gemini_parser.py`)
- Extracts structured data (Name, ID, DOB, Address) from messy ID cards.
- **State Detection**: Uses a hybrid regex + keyword engine to identify the customer's state for tax purposes.

---

## 4. Finance & GST Engine
A modular engine built to handle Indian tax complexities autonomously:

*   **`finance_engine.py`**:
    *   Implements the "Telangana HQ Rule".
    *   Calculates 18% GST (Intra: CGST+SGST | Inter: IGST).
    *   Handles back-calculation from the ₹99.00 fixed price.
*   **`invoice_generator.py`**:
    *   Uses `reportlab` to produce legally valid Tax Invoice PDFs.
    *   Includes SAC 998313 (IT/Software Services) classification.

---

## 5. Security & DPDP Compliance
"Hackproof" protocols are baked into the foundation:

*   **AES-256 Tokenization**: Personally Identifiable Information (PII) is encrypted before hit the disk.
*   **"Empty Vault" Architecture**: Primary images are processed in-memory/temp folders and immediately purged after parsing.
*   **Centralized Secrets**: API keys (Razorpay, Interakt, Protean) are never hardcoded; they are fetched at runtime via Google Secret Manager.

---

## 6. WhatsApp Integration (Niti Assistant)
A Conversational AI flow managed via `whatsapp_processor.py`:
- **Niti Flow**: Onboards users, collects DPDP consent (hashed signature), and accepts ID uploads.
- **Status Alerts**: Sends real-time verification updates and PDF invoices directly to the user's phone.

---

## 7. Legal Scaffolding
- **`privacy.html`**: Legally vetted content for DPDP Act 2023.
- **`terms.html`**: Payment, refund, and jurisdictional terms for SAAS operations.

---

## 8. Directory Structure
```text
/backend
├── app.py                # Main API Entry Point
├── main.py               # Firebase Functions Entry
├── database.py           # DB Engines & Sessions
├── models.py             # SQLAlchemy Schemas
├── requirements.txt      # Dependency Lockfile
├── /services
│   ├── finance_engine.py      # GST Logic
│   ├── invoice_generator.py   # PDF Logic
│   ├── gemini_parser.py       # AI Extraction
│   ├── security_utils.py      # AES Encryption
│   └── whatsapp_processor.py  # Interakt Logic
/frontend
├── /public
│   ├── index.html        # Landing Page
│   ├── privacy.html      # DPDP Policy
│   └── terms.html        # Terms of Service
/scripts
└── reporting_task.py     # Monthly GSTR-1 Automation
```

---

## 9. Final Deployment Checklist
1.  **Environment**: Set `DEMO_MODE=False` in production.
2.  **Secrets**: Deploy `RAZORPAY_WEBHOOK_SECRET` to GCP.
3.  **Storage**: Ensure `/tmp` is used for PDF generation in Cloud Functions.

---
*End of Document*
