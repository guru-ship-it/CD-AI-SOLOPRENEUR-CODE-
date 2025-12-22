# Module: Police & Court Verification (eCourts)

## 1. The Challenge
Scanning 3,000+ district courts for a name match takes time. We cannot block the UI.

## 2. Architecture: "Fire and Forget"
1.  **Frontend:** Calls `verifyDocument(type='CRIME_CHECK')`.
2.  **Backend:**
    * Creates a `JobId` (e.g., `JOB_998`).
    * Returns `status: PENDING` immediately to Frontend.
    * Triggers a background Cloud Task / PubSub event.
3.  **Background Worker:**
    * Crawls eCourts/Protean Crime API.
    * Updates Firestore when done.
    * **Niti Bot:** Sends a WhatsApp ping: "Police Check Complete for Driver X."

## 3. Implementation Status: IN PROGRESS
- [ ] CrimeAdapter Implementation
- [ ] Job Worker logic
- [ ] WhatsApp Integration for Job completion
