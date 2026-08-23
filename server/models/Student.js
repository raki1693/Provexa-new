const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: { type: String, required: [true, 'Mobile is required'] },
    rollNumber: { type: String, trim: true },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
    institutionName: { type: String }, // stored at registration time
    password: { type: String, required: [true, 'Password is required'], minlength: 6 },
    isVerified: { type: Boolean, default: false },
    totpSecret: { type: String },
    isTotpEnabled: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    profilePhoto: { type: String, default: '' },
  },
  { timestamps: true }
);

// Hash password before save
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
studentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Never return password
studentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.totpSecret;
  return obj;
};

module.exports = mongoose.model('Student', studentSchema);
