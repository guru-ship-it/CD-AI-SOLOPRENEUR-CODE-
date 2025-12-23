import * as sgMail from '@sendgrid/mail';
import { defineSecret } from 'firebase-functions/params';

/**
 * SendGrid Transactional Email Service
 * High deliverability service for system-critical emails.
 */
const sendgridKey = defineSecret('SENDGRID_API_KEY');

export const sendSystemEmail = async (to: string, templateId: string, dynamicData: any) => {
    // Lazily set API key to ensure secret is available
    sgMail.setApiKey(sendgridKey.value());

    const msg = {
        to: to,
        from: 'no-reply@compliancedesk.ai',
        templateId: templateId, // Use SendGrid Dynamic Templates
        dynamic_template_data: dynamicData,
    };

    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error("Mailer Error: Failed to send system email.", error);
        throw error;
    }
};
