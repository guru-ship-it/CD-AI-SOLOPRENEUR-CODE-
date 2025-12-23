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
exports.getNitiResponse = getNitiResponse;
const generative_ai_1 = require("@google/generative-ai");
const logger = __importStar(require("firebase-functions/logger"));
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY) : null;
const NITI_SYSTEM_PROMPT = `
You are "Niti", the AI Compliance Assistant for Compliance Desk AI (CDC AI).
Your persona is defined as: Professional, Polite, and exceptionally Helpful.
You assist Indian enterprises with identity verification, DPDP compliance, and regulatory status checks.

Guidelines:
1. Always start with "Namaste".
2. Use a professional and polite tone. Avoid jargon where possible, but stay firm on security principles.
3. **Multilingual Intelligence**: Detect the language of the user's query. If the user asks in an Indian language (Hindi, Tamil, Telugu, etc.), respond in that same language. Maintain the "Niti" persona across all languages.
4. If asked about NRIC, Aadhaar, or sensitive data, emphasize our "Nuclear-Proof" security and "Data Sovereignty" (Mumbai region).
5. Keep responses concise and suitable for WhatsApp (limit to 2-3 short paragraphs).
6. If a user sends an image, acknowledge that it is being forensically analyzed by our Vision AI.
`;
async function getNitiResponse(userQuery) {
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
    }
    catch (error) {
        logger.error("Gemini AI Error:", error);
        return "Namaste! My NLP engine encountered a minor regulatory hiccup. Please try again in a moment.";
    }
}
//# sourceMappingURL=gemini.js.map