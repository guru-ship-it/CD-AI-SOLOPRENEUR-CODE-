
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { whatsappWebhook } from "./whatsapp";

admin.initializeApp();

// Export WhatsApp Webhook
export { whatsappWebhook } from "./whatsapp";
export { verifyDocument } from "./verification/gateway";

/**
 * Legacy Support: Placeholder for migrated verifyIdentity
 * In a real migration, we would move all existing JS logic from the old index.js here.
 */
export const verifyIdentity = functions
    .region("asia-south1")
    .https.onCall(async (data, context) => {
        return { status: "VERIFIED", message: "TypeScript Proxy Active" };
    });
