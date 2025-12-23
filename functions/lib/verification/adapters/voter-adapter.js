"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoterAdapter = void 0;
class VoterAdapter {
    constructor() {
        this.endpoint = "https://uat.risewithprotean.io/api/v2/voter/verify";
        this.method = "POST";
        this.sourceAuthority = "Election Commission of India";
    }
    buildRequest(inputs) {
        return {
            epic_number: inputs.idNumber,
            consent: "Y"
        };
    }
    normalizeResponse(apiResponse) {
        const data = apiResponse.data || {};
        return {
            isValid: apiResponse.status === "SUCCESS" && !!data.epic_number,
            legalName: data.full_name || "Unknown",
            rawResponse: apiResponse
        };
    }
}
exports.VoterAdapter = VoterAdapter;
//# sourceMappingURL=voter-adapter.js.map