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
exports.checkApiHealth = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
const api_client_1 = require("./verification/api-client");
exports.checkApiHealth = (0, scheduler_1.onSchedule)({
    schedule: "every 10 minutes",
    region: "asia-south1",
    timeoutSeconds: 30,
    secrets: []
}, async (event) => {
    const statusRef = admin.firestore().collection("system_settings").doc("status");
    let proteanStatus = "ONLINE";
    let digilockerStatus = "ONLINE";
    let alertMessage = "";
    const proteanStart = Date.now();
    try {
        const response = await (0, api_client_1.resilientCall)({
            method: 'GET',
            url: "https://uat.risewithprotean.io/api/v2/pan/health",
            timeout: 5000
        });
        const latency = Date.now() - proteanStart;
        if (latency > 3000) {
            proteanStatus = "DEGRADED";
            alertMessage = "NSDL is experiencing higher than usual latency.";
        }
        else if (response.status !== 200) {
            proteanStatus = "DOWN";
            alertMessage = "NSDL Services are currently unavailable.";
        }
    }
    catch (error) {
        logger.error("Protean Health Check Failed:", error.message);
        proteanStatus = "DOWN";
        alertMessage = "NSDL Services are currently offline.";
    }
    await statusRef.set({
        protean_status: proteanStatus,
        digilocker_status: digilockerStatus,
        global_alert: alertMessage,
        updated_at: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    logger.info(`Health Check Completed: Protean=${proteanStatus}, DigiLocker=${digilockerStatus}`);
});
//# sourceMappingURL=health.js.map