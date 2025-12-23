import { onCall, HttpsError } from "firebase-functions/v2/https";
import { resilientCall } from "./api-client";
import * as admin from "firebase-admin";
import { ADAPTER_REGISTRY } from "./registry";
import { checkAndDeductCredits } from "../billing/service";
import { VERIFICATION_COST } from "../billing/interface";
import { proteanApiKey, proteanBearerToken, sendgridKey, waToken, waPhoneId } from "../secrets";

export const verifyDocument = onCall({
    secrets: [proteanApiKey, proteanBearerToken, sendgridKey, waToken, waPhoneId],
    region: "asia-south1"
}, async (request) => {
    const { type, inputs } = request.data;
    const auth = request.auth;

    if (!auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated to perform verification.");
    }

    const tenantId = auth.token.tenantId || "MASTER_TENANT";

    // 1. Validate Adapter Exists
    const adapter = ADAPTER_REGISTRY[type];
    if (!adapter) {
        throw new HttpsError("invalid-argument", `Unsupported ID Type: ${type}`);
    }

    // 2. Commercial Gate: Deduct Credits BEFORE API call
    try {
        await checkAndDeductCredits(tenantId, VERIFICATION_COST);
    } catch (error: any) {
        if (error instanceof HttpsError) throw error;
        throw new HttpsError("internal", "Billing System Error");
    }

    // 3. Execution Path: Sync vs Async
    if (type === 'CRIME_CHECK') {
        const jobId = `JOB_${Date.now()}`;
        await admin.firestore().collection('verification_jobs').doc(jobId).set({
            tenantId,
            type,
            inputs,
            status: 'PENDING',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            name: inputs.name // For notification
        });
        return adapter.normalizeResponse({ job_id: jobId });
    }

    try {
        // 4. Build Payload
        const payload = adapter.buildRequest(inputs);

        // 5. Secure Call (Injecting Secrets Centrally)
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

        // 6. Normalize
        const normalized = adapter.normalizeResponse(response.data);

        const verificationId = `CERT_${admin.firestore().collection('verifications').doc().id}`;
        await admin.firestore().collection('verifications').doc(verificationId).set({
            tenantId,
            userId: auth.uid,
            type,
            inputs: inputs, // Store inputs for certificate (masked later)
            result: normalized,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: normalized.isValid ? 'VALID' : 'FAILED',
            sourceAuthority: adapter.sourceAuthority || 'National Database'
        });

        // 8. Rejection Alert (Instant)
        if (!normalized.isValid) {
            const { notifyRejection } = require("../notifications_v2");
            notifyRejection(tenantId, inputs, normalized.error || "Document data mismatch").catch((e: any) =>
                console.error("Failed to trigger rejection alert:", e.message)
            );
        }

        // 9. Return Normalized Result with Verification ID
        return {
            ...normalized,
            verificationId
        };

    } catch (error: any) {
        console.error(`Protean Verification Failed [${type}]:`, error);
        // Return a safe error so frontend doesn't crash
        return {
            isValid: false,
            error: "External API Verification Failed",
            rawResponse: error.response?.data || error.message
        };
    }
});
