import { VerificationAdapter, StandardResult } from "../interface";

export class GSTAdapter implements VerificationAdapter {
    endpoint = "https://uat.risewithprotean.io/api/v2/gst/verify";
    method: "POST" = "POST";
    sourceAuthority = "GSTN (Goods and Services Tax Network)";

    buildRequest(inputs: { gstNumber: string }): object {
        return {
            gstin: inputs.gstNumber,
            consent: "Y"
        };
    }

    normalizeResponse(apiResponse: any): StandardResult {
        const data = apiResponse.data || {};
        return {
            isValid: apiResponse.status === "SUCCESS" && data.status === "Active",
            legalName: data.legal_name || "Unknown",
            rawResponse: apiResponse
        };
    }
}
