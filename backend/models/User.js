// models/User.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  resetOtp: String,
  resetOtpExpiry: Number,
});

module.exports = mongoose.model("User", schema);