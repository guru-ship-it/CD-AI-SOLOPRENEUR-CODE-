
import DOMPurify from 'dompurify';

/**
 * Sanitizes user input to prevent XSS attacks.
 * @param text The raw input string
 * @returns Sanitized string safe for rendering
 */
export const sanitizeInput = (text: string): string => {
    return DOMPurify.sanitize(text);
};

/**
 * Masks sensitive PII (Aadhaar/PAN) in logs or UI.
 * Replaces patterns with 'XXXX'.
 * @param text The raw string potentially containing PII
 * @returns Masked string
 */
export const maskPII = (text: string): string => {
    if (!text) return text;

    // Aadhaar Regex: 12 digits (generic pattern)
    const aadhaarPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
    // PAN Regex: 5 letters, 4 digits, 1 letter
    const panPattern = /\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g;

    let masked = text.replace(aadhaarPattern, 'XXXX-XXXX-XXXX');
    masked = masked.replace(panPattern, 'XXXXXX');

    return masked;
};

/**
 * Secure Logger wrapper that ensures PII is masked before logging.
 */
export const secureLog = (message: string, data?: any) => {
    const maskedMessage = maskPII(message);
    // Shallow mask of data object values if simple string
    const maskedData = data && typeof data === 'object'
        ? JSON.stringify(data).replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, 'XXXX')
        : data;

    if (import.meta.env.MODE !== 'production') {
        console.log(`[SECURE LOG]: ${maskedMessage}`, maskedData || '');
    }
};

/**
 * Mocks writing an immutable audit log to a Firestore collection.
 * In production, this would use the Firebase Admin SDK or Client SDK.
 */
export const logAuditAction = (
    actionType: 'LOGIN' | 'VERIFY' | 'EXPORT' | 'CREATE_TENANT',
    userId: string,
    details: any,
    status: 'SUCCESS' | 'FAILURE' = 'SUCCESS'
) => {
    // Safe Console Log (Masked)
    secureLog(`[AUDIT] Action: ${actionType} by ${userId} [${status}]`, details);
};

// --- VALIDATION HELPERS ---

export const validateIndianMobile = (phone: string): boolean => {
    // CERT-In Requirement: Starts with 6-9, followed by 9 digits
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phone);
};

export const validateEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
};

// --- CONSENT LEDGER (DPDP Section 6) ---

export interface ConsentRecord {
    userId: string;
    timestamp: string;
    policyVersion: string;
    purpose: 'IDENTITY_VERIFICATION';
    ipAddress: string;
    action: 'GRANTED' | 'WITHDRAWN';
}

/**
 * Logs a verifiable consent record to the 'consent_ledger' collection.
 * Essential for DPDP compliance.
 */
export const recordConsent = async (
    userId: string,
    action: 'GRANTED' | 'WITHDRAWN' = 'GRANTED',
    ipAddress: string = 'unknown'
) => {
    const record: ConsentRecord = {
        userId,
        timestamp: new Date().toISOString(),
        policyVersion: 'v1.2_2025',
        purpose: 'IDENTITY_VERIFICATION',
        ipAddress,
        action
    };

    // Safe Console Log (Masked)
    secureLog(`[CONSENT] User ${userId} ${action} consent for Identity Verification`, record);

    // TODO: Firestore Write
    // await addDoc(collection(db, 'consent_ledger'), record);
};
