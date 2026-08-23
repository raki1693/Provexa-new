const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const VerificationLog = require('../models/VerificationLog');

// GET /api/public/verify/:certId — no auth required
router.get('/verify/:certId', async (req, res) => {
  const cert = await Certificate.findOne({ certId: req.params.certId })
    .populate('institution', 'name state district website type')
    .populate('student', 'name');

  if (!cert) {
    return res.json({ success: true, result: 'invalid', data: null, message: 'Certificate not found' });
  }

  const result = cert.status === 'revoked' ? 'revoked' : 'verified';

  // Log public verification
  await VerificationLog.create({
    cert: cert._id, certId: cert.certId,
    verifierType: 'public', method: 'id', result, ip: req.ip,
  });

  // Increment verification count
  await Certificate.findByIdAndUpdate(cert._id, { $inc: { verificationCount: 1 } });

  res.json({ success: true, result, data: cert });
});

// Debug route to test SMTP connection settings and return the exact error
router.get('/debug-smtp', async (req, res) => {
  const nodemailer = require('nodemailer');
  const transporterConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT == '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  };

  const results = {
    envVariables: {
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER,
      HAS_PASS: !!process.env.EMAIL_PASS,
    },
    configUsed: { ...transporterConfig, auth: { ...transporterConfig.auth, pass: '***' } },
    connectionStatus: 'testing...',
    errorMessage: null,
  };

  try {
    const transporter = nodemailer.createTransport(transporterConfig);
    await transporter.verify();
    results.connectionStatus = 'SUCCESS';
  } catch (err) {
    results.connectionStatus = 'FAILED';
    results.errorMessage = err.message;
    results.errorStack = err.stack;
  }

  res.json({ success: results.connectionStatus === 'SUCCESS', data: results });
});

module.exports = router;
