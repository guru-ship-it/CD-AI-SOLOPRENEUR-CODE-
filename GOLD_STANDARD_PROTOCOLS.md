# Gold Standard Protocols (2025 Identity Platform)

## 1. Right to Correction (DPDP Mandatory)
**Objective:** Allow users to dispute and admins to correct AI verification errors.
*   **Workflow:**
    1.  User: "Report Incorrect Data" -> Flags profile as `DISPUTED`.
    2.  Admin: Reviews -> Overrides field -> Flags as `VERIFIED`.
    3.  Audit: Log "Correction Event" in `consent_ledger`.

## 2. AI Explainability (White Box Protocol)
**Objective:** complying with GDPR Article 22 (Right to Explanation).
*   **Mechanism:** Never return generic "REJECTED".
*   **Response**: `{"reason": "FACE_MISMATCH", "confidence": 42%, "message": "Photo does not match selfie."}`.

## 3. Synthetic Data Sandbox (DevSecOps)
**Objective:** Zero "Real Data" in Staging.
*   **Protocol:** Use `faker.js` to populate Staging DB with 10k fake identities.
*   **Safety**: Staging API keys must be "Sandboxed" (Block real Protean calls).

## 4. Data Protection Impact Assessment (DPIA)
**Objective:** Automated Risk Assessment ("The Defense Document").
*   **Artifact:** A generated report mapping Data Flow, Risks (e.g., Insider Threat), and Mitigations (Vault, MFA, Encryption).
