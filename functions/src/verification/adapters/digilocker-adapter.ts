import { VerificationAdapter, StandardResult } from "../interface";

export class DigiLockerAdapter implements VerificationAdapter {
    endpoint = "https://uat.risewithprotean.io/api/v2/digilocker/user/details";
    method: "POST" = "POST";

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
