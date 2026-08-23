const Institution = require('../models/Institution');
const Certificate = require('../models/Certificate');
const BulkUpload = require('../models/BulkUpload');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { signToken } = require('../middleware/authMiddleware');
const { generateCertId } = require('../utils/certIdGenerator');
const { hashCertData } = require('../utils/hashUtils');
const { generateQRDataURL } = require('../utils/qrGenerator');
const { parseExcelBuffer, validateRow, generateTemplateCsv } = require('../utils/excelParser');
const { sendCertIssuedEmail, sendCertRevokedEmail, sendInstitutionApprovedEmail, sendResetEmail } = require('../utils/emailService');
const { generateOTP, getOTPExpiry, isOTPExpired } = require('../utils/otpUtils');
const { buildCertificatePDF } = require('../utils/pdfBuilder');
const { uploadFileBuffer } = require('../utils/uploadHelper');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, registrationNumber, email, password, contactPerson, contactMobile, address, state, district, website, type } = req.body;
  if (!name || !registrationNumber || !email || !password)
    return res.status(400).json({ success: false, message: 'Name, reg. number, email, and password are required' });

  const existing = await Institution.findOne({ $or: [{ email: email.toLowerCase() }, { registrationNumber }] });
  if (existing) return res.status(409).json({ success: false, message: 'Email or registration number already registered' });

  await Institution.create({ name, registrationNumber, email: email.toLowerCase(), password, contactPerson, contactMobile, address, state, district, website, type });
  res.status(201).json({ success: true, message: 'Registration submitted successfully. Awaiting admin approval.' });
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const institution = await Institution.findOne({ email: email?.toLowerCase() }).select('+password');
  if (!institution) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  if (institution.approvalStatus === 'pending')
    return res.status(403).json({ success: false, message: 'Your registration is pending admin approval', approvalStatus: 'pending' });
  if (institution.approvalStatus === 'rejected')
    return res.status(403).json({ success: false, message: 'Your registration was rejected', approvalStatus: 'rejected', reason: institution.rejectionReason });
  if (institution.isSuspended)
    return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact admin.', reason: institution.suspendReason });

  const valid = await institution.comparePassword(password);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = signToken(institution._id, 'institution');
  res.json({ success: true, token, user: institution });
};

// ─── Profile ──────────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => res.json({ success: true, data: req.user });

exports.updateProfile = async (req, res) => {
  const { contactPerson, contactMobile, address, website } = req.body;
  const updated = await Institution.findByIdAndUpdate(req.user._id, { contactPerson, contactMobile, address, website }, { new: true });
  res.json({ success: true, data: updated });
};

// ─── Issue Certificate ────────────────────────────────────────────────────────
exports.issueCertificate = async (req, res) => {
  const { studentEmail, studentName, rollNumber, course, degree, specialization, grade, percentage, certType, issueDate, expiryDate } = req.body;
  if (!studentEmail || !course || !certType || !issueDate)
    return res.status(400).json({ success: false, message: 'studentEmail, course, certType, and issueDate are required' });

  let student = await Student.findOne({ email: studentEmail.toLowerCase() });

  const certId = await generateCertId();
  const qrUrl = await generateQRDataURL(`${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${certId}`);
  const sName = studentName || student?.name || 'Student';
  const sEmail = studentEmail.toLowerCase();
  
  const sha256Hash = hashCertData({ certId, studentEmail: sEmail, studentName: sName, course, degree: degree || '', grade: grade || '', issueDate, institutionName: req.user.name });

  // Generate PDF and upload
  const pdfBuffer = await buildCertificatePDF({
    certId,
    studentName: sName,
    course,
    degree,
    specialization,
    grade,
    percentage,
    issueDate,
    institutionName: req.user.name,
  });

  const pdfUrl = await uploadFileBuffer(pdfBuffer, `${certId}.pdf`, 'certificates');

  const cert = await Certificate.create({
    certId,
    student: student ? student._id : undefined,
    institution: req.user._id,
    studentName: sName,
    studentEmail: sEmail,
    studentRollNo: rollNumber || student?.rollNumber,
    institutionName: req.user.name,
    course, degree, specialization, grade, percentage: percentage ? Number(percentage) : undefined,
    certType, issueDate: new Date(issueDate), expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    qrUrl, pdfUrl, sha256Hash,
  });

  // Notify student
  if (student) {
    await Notification.create({ userId: student._id, role: 'student', title: 'Certificate Issued', message: `Your ${certType} certificate for ${course} has been issued. ID: ${certId}`, link: `/student/certificate/${certId}` });
    sendCertIssuedEmail(student.email, student.name, certId, course, req.user.name);
  } else {
    // Send email invitation to register and claim
    sendCertIssuedEmail(sEmail, sName, certId, course, req.user.name);
  }

  await AuditLog.create({ actorRole: 'institution', actorId: req.user._id, actorEmail: req.user.email, action: 'CERT_ISSUED', targetType: 'Certificate', targetId: certId, ip: req.ip });

  res.status(201).json({ success: true, message: 'Certificate issued successfully', data: cert });
};

// ─── Bulk Issue ───────────────────────────────────────────────────────────────
exports.bulkIssueCertificates = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Excel file is required' });

  const rows = parseExcelBuffer(req.file.buffer);
  if (!rows || rows.length === 0) return res.status(400).json({ success: false, message: 'File is empty or invalid format' });

  const results = { total: rows.length, success: 0, failed: 0, errors: [], certIds: [] };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowErrors = validateRow(row);
    if (rowErrors.length > 0) {
      results.failed++;
      results.errors.push({ row: i + 2, studentEmail: row.studentEmail, reason: rowErrors.join('; ') });
      continue;
    }
    try {
      const student = await Student.findOne({ email: String(row.studentEmail).toLowerCase() });
      const certId = await generateCertId();
      const qrUrl = await generateQRDataURL(`${process.env.CLIENT_URL || 'http://localhost:5173'}/verify/${certId}`);
      const sName = row.studentName || student?.name || 'Student';
      const sEmail = String(row.studentEmail).toLowerCase();

      const sha256Hash = hashCertData({ certId, studentEmail: sEmail, studentName: sName, course: row.course, degree: row.degree || '', grade: row.grade || '', issueDate: row.issueDate, institutionName: req.user.name });

      // Generate PDF and upload
      const pdfBuffer = await buildCertificatePDF({
        certId,
        studentName: sName,
        course: row.course,
        degree: row.degree,
        specialization: row.specialization,
        grade: row.grade,
        percentage: row.percentage,
        issueDate: row.issueDate,
        institutionName: req.user.name,
      });

      const pdfUrl = await uploadFileBuffer(pdfBuffer, `${certId}.pdf`, 'certificates');

      await Certificate.create({
        certId,
        student: student ? student._id : undefined,
        institution: req.user._id,
        studentName: sName,
        studentEmail: sEmail,
        studentRollNo: row.rollNumber,
        institutionName: req.user.name,
        course: row.course, degree: row.degree, specialization: row.specialization,
        grade: row.grade, percentage: row.percentage ? Number(row.percentage) : undefined,
        certType: row.certType, issueDate: new Date(row.issueDate),
        expiryDate: row.expiryDate ? new Date(row.expiryDate) : undefined,
        qrUrl, pdfUrl, sha256Hash,
      });

      if (student) {
        await Notification.create({ userId: student._id, role: 'student', title: 'Certificate Issued', message: `Your ${row.certType} certificate for ${row.course} has been issued. ID: ${certId}`, link: `/student/certificate/${certId}` });
        sendCertIssuedEmail(student.email, student.name, certId, row.course, req.user.name);
      } else {
        sendCertIssuedEmail(sEmail, sName, certId, row.course, req.user.name);
      }

      results.certIds.push(certId);
      results.success++;
    } catch (err) {
      results.failed++;
      results.errors.push({ row: i + 2, studentEmail: row.studentEmail, reason: err.message });
    }
  }

  const bulkRecord = await BulkUpload.create({
    institution: req.user._id, fileName: req.file.originalname,
    totalRows: results.total, successCount: results.success,
    failedCount: results.failed, errors: results.errors, certIds: results.certIds,
  });

  await AuditLog.create({ actorRole: 'institution', actorId: req.user._id, actorEmail: req.user.email, action: 'BULK_CERTS_ISSUED', targetType: 'BulkUpload', targetId: bulkRecord._id.toString(), metadata: { total: results.total, success: results.success, failed: results.failed }, ip: req.ip });

  res.status(201).json({ success: true, message: `Bulk issue complete: ${results.success} issued, ${results.failed} failed`, data: results });
};

// ─── Template Download ────────────────────────────────────────────────────────
exports.downloadTemplate = async (req, res) => {
  const buffer = generateTemplateCsv();
  res.set({ 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename=provexa_bulk_template.xlsx' });
  res.send(buffer);
};

// ─── Get Certificates (issue history) ────────────────────────────────────────
exports.getCertificates = async (req, res) => {
  const { status, certType, page = 1, limit = 20, search } = req.query;
  const filter = { institution: req.user._id };
  if (status) filter.status = status;
  if (certType) filter.certType = certType;
  if (search) filter.$or = [{ studentName: new RegExp(search, 'i') }, { certId: new RegExp(search, 'i') }, { studentEmail: new RegExp(search, 'i') }];

  const total = await Certificate.countDocuments(filter);
  const certs = await Certificate.find(filter)
    .populate('student', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), data: certs });
};

// ─── Get Single Certificate ───────────────────────────────────────────────────
exports.getCertificate = async (req, res) => {
  const cert = await Certificate.findOne({ certId: req.params.certId, institution: req.user._id }).populate('student', 'name email mobile');
  if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
  res.json({ success: true, data: cert });
};

// ─── Revoke Certificate ───────────────────────────────────────────────────────
exports.revokeCertificate = async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ success: false, message: 'Revoke reason is required' });

  const cert = await Certificate.findOne({ certId: req.params.certId, institution: req.user._id });
  if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found or not yours' });
  if (cert.status === 'revoked') return res.status(400).json({ success: false, message: 'Certificate already revoked' });

  cert.status = 'revoked';
  cert.revokedBy = 'institution';
  cert.revokeReason = reason;
  cert.revokedAt = new Date();
  await cert.save();

  const student = await Student.findById(cert.student);
  if (student) {
    await Notification.create({ userId: student._id, role: 'student', title: 'Certificate Revoked', message: `Your certificate ${cert.certId} has been revoked. Reason: ${reason}`, link: `/student/certificate/${cert.certId}` });
    sendCertRevokedEmail(student.email, student.name, cert.certId, reason);
  }
  await AuditLog.create({ actorRole: 'institution', actorId: req.user._id, actorEmail: req.user.email, action: 'CERT_REVOKED', targetType: 'Certificate', targetId: cert.certId, metadata: { reason }, ip: req.ip });

  res.json({ success: true, message: 'Certificate revoked successfully', data: cert });
};

// ─── Verify Any Certificate ───────────────────────────────────────────────────
exports.verifyCertificate = async (req, res) => {
  const cert = await Certificate.findOne({ certId: req.params.certId }).populate('institution', 'name').populate('student', 'name email');
  if (!cert) return res.json({ success: true, result: 'invalid', data: null });
  const result = cert.status === 'revoked' ? 'revoked' : 'verified';
  res.json({ success: true, result, data: cert });
};

// ─── Bulk Upload History ──────────────────────────────────────────────────────
exports.getBulkUploads = async (req, res) => {
  const uploads = await BulkUpload.find({ institution: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: uploads });
};

// ─── Stats ────────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  const [total, active, revoked] = await Promise.all([
    Certificate.countDocuments({ institution: req.user._id }),
    Certificate.countDocuments({ institution: req.user._id, status: 'active' }),
    Certificate.countDocuments({ institution: req.user._id, status: 'revoked' }),
  ]);
  const verifications = await Certificate.aggregate([
    { $match: { institution: req.user._id } },
    { $group: { _id: null, total: { $sum: '$verificationCount' } } },
  ]);
  res.json({ success: true, data: { total, active, revoked, verificationRequests: verifications[0]?.total || 0 } });
};

// ─── Notifications ────────────────────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id, role: 'institution' }).sort({ createdAt: -1 }).limit(50);
  const unread = await Notification.countDocuments({ userId: req.user._id, role: 'institution', isRead: false });
  res.json({ success: true, data: notifications, unreadCount: unread });
};

exports.markNotificationRead = async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true });
  res.json({ success: true });
};

// ─── Clear Data ────────────────────────────────────────────────────────────────
exports.clearCertificates = async (req, res) => {
  await Certificate.deleteMany({ institution: req.user._id });
  res.json({ success: true, message: 'All certificate issuance history cleared successfully' });
};

exports.clearBulkUploads = async (req, res) => {
  await BulkUpload.deleteMany({ institution: req.user._id });
  res.json({ success: true, message: 'All bulk upload history cleared successfully' });
};

// ─── Forgot & Reset Password (TOTP 2FA) ──────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const institution = await Institution.findOne({ email: email?.toLowerCase() });
  if (!institution) return res.status(404).json({ success: false, message: 'No account found with this email' });

  // If 2FA is already enabled, request verification token
  if (institution.isTotpEnabled && institution.totpSecret) {
    return res.json({
      success: true,
      isSetup: true,
      message: 'Please enter the 6-digit verification code from your Google Authenticator app.'
    });
  }

  // Generate new secret for first-time setup
  const secret = speakeasy.generateSecret({
    name: `PROVEXA Institution (${institution.email})`
  });

  institution.totpSecret = secret.base32;
  await institution.save();

  // Generate QR code data URL
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  res.json({
    success: true,
    isSetup: false,
    secret: secret.base32,
    qrCodeUrl,
    message: 'Scan the QR code with Google Authenticator, then enter the 6-digit code.'
  });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) return res.status(400).json({ success: false, message: 'Email, OTP, and password are required' });

  const institution = await Institution.findOne({ email: email.toLowerCase() });
  if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });
  if (!institution.totpSecret) return res.status(400).json({ success: false, message: '2FA secret not initialized' });

  const verified = speakeasy.totp.verify({
    secret: institution.totpSecret,
    encoding: 'base32',
    token: otp,
    window: 2
  });

  if (!verified) {
    return res.status(400).json({ success: false, message: 'Invalid 2FA code' });
  }

  institution.password = password;
  await institution.save();

  res.json({ success: true, message: 'Password reset successful. You can log in now.' });
};

exports.verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  const institution = await Institution.findOne({ email: email?.toLowerCase() });
  if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });
  if (!institution.totpSecret) return res.status(400).json({ success: false, message: '2FA secret not initialized' });

  const verified = speakeasy.totp.verify({
    secret: institution.totpSecret,
    encoding: 'base32',
    token: otp,
    window: 2
  });

  if (!verified) {
    return res.status(400).json({ success: false, message: 'Invalid 2FA code' });
  }

  // Set as enabled on first verification success
  if (!institution.isTotpEnabled) {
    institution.isTotpEnabled = true;
    await institution.save();
  }

  res.json({ success: true, message: 'Reset code verified' });
};

exports.searchInstitutions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 3) {
      return res.json({ success: true, data: [] });
    }
    const institutions = await Institution.find({
      name: { $regex: q.trim(), $options: 'i' },
      approvalStatus: 'approved',
    }).select('name _id').limit(10);
    res.json({ success: true, data: institutions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to search institutions' });
  }
};
