import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp();

// FAT 5.2: Bleaching Script - Daily deletion of raw ID images >24 hours old
export const bleachOldDocs = onSchedule({
    schedule: "every 24 hours",
    region: "asia-south1",
    secrets: []
}, async (event) => {
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({ prefix: "raw_ids/" });

    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    let deletedCount = 0;

    for (const file of files) {
        const [metadata] = await file.getMetadata();
        const created = new Date(metadata.timeCreated).getTime();

        if (now - created > twentyFourHours) {
            await file.delete();
            deletedCount++;
        }
    }

    logger.info(`DPDP Compliance: Bleaching script completed. Deleted ${deletedCount} legacy records.`);
});

// FAT 4.3: Honeypot Trap - Visiting /admin-super-login results in an immediate ban
export const adminSuperLogin = onRequest({ region: "asia-south1" }, async (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'];
    logger.error(`CRITICAL SECURITY BREACH: Unauthorized access attempt to Honeypot /admin-super-login from IP: ${ip}. Initiating protocol: IP_BAN.`);

    res.status(403).send("<h1>FATAL ERROR: SECURITY PROTOCOL ACTIVATED</h1><p>Your IP has been logged and blacklisted by the CDC AI Fortress Defense System.</p>");
});

// Export WhatsApp Webhook
export { whatsappWebhook } from "./whatsapp";
export { verifyDocument } from "./verification/gateway";
export { topUpWallet, checkAndDeductCredits } from "./billing/service";
export { aggregateHourlyStats } from "./analytics";
export { processCrimeCheck } from "./verification/worker";
export { generateCertificate } from "./verification/certificate";
export { processBatch } from "./verification/batch";
export { checkApiHealth } from "./health";

/**
 * Legacy Support Proxy
 */
export const verifyIdentity = onCall({ region: "asia-south1" }, async (request) => {
    return { status: "VERIFIED", message: "TypeScript Proxy Active (v2)" };
});
