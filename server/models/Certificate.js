const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certId: { type: String, unique: true, required: true }, // PRVX-XXXXXXXX
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },

    // Denormalized snapshot at time of issuance
    studentName: { type: String, required: true },
    studentEmail: { type: String, required: true },
    studentRollNo: { type: String },
    institutionName: { type: String, required: true },

    course: { type: String, required: [true, 'Course is required'] },
    degree: { type: String }, // e.g. B.Tech, M.Sc
    specialization: { type: String },
    grade: { type: String },
    percentage: { type: Number },
    certType: {
      type: String,
      enum: ['Degree', 'Marksheet', 'Migration', 'Achievement', 'Other'],
      required: [true, 'Certificate type is required'],
    },
    issueDate: { type: Date, required: [true, 'Issue date is required'] },
    expiryDate: { type: Date },

    pdfUrl: { type: String }, // Cloudinary URL
    qrUrl: { type: String }, // QR image data URL or Cloudinary URL
    sha256Hash: { type: String }, // SHA-256 hash of certificate data

    status: { type: String, enum: ['active', 'revoked'], default: 'active' },
    revokedBy: { type: String, enum: ['institution', 'admin'] },
    revokeReason: { type: String },
    revokedAt: { type: Date },

    verificationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for fast lookups
certificateSchema.index({ student: 1 });
certificateSchema.index({ institution: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
