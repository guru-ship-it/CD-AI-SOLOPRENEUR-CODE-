import * as admin from 'firebase-admin';
import * as logger from 'firebase-functions/logger';
import { Wallet, Transaction, VERIFICATION_COST } from './interface';
import { sendWhatsAppMessage } from '../whatsapp';

const WALLETS_COLLECTION = 'wallets';

export class BillingService {
    private static db = admin.firestore();

    /**
     * Deduct credits from a tenant's wallet using an atomic transaction.
     * Throws an error if balance is insufficient.
     */
    static async deductCredits(tenantId: string, referenceId: string): Promise<void> {
        const walletRef = this.db.collection(WALLETS_COLLECTION).doc(tenantId);

        await this.db.runTransaction(async (transaction) => {
            const walletDoc = await transaction.get(walletRef);

            if (!walletDoc.exists) {
                // Create default wallet if it doesn't exist
                const newWallet: Wallet = {
                    tenantId,
                    balance: 0,
                    currency: 'INR',
                    lowBalanceThreshold: 1000,
                };
                transaction.set(walletRef, newWallet);
                throw new Error('INSUFFICIENT_BALANCE: New wallet created with 0 balance.');
            }

            const wallet = walletDoc.data() as Wallet;

            if (wallet.balance < VERIFICATION_COST) {
                throw new Error(`INSUFFICIENT_BALANCE: Required ${VERIFICATION_COST}, available ${wallet.balance}`);
            }

            const newBalance = wallet.balance - VERIFICATION_COST;
            const txRef = walletRef.collection('transactions').doc();

            const newTransaction: Transaction = {
                amount: VERIFICATION_COST,
                type: 'DEBIT',
                referenceId: referenceId,
                timestamp: new Date(),
                description: `Identity Verification - ${referenceId}`
            };

            transaction.update(walletRef, { balance: newBalance });
            transaction.set(txRef, newTransaction);

            // Low Balance Alert Check
            if (newBalance <= wallet.lowBalanceThreshold) {
                logger.warn(`LOW_BALANCE: Tenant ${tenantId} reached threshold. Current: ${newBalance}`);
            }
        });
    }

    /**
     * Helper to add credits (TOP-UP)
     */
    static async addCredits(tenantId: string, amount: number, paymentId: string): Promise<void> {
        const walletRef = this.db.collection(WALLETS_COLLECTION).doc(tenantId);
        const txRef = walletRef.collection('transactions').doc();

        const newTransaction: Transaction = {
            amount,
            type: 'CREDIT',
            referenceId: paymentId,
            timestamp: new Date(),
            description: 'Wallet Top-up'
        };

        await this.db.runTransaction(async (t) => {
            t.set(walletRef, {
                balance: admin.firestore.FieldValue.increment(amount)
            }, { merge: true });
            t.set(txRef, newTransaction);
        });

        logger.info(`CREDIT_ADDED: Added ${amount} to tenant ${tenantId}`);
    }

    /**
   * Get Current Balance
   */
    static async getBalance(tenantId: string): Promise<number> {
        const walletDoc = await this.db.collection(WALLETS_COLLECTION).doc(tenantId).get();
        if (!walletDoc.exists) return 0;
        return (walletDoc.data() as Wallet).balance;
    }
}

import { onCall, HttpsError } from "firebase-functions/v2/https";

export const topUpWallet = onCall({ region: "asia-south1" }, async (request) => {
    const { amount } = request.data;
    const auth = request.auth;

    if (!auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated to top up.");
    }

    const tenantId = auth.token.tenantId || "MASTER_TENANT";
    const paymentId = `PAYM_${Date.now()}`;

    try {
        await BillingService.addCredits(tenantId, amount, paymentId);
        const newBalance = await BillingService.getBalance(tenantId);
        return { success: true, newBalance };
    } catch (error: any) {
        throw new HttpsError("internal", error.message);
    }
});

/**
 * Standardised Credit Deduction Helper (as requested)
 */
export const checkAndDeductCredits = async (tenantId: string, cost: number) => {
    const firestore = admin.firestore();
    return firestore.runTransaction(async (t) => {
        const docRef = firestore.collection('wallets').doc(tenantId);
        const txRef = docRef.collection('transactions').doc();
        const doc = await t.get(docRef);

        if (!doc.exists) {
            throw new HttpsError('not-found', 'Wallet not found for this tenant.');
        }

        const currentBalance = doc.data()!.balance;
        const newBalance = currentBalance - cost;

        if (newBalance < 0) {
            throw new HttpsError('resource-exhausted', 'Insufficient Credits. Please Top Up.');
        }

        const transaction: Transaction = {
            amount: cost,
            type: 'DEBIT',
            referenceId: `AUTO_${Date.now()}`,
            timestamp: new Date(),
            description: 'Automated Identity Verification'
        };

        t.update(docRef, { balance: newBalance });
        t.set(txRef, transaction);

        return { newBalance };
    });
};
