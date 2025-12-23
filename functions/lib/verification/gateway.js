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
exports.verifyDocument = void 0;
const https_1 = require("firebase-functions/v2/https");
const api_client_1 = require("./api-client");
const admin = __importStar(require("firebase-admin"));
const params_1 = require("firebase-functions/params");
const registry_1 = require("./registry");
const service_1 = require("../billing/service");
const interface_1 = require("../billing/interface");
const proteanApiKey = (0, params_1.defineSecret)("PROTEAN_API_KEY");
const proteanBearerToken = (0, params_1.defineSecret)("PROTEAN_BEARER_TOKEN");
exports.verifyDocument = (0, https_1.onCall)({ secrets: [proteanApiKey, proteanBearerToken], region: "asia-south1" }, async (request) => {
    const { type, inputs } = request.data;
    const auth = request.auth;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated to perform verification.");
    }
    const tenantId = auth.token.tenantId || "MASTER_TENANT";
    const adapter = registry_1.ADAPTER_REGISTRY[type];
    if (!adapter) {
        throw new https_1.HttpsError("invalid-argument", `Unsupported ID Type: ${type}`);
    }
    try {
        await (0, service_1.checkAndDeductCredits)(tenantId, interface_1.VERIFICATION_COST);
    }
    catch (error) {
        if (error instanceof https_1.HttpsError)
            throw error;
        throw new https_1.HttpsError("internal", "Billing System Error");
    }
    if (type === 'CRIME_CHECK') {
        const jobId = `JOB_${Date.now()}`;
        await admin.firestore().collection('verification_jobs').doc(jobId).set({
            tenantId,
            type,
            inputs,
            status: 'PENDING',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            name: inputs.name
        });
        return adapter.normalizeResponse({ job_id: jobId });
    }
    try {
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
        const normalized = adapter.normalizeResponse(response.data);
        const verificationId = `CERT_${admin.firestore().collection('verifications').doc().id}`;
        await admin.firestore().collection('verifications').doc(verificationId).set({
            tenantId,
            userId: auth.uid,
            type,
            inputs: inputs,
            result: normalized,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            status: normalized.isValid ? 'VALID' : 'FAILED',
            sourceAuthority: adapter.sourceAuthority || 'National Database'
        });
        return {
            ...normalized,
            verificationId
        };
    }
    catch (error) {
        console.error(`Protean Verification Failed [${type}]:`, error);
        return {
            isValid: false,
            error: "External API Verification Failed",
            rawResponse: error.response?.data || error.message
        };
    }
});
//# sourceMappingURL=gateway.js.map