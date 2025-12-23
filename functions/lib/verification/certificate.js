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
    doc.fillColor('#0f172a').fontSize(24).font('Helvetica-Bold').text("ComplianceDesk.ai", { align: 'left' });
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text("THE TRUST LAYER FOR DIGITAL BHARAT", { align: 'left', characterSpacing: 1 });
    doc.moveUp();
    doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text("IDENTITY CERTIFICATE", { align: 'right' });
    doc.moveDown(2);
    if (data.status === 'VALID') {
        doc.rect(50, 110, 500, 40).fill('#ecfdf5');
        doc.fillColor('#059669').fontSize(12).font('Helvetica-Bold').text("✅ VERIFIED & AUTHENTICATED", 70, 125, { width: 460, align: 'center' });
    }
    else {
        doc.rect(50, 110, 500, 40).fill('#fef2f2');
        doc.fillColor('#dc2626').fontSize(12).font('Helvetica-Bold').text("❌ VERIFICATION FAILED", 70, 125, { width: 460, align: 'center' });
    }
    doc.moveDown(3);
    doc.save();
    doc.opacity(0.05);
    doc.fontSize(60).font('Helvetica-Bold').rotate(-45, { origin: [300, 400] });
    doc.text("COMPLIANCE DESK SECURE", 100, 400, { align: 'center' });
    doc.restore();
    const startY = 180;
    if (data.result?.photoBase64) {
        try {
            const photoBuffer = Buffer.from(data.result.photoBase64, 'base64');
            doc.image(photoBuffer, 50, startY, { width: 120, height: 144 });
        }
        catch (e) {
            doc.fontSize(10).text("[ Photo Unavailable ]", 50, startY + 60, { width: 120, align: 'center' });
        }
    }
    else {
        doc.rect(50, startY, 120, 144).stroke('#e2e8f0');
        doc.fillColor('#94a3b8').fontSize(8).text("NO PHOTO ATTACHED", 50, startY + 65, { width: 120, align: 'center' });
    }
    doc.fillColor('#0f172a');
    const dataX = 190;
    let currentY = startY;
    const drawField = (label, value, isBoldValue = true) => {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#64748b').text(label.toUpperCase(), dataX, currentY);
        currentY += 12;
        doc.fontSize(12).font(isBoldValue ? 'Helvetica-Bold' : 'Helvetica').fillColor('#0f172a').text(value || 'N/A', dataX, currentY);
        currentY += 25;
    };
    drawField("Legal Name", data.result?.legalName || "Unknown");
    drawField("Document Type", data.type);
    const maskedId = data.inputs?.idNumber ? `XXXXXX${data.inputs.idNumber.slice(-4)}` : "PROTECTED";
    drawField("Document Number", maskedId);
    if (data.result?.address) {
        drawField("Registered Address", data.result.address, false);
    }
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Bold').text("Audit Metadata", 50, currentY + 20, { underline: true });
    currentY += 45;
    const drawAuditRow = (label, value) => {
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748b').text(`${label}: `, 70, currentY, { continued: true });
        doc.font('Helvetica').fillColor('#0f172a').text(value);
        currentY += 15;
    };
    drawAuditRow("Authority", data.sourceAuthority || "National Database");
    drawAuditRow("Timestamp", data.timestamp.toDate().toLocaleString('en-IN'));
    drawAuditRow("Transaction ID", verificationId);
    doc.image(qrCodeBuffer, 450, 680, { width: 100 });
    doc.fontSize(8).fillColor('#64748b').text("SCAN TO VERIFY AUDIT TRAIL", 440, 785, { width: 120, align: 'center', characterSpacing: 1 });
    doc.fontSize(7).text("This is an electronically generated document. No signature required.", 50, 800, { align: 'center', width: 500 });
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