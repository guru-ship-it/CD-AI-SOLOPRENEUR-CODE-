import * as sgMail from '@sendgrid/mail';
import axios from 'axios';
import { sendgridKey, waToken, waPhoneId } from './secrets';

// --- EMAIL SENDER ---
export const sendLowBalanceEmail = async (email: string, balance: number) => {
    sgMail.setApiKey(sendgridKey.value());
    const msg = {
        to: email,
        from: 'alerts@compliancedesk.ai',
        subject: '⚠️ Action Required: Low Wallet Balance',
        html: `<h3>Wallet Alert</h3><p>Your current balance is <strong>₹${balance}</strong>. Please recharge to ensure uninterrupted verifications.</p>`
    };
    await sgMail.send(msg);
};

// --- WHATSAPP HELPER ---
export const sendWhatsAppTemplate = async (phone: string, templateName: string, parameters: string[]) => {
    const url = `https://graph.facebook.com/v17.0/${waPhoneId.value()}/messages`;

    await axios.post(url, {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
            name: templateName,
            language: { code: "en" },
            components: [
                {
                    type: "body",
                    parameters: parameters.map(p => ({ type: "text", text: p }))
                }
            ]
        }
    }, {
        headers: { Authorization: `Bearer ${waToken.value()}` }
    });
};

// --- WHATSAPP SENDER (LEGACY/LOW BALANCE) ---
export const sendWhatsAppAlert = async (phone: string, balance: number) => {
    return sendWhatsAppTemplate(phone, "wallet_low_balance", [balance.toString()]);
};
