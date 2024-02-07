const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function generateSecretAndCreatePdf() {
    const secret = speakeasy.generateSecret({
        length: 20,
        issuer: 'UniPath',
        name: 'invoice-admin@unipath.cloud'
    });
    console.log("Secret for TOTP:", secret.base32);
    console.log("OTPAuth URL:", secret.otpauth_url);

    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([500, 500]);

    const qrImage = await pdfDoc.embedPng(qrDataUrl);
    page.drawImage(qrImage, {
        x: page.getWidth() / 2 - qrImage.width / 2,
        y: page.getHeight() / 2 - qrImage.height / 2,
        width: qrImage.width,
        height: qrImage.height,
    });

    const pdfBytes = await pdfDoc.save();

    fs.writeFileSync('TOTP-QRCode.pdf', pdfBytes);

    console.log('PDF with QR Code created successfully.');
}

generateSecretAndCreatePdf().catch(console.error);
