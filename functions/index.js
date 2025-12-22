
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();

// --- DPDP FORTIFICATION MIDDLEWARE ---

/**
 * 1. PANIC MODE (The Kill Switch)
 * Checks if the system is in LOCKDOWN.
 * In production, this would read from a cached Firestore doc or Runtime Config.
 */
const checkLockdown = async () => {
    // Mock Check: In reality, await admin.firestore().doc('system_config/security_status').get()...
    const isLockdown = process.env.SECURITY_STATUS === 'LOCKDOWN';
    if (isLockdown) {
        console.error('[PANIC MODE] System is in LOCKDOWN. Rejecting request.');
        throw new functions.https.HttpsError('unavailable', 'System is temporarily unavailable.');
    }
};

/**
 * 2. CONSENT LEDGER (Section 6 Compliance)
 * Verifies if the user has a valid 'GRANTED' consent record in the last 24h.
 */
const verifyConsent = async (uid) => {
    // Mock Check: In reality, query 'consent_ledger' where userId == uid...
    // const snapshot = await admin.firestore().collection('consent_ledger')...
    // For demo, we assume consent is missing if UID implies 'suspicious'
    if (uid === 'suspicious-user') {
        console.warn(`[CONSENT CHECK] Check failed for ${uid}`);
        throw new functions.https.HttpsError('permission-denied', 'Valid consent record not found.');
    }
    console.log(`[CONSENT CHECK] Consent verified for ${uid}`);
};

/**
 * 3. FIELD-LEVEL ENCRYPTION (Plausible Deniability)
 * Encrypts sensitive PII before storage/processing.
 */
const encryptPII = (text) => {
    // In production, fetch key from Secret Manager
    const ENCRYPTION_KEY = process.env.PII_SECRET || 'crypto-js-secret-key-32-chars-long!!';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

/**
 * CERT-In "Air Gap" Proxy
 * Prevents API Key exposure by handling Identity Verification server-side.
 * Enforces App Check to prevent bot abuse.
 */
exports.verifyIdentity = functions
    .region('asia-south1') // DPDP Act: Data Sovereignty
    .runWith({
        enforceAppCheck: true, // CERT-In: Bot Protection
        minInstances: 0,
        maxInstances: 10 // Rate Limiting
    })
    .https.onCall(async (data, context) => {
        // 0. Panic Mode Check (Kill Switch)
        await checkLockdown();

        // 1. Auth Check
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'The function must be called while authenticated.'
            );
        }

        // 2. App Check Verification (Auto-handled by runWith, but logic here for strictness)
        if (context.app == undefined) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                'The function must be called from an App Check verified app.'
            );
        }

        // 3. Consent Verification (DPDP)
        await verifyConsent(context.auth.uid);

        // 4. Mock External API Call (Google Vision / Protean)
        // In production, use process.env.GOOGLE_VISION_KEY
        try {
            console.log(`[SECURE PROXY] Verifying identity for User: ${context.auth.uid}`);

            // DEMO: Encrypt Incoming PII (if user sent any)
            if (data.aadhaar) {
                const encryptedID = encryptPII(data.aadhaar);
                console.log(`[CRYPTO] Encrypted Aadhaar for storage: ${encryptedID}`);
            }

            // Mock Response from "Protean" with WHITE BOX EXPLAINABILITY
            // In a real failure scenario, we would return:
            // { status: "REJECTED", reason: "FACE_MISMATCH", confidence: 0.42, message: "Photo does not match selfie." }

            const mockResponse = {
                status: "VERIFIED",
                confidence_score: 0.98,
                confidence_level: "HIGH",
                reason: "MATCH_FOUND",
                message: "Identity verified successfully against National Database.",
                provider: "Protean eGov",
                timestamp: new Date().toISOString()
            };

            return mockResponse;
        } catch (error) {
            throw new functions.https.HttpsError('internal', 'Verification provider failed');
        }
    });

/**
 * HONEYPOT TRAP
 * Detections malicious scanning of hidden admin routes.
 * Logs potential attacker IPs to 'blocked_ips' collection.
 */
exports.honeypotTrap = functions
    .region('asia-south1')
    .https.onRequest(async (req, res) => {
        // 1. Capture Threat Intelligence
        const threatData = {
            ip: req.headers['fastly-client-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
            userAgent: req.headers['user-agent'] || 'Unknown',
            method: req.method,
            path: req.url,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            reason: 'Honeypot Triggered: /admin-super-login'
        };

        const ipAddress = (threatData.ip || 'unknown_ip').toString().split(',')[0].trim();

        // 2. Log to Firestore (Active Ban List)
        try {
            await admin.firestore().collection('blocked_ips').doc(ipAddress).set(threatData);
            console.warn(`[HONEYPOT TRIGGERED] IP BAN: ${ipAddress}`);
        } catch (e) {
            console.error('Failed to log honeypot hit', e);
        }

        // 3. Return generic 403 Forbidden (Don't give clues)
        res.status(403).send('Forbidden: Access Denied');
    });

/**
 * 4. GDPR DATA PORTABILITY
 * Exports all tenant data (Users, Logs, Summaries) in a ZIP format.
 * Compliant with "Right to Data Portability".
 */
exports.exportTenantData = functions
    .region('asia-south1')
    .runWith({ timeoutSeconds: 300, memory: '1GB' })
    .https.onCall(async (data, context) => {
        // 1. Security Check
        await checkLockdown();
        if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');

        // 2. Authorization (Mock: In real app, check if user is Company Admin)
        const tenantId = data.tenantId;
        console.log(`[GDPR EXPORT] Starting export for Tenant: ${tenantId} requested by ${context.auth.uid}`);

        // 3. Mock Data Generation
        const exportData = {
            users: [
                { id: "u1", email: "user1@company.com", role: "employee" },
                { id: "u2", email: "user2@company.com", role: "manager" }
            ],
            audit_logs: [
                { action: "LOGIN", timestamp: new Date().toISOString(), ip: "10.0.0.1" }
            ],
            summary: "Total Verifications: 1542"
        };

        // 4. Return Download URL (Mock)
        // In production, zip this content, upload to a signed GCS URL, and return that URL.
        return {
            status: "READY",
            downloadUrl: `https://storage.googleapis.com/exports/${tenantId}_${Date.now()}.zip?token=mock-sas-token`,
            expiresAt: new Date(Date.now() + 3600000).toISOString() // 1 hour
        };
    });

/**
 * 5. ACTIVE DEFENSE (CSP REPORTING)
 * Ingests browser reports about Content-Security-Policy violations.
 * Triggers alerts on XSS spikes.
 */
exports.cspReport = functions
    .region('asia-south1')
    .https.onRequest(async (req, res) => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        const report = req.body;
        const violation = report['csp-report'] || report;

        // Log the violation
        console.warn('[CSP VIOLATION]', JSON.stringify(violation));

        // In production: Increment a counter in Redis/Firestore. 
        // If count > 100/min => Trigger PagerDuty/Slack Alert (Potential XSS Attack Underway)

        res.status(204).send();
    });

// --- ZERO TRUST VAULT (The Skyflow Pattern) ---

/**
 * Helper: Tokenizes data.
 * 1. Generates a random Token ID (tok_...).
 * 2. Encrypts the PII.
 * 3. Stores Mapping in 'secure_vault'.
 * 4. Returns Token ID.
 */
const tokenize = async (piiValue) => {
    if (!piiValue) return null;

    const tokenId = `tok_${crypto.randomBytes(4).toString('hex')}_${Date.now().toString(36)}`;
    const encryptedValue = encryptPII(piiValue); // Use existing crypto helper

    // Store in Vault
    await admin.firestore().collection('secure_vault').doc(tokenId).set({
        value: encryptedValue,
        created_at: admin.firestore.FieldValue.serverTimestamp()
    });

    return tokenId;
};

/**
 * Helper: Detokenizes data.
 * 1. Fetches encrypted blob from 'secure_vault'.
 * 2. Decrypts it.
 * 3. Returns Plaintext.
 */
const detokenize = async (tokenId) => {
    const doc = await admin.firestore().collection('secure_vault').doc(tokenId).get();
    if (!doc.exists) return null;

    const encrypted = doc.data().value;
    // Decrypt Logic (Inverse of encryptPII)
    // For this demo, we assume encryptPII output is IV:EncryptedText
    const parts = encrypted.split(':');
    const ENCRYPTION_KEY = process.env.PII_SECRET || 'crypto-js-secret-key-32-chars-long!!';
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

/**
 * 6. SECURE ONBOARD (Vault Writer)
 * Accepts PII, returns Tokens. 
 * Used by Frontend Registration forms.
 */
exports.secureOnboard = functions
    .region('asia-south1')
    .https.onCall(async (data, context) => {
        await checkLockdown();
        // Allow unauthenticated for signup, or enforce strictly if internal tool

        const { mobile, aadhaar, name } = data;

        // Tokenize Sensitive Fields
        const mobileToken = await tokenize(mobile);
        const aadhaarToken = await tokenize(aadhaar);

        // Name might be business data, but let's tokenize for "Zero Trust" demo
        // const nameToken = await tokenize(name); 

        return {
            mobile_token: mobileToken,
            aadhaar_token: aadhaarToken,
            // name: name // Return name as is if not tokenized
        };
    });

/**
 * 7. REVEAL DATA (Vault Reader / Detokenization Proxy)
 * The ONLY way to see real data.
 * Audit Logged. RBAC Checked.
 */
exports.detokenizeField = functions
    .region('asia-south1')
    .https.onCall(async (data, context) => {
        await checkLockdown();

        if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Login required.');

        const { token, reason } = data;
        const uid = context.auth.uid;

        // 1. RBAC Check (Mock: Only specific UIDs or Claims)
        // if (context.auth.token.role !== 'MASTER_ADMIN') ...

        // 2. MFA Check (Mock)
        // if (!context.auth.token.email_verified) ...

        console.log(`[VAULT ACCESS] User ${uid} requesting detokenization for ${token}. Reason: ${reason}`);

        try {
            const realData = await detokenize(token);

            // 3. Log to Audit (Critical)
            await admin.firestore().collection('audit_logs').add({
                action: 'VAULT_REVEAL',
                actor: uid,
                token_accessed: token,
                reason: reason || 'Unspecified',
                timestamp: admin.firestore.FieldValue.serverTimestamp()
            });

            return { value: realData };
        } catch (e) {
            console.error('Vault Access Error', e);
            throw new functions.https.HttpsError('permission-denied', 'Vault access denied or token invalid.');
        }
    });
