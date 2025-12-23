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
exports.sendDailyReport = exports.notifyRejection = void 0;
const sgMail = __importStar(require("@sendgrid/mail"));
const admin = __importStar(require("firebase-admin"));
const scheduler_1 = require("firebase-functions/v2/scheduler");
const logger = __importStar(require("firebase-functions/logger"));
const notifications_1 = require("./notifications");
const secrets_1 = require("./secrets");
const db = admin.firestore();
const notifyRejection = async (tenantId, docData, reason) => {
    try {
        const walletDoc = await db.collection('wallets').doc(tenantId).get();
        if (!walletDoc.exists) {
            logger.warn(`NotifyRejection: No wallet/contact info found for tenant ${tenantId}`);
            return;
        }
        const { contactEmail, contactPhone } = walletDoc.data() || {};
        if (contactPhone) {
            await (0, notifications_1.sendWhatsAppTemplate)(contactPhone, 'verification_rejected', [docData.name, reason])
                .catch(e => logger.error(`WhatsApp Rejection Alert Failed for ${tenantId}:`, e.message));
        }
        if (contactEmail) {
            sgMail.setApiKey(secrets_1.sendgridKey.value());
            const msg = {
                to: contactEmail,
                from: 'alerts@compliancedesk.ai',
                subject: `🔴 Verification REJECTED: ${docData.name}`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
                        <h3 style="color: #e11d48;">Verification Failed</h3>
                        <p><strong>Entity Name:</strong> ${docData.name}</p>
                        <p><strong>ID Number:</strong> ${docData.idNumber || 'N/A'}</p>
                        <p style="color: #e11d48; font-weight: bold;"><strong>Reason:</strong> ${reason}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p>Please login to the Compliance Desk Dashboard to review the full audit log.</p>
                        <a href="https://compliancedesk.ai/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #0f172a; color: white; text-decoration: none; border-radius: 5px;">View Dashboard</a>
                    </div>
                `
            };
            await sgMail.send(msg).catch(e => logger.error(`Email Rejection Alert Failed for ${tenantId}:`, e.message));
        }
    }
    catch (error) {
        logger.error(`Rejection Notification Flow Failed:`, error.message);
    }
};
exports.notifyRejection = notifyRejection;
exports.sendDailyReport = (0, scheduler_1.onSchedule)({
    schedule: "0 19 * * *",
    timeZone: "Asia/Kolkata",
    region: "asia-south1",
    secrets: [secrets_1.sendgridKey]
}, async (event) => {
    const tenants = await db.collection('wallets').get();
    for (const tenantDoc of tenants.docs) {
        const tenantId = tenantDoc.id;
        const { contactEmail } = tenantDoc.data();
        if (!contactEmail)
            continue;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const verifications = await db.collection('verifications')
            .where('tenantId', '==', tenantId)
            .where('timestamp', '>=', startOfDay)
            .get();
        if (verifications.empty)
            continue;
        let passed = 0;
        let failed = 0;
        verifications.docs.forEach(doc => {
            const data = doc.data();
            if (data.status === 'VALID' || data.result?.isValid) {
                passed++;
            }
            else {
                failed++;
            }
        });
        sgMail.setApiKey(secrets_1.sendgridKey.value());
        const msg = {
            to: contactEmail,
            from: 'reports@compliancedesk.ai',
            subject: `Daily Compliance Report - ${new Date().toLocaleDateString('en-IN')}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 12px;">
                    <h2 style="color: #0f172a; border-bottom: 2px solid #10b981; padding-bottom: 10px;">Daily Activity Summary</h2>
                    <p>Here is the identity verification overview for today:</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr style="background-color: #f8fafc;">
                            <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong>Total Scanned</strong></td>
                            <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">${verifications.size}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong style="color: #10b981;">Passed</strong></td>
                            <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">${passed}</td>
                        </tr>
                        <tr style="background-color: #fef2f2;">
                            <td style="padding: 12px; border: 1px solid #e2e8f0;"><strong style="color: #ef4444;">Failed / Flagged</strong></td>
                            <td style="padding: 12px; border: 1px solid #e2e8f0; text-align: right;">${failed}</td>
                        </tr>
                    </table>
                    <div style="margin-top: 30px; padding: 15px; background: #f1f5f9; border-radius: 8px; font-size: 13px; color: #64748b;">
                        * This is an automated summary generated by ComplianceDesk.ai. Login as an admin to download detailed CSV logs.
                    </div>
                </div>
            `
        };
        try {
            await sgMail.send(msg);
            logger.info(`Daily Report Sent to ${tenantId} (${contactEmail})`);
        }
        catch (e) {
            logger.error(`Daily Report Failed for ${tenantId}:`, e.message);
        }
    }
});
//# sourceMappingURL=notifications_v2.js.map