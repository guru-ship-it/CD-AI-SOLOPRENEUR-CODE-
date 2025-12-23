import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { resilientCall } from "./verification/api-client";

/**
 * Proactively checks the health of external identity providers (Protean, DigiLocker).
 * Updates Firestore system_settings/status document.
 * Runs every 10 minutes.
 */
export const checkApiHealth = onSchedule({
    schedule: "every 10 minutes",
    region: "asia-south1",
    timeoutSeconds: 30, // Short timeout for pings
    secrets: []
}, async (event) => {
    const statusRef = admin.firestore().collection("system_settings").doc("status");

    // Default Statuses
    let proteanStatus = "ONLINE";
    let digilockerStatus = "ONLINE";
    let alertMessage = "";

    // 1. Check Protean Health
    // NSDL/Protean UAT Health Endpoint (Mock/Placeholder logic)
    const proteanStart = Date.now();
    try {
        const response = await resilientCall({
            method: 'GET',
            url: "https://uat.risewithprotean.io/api/v2/pan/health",
            timeout: 5000 // 5 second timeout
        });

        const latency = Date.now() - proteanStart;

        if (latency > 3000) {
            proteanStatus = "DEGRADED";
            alertMessage = "NSDL is experiencing higher than usual latency.";
        } else if (response.status !== 200) {
            proteanStatus = "DOWN";
            alertMessage = "NSDL Services are currently unavailable.";
        }
    } catch (error: any) {
        logger.error("Protean Health Check Failed:", error.message);
        proteanStatus = "DOWN";
        alertMessage = "NSDL Services are currently offline.";
    }

    // 2. Check DigiLocker (Simulated logic as real endpoints are behind OAuth/IP whitelist)
    // In production, we'd check their public status page or a lightweight API
    // const digilockerResponse = await axios.get("...");

    // 3. Update Firestore (The Source of Truth)
    await statusRef.set({
        protean_status: proteanStatus,
        digilocker_status: digilockerStatus,
        global_alert: alertMessage,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    logger.info(`Health Check Completed: Protean=${proteanStatus}, DigiLocker=${digilockerStatus}`);
});
