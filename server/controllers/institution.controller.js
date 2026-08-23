const Institution = require('../models/Institution');
const Certificate = require('../models/Certificate');
const BulkUpload = require('../models/BulkUpload');
const Student = require('../models/Student');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const Complaint = require('../models/Complaint');
const VerificationLog = require('../models/VerificationLog');
const { signToken } = require('../middleware/authMiddleware');
const { generateCertId } = require('../utils/certIdGenerator');
const { hashCertData } = require('../utils/hashUtils');
const { generateQRDataURL } = require('../utils/qrGenerator');
const { parseExcelBuffer, validateRow, generateTemplateCsv } = require('../utils/excelParser');
const { sendCertIssuedEmail, sendCertRevokedEmail, sendInstitutionApprovedEmail, sendResetEmail } = require('../utils/emailService');
const { generateOTP, getOTPExpiry, isOTPExpired } = require('../utils/otpUtils');
const { buildCertificatePDF } = require('../utils/pdfBuilder');
const { uploadFileBuffer } = require('../utils/uploadHelper');

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
    design: req.user.certificateDesign,
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
        design: req.user.certificateDesign,
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
  const institutionId = req.user._id;

  // Basic counters
  const [total, active, revoked] = await Promise.all([
    Certificate.countDocuments({ institution: institutionId }),
    Certificate.countDocuments({ institution: institutionId, status: 'active' }),
    Certificate.countDocuments({ institution: institutionId, status: 'revoked' }),
  ]);

  const verifications = await Certificate.aggregate([
    { $match: { institution: institutionId } },
    { $group: { _id: null, total: { $sum: '$verificationCount' } } },
  ]);

  // Aggregate monthly trends over the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  // 1. Monthly Issuances
  const issuanceTrend = await Certificate.aggregate([
    {
      $match: {
        institution: institutionId,
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // 2. Monthly Verifications
  const verificationTrend = await VerificationLog.aggregate([
    {
      $lookup: {
        from: 'certificates',
        localField: 'cert',
        foreignField: '_id',
        as: 'certDetails'
      }
    },
    { $unwind: '$certDetails' },
    {
      $match: {
        'certDetails.institution': institutionId,
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          result: '$result'
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // 3. Security Warning: Scans on Revoked Certificates
  const revokedHitsCount = await VerificationLog.aggregate([
    {
      $lookup: {
        from: 'certificates',
        localField: 'cert',
        foreignField: '_id',
        as: 'certDetails'
      }
    },
    { $unwind: '$certDetails' },
    {
      $match: {
        'certDetails.institution': institutionId,
        result: 'revoked'
      }
    },
    { $count: 'count' }
  ]);

  // 4. Security Warning: Active Complaints by Employers
  const activeComplaintsCount = await Complaint.aggregate([
    {
      $lookup: {
        from: 'certificates',
        localField: 'cert',
        foreignField: '_id',
        as: 'certDetails'
      }
    },
    { $unwind: '$certDetails' },
    {
      $match: {
        'certDetails.institution': institutionId,
        status: { $in: ['open', 'under_review'] }
      }
    },
    { $count: 'count' }
  ]);

  // Format trends for frontend easy chart parsing (Recharts format)
  const monthsList = [];
  const tempDate = new Date(sixMonthsAgo);
  for (let i = 0; i < 6; i++) {
    monthsList.push({
      year: tempDate.getFullYear(),
      month: tempDate.getMonth() + 1,
      monthName: tempDate.toLocaleString('en-US', { month: 'short' }),
      issued: 0,
      verified: 0,
      revokedScans: 0
    });
    tempDate.setMonth(tempDate.getMonth() + 1);
  }

  // Populate issuance values
  issuanceTrend.forEach((item) => {
    const match = monthsList.find(m => m.year === item._id.year && m.month === item._id.month);
    if (match) match.issued = item.count;
  });

  // Populate verification values
  verificationTrend.forEach((item) => {
    const match = monthsList.find(m => m.year === item._id.year && m.month === item._id.month);
    if (match) {
      if (item._id.result === 'verified') match.verified += item.count;
      if (item._id.result === 'revoked') match.revokedScans += item.count;
    }
  });

  res.json({
    success: true,
    data: {
      total,
      active,
      revoked,
      verificationRequests: verifications[0]?.total || 0,
      trends: monthsList,
      warnings: {
        revokedHits: revokedHitsCount[0]?.count || 0,
        activeComplaints: activeComplaintsCount[0]?.count || 0
      }
    }
  });
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

// ─── Forgot & Reset Password ───────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const institution = await Institution.findOne({ email: email?.toLowerCase() });
  if (!institution) return res.status(404).json({ success: false, message: 'No account found with this email' });

  const resetOTP = generateOTP();
  institution.otp = resetOTP;
  institution.otpExpiry = getOTPExpiry(10);
  await institution.save();

  console.log(`🔑 [DEBUG] Password Reset OTP for Institution ${institution.email} is: ${resetOTP}`);

  sendResetEmail(institution.email, resetOTP, institution.name);
  res.json({ success: true, message: 'Password reset code sent to your email.' });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) return res.status(400).json({ success: false, message: 'Email, OTP, and password are required' });

  const institution = await Institution.findOne({ email: email.toLowerCase() });
  if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });
  if (institution.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid reset code' });
  if (isOTPExpired(institution.otpExpiry)) return res.status(400).json({ success: false, message: 'Reset code expired' });

  institution.password = password;
  institution.otp = undefined;
  institution.otpExpiry = undefined;
  await institution.save();

  res.json({ success: true, message: 'Password reset successful. You can log in now.' });
};

exports.verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  const institution = await Institution.findOne({ email: email?.toLowerCase() });
  if (!institution) return res.status(404).json({ success: false, message: 'Institution not found' });
  if (institution.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid reset code' });
  if (isOTPExpired(institution.otpExpiry)) return res.status(400).json({ success: false, message: 'Reset code expired' });
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

exports.updateCertificateDesign = async (req, res) => {
  try {
    const { templateType } = req.body;
    const signatureUrl = req.file?.path;

    const updateData = {};
    if (templateType) updateData['certificateDesign.templateType'] = templateType;
    if (signatureUrl) updateData['certificateDesign.signatureUrl'] = signatureUrl;

    const institution = await Institution.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Certificate design updated successfully',
      data: institution.certificateDesign,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update certificate design' });
  }
};
