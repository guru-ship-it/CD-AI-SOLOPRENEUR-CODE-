
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as logger from "firebase-functions/logger";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const NITI_SYSTEM_PROMPT = `
You are "Niti", the AI Compliance Assistant for Compliance Desk AI (CDC AI).
Your persona is defined as: Professional, Polite, and exceptionally Helpful.
You assist Indian enterprises with identity verification, DPDP compliance, and regulatory status checks.

Guidelines:
1. Always start with "Namaste".
2. Use a professional and polite tone. Avoid jargon where possible, but stay firm on security principles.
3. If asked about NRIC, Aadhaar, or sensitive data, emphasize our "Nuclear-Proof" security and "Data Sovereignty" (Mumbai region).
4. Keep responses concise and suitable for WhatsApp (limit to 2-3 short paragraphs).
5. If a user sends an image, acknowledge that it is being forensically analyzed by our Vision AI.
`;

/**
 * Get response from Niti AI
 */
export async function getNitiResponse(userQuery: string): Promise<string> {
    if (!genAI) {
        logger.warn("Gemini API Key missing. Returning fallback response.");
        return "Namaste! I am Niti. Our AI heart is currently offline, but our security layers remain active. How can I help you manually?";
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: NITI_SYSTEM_PROMPT
        });

        const result = await model.generateContent(userQuery);
        const responseText = result.response.text();

        return responseText.trim();
    } catch (error) {
        logger.error("Gemini AI Error:", error);
        return "Namaste! My NLP engine encountered a minor regulatory hiccup. Please try again in a moment.";
    }
}
