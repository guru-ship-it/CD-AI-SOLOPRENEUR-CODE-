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
exports.sendSystemEmail = void 0;
const sgMail = __importStar(require("@sendgrid/mail"));
const params_1 = require("firebase-functions/params");
const sendgridKey = (0, params_1.defineSecret)('SENDGRID_API_KEY');
const sendSystemEmail = async (to, templateId, dynamicData) => {
    sgMail.setApiKey(sendgridKey.value());
    const msg = {
        to: to,
        from: 'no-reply@compliancedesk.ai',
        templateId: templateId,
        dynamic_template_data: dynamicData,
    };
    try {
        await sgMail.send(msg);
    }
    catch (error) {
        console.error("Mailer Error: Failed to send system email.", error);
        throw error;
    }
};
exports.sendSystemEmail = sendSystemEmail;
//# sourceMappingURL=mailer.js.map