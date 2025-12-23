import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { ADAPTER_REGISTRY } from "./registry";
import { checkAndDeductCredits } from "../billing/service";
import { VERIFICATION_COST } from "../billing/interface";
import { resilientCall } from "./api-client";
import { proteanApiKey, proteanBearerToken, sendgridKey, waToken, waPhoneId } from "../secrets";

/**
 * Handles bulk verification requests from a CSV upload.
 * Throttles processing to prevent rate limiting.
 */
export const processBatch = onCall({
    secrets: [proteanApiKey, proteanBearerToken, sendgridKey, waToken, waPhoneId],
    region: "asia-south1",
    timeoutSeconds: 300 // 5 minutes for large batches
}, async (request) => {
    const { requests } = request.data; // Array of { type, inputs }
    const auth = request.auth;

    if (!auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    }

    if (!Array.isArray(requests) || requests.length === 0) {
        throw new HttpsError("invalid-argument", "Requests must be a non-empty array.");
    }

    const tenantId = auth.token.tenantId || "MASTER_TENANT";
    const batchId = `BATCH_${Date.now()}`;
    const batchRef = admin.firestore().collection('batch_jobs').doc(batchId);

    // 1. Initial State
    await batchRef.set({
        tenantId,
        userId: auth.uid,
        status: 'PROCESSING',
        totalItems: requests.length,
        processedItems: 0,
        successCount: 0,
        failedCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 2. Process in background (though onCall waits, we'll return the ID early if needed, 
    // but here we follow the user's flow of looping synchronously with delays)
    const results = [];

    for (const [index, item] of requests.entries()) {
        const { type, inputs } = item;
        let result;

        try {
            // Re-using logic from verifyDocument
            const adapter = ADAPTER_REGISTRY[type];
            if (!adapter) throw new Error(`Unsupported type: ${type}`);

            // Credit Check & Deduction
            await checkAndDeductCredits(tenantId, VERIFICATION_COST);

            // API Call
            const payload = adapter.buildRequest(inputs);
            const response = await resilientCall({
                method: adapter.method,
                url: adapter.endpoint,
                data: payload,
                headers: {
                    'content-type': 'application/json',
                    'apikey': proteanApiKey.value(),
                    'Authorization': `Bearer ${proteanBearerToken.value()}`
                }
            });

            result = adapter.normalizeResponse(response.data);

            // Persist Record
            const verificationId = `CERT_${admin.firestore().collection('verifications').doc().id}`;
            await admin.firestore().collection('verifications').doc(verificationId).set({
                tenantId,
                userId: auth.uid,
                batchId,
                type,
                inputs,
                result,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                status: result.isValid ? 'VALID' : 'FAILED',
                sourceAuthority: adapter.sourceAuthority || 'National Database'
            });

            results.push({ index, success: true, verificationId, isValid: result.isValid });

            // Rejection Alert (Instant)
            if (!result.isValid) {
                const { notifyRejection } = require("../notifications_v2");
                notifyRejection(tenantId, inputs, result.error || "Document data mismatch").catch((e: any) =>
                    console.error("Failed to trigger rejection alert in batch:", e.message)
                );
            }

        } catch (error: any) {
            console.error(`Batch item ${index} failed:`, error.message);
            results.push({ index, success: false, error: error.message });
        }

        // Throttling: 500ms delay per user request
        if (index < requests.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Update Progress every 5 items or at the end
        if ((index + 1) % 5 === 0 || index === requests.length - 1) {
            const successCount = results.filter(r => r.success && r.isValid).length;
            const failedCount = results.length - successCount;

            await batchRef.update({
                processedItems: index + 1,
                successCount,
                failedCount,
                status: (index === requests.length - 1) ? 'COMPLETED' : 'PROCESSING',
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    }

    return { batchId, summary: { total: requests.length, processed: results.length } };
});
