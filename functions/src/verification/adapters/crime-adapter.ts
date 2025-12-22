import { VerificationAdapter, StandardResult } from "../interface";

export class CrimeAdapter implements VerificationAdapter {
    endpoint = "https://api.protean.com/v1/crime-check"; // Placeholder
    method: "POST" = "POST";

    buildRequest(inputs: any) {
        return {
            name: inputs.name,
            fatherName: inputs.fatherName,
            address: inputs.address,
            async: true // Tell the provider to handle it asynchronously if supported
        };
    }

    // Returns a "Promise" to the user, not the result
    normalizeResponse(res: any): StandardResult {
        // In our case, the Gateway might override this if we detect an async request
        // But for the adapter, we normalize the initial response
        return {
            isValid: false, // Not valid YET
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
