import { VerificationAdapter, StandardResult } from "../interface";

export class PanAdapter implements VerificationAdapter {
    endpoint = "https://uat.risewithprotean.io/api/v2/pan/verify";
    method: "POST" = "POST";

    buildRequest(inputs: any) {
        return { pan: inputs.idNumber }; // PAN API expects simple { pan: "..." }
    }

    normalizeResponse(res: any): StandardResult {
        // Protean PAN response structure logic
        const isValid = res.status === "VALID" || res.pan_status === "E";
        return {
            isValid,
            legalName: res.full_name || res.pan_holder_name, // Fix inconsistent naming
            rawResponse: res
        };
    }
}
