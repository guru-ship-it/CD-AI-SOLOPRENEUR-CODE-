import { onCall, HttpsError } from "firebase-functions/v2/https";
import axios from "axios";
import { defineSecret } from "firebase-functions/params";
import { ADAPTER_REGISTRY } from "./registry";

const proteanApiKey = defineSecret("PROTEAN_API_KEY");
const proteanBearerToken = defineSecret("PROTEAN_BEARER_TOKEN");

export const verifyDocument = onCall({ secrets: [proteanApiKey, proteanBearerToken], region: "asia-south1" }, async (request) => {
    const { type, inputs } = request.data;

    // 1. Validate Adapter Exists
    const adapter = ADAPTER_REGISTRY[type];
    if (!adapter) {
        throw new HttpsError("invalid-argument", `Unsupported ID Type: ${type}`);
    }

    try {
        // 2. Build Payload
        const payload = adapter.buildRequest(inputs);

        // 3. Secure Call (Injecting Secrets Centrally)
        const response = await axios({
            method: adapter.method,
            url: adapter.endpoint,
            data: payload,
            headers: {
                'content-type': 'application/json',
                'apikey': proteanApiKey.value(),
                'Authorization': `Bearer ${proteanBearerToken.value()}`
            }
        });

        // 4. Normalize & Return
        return adapter.normalizeResponse(response.data);

    } catch (error: any) {
        console.error(`Protean Verification Failed [${type}]:`, error);
        // Return a safe error so frontend doesn't crash
        return {
            isValid: false,
            error: "External API Verification Failed",
            rawResponse: error.response?.data || error.message
        };
    }
});
