import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

/**
 * Hourly Aggregation for Bento Grid Analytics
 * Reduces load on the frontend by pre-calculating stats.
 */
export const aggregateHourlyStats = onSchedule({
    schedule: "every 1 hours",
    region: "asia-south1"
}, async (event) => {
    const db = admin.firestore();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));

    try {
        // 1. Fetch verifications in the last hour
        const snapshot = await db.collection("verifications")
            .where("timestamp", ">=", oneHourAgo)
            .get();

        let total = snapshot.size;
        let valid = 0;
        let invalid = 0;
        let totalTAT = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.isValid) valid++; else invalid++;
            if (data.tat) totalTAT += data.tat;
        });

        const avgTAT = total > 0 ? totalTAT / total : 0;
        const fraudRate = total > 0 ? (invalid / total) * 100 : 0;

        // 2. Update Hourly Stats collection
        const statsId = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}_H${now.getHours()}`;
        await db.collection("analytics_hourly").doc(statsId).set({
            timestamp: now,
            total,
            valid,
            invalid,
            avgTAT,
            fraudRate,
            hour: now.getHours()
        });

        logger.info(`Analytics: Hourly aggregation complete for ${statsId}. Total: ${total}`);

    } catch (error) {
        logger.error("Analytics: Hourly aggregation failed:", error);
    }
});
