// models/Cart.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: String,
  products: Array
});

module.exports = mongoose.model("Cart", schema);