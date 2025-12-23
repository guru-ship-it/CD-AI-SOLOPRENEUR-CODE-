import * as sgMail from '@sendgrid/mail';
import * as admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as logger from "firebase-functions/logger";
import { sendWhatsAppTemplate } from './notifications';
import { sendgridKey } from './secrets';

const db = admin.firestore();

/**
 * --- 1. IMMEDIATE REJECTION ALERT ---
 * Notifies the tenant admin via Email and WhatsApp when a verification is rejected.
 */
export const notifyRejection = async (tenantId: string, docData: any, reason: string) => {
    try {
        // Fetch Admin Details from Wallet (Source of Truth for billing/alerts)
        const walletDoc = await db.collection('wallets').doc(tenantId).get();
        if (!walletDoc.exists) {
            logger.warn(`NotifyRejection: No wallet/contact info found for tenant ${tenantId}`);
            return;
        }

        const { contactEmail, contactPhone } = walletDoc.data() || {};

        // A. Send WhatsApp (Instant) - Template: verification_rejected
        if (contactPhone) {
            await sendWhatsAppTemplate(contactPhone, 'verification_rejected', [docData.name, reason])
                .catch(e => logger.error(`WhatsApp Rejection Alert Failed for ${tenantId}:`, e.message));
        }

        // B. Send Email (Detail)
        if (contactEmail) {
            sgMail.setApiKey(sendgridKey.value());
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
    } catch (error: any) {
        logger.error(`Rejection Notification Flow Failed:`, error.message);
    }
};

/**
 * --- 2. DAILY AUTOMATED SUMMARY (CRON JOB) ---
 * Aggregates all activity for the day and sends a summary report to each tenant admin.
 * Runs every day at 19:00 IST (Asia/Kolkata)
 */
export const sendDailyReport = onSchedule({
    schedule: "0 19 * * *", // 7:00 PM Daily
    timeZone: "Asia/Kolkata",
    region: "asia-south1",
    secrets: [sendgridKey]
}, async (event) => {
    // 1. Get all tenants with an active wallet
    const tenants = await db.collection('wallets').get();

    for (const tenantDoc of tenants.docs) {
        const tenantId = tenantDoc.id;
        const { contactEmail } = tenantDoc.data();

        if (!contactEmail) continue;

        // 2. Query Today's Activity
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const verifications = await db.collection('verifications')
            .where('tenantId', '==', tenantId)
            .where('timestamp', '>=', startOfDay)
            .get();

        if (verifications.empty) continue; // Skip if no activity

        // 3. Calculate Stats
        let passed = 0;
        let failed = 0;
        verifications.docs.forEach(doc => {
            const data = doc.data();
            if (data.status === 'VALID' || data.result?.isValid) {
                passed++;
            } else {
                failed++;
            }
        });

        // 4. Send Summary Email via SendGrid
        sgMail.setApiKey(sendgridKey.value());
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
        } catch (e: any) {
            logger.error(`Daily Report Failed for ${tenantId}:`, e.message);
        }
    }
});
