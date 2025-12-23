"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DigiLockerAdapter = void 0;
class DigiLockerAdapter {
    constructor() {
        this.endpoint = "https://api.digitallocker.gov.in/public/oauth2/1/token";
        this.method = "POST";
        this.sourceAuthority = "DigiLocker (MeitY)";
    }
    buildRequest(inputs) {
        return { access_token: inputs.accessToken };
    }
    normalizeResponse(res) {
        return {
            isValid: true,
            legalName: res.name,
            dob: res.dob,
            rawResponse: res
        };
    }
}
exports.DigiLockerAdapter = DigiLockerAdapter;
//# sourceMappingURL=digilocker-adapter.js.map