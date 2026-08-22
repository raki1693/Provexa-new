const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const auth = [protect, authorize('student')];

// Public routes
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/verify-otp', ctrl.verifyOTP);
router.post('/verify-otp-only', ctrl.verifyOTPOnly);
router.post('/resend-otp', ctrl.resendOTP);
router.post('/check-availability', ctrl.checkAvailability);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/verify-reset-otp', ctrl.verifyResetOTP);
router.post('/reset-password', ctrl.resetPassword);

// Protected routes
router.get('/profile', ...auth, ctrl.getProfile);
router.put('/profile', ...auth, ctrl.updateProfile);

router.get('/certificates', ...auth, ctrl.getCertificates);
router.get('/certificates/:certId', ...auth, ctrl.getCertificate);
router.get('/certificates/:certId/download', ...auth, ctrl.downloadCertificate);
router.get('/certificates/:certId/share', ...auth, ctrl.getShareableLink);
router.post('/certificates/:certId/verify', ...auth, ctrl.verifyCertificate);

router.get('/notifications', ...auth, ctrl.getNotifications);
router.patch('/notifications/:id/read', ...auth, ctrl.markNotificationRead);

module.exports = router;
