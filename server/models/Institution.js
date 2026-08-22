const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const institutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Institution name is required'], trim: true },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6 },
    contactPerson: { type: String, trim: true },
    contactMobile: { type: String },
    address: { type: String },
    state: { type: String },
    district: { type: String },
    website: { type: String },
    type: {
      type: String,
      enum: ['University', 'College', 'School', 'Institute', 'Other'],
      default: 'College',
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isSuspended: { type: Boolean, default: false },
    suspendReason: { type: String },
    rejectionReason: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    approvedAt: { type: Date },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

institutionSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

institutionSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

institutionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Institution', institutionSchema);
