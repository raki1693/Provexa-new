const mongoose = require('mongoose');

const bulkUploadSchema = new mongoose.Schema(
  {
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
    fileName: { type: String },
    totalRows: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    errors: [
      {
        row: Number,
        studentEmail: String,
        reason: String,
      },
    ],
    certIds: [String],
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

module.exports = mongoose.model('BulkUpload', bulkUploadSchema);
