export interface Transaction {
    amount: number;
    type: 'DEBIT' | 'CREDIT';
    referenceId: string; // Verification ID or Payment ID
    timestamp: Date;
    description?: string;
}

export interface Wallet {
    tenantId: string;
    balance: number;      // e.g., 5000.00
    currency: 'INR';
    lowBalanceThreshold: number; // e.g., 1000 (Trigger WhatsApp Alert)
}

export const VERIFICATION_COST = 99; // Standard cost per verification in INR
