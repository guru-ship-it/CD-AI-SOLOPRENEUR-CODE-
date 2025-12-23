import { VerificationAdapter, StandardResult } from "../interface";

export class DigiLockerAdapter implements VerificationAdapter {
    endpoint = "https://api.digitallocker.gov.in/public/oauth2/1/token";
    method: "POST" = "POST";
    sourceAuthority = "DigiLocker (MeitY)";

    buildRequest(inputs: any) {
        return { access_token: inputs.accessToken };
    }

    normalizeResponse(res: any): StandardResult {
        return {
            isValid: true, // If we got data, it's valid
            legalName: res.name,
            dob: res.dob,
            rawResponse: res
        };
    }
}
