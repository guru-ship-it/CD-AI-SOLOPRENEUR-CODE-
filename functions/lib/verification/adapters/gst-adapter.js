"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GSTAdapter = void 0;
class GSTAdapter {
    constructor() {
        this.endpoint = "https://uat.risewithprotean.io/api/v2/gst/verify";
        this.method = "POST";
        this.sourceAuthority = "GSTN (Goods and Services Tax Network)";
    }
    buildRequest(inputs) {
        return {
            gstin: inputs.gstNumber,
            consent: "Y"
        };
    }
    normalizeResponse(apiResponse) {
        const data = apiResponse.data || {};
        return {
            isValid: apiResponse.status === "SUCCESS" && data.status === "Active",
            legalName: data.legal_name || "Unknown",
            rawResponse: apiResponse
        };
    }
}
exports.GSTAdapter = GSTAdapter;
//# sourceMappingURL=gst-adapter.js.map