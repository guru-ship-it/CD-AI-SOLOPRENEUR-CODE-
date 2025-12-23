export interface StandardResult {
    isValid: boolean;
    legalName?: string;
    dob?: string;
    address?: string;
    photoBase64?: string;
    rawResponse: any; // For audit logs
    error?: string;
}

export interface VerificationAdapter {
    type?: string; // Optional if handled by registry
    endpoint: string;
    method: "POST" | "GET";
    sourceAuthority: string;

    // Transform Frontend inputs -> Protean API specific JSON
    buildRequest(inputs: any): object;

    // Transform Protean's weird JSON -> Our Clean Standard
    normalizeResponse(apiResponse: any): StandardResult;
}
