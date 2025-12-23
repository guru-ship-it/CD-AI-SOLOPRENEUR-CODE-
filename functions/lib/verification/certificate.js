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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCertificate = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const qrcode_1 = __importDefault(require("qrcode"));
const storage_1 = require("firebase-admin/storage");
exports.generateCertificate = (0, https_1.onCall)({ region: "asia-south1" }, async (request) => {
    const { verificationId } = request.data;
    const auth = request.auth;
    if (!auth) {
        throw new https_1.HttpsError("unauthenticated", "User must be authenticated to generate a certificate.");
    }
    const verifDoc = await admin.firestore().collection("verifications").doc(verificationId).get();
    if (!verifDoc.exists) {
        throw new https_1.HttpsError("not-found", "Verification record not found.");
    }
    const data = verifDoc.data();
    const tenantId = auth.token.tenantId || "MASTER_TENANT";
    if (data.tenantId !== tenantId) {
        throw new https_1.HttpsError("permission-denied", "You do not have permission to access this certificate.");
    }
    const qrCodeUrl = `https://compliancedesk.ai/verify/${verificationId}`;
    const qrCodeBuffer = await qrcode_1.default.toBuffer(qrCodeUrl, { errorCorrectionLevel: 'H' });
    const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.fontSize(20).text("ComplianceDesk.ai", { align: 'left' });
    doc.fontSize(10).text("The Trust Layer for the Digital Bharat", { align: 'left' });
    doc.moveUp();
    doc.fontSize(16).font('Helvetica-Bold').text("OFFICIAL VERIFICATION CERTIFICATE", { align: 'right' });
    doc.moveDown(2);
    doc.save();
    doc.opacity(0.1);
    doc.fontSize(60).font('Helvetica-Bold').rotate(-45, { origin: [300, 400] });
    doc.text("COMPLIANCE DESK SECURE", 100, 400, { align: 'center' });
    doc.restore();
    doc.font('Helvetica-Bold').fontSize(14).text("Verification Details", { underline: true });
    doc.moveDown();
    const drawRow = (label, value) => {
        doc.font('Helvetica-Bold').fontSize(10).text(`${label}: `, { continued: true });
        doc.font('Helvetica').text(value);
        doc.moveDown(0.5);
    };
    const maskedId = data.inputs?.idNumber ? `XXXXX${data.inputs.idNumber.slice(-4)}` : "N/A";
    drawRow("Subject Name", data.result?.legalName || "Unknown");
    drawRow("ID Type", data.type);
    drawRow("ID Number", maskedId);
    doc.font('Helvetica-Bold').fontSize(10).text("Verification Status: ", { continued: true });
    doc.fillColor(data.status === 'VALID' ? 'green' : 'red').text(data.status);
    doc.fillColor('black');
    doc.moveDown(0.5);
    drawRow("Source Authority", data.sourceAuthority || "National Database");
    drawRow("Timestamp", data.timestamp.toDate().toISOString());
    drawRow("Certificate ID", verificationId);
    doc.image(qrCodeBuffer, 450, 650, { width: 100 });
    doc.fontSize(8).text("Scan to verify authenticity on our secure portal.", 440, 755, { width: 120, align: 'center' });
    doc.end();
    const pdfBuffer = await new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
    });
    const bucket = (0, storage_1.getStorage)().bucket();
    const fileName = `certificates/${verificationId}.pdf`;
    const file = bucket.file(fileName);
    await file.save(pdfBuffer, {
        contentType: 'application/pdf',
        metadata: {
            contentType: 'application/pdf',
            customMetadata: {
                verificationId: verificationId,
                tenantId: tenantId
            }
        }
    });
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000,
    });
    return { downloadUrl: url };
});
//# sourceMappingURL=certificate.js.map