const AuditLog = require('../models/AuditLog');

/**
 * auditLog middleware factory
 * Usage: router.post('/route', protect, auditLog('CERT_ISSUED', 'Certificate'), controller)
 *
 * Hooks into res.json to log only on successful responses (2xx).
 */
function auditLog(action, targetType = '') {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = async function (data) {
      // Log only on success
      if (res.statusCode >= 200 && res.statusCode < 300 && data && data.success !== false) {
        try {
          await AuditLog.create({
            actorRole: req.userRole || 'system',
            actorId: req.user?._id,
            actorEmail: req.user?.email,
            action,
            targetType,
            targetId:
              req.params.id ||
              req.params.certId ||
              data?.data?._id ||
              data?.data?.certId ||
              '',
            metadata: {
              method: req.method,
              path: req.originalUrl,
              body: req.body,
            },
            ip: req.ip || req.connection?.remoteAddress,
          });
        } catch (err) {
          console.error('AuditLog write error:', err.message);
          // Don't fail the request over audit log error
        }
      }
      return originalJson(data);
    };

    next();
  };
}

module.exports = { auditLog };
