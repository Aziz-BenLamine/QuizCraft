const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Not required for Google users
  googleId: { type: String }, // Add googleId for Google users
  githubId: { type: String }, // Add githubId for GitHub users
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);