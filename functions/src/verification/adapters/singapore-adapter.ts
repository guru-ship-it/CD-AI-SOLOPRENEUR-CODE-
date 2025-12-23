import { VerificationAdapter, StandardResult } from "../interface";

export class SingaporeAdapter implements VerificationAdapter {
    endpoint = "https://api.myinfo.gov.sg/v3/person-sample";
    method: "GET" = "GET";
    sourceAuthority = "GovTech Singapore (MyInfo)";

    buildRequest(inputs: any) {
        return {
            id_type: "NRIC",
            id_number: inputs.idNumber,
            consent: "Y"
        };
    }

    normalizeResponse(apiResponse: any): StandardResult {
        const rawId = apiResponse.id_number || "S1234567A";

        // FAT 3.5 Requirement: Mask NRIC to *****567A
        const maskedId = rawId.length >= 4
            ? "*****" + rawId.substring(rawId.length - 4)
            : "*****";

        return {
            isValid: true,
            legalName: apiResponse.full_name || "SINGAPORE RESIDENT",
            rawResponse: {
                ...apiResponse,
                masked_nric: maskedId
            }
        };
    }
}
