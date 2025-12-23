import { VerificationAdapter, StandardResult } from "../interface";

export class VoterAdapter implements VerificationAdapter {
    endpoint = "https://uat.risewithprotean.io/api/v2/voter/verify";
    method: "POST" = "POST";
    sourceAuthority = "Election Commission of India";

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
