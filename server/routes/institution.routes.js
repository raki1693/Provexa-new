const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/institution.controller');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadExcel, uploadEvidence } = require('../middleware/upload');

const auth = [protect, authorize('institution')];

// Public routes
router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/search', ctrl.searchInstitutions);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/verify-reset-otp', ctrl.verifyResetOTP);
router.post('/reset-password', ctrl.resetPassword);

// Protected routes
router.get('/profile', ...auth, ctrl.getProfile);
router.put('/profile', ...auth, ctrl.updateProfile);
router.post('/design', ...auth, uploadEvidence.single('signature'), ctrl.updateCertificateDesign);

router.post('/certificates/issue', ...auth, ctrl.issueCertificate);
router.post('/certificates/bulk-issue', ...auth, uploadExcel.single('file'), ctrl.bulkIssueCertificates);
router.get('/certificates/template', ...auth, ctrl.downloadTemplate);
router.get('/certificates', ...auth, ctrl.getCertificates);
router.delete('/certificates/clear', ...auth, ctrl.clearCertificates);
router.get('/certificates/:certId', ...auth, ctrl.getCertificate);
router.put('/certificates/:certId/revoke', ...auth, ctrl.revokeCertificate);
router.get('/certificates/:certId/verify', ...auth, ctrl.verifyCertificate);

router.get('/bulk-uploads', ...auth, ctrl.getBulkUploads);
router.delete('/bulk-uploads/clear', ...auth, ctrl.clearBulkUploads);
router.get('/stats', ...auth, ctrl.getStats);

router.get('/notifications', ...auth, ctrl.getNotifications);
router.patch('/notifications/:id/read', ...auth, ctrl.markNotificationRead);

module.exports = router;
