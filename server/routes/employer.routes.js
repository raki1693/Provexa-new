const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/employer.controller');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadEvidence, uploadExcel } = require('../middleware/upload');

const auth = [protect, authorize('employer')];

// Public routes
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/verify-otp', ctrl.verifyOTP);
router.post('/verify-otp-only', ctrl.verifyOTPOnly);
router.post('/resend-otp', ctrl.resendOTP);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/verify-reset-otp', ctrl.verifyResetOTP);
router.post('/reset-password', ctrl.resetPassword);

// Protected routes
router.get('/profile', ...auth, ctrl.getProfile);
router.put('/profile', ...auth, ctrl.updateProfile);

router.get('/verify/:certId', ...auth, ctrl.verifyById);
router.post('/verify/qr', ...auth, ctrl.verifyByQR);
router.post('/verify/bulk', ...auth, uploadExcel.single('file'), ctrl.bulkVerify);

router.get('/verification-history', ...auth, ctrl.getVerificationHistory);

router.post('/complaints', ...auth, uploadEvidence.single('evidence'), ctrl.createComplaint);
router.get('/complaints', ...auth, ctrl.getComplaints);
router.get('/complaints/:id', ...auth, ctrl.getComplaint);

router.get('/notifications', ...auth, ctrl.getNotifications);

module.exports = router;
