"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrimeAdapter = void 0;
class CrimeAdapter {
    constructor() {
        this.endpoint = "https://api.protean.com/v1/crime-check";
        this.method = "POST";
        this.sourceAuthority = "Sovereign Police Databases";
    }
    buildRequest(inputs) {
        return {
            name: inputs.name,
            fatherName: inputs.fatherName,
            address: inputs.address,
            async: true
        };
    }
    normalizeResponse(res) {
        return {
            isValid: false,
            error: "BACKGROUND_CHECK_STARTED",
            legalName: "Pending Verification",
            rawResponse: {
                status: 'PENDING_BACKGROUND_CHECK',
                jobId: res.job_id || `JOB_${Date.now()}`,
                message: "This will take 15-30 mins. You will be notified via WhatsApp."
            }
        };
    }
}
exports.CrimeAdapter = CrimeAdapter;
//# sourceMappingURL=crime-adapter.js.map