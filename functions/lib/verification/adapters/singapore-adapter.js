"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingaporeAdapter = void 0;
class SingaporeAdapter {
    constructor() {
        this.endpoint = "https://api.myinfo.gov.sg/v3/person-sample";
        this.method = "GET";
        this.sourceAuthority = "GovTech Singapore (MyInfo)";
    }
    buildRequest(inputs) {
        return {
            id_type: "NRIC",
            id_number: inputs.idNumber,
            consent: "Y"
        };
    }
    normalizeResponse(apiResponse) {
        const rawId = apiResponse.id_number || "S1234567A";
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
exports.SingaporeAdapter = SingaporeAdapter;
//# sourceMappingURL=singapore-adapter.js.map