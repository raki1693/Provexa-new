const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/authMiddleware');

const auth = [protect, authorize('admin')];

// Auth routes (public)
router.post('/login', ctrl.login);
router.post('/verify-totp', ctrl.verifyTOTP);
router.post('/setup-totp', ctrl.setupTOTP);

// Profile
router.get('/profile', ...auth, ctrl.getProfile);

// Institutions
router.get('/institutions', ...auth, ctrl.getInstitutions);
router.put('/institutions/:id/approve', ...auth, ctrl.approveInstitution);
router.put('/institutions/:id/reject', ...auth, ctrl.rejectInstitution);
router.put('/institutions/:id/suspend', ...auth, ctrl.suspendInstitution);
router.put('/institutions/:id/reactivate', ...auth, ctrl.reactivateInstitution);
router.delete('/institutions/:id', ...auth, ctrl.deleteInstitution);

// Students
router.get('/students', ...auth, ctrl.getStudents);
router.put('/students/:id/suspend', ...auth, ctrl.suspendStudent);
router.put('/students/:id/reactivate', ...auth, ctrl.reactivateStudent);
router.delete('/students/:id', ...auth, ctrl.deleteStudent);

// Employers
router.get('/employers', ...auth, ctrl.getEmployers);
router.put('/employers/:id/suspend', ...auth, ctrl.suspendEmployer);
router.put('/employers/:id/reactivate', ...auth, ctrl.reactivateEmployer);
router.delete('/employers/:id', ...auth, ctrl.deleteEmployer);

// Certificates
router.get('/certificates', ...auth, ctrl.getCertificates);
router.put('/certificates/:certId/revoke', ...auth, ctrl.adminRevokeCertificate);

// Complaints
router.get('/complaints', ...auth, ctrl.getComplaints);
router.get('/complaints/:id', ...auth, ctrl.getComplaint);
router.put('/complaints/:id/resolve', ...auth, ctrl.resolveComplaint);
router.put('/complaints/:id/reject', ...auth, ctrl.rejectComplaint);

// Audit & Reports
router.get('/audit-logs', ...auth, ctrl.getAuditLogs);
router.delete('/audit-logs', ...auth, ctrl.clearAuditLogs);
router.get('/reports', ...auth, ctrl.getReports);
router.get('/stats', ...auth, ctrl.getStats);

// Announcements
router.post('/announcements', ...auth, ctrl.createAnnouncement);

// Notifications
router.get('/notifications', ...auth, ctrl.getNotifications);

module.exports = router;
