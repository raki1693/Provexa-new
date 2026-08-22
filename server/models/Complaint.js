const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    certId: { type: String, required: true },
    cert: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
    employer: { type: mongoose.Schema.Types.ObjectId, ref: 'Employer', required: true },
    employerEmail: { type: String },
    reason: {
      type: String,
      enum: ['Forged', 'Mismatch', 'Revoked but Claimed Valid', 'Other'],
      required: true,
    },
    description: { type: String },
    evidenceUrl: { type: String },
    status: {
      type: String,
      enum: ['open', 'under_review', 'resolved', 'rejected'],
      default: 'open',
    },
    adminNote: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

complaintSchema.index({ employer: 1 });
complaintSchema.index({ status: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
