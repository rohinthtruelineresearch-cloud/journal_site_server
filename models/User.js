const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // required: true, // Not required if using Google Auth
  },
  googleId: {
    type: String,
  },
  role: {
    type: String,
    enum: ['author', 'admin', 'reviewer'],
    default: 'author',
  },
  orcid: { type: String },
  workplace: { type: String },
  jobType: { type: String },
  title: { type: String },
  firstName: { type: String },
  middleName: { type: String },
  lastName: { type: String },
  facebook: { type: String },
  twitter: { type: String },
  affiliation: { type: String },
  address1: { type: String },
  address2: { type: String },
  zipCode: { type: String },
  city: { type: String },
  country: { type: String },
  expertise: { type: String },
  biography: { type: String },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate and hash password reset token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
