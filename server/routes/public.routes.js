const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const VerificationLog = require('../models/VerificationLog');

// GET /api/public/verify/:certId — no auth required
router.get('/verify/:certId', async (req, res) => {
  const cert = await Certificate.findOne({ certId: req.params.certId })
    .populate('institution', 'name state district website type certificateDesign')
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

  const certObj = cert.toObject();
  if (certObj.institution && !certObj.institution.certificateDesign) {
    certObj.institution.certificateDesign = {
      templateType: 'default',
      signatureUrl: ''
    };
  }

  res.json({ success: true, result, data: certObj });
});

module.exports = router;
