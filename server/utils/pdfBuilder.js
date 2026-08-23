const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { generateQRBuffer } = require('./qrGenerator');
const https = require('https');

// Color palettes for design templates
const palettes = {
  default: {
    primary: rgb(0.11, 0.31, 0.45),      // Navy Blue (#1B4F72)
    secondary: rgb(0.18, 0.53, 0.76),    // Light Blue (#2E86C1)
    borderWidth: 5
  },
  elegant_gold: {
    primary: rgb(0.72, 0.53, 0.04),      // Dark Gold (#B8860B)
    secondary: rgb(0.85, 0.73, 0.38),    // Light Gold (#D7C460)
    borderWidth: 6
  },
  modern_emerald: {
    primary: rgb(0.08, 0.35, 0.20),      // Dark Emerald (#145A32)
    secondary: rgb(0.12, 0.52, 0.29),    // Light Emerald (#1E8449)
    borderWidth: 5
  },
  royal_ruby: {
    primary: rgb(0.39, 0.12, 0.09),      // Dark Ruby (#641E16)
    secondary: rgb(0.57, 0.17, 0.13),    // Light Ruby (#922B21)
    borderWidth: 5
  }
};

// Helper utility to download signature image from web URL (Cloudinary)
function downloadImageBytes(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download signature image: Status ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

/**
 * Builds a certificate PDF using pdf-lib and embeds the QR code.
 * Returns a Buffer of the generated PDF.
 */
async function buildCertificatePDF(certData) {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Add a blank page (A4 landscape: 842 x 595 points)
  const page = pdfDoc.addPage([842, 595]);
  const { width, height } = page.getSize();

  // Load fonts
  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontCourierBold = await pdfDoc.embedFont(StandardFonts.CourierBold);

  // Load selected template style
  const design = certData.design || {};
  const t = palettes[design.templateType] || palettes.default;

  // Draw background border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: t.primary,
    borderWidth: t.borderWidth,
  });

  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: t.secondary,
    borderWidth: 2,
  });

  // Title
  page.drawText('PROVEXA ACADEMIC CERTIFICATE', {
    x: 180,
    y: 480,
    size: 28,
    font: fontHelveticaBold,
    color: t.primary,
  });

  page.drawText('AUTHENTICITY VALIDATOR FOR ACADEMIA', {
    x: 260,
    y: 450,
    size: 14,
    font: fontHelvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Certificate ID
  page.drawText(`Certificate ID: ${certData.certId}`, {
    x: 50,
    y: 530,
    size: 12,
    font: fontCourierBold,
    color: t.primary,
  });

  // Body text
  page.drawText('This is to certify that', {
    x: 350,
    y: 380,
    size: 14,
    font: fontHelvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Student name
  const nameWidth = fontHelveticaBold.widthOfTextAtSize(certData.studentName.toUpperCase(), 24);
  page.drawText(certData.studentName.toUpperCase(), {
    x: (width - nameWidth) / 2,
    y: 330,
    size: 24,
    font: fontHelveticaBold,
    color: t.primary,
  });

  // Achievement text
  const courseText = `has successfully completed the course in ${certData.course}`;
  const courseWidth = fontHelvetica.widthOfTextAtSize(courseText, 14);
  page.drawText(courseText, {
    x: (width - courseWidth) / 2,
    y: 280,
    size: 14,
    font: fontHelvetica,
    color: rgb(0.3, 0.3, 0.3),
  });

  if (certData.degree || certData.specialization) {
    const degText = `towards the award of ${certData.degree || ''} ${certData.specialization ? `(${certData.specialization})` : ''}`;
    const degWidth = fontHelvetica.widthOfTextAtSize(degText, 14);
    page.drawText(degText, {
      x: (width - degWidth) / 2,
      y: 250,
      size: 14,
      font: fontHelvetica,
      color: rgb(0.3, 0.3, 0.3),
    });
  }

  // Grade
  if (certData.grade) {
    const gradeText = `with Grade ${certData.grade}${certData.percentage ? ` (${certData.percentage}%)` : ''}`;
    const gradeWidth = fontHelvetica.widthOfTextAtSize(gradeText, 14);
    page.drawText(gradeText, {
      x: (width - gradeWidth) / 2,
      y: 220,
      size: 14,
      font: fontHelveticaBold,
      color: t.secondary,
    });
  }

  // Footer metadata
  page.drawText(`Issued by: ${certData.institutionName}`, {
    x: 60,
    y: 120,
    size: 12,
    font: fontHelveticaBold,
    color: rgb(0.2, 0.2, 0.2),
  });

  const issueDateStr = new Date(certData.issueDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  page.drawText(`Date of Issue: ${issueDateStr}`, {
    x: 60,
    y: 95,
    size: 11,
    font: fontHelvetica,
    color: rgb(0.4, 0.4, 0.4),
  });

  // Embed QR Code
  const qrUrlText = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${certData.certId}`;
  const qrBuffer = await generateQRBuffer(qrUrlText);
  const qrImage = await pdfDoc.embedPng(qrBuffer);
  
  page.drawImage(qrImage, {
    x: width - 200,
    y: 60,
    width: 130,
    height: 130,
  });

  page.drawText('Scan to Verify Authenticity', {
    x: width - 205,
    y: 45,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Draw signature line
  page.drawLine({
    start: { x: 60, y: 150 },
    end: { x: 260, y: 150 },
    color: rgb(0.7, 0.7, 0.7),
    thickness: 1,
  });
  
  page.drawText('Authorized Signatory', {
    x: 60,
    y: 138,
    size: 10,
    font: fontHelvetica,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Fetch and embed authorized signature image if configured
  if (design.signatureUrl) {
    try {
      const sigBuffer = await downloadImageBytes(design.signatureUrl);
      const isJpg = design.signatureUrl.toLowerCase().includes('.jpg') || design.signatureUrl.toLowerCase().includes('.jpeg');
      let sigImage;
      if (isJpg) {
        sigImage = await pdfDoc.embedJpg(sigBuffer);
      } else {
        sigImage = await pdfDoc.embedPng(sigBuffer);
      }
      
      page.drawImage(sigImage, {
        x: 90,
        y: 155,
        width: 100,
        height: 38,
      });
    } catch (err) {
      console.error('❌ Failed to embed signature in PDF:', err.message);
    }
  }

  // Save the PDF document to bytes
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = { buildCertificatePDF };
