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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppAlert = exports.sendWhatsAppTemplate = exports.sendLowBalanceEmail = void 0;
const sgMail = __importStar(require("@sendgrid/mail"));
const axios_1 = __importDefault(require("axios"));
const secrets_1 = require("./secrets");
const sendLowBalanceEmail = async (email, balance) => {
    sgMail.setApiKey(secrets_1.sendgridKey.value());
    const msg = {
        to: email,
        from: 'alerts@compliancedesk.ai',
        subject: '⚠️ Action Required: Low Wallet Balance',
        html: `<h3>Wallet Alert</h3><p>Your current balance is <strong>₹${balance}</strong>. Please recharge to ensure uninterrupted verifications.</p>`
    };
    await sgMail.send(msg);
};
exports.sendLowBalanceEmail = sendLowBalanceEmail;
const sendWhatsAppTemplate = async (phone, templateName, parameters) => {
    const url = `https://graph.facebook.com/v17.0/${secrets_1.waPhoneId.value()}/messages`;
    await axios_1.default.post(url, {
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
        headers: { Authorization: `Bearer ${secrets_1.waToken.value()}` }
    });
};
exports.sendWhatsAppTemplate = sendWhatsAppTemplate;
const sendWhatsAppAlert = async (phone, balance) => {
    return (0, exports.sendWhatsAppTemplate)(phone, "wallet_low_balance", [balance.toString()]);
};
exports.sendWhatsAppAlert = sendWhatsAppAlert;
//# sourceMappingURL=notifications.js.map