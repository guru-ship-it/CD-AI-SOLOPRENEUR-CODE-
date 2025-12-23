"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanAdapter = void 0;
class PanAdapter {
    constructor() {
        this.endpoint = "https://uat.risewithprotean.io/api/v2/pan/verify";
        this.method = "POST";
        this.sourceAuthority = "NSDL / Protean";
    }
    buildRequest(inputs) {
        return { pan: inputs.idNumber };
    }
    normalizeResponse(res) {
        const isValid = res.status === "VALID" || res.pan_status === "E";
        return {
            isValid,
            legalName: res.full_name || res.pan_holder_name,
            rawResponse: res
        };
    }
}
exports.PanAdapter = PanAdapter;
//# sourceMappingURL=pan-adapter.js.map