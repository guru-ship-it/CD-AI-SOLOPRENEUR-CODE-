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
const registry_1 = require("./registry");
const service_1 = require("../billing/service");
const interface_1 = require("../billing/interface");
const api_client_1 = require("./api-client");
const params_1 = require("firebase-functions/params");
const proteanApiKey = (0, params_1.defineSecret)("PROTEAN_API_KEY");
const proteanBearerToken = (0, params_1.defineSecret)("PROTEAN_BEARER_TOKEN");
exports.processBatch = (0, https_1.onCall)({
    secrets: [proteanApiKey, proteanBearerToken],
    region: "asia-south1",
    timeoutSeconds: 300
}, async (request) => {
    const { requests } = request.data;
    const auth = request.auth;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated.");
    }
    if (!Array.isArray(requests) || requests.length === 0) {
        throw new https_1.HttpsError("invalid-argument", "Requests must be a non-empty array.");
    }
    const tenantId = auth.token.tenantId || "MASTER_TENANT";
    const batchId = `BATCH_${Date.now()}`;
    const batchRef = admin.firestore().collection('batch_jobs').doc(batchId);
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
    const results = [];
    for (const [index, item] of requests.entries()) {
        const { type, inputs } = item;
        let result;
        try {
            const adapter = registry_1.ADAPTER_REGISTRY[type];
            if (!adapter)
                throw new Error(`Unsupported type: ${type}`);
            await (0, service_1.checkAndDeductCredits)(tenantId, interface_1.VERIFICATION_COST);
            const payload = adapter.buildRequest(inputs);
            const response = await (0, api_client_1.resilientCall)({
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
        }
        catch (error) {
            console.error(`Batch item ${index} failed:`, error.message);
            results.push({ index, success: false, error: error.message });
        }
        if (index < requests.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
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
//# sourceMappingURL=batch.js.map