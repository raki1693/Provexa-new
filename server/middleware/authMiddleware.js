const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Institution = require('../models/Institution');
const Employer = require('../models/Employer');
const Admin = require('../models/Admin');

const modelMap = {
  student: Student,
  institution: Institution,
  employer: Employer,
  admin: Admin,
};

/**
 * protect — verifies JWT, attaches req.user and req.userRole
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Block pre-totp tokens from accessing protected resources
    if (decoded.phase === 'pre-totp') {
      return res.status(401).json({ success: false, message: 'TOTP verification required' });
    }

    const Model = modelMap[decoded.role];
    if (!Model) {
      return res.status(401).json({ success: false, message: 'Invalid token role' });
    }

    const user = await Model.findById(decoded.id).select('-password -otp -otpExpiry -totpSecret');
    if (!user) {
      console.warn(`🔑 JWT Auth Error: User with ID ${decoded.id} not found in database.`);
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    console.error('🔑 JWT Verification Error:', err.message);
    return res.status(401).json({ success: false, message: 'Token invalid or expired' });
  }
};

/**
 * authorize — role-based guard middleware
 * Usage: authorize('admin') or authorize('student', 'institution')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

/**
 * Generate JWT token
 */
const signToken = (id, role, extra = {}) => {
  return jwt.sign({ id, role, ...extra }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = { protect, authorize, signToken };
