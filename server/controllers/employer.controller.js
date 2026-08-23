const Employer = require('../models/Employer');
const Certificate = require('../models/Certificate');
const VerificationLog = require('../models/VerificationLog');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { signToken } = require('../middleware/authMiddleware');
const { parseExcelBuffer } = require('../utils/excelParser');
const { sendComplaintUpdateEmail, sendResetEmail, sendOTPEmail } = require('../utils/emailService');
const { generateOTP, getOTPExpiry, isOTPExpired } = require('../utils/otpUtils');
const XLSX = require('xlsx');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const tempRegistrations = new Map();

// ─── Register ─────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { companyName, cin, hrName, designation, email, mobile } = req.body;
  if (!companyName || !hrName || !email)
    return res.status(400).json({ success: false, message: 'Company name, HR name, and email are required' });

  const existing = await Employer.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

  const otp = generateOTP();
  const otpExpiry = getOTPExpiry(10);

  // Store in memory
  tempRegistrations.set(email.toLowerCase(), {
    companyName,
    cin,
    hrName,
    designation,
    email: email.toLowerCase(),
    mobile,
    otp,
    otpExpiry,
  });

  // Auto clean up after 15 minutes
  setTimeout(() => {
    tempRegistrations.delete(email.toLowerCase());
  }, 15 * 60 * 1000);

  console.log(`🔑 [DEBUG] Generated OTP for Employer ${email.toLowerCase()} is: ${otp}`);
  sendOTPEmail(email.toLowerCase(), otp, hrName);
  res.status(200).json({ success: true, message: 'OTP sent to your email. Please check and verify.' });
};

// ─── Resend OTP ───────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  const { email } = req.body;
  const temp = tempRegistrations.get(email?.toLowerCase());
  if (!temp) return res.status(404).json({ success: false, message: 'Registration session not found. Please register again.' });

  const otp = generateOTP();
  temp.otp = otp;
  temp.otpExpiry = getOTPExpiry(10);
  
  tempRegistrations.set(email.toLowerCase(), temp);

  console.log(`🔑 [DEBUG] Generated OTP for Employer ${temp.email} is: ${otp}`);

  sendOTPEmail(temp.email, otp, temp.hrName);
  res.json({ success: true, message: 'OTP resent to your email' });
};

// ─── Verify OTP Only ──────────────────────────────────────────────────────────
exports.verifyOTPOnly = async (req, res) => {
  const { email, otp } = req.body;
  const temp = tempRegistrations.get(email?.toLowerCase());
  if (!temp) return res.status(404).json({ success: false, message: 'Registration session expired or not found. Please register again.' });
  if (temp.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP code' });
  if (isOTPExpired(temp.otpExpiry)) return res.status(400).json({ success: false, message: 'OTP expired. Please resend.' });
  res.json({ success: true, message: 'OTP code verified successfully' });
};

// ─── Verify OTP & Complete Registration ───────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!password) return res.status(400).json({ success: false, message: 'Password is required' });
  if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

  const temp = tempRegistrations.get(email?.toLowerCase());
  if (!temp) return res.status(404).json({ success: false, message: 'Registration session expired or not found. Please register again.' });
  if (temp.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
  if (isOTPExpired(temp.otpExpiry)) return res.status(400).json({ success: false, message: 'OTP expired. Please resend.' });

  const employer = await Employer.create({
    companyName: temp.companyName,
    cin: temp.cin,
    hrName: temp.hrName,
    designation: temp.designation,
    email: temp.email,
    mobile: temp.mobile,
    password,
  });

  tempRegistrations.delete(email.toLowerCase());
  const token = signToken(employer._id, 'employer');
  res.json({ success: true, token, user: employer });
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const employer = await Employer.findOne({ email: email?.toLowerCase() }).select('+password');
  if (!employer) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  if (employer.status === 'suspended') return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact admin.' });

  const valid = await employer.comparePassword(password);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = signToken(employer._id, 'employer');
  res.json({ success: true, token, user: employer });
};

// ─── Profile ──────────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => res.json({ success: true, data: req.user });

exports.updateProfile = async (req, res) => {
  const { hrName, designation, mobile, companyName, cin } = req.body;
  const updated = await Employer.findByIdAndUpdate(req.user._id, { hrName, designation, mobile, companyName, cin }, { new: true });
  res.json({ success: true, data: updated });
};

// ─── Verify by ID ─────────────────────────────────────────────────────────────
exports.verifyById = async (req, res) => {
  const { certId } = req.params;
  const cert = await Certificate.findOne({ certId })
    .populate('institution', 'name state district')
    .populate('student', 'name');

  let result = 'invalid';
  if (cert) {
    result = cert.status === 'revoked' ? 'revoked' : 'verified';
    await Certificate.findByIdAndUpdate(cert._id, { $inc: { verificationCount: 1 } });
  }

  await VerificationLog.create({
    cert: cert?._id, certId, verifierType: 'employer',
    verifier: req.user._id, verifierEmail: req.user.email,
    method: 'id', result, ip: req.ip,
  });

  res.json({ success: true, result, data: cert || null });
};

// ─── Verify by QR (frontend decodes QR, sends certId) ────────────────────────
exports.verifyByQR = async (req, res) => {
  const { certId } = req.body;
  if (!certId) return res.status(400).json({ success: false, message: 'certId is required' });

  const cert = await Certificate.findOne({ certId })
    .populate('institution', 'name state district')
    .populate('student', 'name');

  let result = 'invalid';
  if (cert) {
    result = cert.status === 'revoked' ? 'revoked' : 'verified';
    await Certificate.findByIdAndUpdate(cert._id, { $inc: { verificationCount: 1 } });
  }

  await VerificationLog.create({
    cert: cert?._id, certId, verifierType: 'employer',
    verifier: req.user._id, verifierEmail: req.user.email,
    method: 'qr', result, ip: req.ip,
  });

  res.json({ success: true, result, data: cert || null });
};

// ─── Bulk Verify ──────────────────────────────────────────────────────────────
exports.bulkVerify = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'CSV/Excel file required' });

  const rows = parseExcelBuffer(req.file.buffer);
  const results = [];

  for (const row of rows) {
    const certId = String(row.certId || row['Certificate ID'] || '').trim();
    if (!certId) { results.push({ certId: '', result: 'invalid', reason: 'Empty certId' }); continue; }

    const cert = await Certificate.findOne({ certId }).populate('institution', 'name').populate('student', 'name');
    let result = 'invalid';
    if (cert) {
      result = cert.status === 'revoked' ? 'revoked' : 'verified';
      await Certificate.findByIdAndUpdate(cert._id, { $inc: { verificationCount: 1 } });
    }

    await VerificationLog.create({
      cert: cert?._id, certId, verifierType: 'employer',
      verifier: req.user._id, verifierEmail: req.user.email,
      method: 'bulk', result, ip: req.ip,
    });

    results.push({
      certId, result,
      studentName: cert?.studentName || '-',
      course: cert?.course || '-',
      institution: cert?.institutionName || '-',
      issueDate: cert?.issueDate ? new Date(cert.issueDate).toLocaleDateString() : '-',
      revokeReason: cert?.revokeReason || '-',
    });
  }

  res.json({ success: true, total: results.length, data: results });
};

// ─── Verification History ────────────────────────────────────────────────────
exports.getVerificationHistory = async (req, res) => {
  const { result, page = 1, limit = 20 } = req.query;
  const filter = { verifier: req.user._id, verifierType: 'employer' };
  if (result) filter.result = result;

  const total = await VerificationLog.countDocuments(filter);
  const logs = await VerificationLog.find(filter)
    .populate('cert', 'studentName course institutionName certType')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json({ success: true, total, data: logs });
};

// ─── Create Complaint ─────────────────────────────────────────────────────────
exports.createComplaint = async (req, res) => {
  const { certId, reason, description } = req.body;
  if (!certId || !reason) return res.status(400).json({ success: false, message: 'certId and reason are required' });

  const cert = await Certificate.findOne({ certId });
  const evidenceUrl = req.file?.path || null;

  const complaint = await Complaint.create({
    certId, cert: cert?._id, employer: req.user._id, employerEmail: req.user.email,
    reason, description, evidenceUrl,
  });

  await AuditLog.create({ actorRole: 'employer', actorId: req.user._id, actorEmail: req.user.email, action: 'COMPLAINT_RAISED', targetType: 'Complaint', targetId: complaint._id.toString(), ip: req.ip });

  res.status(201).json({ success: true, message: 'Complaint submitted successfully', data: complaint });
};

// ─── Get Complaints ───────────────────────────────────────────────────────────
exports.getComplaints = async (req, res) => {
  const complaints = await Complaint.find({ employer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: complaints });
};

exports.getComplaint = async (req, res) => {
  const complaint = await Complaint.findOne({ _id: req.params.id, employer: req.user._id })
    .populate('cert', 'certId studentName course institutionName status');
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
  res.json({ success: true, data: complaint });
};

// ─── Notifications ────────────────────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id, role: 'employer' }).sort({ createdAt: -1 }).limit(30);
  const unread = await Notification.countDocuments({ userId: req.user._id, role: 'employer', isRead: false });
  res.json({ success: true, data: notifications, unreadCount: unread });
};

// ─── Forgot & Reset Password (TOTP 2FA) ──────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const employer = await Employer.findOne({ email: email?.toLowerCase() });
  if (!employer) return res.status(404).json({ success: false, message: 'No account found with this email' });

  // If 2FA is already enabled, request verification token
  if (employer.isTotpEnabled && employer.totpSecret) {
    return res.json({
      success: true,
      isSetup: true,
      message: 'Please enter the 6-digit verification code from your Google Authenticator app.'
    });
  }

  // Generate new secret for first-time setup
  const secret = speakeasy.generateSecret({
    name: `PROVEXA Employer (${employer.email})`
  });

  employer.totpSecret = secret.base32;
  await employer.save();

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

  const employer = await Employer.findOne({ email: email.toLowerCase() });
  if (!employer) return res.status(404).json({ success: false, message: 'Employer not found' });
  if (!employer.totpSecret) return res.status(400).json({ success: false, message: '2FA secret not initialized' });

  const verified = speakeasy.totp.verify({
    secret: employer.totpSecret,
    encoding: 'base32',
    token: otp,
    window: 2
  });

  if (!verified) {
    return res.status(400).json({ success: false, message: 'Invalid 2FA code' });
  }

  employer.password = password;
  await employer.save();

  res.json({ success: true, message: 'Password reset successful. You can log in now.' });
};

exports.verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  const employer = await Employer.findOne({ email: email?.toLowerCase() });
  if (!employer) return res.status(404).json({ success: false, message: 'Employer not found' });
  if (!employer.totpSecret) return res.status(400).json({ success: false, message: '2FA secret not initialized' });

  const verified = speakeasy.totp.verify({
    secret: employer.totpSecret,
    encoding: 'base32',
    token: otp,
    window: 2
  });

  if (!verified) {
    return res.status(400).json({ success: false, message: 'Invalid 2FA code' });
  }

  // Set as enabled on first verification success
  if (!employer.isTotpEnabled) {
    employer.isTotpEnabled = true;
    await employer.save();
  }

  res.json({ success: true, message: 'Reset code verified' });
};
