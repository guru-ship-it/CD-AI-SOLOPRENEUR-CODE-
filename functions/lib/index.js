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
exports.verifyIdentity = exports.sendDailyReport = exports.checkApiHealth = exports.processBatch = exports.generateCertificate = exports.processCrimeCheck = exports.aggregateHourlyStats = exports.checkAndDeductCredits = exports.topUpWallet = exports.verifyDocument = exports.whatsappWebhook = exports.adminSuperLogin = exports.bleachOldDocs = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
exports.bleachOldDocs = (0, scheduler_1.onSchedule)({
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
exports.adminSuperLogin = (0, https_1.onRequest)({ region: "asia-south1" }, async (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'];
    logger.error(`CRITICAL SECURITY BREACH: Unauthorized access attempt to Honeypot /admin-super-login from IP: ${ip}. Initiating protocol: IP_BAN.`);
    res.status(403).send("<h1>FATAL ERROR: SECURITY PROTOCOL ACTIVATED</h1><p>Your IP has been logged and blacklisted by the CDC AI Fortress Defense System.</p>");
});
var whatsapp_1 = require("./whatsapp");
Object.defineProperty(exports, "whatsappWebhook", { enumerable: true, get: function () { return whatsapp_1.whatsappWebhook; } });
var gateway_1 = require("./verification/gateway");
Object.defineProperty(exports, "verifyDocument", { enumerable: true, get: function () { return gateway_1.verifyDocument; } });
var service_1 = require("./billing/service");
Object.defineProperty(exports, "topUpWallet", { enumerable: true, get: function () { return service_1.topUpWallet; } });
Object.defineProperty(exports, "checkAndDeductCredits", { enumerable: true, get: function () { return service_1.checkAndDeductCredits; } });
var analytics_1 = require("./analytics");
Object.defineProperty(exports, "aggregateHourlyStats", { enumerable: true, get: function () { return analytics_1.aggregateHourlyStats; } });
var worker_1 = require("./verification/worker");
Object.defineProperty(exports, "processCrimeCheck", { enumerable: true, get: function () { return worker_1.processCrimeCheck; } });
var certificate_1 = require("./verification/certificate");
Object.defineProperty(exports, "generateCertificate", { enumerable: true, get: function () { return certificate_1.generateCertificate; } });
var batch_1 = require("./verification/batch");
Object.defineProperty(exports, "processBatch", { enumerable: true, get: function () { return batch_1.processBatch; } });
var health_1 = require("./health");
Object.defineProperty(exports, "checkApiHealth", { enumerable: true, get: function () { return health_1.checkApiHealth; } });
var notifications_v2_1 = require("./notifications_v2");
Object.defineProperty(exports, "sendDailyReport", { enumerable: true, get: function () { return notifications_v2_1.sendDailyReport; } });
exports.verifyIdentity = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    return { status: "VERIFIED", message: "TypeScript Proxy Active (v2)" };
});
//# sourceMappingURL=index.js.map