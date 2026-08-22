const crypto = require('crypto');

/**
 * Generate a 6-digit numeric OTP
 */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate OTP expiry time (default: 10 minutes from now)
 */
function getOTPExpiry(minutes = 10) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check if OTP has expired
 */
function isOTPExpired(expiry) {
  return !expiry || new Date() > new Date(expiry);
}

module.exports = { generateOTP, getOTPExpiry, isOTPExpired };
