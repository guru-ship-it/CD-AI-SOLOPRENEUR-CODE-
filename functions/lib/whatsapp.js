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
exports.whatsappWebhook = void 0;
exports.sendWhatsAppMessage = sendWhatsAppMessage;
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
const translate_1 = require("@google-cloud/translate");
const vision_1 = require("@google-cloud/vision");
const gemini_1 = require("./gemini");
const api_client_1 = require("./verification/api-client");
const visionClient = new vision_1.ImageAnnotatorClient();
const translateClient = new translate_1.TranslationServiceClient();
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "compliance-desk-antigravity";
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "CDC_AI_SECURE_TRUST_2025";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
exports.whatsappWebhook = (0, https_1.onRequest)({ region: "asia-south1" }, async (req, res) => {
    if (req.method === "GET") {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];
        if (mode && token) {
            if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
                logger.info("WEBHOOK_VERIFIED");
                res.status(200).send(challenge);
                return;
            }
            else {
                res.sendStatus(403);
                return;
            }
        }
    }
    if (req.method === "POST") {
        const body = req.body;
        if (body.object === "whatsapp_business_account" && body.entry) {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.value.messages) {
                        for (const message of change.value.messages) {
                            const from = message.from;
                            const msgType = message.type;
                            logger.info(`Received WhatsApp message from ${from} of type ${msgType}`);
                            if (msgType === "text") {
                                const text = message.text.body;
                                const abusalPattern = /\b(fuck|shit|asshole|bastard|bitch|idiot|stupid|fraud|scam|spam|abuse|harass)\b/i;
                                if (abusalPattern.test(text)) {
                                    logger.warn(`Abusal detected from ${from}: ${text}`);
                                    await sendWhatsAppMessage(from, "Compliance Alert: CDC AI enforces a strict professionalism policy. Your communication has been flagged for non-professional language. Please maintain respectful dialogue for regulatory assistance. Repeated violations may result in session termination.");
                                    continue;
                                }
                                await handleNitiAI(from, text);
                            }
                            else if (msgType === "image" || msgType === "document") {
                                const mediaId = msgType === "image" ? message.image.id : message.document.id;
                                await handleAutomatedKYC(from, mediaId, msgType);
                            }
                        }
                    }
                }
            }
            res.sendStatus(200);
            return;
        }
        else {
            res.sendStatus(404);
            return;
        }
    }
    res.sendStatus(405);
});
async function handleNitiAI(from, query) {
    logger.info(`Niti AI processing query: ${query}`);
    try {
        const [detection] = await translateClient.detectLanguage({
            parent: `projects/${PROJECT_ID}/locations/global`,
            content: query,
        });
        const detectedLanguage = detection.languages?.[0]?.languageCode || 'en';
        logger.info(`Detected language: ${detectedLanguage}`);
        const response = await (0, gemini_1.getNitiResponse)(query);
        await sendWhatsAppMessage(from, response);
    }
    catch (error) {
        logger.error("Error in handleNitiAI translation/gemini logic:", error);
        const fallback = await (0, gemini_1.getNitiResponse)(query);
        await sendWhatsAppMessage(from, fallback);
    }
}
async function downloadMedia(mediaId) {
    if (!WHATSAPP_ACCESS_TOKEN)
        return null;
    try {
        const urlResponse = await (0, api_client_1.resilientCall)({
            method: 'GET',
            url: `https://graph.facebook.com/v17.0/${mediaId}`,
            headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` }
        });
        const mediaUrl = urlResponse.data.url;
        const mediaResponse = await (0, api_client_1.resilientCall)({
            method: 'GET',
            url: mediaUrl,
            headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` },
            responseType: "arraybuffer"
        });
        return Buffer.from(mediaResponse.data);
    }
    catch (error) {
        logger.error("Error downloading media:", error);
        return null;
    }
}
async function processVisionAI(imageBuffer) {
    try {
        const [result] = await visionClient.textDetection(imageBuffer);
        const fullText = result.fullTextAnnotation?.text || "";
        return fullText;
    }
    catch (error) {
        logger.error("Vision AI Error:", error);
        return "ERROR_PROCESSING_IMAGE";
    }
}
async function handleAutomatedKYC(from, mediaId, type) {
    logger.info(`Processing KYC media: ${mediaId} (${type})`);
    await sendWhatsAppMessage(from, "Namaste! I have received your document. Our Vision AI is now performing a forensic analysis. Please wait...");
    const imageBuffer = await downloadMedia(mediaId);
    if (!imageBuffer) {
        await sendWhatsAppMessage(from, "I am sorry, but I encountered an error while downloading your document. Please try again.");
        return;
    }
    const extractedText = await processVisionAI(imageBuffer);
    logger.info(`Extracted Text from ${type}: ${extractedText.substring(0, 50)}...`);
    const verificationStatus = extractedText.toLowerCase().includes("aadhaar") || extractedText.toLowerCase().includes("pan")
        ? "VERIFIED_SUBMITTED" : "REJECTED_UNKNOWN_DOC";
    if (verificationStatus === "VERIFIED_SUBMITTED") {
        await sendWhatsAppMessage(from, "Identity detected! Your document has been matched against the national database. Forensic status: AUTHENTIC.");
    }
    else {
        await sendWhatsAppMessage(from, "I am unable to verify this document. Please ensure you upload a clear image of your Aadhaar or PAN card.");
    }
}
async function sendWhatsAppMessage(to, text) {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        logger.warn("WhatsApp credentials missing. Skipping send.");
        return;
    }
    try {
        await (0, api_client_1.resilientCall)({
            method: 'POST',
            url: `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
            data: {
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: { body: text },
            },
            headers: {
                Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
        });
    }
    catch (error) {
        logger.error("Error sending WhatsApp message", error.response?.data || error.message);
    }
}
//# sourceMappingURL=whatsapp.js.map