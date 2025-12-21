# Mission: Police Verification Certificate (PVC) Module
**Target Markets:** Telangana, Karnataka, Tamil Nadu, Andhra Pradesh.
**User Base:** Blue-collar workforce (Drivers, Guards, Delivery Partners).
**Challenge:** No unified API. Requires "Portal Routing" and "OCR Verification".

## 1. The Strategy Factory Update
**Goal:** Route the user to the correct logic based on their location.

Update `app/verifiers/factory.py`:
*   Add `PoliceVerifier` class.
*   Input: `state_code` ('TS', 'KA', 'TN', 'AP').
*   Logic:
    *   If TS (Telangana) -> `TsPoliceStrategy`.
    *   If KA (Karnataka) -> `KaSevaSindhuStrategy`.
    *   If TN (Tamil Nadu) -> `TnEservicesStrategy`.
    *   If AP (Andhra) -> `ApPoliceStrategy`.

## 2. The "Application" Engine (Form Filler)
Since we cannot legally login as the user to apply, we **Automate the Form Filling** to reduce rejection rates.

*   **Service:** `app/services/pvc_application.py`
*   **Input:** User data from WhatsApp (Name, Father's Name, Address, Aadhaar).
*   **Action:**
    *   **Telangana:** Generate a pre-filled "PCC Application Form" (PDF) compatible with MeeSeva centers.
    *   **Karnataka:** Generate a pre-filled data sheet for Seva Sindhu.
*   **Bot Reply:** "✅ Application Form Generated. Please take this PDF to your nearest MeeSeva/SevaSindhu center. Once applied, reply with the Application Number here."

## 3. The "Verification" Engine (Status Check)
We automate the "Status Check" using a **Headless Browser (Playwright)** because most state portals don't have public APIs.

*   **Tech:** Python playwright (Headless Browser).
*   **Service:** `app/services/pvc_status_checker.py`.

### A. Hyderabad (Telangana)
*   **Target:** `tspolice.gov.in` (Check Petition Status).
*   **Logic:**
    *   Bot asks: "Enter Petition/Application Number".
    *   Playwright: Visits portal -> Enters No -> Solves Captcha (using 2Captcha or Gemini Vision) -> Scrapes Status.
*   **Result:** "Approved / Pending".

### B. Bangalore (Karnataka)
*   **Target:** `sevasindhu.karnataka.gov.in`
*   **Logic:**
    *   Input: "Application Reference Number".
    *   Playwright: Scrapes "Track Application Status".

### C. Chennai (Tamil Nadu)
*   **Target:** `eservices.tnpolice.gov.in`
*   **Logic:**
    *   Input: Mobile Number + Service Type.
    *   **Action:** Verify if "PVR" (Police Verification Report) is generated.

## 4. The "Certificate Validator" (For Completed PVCs)
If the worker uploads a photo of their Physical Certificate.

*   **Service:** `app/verifiers/pvc_validator.py`
*   **Tools:** Vertex AI Vision (OCR) + QR Code Reader.
*   **Logic:**
    *   **Detect State:** Look for keywords ("Government of Telangana", "Tamil Nadu Police").
    *   **Extract:** Name, Date of Issue, "No Criminal Record" text.
    *   **QR Verification:**
        *   Decode the QR code on the certificate.
        *   Compare the QR data vs. Printed Text.
    *   **Mismatch?** -> Fake Certificate (Red Flag 🚩).

## 5. WhatsApp Bot Flow Update
*   **State:** POLICE_VERIFICATION
*   **Bot:** "Select your Work Location: 1. Hyderabad, 2. Bangalore, 3. Chennai, 4. Andhra."
*   **User:** "1"
*   **Bot:** "Do you have a Police Certificate? (YES/NO)"
    *   If **YES**: "Upload a photo of the certificate." -> Trigger Validator.
    *   If **NO**: "We will help you apply. Send your Aadhaar Photo." -> Trigger Application Engine. -> "Here is your filled form. Submit at MeeSeva."
    *   If **APPLIED**: "Enter Application Number." -> Trigger Status Checker.

## Deployment
*   **Update requirements.txt:** Add `playwright`, `opencv-python-headless`.
*   **Update Dockerfile:**
    ```dockerfile
    # Install browsers for Playwright
    RUN playwright install chromium
    RUN playwright install-deps
    ```
