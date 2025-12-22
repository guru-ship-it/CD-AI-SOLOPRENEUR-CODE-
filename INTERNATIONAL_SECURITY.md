# International Security Standards (GDPR / ISO 27001 / SOC 2)

## 1. Vulnerability Disclosure Policy (RFC 9116)
* **File Path:** `public/.well-known/security.txt`
* **Content:**
    ```text
    Contact: mailto:support@compliancedesk.ai
    Expires: 2025-12-31T23:59:00.000Z
    Preferred-Languages: en
    Canonical: https://compliancedesk.ai/.well-known/security.txt
    ```

## 2. Data Portability (GDPR Export)
* **Objective:** Allow Company Admins to export all their tenant data.
* **Cloud Function:** `exportTenantData(tenantId)`
* **Output:** A password-protected ZIP file containing:
    * `users.json` (List of active accounts)
    * `audit_logs.json` (History of actions)
    * `verifications_summary.csv` (Anonymized stats)

## 3. Supply Chain Security (SBOM)
* **Tool:** Use `@cyclonedx/cyclonedx-npm`
* **Pipeline:** Generate `sbom.xml` during every build.
* **Storage:** Upload this SBOM to a private "Release Artifacts" bucket in Google Cloud Storage for audit purposes.

## 4. Active Defense (CSP Reporting)
* **Header Update:** Modify `Content-Security-Policy` in `firebase.json` to include:
    `report-uri https://api.compliancedesk.ai/csp-report;`
* **Endpoint:** Create a lightweight Cloud Function to ingest these reports and log "High Alert" warnings if XSS attempts spike.

## 5. Cookie Consent Manager (ePrivacy Directive)
* **UI:** A "Strict" cookie banner that blocks *all* non-essential cookies until the user explicitly clicks "Accept".
* **Storage:** Save this preference in the `consent_ledger` defined in the DPDP step.
