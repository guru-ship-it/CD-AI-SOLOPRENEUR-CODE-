# Phase 5: Afro-Asian Compliance Strategy

## 1. The "Information Officer" Designation (South Africa POPIA)
*   **Requirement:** Every company must legally appoint an "Information Officer" (DPO).
*   **Implementation:**
    *   **UI:** "Legal Compliance Officer" section in Company Settings.
    *   **Logic:** Block "Go Live" if DPO Name, Phone, and Email are missing.

## 2. The "March 15th" Audit Generator (Nigeria NDPR)
*   **Requirement:** Annual Data Protection Audit by March 15th.
*   **Implementation:**
    *   **Script:** `generateNDPRAudit()`
    *   **Output:** PDF/Markdown report with Total Identities, Breaches, Encryption.

## 3. NRIC "Masking" Protocol (Singapore PDPA)
*   **Requirement:** Do not store full NRIC unless necessary. Mask it.
*   **Implementation:**
    *   **Logic:** If `country == 'SG'`, store `*****567A`.
    *   **Display:** Show masked ID.

## 4. The "72-Hour" Breach Timer (Kenya DPA / GDPR)
*   **Requirement:** Report data breaches within 72 hours.
*   **Implementation:**
    *   **Feature:** "Declare Security Incident" button.
    *   **Effect:** Starts 72h countdown, drafts email to regulator (ODPC/NDPC).

## 5. Cross-Border "Adequacy" Checks (Africa Region)
*   **Requirement:** Data Residency Pinning (Adequacy).
*   **Implementation:**
    *   **Rule:** Indian Users -> `asia-south1`, African Users -> `africa-south1`.
    *   **Config:** Tenant selects "Home Region" on signup.
