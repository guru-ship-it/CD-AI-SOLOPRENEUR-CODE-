import { VerificationAdapter, StandardResult } from "../interface";

export class VoterAdapter implements VerificationAdapter {
    endpoint = "https://api.protean.com/verification/voter";
    method: "POST" = "POST";

    buildRequest(inputs: { idNumber: string }): object {
        return {
            epic_number: inputs.idNumber,
            consent: "Y"
        };
    }

    normalizeResponse(apiResponse: any): StandardResult {
        const data = apiResponse.data || {};
        return {
            isValid: apiResponse.status === "SUCCESS" && !!data.epic_number,
            legalName: data.full_name || "Unknown",
            rawResponse: apiResponse
        };
    }
}
