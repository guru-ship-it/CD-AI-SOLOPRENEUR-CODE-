import { VerificationAdapter, StandardResult } from "../interface";

export class DLAdapter implements VerificationAdapter {
    endpoint = "https://uat.risewithprotean.io/api/v2/dl/verify";
    method: "POST" = "POST";

    buildRequest(inputs: any) {
        // DL API is stricter: Needs DOB
        return {
            dl_no: inputs.idNumber,
            dob: inputs.dob // "DD-MM-YYYY"
        };
    }

    normalizeResponse(res: any): StandardResult {
        return {
            isValid: res.status === "ACTIVE",
            legalName: res.holder_name,
            dob: res.dob, // Confirm DOB matches
            rawResponse: res
        };
    }
}
