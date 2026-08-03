const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'A valid email address is required.']
  },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
  hash: { type: String, required: true, select: false },
  salt: { type: String, required: true, select: false }
}, { timestamps: true, versionKey: false, collection: 'users' });

userSchema.methods.setPassword = function setPassword(password) {
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(password, this.salt, 100000, 64, 'sha512').toString('hex');
};

userSchema.methods.validPassword = function validPassword(password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 100000, 64, 'sha512');
  const storedHash = Buffer.from(this.hash, 'hex');
  return storedHash.length === hash.length && crypto.timingSafeEqual(storedHash, hash);
};

userSchema.methods.generateJwt = function generateJwt() {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);
  return jwt.sign({ _id: this._id, email: this.email, name: this.name, exp: Math.floor(expiry.getTime() / 1000) }, process.env.JWT_SECRET);
};

module.exports = mongoose.model('users', userSchema);
