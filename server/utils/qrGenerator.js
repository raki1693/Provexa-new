const QRCode = require('qrcode');

/**
 * Generate QR code as a Data URL (base64 PNG) — for embedding in responses
 */
async function generateQRDataURL(text) {
  return await QRCode.toDataURL(text, {
    width: 200,
    margin: 1,
    color: { dark: '#1B4F72', light: '#FFFFFF' },
  });
}

/**
 * Generate QR code as a Buffer — for embedding in PDFs
 */
async function generateQRBuffer(text) {
  return await QRCode.toBuffer(text, {
    width: 200,
    margin: 1,
    color: { dark: '#1B4F72', light: '#FFFFFF' },
  });
}

module.exports = { generateQRDataURL, generateQRBuffer };
