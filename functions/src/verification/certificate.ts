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
    doc.fontSize(20).text("ComplianceDesk.ai", { align: 'left' });
    doc.fontSize(10).text("The Trust Layer for the Digital Bharat", { align: 'left' });
    doc.moveUp();
    doc.fontSize(16).font('Helvetica-Bold').text("OFFICIAL VERIFICATION CERTIFICATE", { align: 'right' });
    doc.moveDown(2);

    // --- Watermark ---
    doc.save();
    doc.opacity(0.1);
    doc.fontSize(60).font('Helvetica-Bold').rotate(-45, { origin: [300, 400] });
    doc.text("COMPLIANCE DESK SECURE", 100, 400, { align: 'center' });
    doc.restore();

    // --- Data Block ---
    doc.font('Helvetica-Bold').fontSize(14).text("Verification Details", { underline: true });
    doc.moveDown();

    const drawRow = (label: string, value: string) => {
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

    // --- Footer & QR Code ---
    doc.image(qrCodeBuffer, 450, 650, { width: 100 });
    doc.fontSize(8).text("Scan to verify authenticity on our secure portal.", 440, 755, { width: 120, align: 'center' });

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
