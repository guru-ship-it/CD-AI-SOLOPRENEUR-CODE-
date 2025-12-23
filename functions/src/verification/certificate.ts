import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { getStorage } from "firebase-admin/storage";

export const generateCertificate = onCall({ region: "asia-south1" }, async (request) => {
    const { verificationId } = request.data;
    const auth = request.auth;

    if (!auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated to generate a certificate.");
    }

    // 1. Fetch Data from Firestore
    const verifDoc = await admin.firestore().collection("verifications").doc(verificationId).get();
    if (!verifDoc.exists) {
        throw new HttpsError("not-found", "Verification record not found.");
    }

    const data = verifDoc.data()!;

    // Security Check: Only the same tenant or admin can access (Simplified for now)
    const tenantId = auth.token.tenantId || "MASTER_TENANT";
    if (data.tenantId !== tenantId) {
        throw new HttpsError("permission-denied", "You do not have permission to access this certificate.");
    }

    // 2. Generate QR Code Buffer
    const qrCodeUrl = `https://compliancedesk.ai/verify/${verificationId}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeUrl, { errorCorrectionLevel: 'H' });

    // 3. Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: any[] = [];

    doc.on('data', (chunk: any) => chunks.push(chunk));

    // --- Header ---
    doc.fillColor('#0f172a').fontSize(24).font('Helvetica-Bold').text("ComplianceDesk.ai", { align: 'left' });
    doc.fillColor('#64748b').fontSize(10).font('Helvetica').text("THE TRUST LAYER FOR DIGITAL BHARAT", { align: 'left', characterSpacing: 1 });
    doc.moveUp();
    doc.fillColor('#0f172a').fontSize(14).font('Helvetica-Bold').text("IDENTITY CERTIFICATE", { align: 'right' });
    doc.moveDown(2);

    // --- Verified Badge ---
    if (data.status === 'VALID') {
        doc.rect(50, 110, 500, 40).fill('#ecfdf5');
        doc.fillColor('#059669').fontSize(12).font('Helvetica-Bold').text("✅ VERIFIED & AUTHENTICATED", 70, 125, { width: 460, align: 'center' });
    } else {
        doc.rect(50, 110, 500, 40).fill('#fef2f2');
        doc.fillColor('#dc2626').fontSize(12).font('Helvetica-Bold').text("❌ VERIFICATION FAILED", 70, 125, { width: 460, align: 'center' });
    }
    doc.moveDown(3);

    // --- Watermark ---
    doc.save();
    doc.opacity(0.05);
    doc.fontSize(60).font('Helvetica-Bold').rotate(-45, { origin: [300, 400] });
    doc.text("COMPLIANCE DESK SECURE", 100, 400, { align: 'center' });
    doc.restore();

    // --- Main Content Area ---
    const startY = 180;

    // Photo (if available)
    if (data.result?.photoBase64) {
        try {
            const photoBuffer = Buffer.from(data.result.photoBase64, 'base64');
            doc.image(photoBuffer, 50, startY, { width: 120, height: 144 }); // Standard Passport Size
        } catch (e) {
            doc.fontSize(10).text("[ Photo Unavailable ]", 50, startY + 60, { width: 120, align: 'center' });
        }
    } else {
        doc.rect(50, startY, 120, 144).stroke('#e2e8f0');
        doc.fillColor('#94a3b8').fontSize(8).text("NO PHOTO ATTACHED", 50, startY + 65, { width: 120, align: 'center' });
    }

    // Data Block
    doc.fillColor('#0f172a');
    const dataX = 190;
    let currentY = startY;

    const drawField = (label: string, value: string, isBoldValue = true) => {
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

    // --- Audit Trail ---
    doc.moveDown(2);
    doc.fontSize(10).font('Helvetica-Bold').text("Audit Metadata", 50, currentY + 20, { underline: true });
    currentY += 45;

    const drawAuditRow = (label: string, value: string) => {
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#64748b').text(`${label}: `, 70, currentY, { continued: true });
        doc.font('Helvetica').fillColor('#0f172a').text(value);
        currentY += 15;
    };

    drawAuditRow("Authority", data.sourceAuthority || "National Database");
    drawAuditRow("Timestamp", data.timestamp.toDate().toLocaleString('en-IN'));
    drawAuditRow("Transaction ID", verificationId);

    // --- QR Footer ---
    doc.image(qrCodeBuffer, 450, 680, { width: 100 });
    doc.fontSize(8).fillColor('#64748b').text("SCAN TO VERIFY AUDIT TRAIL", 440, 785, { width: 120, align: 'center', characterSpacing: 1 });
    doc.fontSize(7).text("This is an electronically generated document. No signature required.", 50, 800, { align: 'center', width: 500 });

    doc.end();

    // 4. Upload to Bucket
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);
    });

    const bucket = getStorage().bucket();
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

    // 5. Return signed download URL (valid for 1 hour)
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    return { downloadUrl: url };
});
