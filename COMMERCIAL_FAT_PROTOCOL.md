# 🚀 FINAL ACCEPTANCE TEST (FAT) PROTOCOL
**Project:** ComplianceDesk.ai (Commercial Build v1.0)
**Date:** Dec 23, 2025
**Standard:** Google Enterprise Light Theme

## 1. The "First Impression" Test (Landing Page)
* [ ] **SSL/DNS:** Does `https://compliancedesk.ai` load without security warnings?
* [ ] **Aesthetics:** Is the background **White/Slate-50** (Not Dark Mode)?
* [ ] **Tech Strip:** Do the Google/Firebase/Protean logos load correctly?
* [ ] **Legal Footer:** Is "Mr. Vijay Lawyer" and the Office Address visible?
* [ ] **WhatsApp:** Does the floating button open `api.whatsapp.com`?

## 2. The "Money" Test (Billing & Wallet)
* [ ] **Empty State:** New users should see "₹0 Balance".
* [ ] **Recharge UI:** Clicking "Add Credits" should open the Razorpay (Test) modal.
* [ ] **Deduction Logic:**
    * *Action:* Manually set wallet to ₹500 via Firestore.
    * *Action:* Run 1 Verification.
    * *Check:* Balance must drop to ₹485 (or defined cost).
* [ ] **Low Balance Alert:** Set balance to ₹10. Did the Admin get a WhatsApp/Email alert?

## 3. The "Core Product" Test (Verification)
* [ ] **Theme Sync:** Is the Dashboard sidebar White (Light Mode)?
* [ ] **Selector:** Does the "Verification Grid" (the cute cards) appear instead of a dropdown?
* [ ] **Loading State:** Do we see "Skeleton Bars" (pulsing gray) while fetching data?
* [ ] **Success Toast:** Does a black toast notification appear ("Verification Successful") upon completion?
* [ ] **PDF Proof:** Click "Download Certificate". Does the PDF open with the correct Name, Date, and QR Code?

## 4. The "Resilience" Test (Error Handling)
* [ ] **Bad Input:** Enter a fake PAN (e.g., "ABCDE1234F"). Does the system show a graceful error message (not a crash)?
* [ ] **Network Cut:** Disconnect WiFi and click Verify. Does the "Resilience Layer" show a "Network Error" toast?

## 5. Mobile Responsiveness
* [ ] **Table Scroll:** Open Dashboard on mobile. Can you scroll the data table horizontally without breaking the page layout?
* [ ] **Menu:** Does the Landing Page hamburger menu work?

## 6. Security & Compliance
* [ ] **Secrets:** Are `PROTEAN_API_KEY`, `RAZORPAY_KEY`, and `SENDGRID_KEY` set in Firebase Functions Secrets?
* [ ] **Logs:** Check Firebase Console -> Functions Logs. Any "Red Text" (Unhandled Exceptions) in the last 30 mins?

---
**GO/NO-GO DECISION:**
* If all checks are ✅ -> **PROCEED TO DEPLOY.**
* If any Critical check is ❌ -> **HALT & FIX.**
