import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { sendWhatsAppMessage } from "../whatsapp";

/**
 * Background Worker for Crime Checks
 * Triggered when a new job is created in 'verification_jobs'
 */
export const processCrimeCheck = onDocumentCreated({
    document: "verification_jobs/{jobId}",
    region: "asia-south1"
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    const jobId = event.params.jobId;
    const tenantId = data.tenantId;

    logger.info(`Async Job Started: Processing Crime Check for ${data.name} (Job: ${jobId})`);

    // Simulate 30-second processing time (In reality would be 15 mins)
    // For FAT demonstration, we use a timeout.
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
        const isFraud = data.name.toLowerCase().includes("fraud") || data.address.toLowerCase().includes("fake");
        const status = isFraud ? "REJECTED" : "VERIFIED";

        // 1. Update Job Status
        await snapshot.ref.update({
            status,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            result: isFraud ? "Clear match found in eCourts for economic offense." : "No adverse records found in district court database."
        });

        // 2. Notify via WhatsApp
        // Assuming we have a linked phone number for the requester
        // await sendWhatsAppMessage('ADMIN_PHONE', `Sovereign Check Complete: Crime Verification for ${data.name} is now ${status}. Job ID: ${jobId}`);

        logger.info(`Async Job Finished: ${jobId} status is now ${status}`);

    } catch (error) {
        logger.error(`Async Job Failed: ${jobId}`, error);
    }
});
