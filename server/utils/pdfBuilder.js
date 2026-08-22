const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const { generateQRBuffer } = require('./qrGenerator');

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

  // Draw background border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0.11, 0.31, 0.45), // Navy blue
    borderWidth: 5,
  });

  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: rgb(0.18, 0.53, 0.76), // Light blue
    borderWidth: 2,
  });

  // Title
  page.drawText('PROVEXA ACADEMIC CERTIFICATE', {
    x: 180,
    y: 480,
    size: 28,
    font: fontHelveticaBold,
    color: rgb(0.11, 0.31, 0.45),
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
    color: rgb(0.11, 0.31, 0.45),
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
    color: rgb(0.11, 0.31, 0.45),
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
      color: rgb(0.18, 0.53, 0.76),
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
  // Generate a verification URL QR code
  const qrUrlText = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${certData.certId}`;
  const qrBuffer = await generateQRBuffer(qrUrlText);
  
  // Embed PNG QR Code
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

  // Save the PDF document to bytes
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

module.exports = { buildCertificatePDF };
