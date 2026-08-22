const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employerSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: [true, 'Company name is required'], trim: true },
    cin: { type: String, trim: true }, // Company Identification Number (optional)
    hrName: { type: String, required: [true, 'HR name is required'], trim: true },
    designation: { type: String, trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: { type: String },
    password: { type: String, required: [true, 'Password is required'], minlength: 6 },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    otp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

employerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

employerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

employerSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Employer', employerSchema);
