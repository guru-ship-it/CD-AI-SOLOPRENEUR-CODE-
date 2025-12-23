"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndDeductCredits = exports.topUpWallet = exports.BillingService = void 0;
const admin = __importStar(require("firebase-admin"));
const logger = __importStar(require("firebase-functions/logger"));
const interface_1 = require("./interface");
const notifications_1 = require("../notifications");
const WALLETS_COLLECTION = 'wallets';
class BillingService {
    static async deductCredits(tenantId, referenceId) {
        const walletRef = this.db.collection(WALLETS_COLLECTION).doc(tenantId);
        await this.db.runTransaction(async (transaction) => {
            const walletDoc = await transaction.get(walletRef);
            if (!walletDoc.exists) {
                const newWallet = {
                    tenantId,
                    balance: 0,
                    currency: 'INR',
                    lowBalanceThreshold: 500,
                };
                transaction.set(walletRef, newWallet);
                throw new Error('INSUFFICIENT_BALANCE: New wallet created with 0 balance.');
            }
            const wallet = walletDoc.data();
            if (wallet.balance < interface_1.VERIFICATION_COST) {
                throw new Error(`INSUFFICIENT_BALANCE: Required ${interface_1.VERIFICATION_COST}, available ${wallet.balance}`);
            }
            const newBalance = wallet.balance - interface_1.VERIFICATION_COST;
            const txRef = walletRef.collection('transactions').doc();
            const newTransaction = {
                amount: interface_1.VERIFICATION_COST,
                type: 'DEBIT',
                referenceId: referenceId,
                timestamp: new Date(),
                description: `Identity Verification - ${referenceId}`
            };
            transaction.update(walletRef, { balance: newBalance });
            transaction.set(txRef, newTransaction);
            if (newBalance <= wallet.lowBalanceThreshold) {
                logger.warn(`LOW_BALANCE: Tenant ${tenantId} reached threshold. Current: ${newBalance}`);
                if (wallet.contactEmail) {
                    (0, notifications_1.sendLowBalanceEmail)(wallet.contactEmail, newBalance).catch(e => logger.error("Failed to send low balance email:", e));
                }
                if (wallet.contactPhone) {
                    (0, notifications_1.sendWhatsAppAlert)(wallet.contactPhone, newBalance).catch(e => logger.error("Failed to send low balance WhatsApp:", e));
                }
            }
        });
    }
    static async addCredits(tenantId, amount, paymentId) {
        const walletRef = this.db.collection(WALLETS_COLLECTION).doc(tenantId);
        const txRef = walletRef.collection('transactions').doc();
        const newTransaction = {
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
    static async getBalance(tenantId) {
        const walletDoc = await this.db.collection(WALLETS_COLLECTION).doc(tenantId).get();
        if (!walletDoc.exists)
            return 0;
        return walletDoc.data().balance;
    }
}
exports.BillingService = BillingService;
BillingService.db = admin.firestore();
const https_1 = require("firebase-functions/v2/https");
exports.topUpWallet = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    const { amount } = request.data;
    const auth = request.auth;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated to top up.");
    }
    const tenantId = auth.token.tenantId || "MASTER_TENANT";
    const paymentId = `PAYM_${Date.now()}`;
    try {
        await BillingService.addCredits(tenantId, amount, paymentId);
        const newBalance = await BillingService.getBalance(tenantId);
        return { success: true, newBalance };
    }
    catch (error) {
        throw new https_1.HttpsError("internal", error.message);
    }
});
const checkAndDeductCredits = async (tenantId, cost) => {
    const firestore = admin.firestore();
    return firestore.runTransaction(async (t) => {
        const docRef = firestore.collection('wallets').doc(tenantId);
        const txRef = docRef.collection('transactions').doc();
        const doc = await t.get(docRef);
        if (!doc.exists) {
            throw new https_1.HttpsError('not-found', 'Wallet not found for this tenant.');
        }
        const currentBalance = doc.data().balance;
        const newBalance = currentBalance - cost;
        if (newBalance < 0) {
            throw new https_1.HttpsError('resource-exhausted', 'Insufficient Credits. Please Top Up.');
        }
        const transaction = {
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
exports.checkAndDeductCredits = checkAndDeductCredits;
//# sourceMappingURL=service.js.map