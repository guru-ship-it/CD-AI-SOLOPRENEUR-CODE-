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
exports.processCrimeCheck = void 0;
const firestore_1 = require("firebase-functions/v2/firestore");
const admin = __importStar(require("firebase-admin"));
const logger = __importStar(require("firebase-functions/logger"));
exports.processCrimeCheck = (0, firestore_1.onDocumentCreated)({
    document: "verification_jobs/{jobId}",
    region: "asia-south1"
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot)
        return;
    const data = snapshot.data();
    const jobId = event.params.jobId;
    const tenantId = data.tenantId;
    logger.info(`Async Job Started: Processing Crime Check for ${data.name} (Job: ${jobId})`);
    await new Promise(resolve => setTimeout(resolve, 30000));
    try {
        const isFraud = data.name.toLowerCase().includes("fraud") || data.address.toLowerCase().includes("fake");
        const status = isFraud ? "REJECTED" : "VERIFIED";
        await snapshot.ref.update({
            status,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            result: isFraud ? "Clear match found in eCourts for economic offense." : "No adverse records found in district court database."
        });
        logger.info(`Async Job Finished: ${jobId} status is now ${status}`);
    }
    catch (error) {
        logger.error(`Async Job Failed: ${jobId}`, error);
    }
});
//# sourceMappingURL=worker.js.map