const Admin = require('../models/Admin');
const Institution = require('../models/Institution');
const Student = require('../models/Student');
const Employer = require('../models/Employer');
const Certificate = require('../models/Certificate');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const VerificationLog = require('../models/VerificationLog');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const { signToken } = require('../middleware/authMiddleware');
const { sendInstitutionApprovedEmail, sendInstitutionRejectedEmail, sendComplaintUpdateEmail } = require('../utils/emailService');

// ─── Login (step 1) ───────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email: email?.toLowerCase() }).select('+password +totpSecret');
  if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  const valid = await admin.comparePassword(password);
  if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

  if (admin.isTotpEnabled) {
    // Issue short-lived pre-TOTP token
    const tempToken = jwt.sign(
      { id: admin._id, role: 'admin', phase: 'pre-totp' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );
    return res.json({ success: true, requireTotp: true, tempToken });
  }

  // No TOTP yet — issue full token (first time)
  admin.lastLogin = new Date();
  await admin.save();
  const token = signToken(admin._id, 'admin');
  res.json({ success: true, token, user: admin });
};

// ─── Verify TOTP (step 2) ─────────────────────────────────────────────────────
exports.verifyTOTP = async (req, res) => {
  const { tempToken, code } = req.body;
  if (!tempToken || !code) return res.status(400).json({ success: false, message: 'tempToken and code are required' });

  let decoded;
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Temp token invalid or expired' });
  }

  if (decoded.phase !== 'pre-totp') return res.status(401).json({ success: false, message: 'Invalid token phase' });

  const admin = await Admin.findById(decoded.id).select('+totpSecret');
  if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

  const verified = speakeasy.totp.verify({
    secret: admin.totpSecret,
    encoding: 'base32',
    token: code,
    window: 1,
  });

  if (!verified) return res.status(401).json({ success: false, message: 'Invalid TOTP code' });

  admin.lastLogin = new Date();
  await admin.save();
  const token = signToken(admin._id, 'admin');
  res.json({ success: true, token, user: admin });
};

// ─── Setup TOTP (first time) ──────────────────────────────────────────────────
exports.setupTOTP = async (req, res) => {
  const { setupKey, adminEmail, adminName, adminPassword } = req.body;
  if (setupKey !== process.env.ADMIN_SETUP_KEY)
    return res.status(403).json({ success: false, message: 'Invalid setup key' });

  let admin = await Admin.findOne({ email: adminEmail?.toLowerCase() });
  if (!admin) {
    // Create admin account if not exists
    admin = await Admin.create({ name: adminName || 'Admin', email: adminEmail.toLowerCase(), password: adminPassword });
  }

  const secret = speakeasy.generateSecret({ name: `PROVEXA Admin (${admin.email})`, length: 20 });
  admin.totpSecret = secret.base32;
  admin.isTotpEnabled = true;
  await admin.save();

  const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);
  res.json({ success: true, message: 'TOTP setup complete. Scan QR with Google Authenticator.', qrCode: qrDataUrl, secret: secret.base32 });
};

// ─── Profile ──────────────────────────────────────────────────────────────────
exports.getProfile = async (req, res) => res.json({ success: true, data: req.user });

// ─── Institutions ─────────────────────────────────────────────────────────────
exports.getInstitutions = async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (status === 'suspended') { filter.isSuspended = true; }
  else if (status) { filter.approvalStatus = status; filter.isSuspended = false; }
  if (search) filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { registrationNumber: new RegExp(search, 'i') }];

  const total = await Institution.countDocuments(filter);
  const institutions = await Institution.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, data: institutions });
};

exports.approveInstitution = async (req, res) => {
  const inst = await Institution.findByIdAndUpdate(req.params.id, { approvalStatus: 'approved', approvedBy: req.user._id, approvedAt: new Date() }, { new: true });
  if (!inst) return res.status(404).json({ success: false, message: 'Institution not found' });
  await sendInstitutionApprovedEmail(inst.email, inst.name);
  await AuditLog.create({ actorRole: 'admin', actorId: req.user._id, actorEmail: req.user.email, action: 'INSTITUTION_APPROVED', targetType: 'Institution', targetId: inst._id.toString(), ip: req.ip });
  res.json({ success: true, message: 'Institution approved', data: inst });
};

exports.rejectInstitution = async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ success: false, message: 'Rejection reason is required' });
  const inst = await Institution.findByIdAndUpdate(req.params.id, { approvalStatus: 'rejected', rejectionReason: reason }, { new: true });
  if (!inst) return res.status(404).json({ success: false, message: 'Institution not found' });
  await sendInstitutionRejectedEmail(inst.email, inst.name, reason);
  await AuditLog.create({ actorRole: 'admin', actorId: req.user._id, actorEmail: req.user.email, action: 'INSTITUTION_REJECTED', targetType: 'Institution', targetId: inst._id.toString(), metadata: { reason }, ip: req.ip });
  res.json({ success: true, message: 'Institution rejected', data: inst });
};

exports.suspendInstitution = async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ success: false, message: 'Suspension reason is required' });
  const inst = await Institution.findByIdAndUpdate(req.params.id, { isSuspended: true, suspendReason: reason }, { new: true });
  if (!inst) return res.status(404).json({ success: false, message: 'Institution not found' });
  await AuditLog.create({ actorRole: 'admin', actorId: req.user._id, actorEmail: req.user.email, action: 'INSTITUTION_SUSPENDED', targetType: 'Institution', targetId: inst._id.toString(), metadata: { reason }, ip: req.ip });
  res.json({ success: true, message: 'Institution suspended', data: inst });
};

exports.reactivateInstitution = async (req, res) => {
  const inst = await Institution.findByIdAndUpdate(req.params.id, { isSuspended: false, suspendReason: '' }, { new: true });
  if (!inst) return res.status(404).json({ success: false, message: 'Institution not found' });
  await AuditLog.create({ actorRole: 'admin', actorId: req.user._id, actorEmail: req.user.email, action: 'INSTITUTION_REACTIVATED', targetType: 'Institution', targetId: inst._id.toString(), ip: req.ip });
  res.json({ success: true, message: 'Institution reactivated', data: inst });
};

exports.deleteInstitution = async (req, res) => {
  const inst = await Institution.findByIdAndDelete(req.params.id);
  if (!inst) return res.status(404).json({ success: false, message: 'Institution not found' });

  // Delete students registered under this institution
  await Student.deleteMany({ institution: req.params.id });

  // Delete certificates issued by this institution
  await Certificate.deleteMany({ institution: req.params.id });

  await AuditLog.create({
    actorRole: 'admin',
    actorId: req.user._id,
    actorEmail: req.user.email,
    action: 'INSTITUTION_DELETED',
    targetType: 'Institution',
    targetId: req.params.id,
    metadata: { name: inst.name },
    ip: req.ip
  });

  res.json({ success: true, message: 'Institution deleted successfully' });
};

// ─── Students ─────────────────────────────────────────────────────────────────
exports.getStudents = async (req, res) => {
  const { status, page = 1, limit = 100, search, institutionId } = req.query;
  const filter = {};
  if (status) filter.status = status;

  const andClauses = [];

  if (institutionId) {
    const inst = await Institution.findById(institutionId);
    if (inst) {
      andClauses.push({
        $or: [
          { institution: institutionId },
          { institutionName: new RegExp(`^${inst.name.trim()}$`, 'i') }
        ]
      });
    } else {
      andClauses.push({ institution: institutionId });
    }
  }

  if (search) {
    andClauses.push({
      $or: [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { rollNumber: new RegExp(search, 'i') }
      ]
    });
  }

  if (andClauses.length > 0) {
    filter.$and = andClauses;
  }

  const total = await Student.countDocuments(filter);
  const students = await Student.find(filter).populate('institution', 'name').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, data: students });
};

exports.suspendStudent = async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  await AuditLog.create({ actorRole: 'admin', actorId: req.user._id, actorEmail: req.user.email, action: 'STUDENT_SUSPENDED', targetType: 'Student', targetId: student._id.toString(), ip: req.ip });
  res.json({ success: true, message: 'Student suspended', data: student });
};

exports.reactivateStudent = async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
  res.json({ success: true, message: 'Student reactivated', data: student });
};

exports.deleteStudent = async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  // Delete certificates linked to this student
  await Certificate.deleteMany({ student: req.params.id });

  await AuditLog.create({
    actorRole: 'admin',
    actorId: req.user._id,
    actorEmail: req.user.email,
    action: 'STUDENT_DELETED',
    targetType: 'Student',
    targetId: student._id.toString(),
    ip: req.ip,
  });

  res.json({ success: true, message: 'Student and their associated certificates deleted successfully' });
};

// ─── Employers ────────────────────────────────────────────────────────────────
exports.getEmployers = async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.$or = [{ companyName: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { hrName: new RegExp(search, 'i') }];

  const total = await Employer.countDocuments(filter);
  const employers = await Employer.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, data: employers });
};

exports.suspendEmployer = async (req, res) => {
  const employer = await Employer.findByIdAndUpdate(req.params.id, { status: 'suspended' }, { new: true });
  if (!employer) return res.status(404).json({ success: false, message: 'Employer not found' });
  await AuditLog.create({ actorRole: 'admin', actorId: req.user._id, actorEmail: req.user.email, action: 'EMPLOYER_SUSPENDED', targetType: 'Employer', targetId: employer._id.toString(), ip: req.ip });
  res.json({ success: true, message: 'Employer suspended' });
};

exports.reactivateEmployer = async (req, res) => {
  const employer = await Employer.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
  res.json({ success: true, message: 'Employer reactivated', data: employer });
};

exports.deleteEmployer = async (req, res) => {
  const employer = await Employer.findByIdAndDelete(req.params.id);
  if (!employer) return res.status(404).json({ success: false, message: 'Employer not found' });

  // Delete complaints raised by this employer
  await Complaint.deleteMany({ employer: req.params.id });

  await AuditLog.create({
    actorRole: 'admin',
    actorId: req.user._id,
    actorEmail: req.user.email,
    action: 'EMPLOYER_DELETED',
    targetType: 'Employer',
    targetId: employer._id.toString(),
    ip: req.ip,
  });

  res.json({ success: true, message: 'Employer permanently deleted successfully' });
};

// ─── Certificates ─────────────────────────────────────────────────────────────
exports.getCertificates = async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.$or = [{ certId: new RegExp(search, 'i') }, { studentName: new RegExp(search, 'i') }];

  const total = await Certificate.countDocuments(filter);
  const certs = await Certificate.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, data: certs });
};

exports.adminRevokeCertificate = async (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json({ success: false, message: 'Reason is required' });
  const cert = await Certificate.findOneAndUpdate(
    { certId: req.params.certId },
    { status: 'revoked', revokedBy: 'admin', revokeReason: reason, revokedAt: new Date() },
    { new: true }
  );
  if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found' });
  await AuditLog.create({ actorRole: 'admin', actorId: req.user._id, actorEmail: req.user.email, action: 'CERT_REVOKED_BY_ADMIN', targetType: 'Certificate', targetId: cert.certId, metadata: { reason }, ip: req.ip });
  res.json({ success: true, message: 'Certificate revoked by admin', data: cert });
};

// ─── Complaints ───────────────────────────────────────────────────────────────
exports.getComplaints = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const total = await Complaint.countDocuments(filter);
  const complaints = await Complaint.find(filter)
    .populate('employer', 'companyName hrName email')
    .populate('cert', 'certId studentName course institutionName')
    .sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, data: complaints });
};

exports.getComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('employer', 'companyName hrName email')
    .populate('cert', 'certId studentName course institutionName status');
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
  res.json({ success: true, data: complaint });
};

exports.resolveComplaint = async (req, res) => {
  const { adminNote } = req.body;
  const complaint = await Complaint.findByIdAndUpdate(req.params.id,
    { status: 'resolved', adminNote, resolvedAt: new Date() }, { new: true }).populate('employer');
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });

  await Notification.create({ userId: complaint.employer._id, role: 'employer', title: 'Complaint Resolved', message: `Your complaint #${complaint._id} has been resolved. ${adminNote || ''}`, link: `/employer/complaints/${complaint._id}` });
  await sendComplaintUpdateEmail(complaint.employer.email, complaint._id, 'resolved', adminNote);
  await AuditLog.create({ actorRole: 'admin', actorId: req.user._id, actorEmail: req.user.email, action: 'COMPLAINT_RESOLVED', targetType: 'Complaint', targetId: complaint._id.toString(), ip: req.ip });
  res.json({ success: true, message: 'Complaint resolved', data: complaint });
};

exports.rejectComplaint = async (req, res) => {
  const { adminNote } = req.body;
  const complaint = await Complaint.findByIdAndUpdate(req.params.id,
    { status: 'rejected', adminNote }, { new: true }).populate('employer');
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
  await Notification.create({ userId: complaint.employer._id, role: 'employer', title: 'Complaint Rejected', message: `Your complaint #${complaint._id} has been rejected. ${adminNote || ''}`, link: `/employer/complaints/${complaint._id}` });
  await sendComplaintUpdateEmail(complaint.employer.email, complaint._id, 'rejected', adminNote);
  res.json({ success: true, message: 'Complaint rejected', data: complaint });
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
exports.getAuditLogs = async (req, res) => {
  const { actorRole, action, page = 1, limit = 50, from, to } = req.query;
  const filter = {};
  if (actorRole) filter.actorRole = actorRole;
  if (action) filter.action = new RegExp(action, 'i');
  if (from || to) { filter.timestamp = {}; if (from) filter.timestamp.$gte = new Date(from); if (to) filter.timestamp.$lte = new Date(to); }

  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter).sort({ timestamp: -1 }).skip((page - 1) * limit).limit(Number(limit));
  res.json({ success: true, total, data: logs });
};

// ─── Stats ────────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  const [institutions, students, employers, certs, verifications, openComplaints, suspendedInst] = await Promise.all([
    Institution.countDocuments({ approvalStatus: 'approved' }),
    Student.countDocuments(),
    Employer.countDocuments(),
    Certificate.countDocuments(),
    VerificationLog.countDocuments(),
    Complaint.countDocuments({ status: 'open' }),
    Institution.countDocuments({ isSuspended: true }),
  ]);
  res.json({ success: true, data: { institutions, students, employers, certs, verifications, openComplaints, suspendedInst } });
};

// ─── Reports ──────────────────────────────────────────────────────────────────
exports.getReports = async (req, res) => {
  const certsByMonth = await Certificate.aggregate([
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);
  const verificationsByMonth = await VerificationLog.aggregate([
    { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);
  const complaintsByStatus = await Complaint.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  res.json({ success: true, data: { certsByMonth, verificationsByMonth, complaintsByStatus } });
};

// ─── Announcements ────────────────────────────────────────────────────────────
exports.createAnnouncement = async (req, res) => {
  const { roles, title, message } = req.body;
  if (!roles || !title || !message) return res.status(400).json({ success: false, message: 'roles, title, and message are required' });

  const roleArray = Array.isArray(roles) ? roles : [roles];
  let sent = 0;

  for (const role of roleArray) {
    let users = [];
    if (role === 'student') users = await Student.find({ status: 'active' }, '_id');
    else if (role === 'institution') users = await Institution.find({ approvalStatus: 'approved', isSuspended: false }, '_id');
    else if (role === 'employer') users = await Employer.find({ status: 'active' }, '_id');

    const notifications = users.map(u => ({ userId: u._id, role, title, message }));
    if (notifications.length > 0) { await Notification.insertMany(notifications); sent += notifications.length; }
  }

  res.json({ success: true, message: `Announcement sent to ${sent} users` });
};

// ─── Admin Notifications ──────────────────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id, role: 'admin' }).sort({ createdAt: -1 }).limit(30);
  const unread = await Notification.countDocuments({ userId: req.user._id, role: 'admin', isRead: false });
  res.json({ success: true, data: notifications, unreadCount: unread });
};

// ─── Clear Audit Logs ─────────────────────────────────────────────────────────
exports.clearAuditLogs = async (req, res) => {
  await AuditLog.deleteMany({});
  res.json({ success: true, message: 'All system audit logs cleared successfully' });
};
