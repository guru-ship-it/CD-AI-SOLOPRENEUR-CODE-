"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.aggregateHourlyStats = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const admin = __importStar(require("firebase-admin"));
const logger = __importStar(require("firebase-functions/logger"));
exports.aggregateHourlyStats = (0, scheduler_1.onSchedule)({
    schedule: "every 1 hours",
    region: "asia-south1"
}, async (event) => {
    const db = admin.firestore();
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    try {
        const snapshot = await db.collection("verifications")
            .where("timestamp", ">=", oneHourAgo)
            .get();
        let total = snapshot.size;
        let valid = 0;
        let invalid = 0;
        let totalTAT = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.isValid)
                valid++;
            else
                invalid++;
            if (data.tat)
                totalTAT += data.tat;
        });
        const avgTAT = total > 0 ? totalTAT / total : 0;
        const fraudRate = total > 0 ? (invalid / total) * 100 : 0;
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
    }
    catch (error) {
        logger.error("Analytics: Hourly aggregation failed:", error);
    }
});
//# sourceMappingURL=analytics.js.map