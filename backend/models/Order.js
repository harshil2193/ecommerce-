const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  customerName: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "ONLINE"],
    default: "COD"
  },

  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      name: String,
      price: Number,
      qty: Number,
      image: String
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Shipped", "Delivered", "Cancelled"],
    default: "Pending"
  },

   otp: {
    type: String,
    default: ""   // ✅ stores OTP generated when order is Accepted
  },
  isPaid: {
    type: Boolean,
    default: false
  },

  razorpayOrderId: {
    type: String,
    default: ""
  },

  razorpayPaymentId: {
    type: String,
    default: ""
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);