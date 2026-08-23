const Student = require('../models/Student');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const VerificationLog = require('../models/VerificationLog');
const { signToken } = require('../middleware/authMiddleware');
const { generateOTP, getOTPExpiry, isOTPExpired } = require('../utils/otpUtils');
const { sendOTPEmail, sendResetEmail } = require('../utils/emailService');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Temporary storage for registrations pending OTP verification
const tempRegistrations = new Map();

// ─── Register ────────────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, mobile, rollNumber, institutionName, institution } = req.body;
  if (!name || !email || !mobile) {
    return res.status(400).json({ success: false, message: 'Name, email, and mobile are required' });
  }
  const existing = await Student.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

  const otp = generateOTP();
  const otpExpiry = getOTPExpiry(10);

  // Store in-memory
  tempRegistrations.set(email.toLowerCase(), {
    name,
    email: email.toLowerCase(),
    mobile,
    rollNumber,
    institutionName,
    institution,
    otp,
    otpExpiry,
  });

  // Auto clean up after 15 minutes
  setTimeout(() => {
    tempRegistrations.delete(email.toLowerCase());
  }, 15 * 60 * 1000);

  console.log(`🔑 [DEBUG] Generated OTP for ${email.toLowerCase()} is: ${otp}`);

  sendOTPEmail(email.toLowerCase(), otp, name);
  res.status(201).json({ success: true, message: 'Registration successful. OTP sent to your email.', email: email.toLowerCase() });
};

// ─── Verify OTP Only (for Auto-Detection) ───────────────────────────────────
exports.verifyOTPOnly = async (req, res) => {
  const { email, otp } = req.body;
  const temp = tempRegistrations.get(email?.toLowerCase());
  if (!temp) return res.status(404).json({ success: false, message: 'Registration session expired or not found. Please register again.' });
  if (temp.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP code' });
  if (isOTPExpired(temp.otpExpiry)) return res.status(400).json({ success: false, message: 'OTP expired. Please resend.' });
  res.json({ success: true, message: 'OTP code verified successfully' });
};

// ─── Verify OTP & Set Password (Complete Registration) ────────────────────────
exports.verifyOTP = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!password) return res.status(400).json({ success: false, message: 'Password is required' });
  if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

  const temp = tempRegistrations.get(email?.toLowerCase());
  if (!temp) return res.status(404).json({ success: false, message: 'Registration session expired or not found. Please register again.' });
  if (temp.otp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
  if (isOTPExpired(temp.otpExpiry)) return res.status(400).json({ success: false, message: 'OTP expired. Please resend.' });

  const student = await Student.create({
    name: temp.name,
    email: temp.email,
    mobile: temp.mobile,
    rollNumber: temp.rollNumber,
    institutionName: temp.institutionName,
    institution: temp.institution,
    password, // Hash will be applied automatically in mongoose pre-save hook
    isVerified: true,
  });

  // Link any pre-issued certificates that match this email
  await Certificate.updateMany({ studentEmail: student.email }, { student: student._id });

  // Remove from temporary map
  tempRegistrations.delete(email.toLowerCase());

  const token = signToken(student._id, 'student');
  res.json({ success: true, message: 'Registration completed successfully', token, user: student });
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

  console.log(`🔑 [DEBUG] Generated OTP for ${temp.email} is: ${otp}`);

  sendOTPEmail(temp.email, otp, temp.name);
  res.json({ success: true, message: 'OTP resent to your email' });
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  const student = await Student.findOne({ email: email.toLowerCase() }).select('+password');
  if (!student) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  if (!student.isVerified) return res.status(403).json({ success: false, message: 'Please verify your email first' });
  if (student.status === 'suspended') return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact admin.' });

  const valid = await student.comparePassword(password);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const token = signToken(student._id, 'student');
  res.json({ success: true, token, user: student });
};

// ─── Get Profile ──────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  res.json({ success: true, data: req.user });
};

// ─── Update Profile ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  const { name, mobile, profilePhoto } = req.body;
  const student = await Student.findByIdAndUpdate(
    req.user._id,
    { name, mobile, profilePhoto },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: student });
};

// ─── Get Certificates ────────────────────────────────────────────────────────
exports.getCertificates = async (req, res) => {
  const { status, certType } = req.query;
  const filter = { student: req.user._id };
  if (status) filter.status = status;
  if (certType) filter.certType = certType;

  const certs = await Certificate.find(filter)
    .populate('institution', 'name state')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: certs.length, data: certs });
};

// ─── Get Single Certificate ───────────────────────────────────────────────────
exports.getCertificate = async (req, res) => {
  const cert = await Certificate.findOne({
    certId: req.params.certId,
    student: req.user._id,
  }).populate('institution', 'name state district website');

  if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
  res.json({ success: true, data: cert });
};

// ─── Download Certificate ────────────────────────────────────────────────────
exports.downloadCertificate = async (req, res) => {
  const cert = await Certificate.findOne({ certId: req.params.certId, student: req.user._id });
  if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
  if (!cert.pdfUrl) return res.status(404).json({ success: false, message: 'PDF not yet available' });
  res.json({ success: true, downloadUrl: cert.pdfUrl });
};

// ─── Get Shareable Link ───────────────────────────────────────────────────────
exports.getShareableLink = async (req, res) => {
  const cert = await Certificate.findOne({ certId: req.params.certId, student: req.user._id });
  if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
  const link = `${process.env.CLIENT_URL}/verify/${cert.certId}`;
  res.json({ success: true, link, certId: cert.certId });
};

// ─── Self Verify ──────────────────────────────────────────────────────────────
exports.verifyCertificate = async (req, res) => {
  const { certId } = req.params;
  const cert = await Certificate.findOne({ certId }).populate('institution', 'name');
  let result = 'invalid';
  if (cert) {
    result = cert.status === 'revoked' ? 'revoked' : 'verified';
    await Certificate.findByIdAndUpdate(cert._id, { $inc: { verificationCount: 1 } });
    await VerificationLog.create({
      cert: cert._id, certId, verifierType: 'student',
      verifier: req.user._id, verifierEmail: req.user.email,
      method: 'id', result, ip: req.ip,
    });
  }
  res.json({ success: true, result, data: cert || null });
};

// ─── Notifications ────────────────────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id, role: 'student' }).sort({ createdAt: -1 }).limit(50);
  const unread = await Notification.countDocuments({ userId: req.user._id, role: 'student', isRead: false });
  res.json({ success: true, data: notifications, unreadCount: unread });
};

exports.markNotificationRead = async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isRead: true });
  res.json({ success: true, message: 'Marked as read' });
};

// ─── Check Availability ────────────────────────────────────────────────────────
exports.checkAvailability = async (req, res) => {
  const { email, rollNumber } = req.body;
  const results = { emailAvailable: true, rollNumberAvailable: true };

  if (email) {
    const existingEmail = await Student.findOne({ email: email.toLowerCase() });
    if (existingEmail) results.emailAvailable = false;
  }

  if (rollNumber) {
    const existingRoll = await Student.findOne({ rollNumber: rollNumber.trim() });
    if (existingRoll) results.rollNumberAvailable = false;
  }

  res.json({ success: true, ...results });
};

// ─── Forgot & Reset Password (TOTP 2FA) ──────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const student = await Student.findOne({ email: email?.toLowerCase() });
  if (!student) return res.status(404).json({ success: false, message: 'No account found with this email' });

  let secretKey = student.totpSecret;

  // Generate secret only if they don't have one yet
  if (!secretKey) {
    const secret = speakeasy.generateSecret({
      name: `PROVEXA Student (${student.email})`
    });
    secretKey = secret.base32;
    student.totpSecret = secretKey;
    student.isTotpEnabled = false;
    await student.save();
  }

  // Always generate QR code from the saved/current secret key
  const label = encodeURIComponent(`PROVEXA:${student.email}`);
  const otpauthUrl = `otpauth://totp/${label}?secret=${secretKey}&issuer=PROVEXA`;
  const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

  res.json({
    success: true,
    isSetup: false,
    secret: secretKey,
    qrCodeUrl,
    message: 'Scan the QR code with Google Authenticator, then enter the 6-digit code.'
  });
};

exports.resetPassword = async (req, res) => {
  const { email, otp, password } = req.body;
  if (!email || !otp || !password) return res.status(400).json({ success: false, message: 'Email, OTP, and password are required' });

  const student = await Student.findOne({ email: email.toLowerCase() });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  if (!student.totpSecret) return res.status(400).json({ success: false, message: '2FA secret not initialized' });

  const verified = speakeasy.totp.verify({
    secret: student.totpSecret,
    encoding: 'base32',
    token: otp,
    window: 2
  });

  if (!verified) {
    return res.status(400).json({ success: false, message: 'Invalid 2FA code' });
  }

  student.password = password;
  await student.save();

  res.json({ success: true, message: 'Password reset successful. You can log in now.' });
};

exports.verifyResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  const student = await Student.findOne({ email: email?.toLowerCase() });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  if (!student.totpSecret) return res.status(400).json({ success: false, message: '2FA secret not initialized' });

  const verified = speakeasy.totp.verify({
    secret: student.totpSecret,
    encoding: 'base32',
    token: otp,
    window: 2
  });

  if (!verified) {
    return res.status(400).json({ success: false, message: 'Invalid 2FA code' });
  }

  // Set as enabled on first verification success
  if (!student.isTotpEnabled) {
    student.isTotpEnabled = true;
    await student.save();
  }

  res.json({ success: true, message: '2FA code verified' });
};
