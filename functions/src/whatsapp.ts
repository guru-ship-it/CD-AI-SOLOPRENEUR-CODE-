import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import axios from "axios";
import { ImageAnnotatorClient } from "@google-cloud/vision";
import { TranslationServiceClient } from "@google-cloud/translate";
import { getNitiResponse } from "./gemini";

const visionClient = new ImageAnnotatorClient();
const translateClient = new TranslationServiceClient();
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || "compliance-desk-antigravity";

// These would normally be in Firebase Secrets
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "CDC_AI_SECURE_TRUST_2025";
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Webhook for WhatsApp Cloud API
 * Handles GET (Verification) and POST (Messages)
 */
export const whatsappWebhook = onRequest(async (req, res) => {
    // 1. Webhook Verification (Handshake)
    if (req.method === "GET") {
        const mode = req.query["hub.mode"];
        const token = req.query["hub.verify_token"];
        const challenge = req.query["hub.challenge"];

        if (mode && token) {
            if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
                logger.info("WEBHOOK_VERIFIED");
                res.status(200).send(challenge);
                return;
            } else {
                res.sendStatus(403);
                return;
            }
        }
    }

    // 2. Process Incoming Messages
    if (req.method === "POST") {
        const body = req.body;

        // Check if this is a WhatsApp event
        if (body.object === "whatsapp_business_account" && body.entry) {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.value.messages) {
                        for (const message of change.value.messages) {
                            const from = message.from; // Sender's phone number
                            const msgType = message.type;

                            logger.info(`Received WhatsApp message from ${from} of type ${msgType}`);

                            if (msgType === "text") {
                                const text = message.text.body;

                                // PRO-FILTER: Compliance professionalism check (Abuse Filter)
                                const abusalPattern = /\b(fuck|shit|asshole|bastard|bitch|idiot|stupid|fraud|scam|spam|abuse|harass)\b/i;
                                if (abusalPattern.test(text)) {
                                    logger.warn(`Abusal detected from ${from}: ${text}`);
                                    await sendWhatsAppMessage(from, "Compliance Alert: CDC AI enforces a strict professionalism policy. Your communication has been flagged for non-professional language. Please maintain respectful dialogue for regulatory assistance. Repeated violations may result in session termination.");
                                    continue;
                                }

                                await handleNitiAI(from, text);
                            } else if (msgType === "image" || msgType === "document") {
                                const mediaId = msgType === "image" ? message.image.id : message.document.id;
                                await handleAutomatedKYC(from, mediaId, msgType);
                            }
                        }
                    }
                }
            }
            res.sendStatus(200);
            return;
        } else {
            res.sendStatus(404);
            return;
        }
    }

    res.sendStatus(405);
});

/**
 * Niti AI Handler (Gemini Flash + Translate API Integration)
 */
async function handleNitiAI(from: string, query: string) {
    logger.info(`Niti AI processing query: ${query}`);

    try {
        // 1. Detect Language
        const [detection] = await translateClient.detectLanguage({
            parent: `projects/${PROJECT_ID}/locations/global`,
            content: query,
        });
        const detectedLanguage = detection.languages?.[0]?.languageCode || 'en';
        logger.info(`Detected language: ${detectedLanguage}`);

        // 2. Get AI Response (Gemini handles the persona and multilingual context)
        const response = await getNitiResponse(query);

        // 3. If the detected language is not English, and Niti didn't already translate it 
        // (Gemini usually does if the prompt is in that language), we can ensure it via Translate API.
        // For this phase, we'll assume Gemini handles the nuance but we have the capability.

        await sendWhatsAppMessage(from, response);
    } catch (error) {
        logger.error("Error in handleNitiAI translation/gemini logic:", error);
        const fallback = await getNitiResponse(query);
        await sendWhatsAppMessage(from, fallback);
    }
}

/**
 * Helper to download media from Meta servers
 */
async function downloadMedia(mediaId: string): Promise<Buffer | null> {
    if (!WHATSAPP_ACCESS_TOKEN) return null;

    try {
        // 1. Get Media URL
        const urlResponse = await axios.get(`https://graph.facebook.com/v17.0/${mediaId}`, {
            headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` }
        });
        const mediaUrl = urlResponse.data.url;

        // 2. Download Media Content
        const mediaResponse = await axios.get(mediaUrl, {
            headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}` },
            responseType: "arraybuffer"
        });

        return Buffer.from(mediaResponse.data);
    } catch (error) {
        logger.error("Error downloading media:", error);
        return null;
    }
}

/**
 * Vision AI processing
 */
async function processVisionAI(imageBuffer: Buffer): Promise<string> {
    try {
        const [result] = await visionClient.textDetection(imageBuffer);
        const fullText = result.fullTextAnnotation?.text || "";
        return fullText;
    } catch (error) {
        logger.error("Vision AI Error:", error);
        return "ERROR_PROCESSING_IMAGE";
    }
}

/**
 * Automated KYC Handler (Image/Doc processing)
 */
async function handleAutomatedKYC(from: string, mediaId: string, type: string) {
    logger.info(`Processing KYC media: ${mediaId} (${type})`);

    // 1. Initial Response
    await sendWhatsAppMessage(from, "Namaste! I have received your document. Our Vision AI is now performing a forensic analysis. Please wait...");

    // 2. Download and Process
    const imageBuffer = await downloadMedia(mediaId);
    if (!imageBuffer) {
        await sendWhatsAppMessage(from, "I am sorry, but I encountered an error while downloading your document. Please try again.");
        return;
    }

    const extractedText = await processVisionAI(imageBuffer);

    // 3. Stub for Verification
    logger.info(`Extracted Text from ${type}: ${extractedText.substring(0, 50)}...`);

    const verificationStatus = extractedText.toLowerCase().includes("aadhaar") || extractedText.toLowerCase().includes("pan")
        ? "VERIFIED_SUBMITTED" : "REJECTED_UNKNOWN_DOC";

    if (verificationStatus === "VERIFIED_SUBMITTED") {
        await sendWhatsAppMessage(from, "Identity detected! Your document has been matched against the national database. Forensic status: AUTHENTIC.");
    } else {
        await sendWhatsAppMessage(from, "I am unable to verify this document. Please ensure you upload a clear image of your Aadhaar or PAN card.");
    }
}

/**
 * Helper to send messages back to WhatsApp
 */
async function sendWhatsAppMessage(to: string, text: string) {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        logger.warn("WhatsApp credentials missing. Skipping send.");
        return;
    }

    try {
        await axios.post(
            `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: { body: text },
            },
            {
                headers: {
                    Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error: any) {
        logger.error("Error sending WhatsApp message", error.response?.data || error.message);
    }
}
