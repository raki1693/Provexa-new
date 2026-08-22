const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema(
  {
    cert: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
    certId: { type: String }, // stored separately for easy querying
    verifierType: { type: String, enum: ['employer', 'student', 'public'] },
    verifier: { type: mongoose.Schema.Types.ObjectId }, // polymorphic ID
    verifierEmail: { type: String },
    method: { type: String, enum: ['id', 'qr', 'bulk'] },
    result: { type: String, enum: ['verified', 'invalid', 'revoked'] },
    ip: { type: String },
  },
  { timestamps: true }
);

verificationLogSchema.index({ certId: 1 });
verificationLogSchema.index({ verifier: 1 });

module.exports = mongoose.model('VerificationLog', verificationLogSchema);
