const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const VerificationLog = require('../models/VerificationLog');

// GET /api/public/verify/:certId — no auth required
router.get('/verify/:certId', async (req, res) => {
  const { certId } = req.params;
  const certs = await Certificate.find({ certId })
    .populate('institution', 'name state district website type')
    .populate('student', 'name');

  if (!certs || certs.length === 0) {
    return res.json({ success: true, result: 'invalid', data: [], message: 'No certificates found' });
  }

  const hasActive = certs.some(c => c.status === 'active');
  const result = hasActive ? 'verified' : 'revoked';

  // Log public verification and increment count for all
  await Certificate.updateMany({ certId }, { $inc: { verificationCount: 1 } });

  for (const cert of certs) {
    await VerificationLog.create({
      cert: cert._id, certId,
      verifierType: 'public', method: 'id', result: cert.status === 'revoked' ? 'revoked' : 'verified', ip: req.ip,
    });
  }

  res.json({ success: true, result, data: certs });
});

module.exports = router;
