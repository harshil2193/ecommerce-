// models/Product.js
const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  stock: {
    type: Number,
    default: 0
  },
  originalStock: {        // ✅ ADD THIS
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Product", schema);