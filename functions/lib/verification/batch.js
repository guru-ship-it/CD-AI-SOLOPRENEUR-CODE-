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
exports.processBatch = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const logger = __importStar(require("firebase-functions/logger"));
const service_1 = require("../billing/service");
const interface_1 = require("../billing/interface");
exports.processBatch = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    const { items, type } = request.data;
    const auth = request.auth;
    if (!auth)
        throw new https_1.HttpsError("unauthenticated", "Auth required.");
    if (!Array.isArray(items))
        throw new https_1.HttpsError("invalid-argument", "Items must be an array.");
    const tenantId = auth.token.tenantId || "MASTER_TENANT";
    const batchId = `BATCH_${Date.now()}`;
    const db = admin.firestore();
    logger.info(`Batch Job Started: ${batchId} for ${tenantId}. Items: ${items.length}`);
    await db.collection('batch_jobs').doc(batchId).set({
        tenantId,
        type,
        totalItems: items.length,
        processedItems: 0,
        status: 'PROCESSING',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    (async () => {
        for (let i = 0; i < items.length; i++) {
            try {
                await new Promise(resolve => setTimeout(resolve, 500));
                await (0, service_1.checkAndDeductCredits)(tenantId, interface_1.VERIFICATION_COST);
                const item = items[i];
                const result = {
                    isValid: true,
                    legalName: item.Name || item.name,
                    timestamp: admin.firestore.FieldValue.serverTimestamp()
                };
                await db.collection('verifications').add({
                    ...result,
                    tenantId,
                    type,
                    batchId,
                    inputs: item
                });
                await db.collection('batch_jobs').doc(batchId).update({
                    processedItems: admin.firestore.FieldValue.increment(1)
                });
            }
            catch (error) {
                logger.error(`Batch Item ${i} Failed:`, error);
            }
        }
        await db.collection('batch_jobs').doc(batchId).update({
            status: 'COMPLETED',
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    })().catch(err => logger.error("Batch Loop Fatal Error:", err));
    return { batchId, status: 'PROCESSING', message: 'Batch verification engine engaged.' };
});
//# sourceMappingURL=batch.js.map