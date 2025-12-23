"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLAdapter = void 0;
class DLAdapter {
    constructor() {
        this.endpoint = "https://uat.risewithprotean.io/api/v2/dl/verify";
        this.method = "POST";
        this.sourceAuthority = "MoRTH (Parivahan)";
    }
    buildRequest(inputs) {
        return {
            dl_no: inputs.idNumber,
            dob: inputs.dob
        };
    }
    normalizeResponse(res) {
        return {
            isValid: res.status === "ACTIVE",
            legalName: res.holder_name,
            dob: res.dob,
            rawResponse: res
        };
    }
}
exports.DLAdapter = DLAdapter;
//# sourceMappingURL=dl-adapter.js.map