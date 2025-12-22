import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { checkAndDeductCredits } from "../billing/service";
import { VERIFICATION_COST } from "../billing/interface";

/**
 * Batch Process Engine
 * Handles bulk verification requests with throttling to avoid rate limits.
 */
export const processBatch = onCall({ region: "asia-south1" }, async (request) => {
    const { items, type } = request.data;
    const auth = request.auth;

    if (!auth) throw new HttpsError("unauthenticated", "Auth required.");
    if (!Array.isArray(items)) throw new HttpsError("invalid-argument", "Items must be an array.");

    const tenantId = auth.token.tenantId || "MASTER_TENANT";
    const batchId = `BATCH_${Date.now()}`;
    const db = admin.firestore();

    logger.info(`Batch Job Started: ${batchId} for ${tenantId}. Items: ${items.length}`);

    // 1. Create Batch Header
    await db.collection('batch_jobs').doc(batchId).set({
        tenantId,
        type,
        totalItems: items.length,
        processedItems: 0,
        status: 'PROCESSING',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 2. background process (simplified for demo/cloud function timeout)
    // Note: In real production, this should trigger a Task Queue or PubSub
    // to avoid Cloud Function 540s timeout for large batches.

    // Process items in background (don't await loop completion)
    (async () => {
        for (let i = 0; i < items.length; i++) {
            try {
                // Throttling
                await new Promise(resolve => setTimeout(resolve, 500));

                // Deduct credits
                await checkAndDeductCredits(tenantId, VERIFICATION_COST);

                // Mock Verification (or call verifyDocument logic)
                // In a real system, we'd reuse the adapter lookup here
                const item = items[i];
                const result = {
                    isValid: true,
                    legalName: item.Name || item.name,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                };

                // Store Result
                await db.collection('verifications').add({
                    ...result,
                    tenantId,
                    type,
                    batchId,
                    inputs: item
                });

                // Update Batch Progress
                await db.collection('batch_jobs').doc(batchId).update({
                    processedItems: admin.firestore.FieldValue.increment(1)
                });

            } catch (error) {
                logger.error(`Batch Item ${i} Failed:`, error);
            }
        }

        // Finalize Batch
        await db.collection('batch_jobs').doc(batchId).update({
            status: 'COMPLETED',
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });

    })().catch(err => logger.error("Batch Loop Fatal Error:", err));

    return { batchId, status: 'PROCESSING', message: 'Batch verification engine engaged.' };
});
