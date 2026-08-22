const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actorRole: {
    type: String,
    enum: ['student', 'institution', 'employer', 'admin', 'system'],
  },
  actorId: { type: mongoose.Schema.Types.ObjectId },
  actorEmail: { type: String },
  action: { type: String, required: true },
  // e.g. CERT_ISSUED, CERT_REVOKED, INSTITUTION_APPROVED, COMPLAINT_RESOLVED
  targetType: { type: String },
  targetId: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed },
  ip: { type: String },
  timestamp: { type: Date, default: Date.now },
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ actorRole: 1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
