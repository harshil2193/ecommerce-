const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const nodemailer = require("nodemailer");

// ✅ Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ✅ Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// ✅ Send Email helper
const sendEmail = async (toEmail, subject, htmlBody) => {
  try {
    const info = await transporter.sendMail({
      from: `"E-Commerce Store" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: htmlBody
    });
    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.log("❌ Email error:", err.message);
  }
};


// ✅ Create Order → reduce stock immediately
router.post("/create", async (req, res) => {
  try {
    const { userId, customerName, phone, address, paymentMethod, products, totalAmount } = req.body;

    for (let item of products) {
      const product = await Product.findById(item._id);
      if (!product) return res.status(404).json({ message: `Product not found: ${item.name}` });
      if (product.stock < item.qty) return res.status(400).json({ message: `Not enough stock for: ${product.name}` });
      product.stock -= item.qty;
      await product.save();
    }

    const order = new Order({
      userId, customerName, phone, address, paymentMethod,
      products: products.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image
      })),
      totalAmount
    });

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });

  } catch (err) {
    console.log("ORDER ERROR:", err);
    res.status(500).json(err);
  }
});


// ✅ Update Order Status
router.put("/update/:id", async (req, res) => {
  console.log("🔥 UPDATE API HIT");
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    console.log("OLD STATUS:", order.status);
    console.log("NEW STATUS:", status);

    const User = require("../models/User");
    const user = await User.findById(order.userId);
    const userEmail = user ? user.email : null;

    // 🟡 Accepted → generate OTP + send email
    if (status === "Accepted" && order.status !== "Accepted") {
      const otp = generateOTP();
      order.otp = otp;

      const productRows = order.products.map(p => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${p.name}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${p.qty}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">₹${p.price * p.qty}</td>
        </tr>`).join("");

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden;">
          <div style="background:#4CAF50;padding:20px;text-align:center;">
            <h1 style="color:white;margin:0;">✅ Order Accepted!</h1>
          </div>
          <div style="padding:24px;">
            <p>Hi <strong>${order.customerName}</strong>, your order has been confirmed.</p>
            <table style="width:100%;border-collapse:collapse;">
              <thead><tr style="background:#f5f5f5;">
                <th style="padding:8px;border:1px solid #ddd;text-align:left;">Product</th>
                <th style="padding:8px;border:1px solid #ddd;">Qty</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:right;">Price</th>
              </tr></thead>
              <tbody>${productRows}</tbody>
            </table>
            <p style="text-align:right;font-size:18px;margin-top:12px;"><strong>Total: ₹${order.totalAmount}</strong></p>
            <p>📍 <strong>Address:</strong> ${order.address}</p>
            <p>📞 <strong>Phone:</strong> ${order.phone}</p>
            <div style="background:#fff8e1;border:2px dashed #FFC107;border-radius:8px;padding:16px;text-align:center;margin-top:20px;">
              <p style="margin:0;font-size:14px;color:#555;">Your Delivery OTP</p>
              <h1 style="margin:8px 0;color:#333;letter-spacing:8px;">${otp}</h1>
              <p style="margin:0;font-size:12px;color:#888;">Show this OTP to the delivery person to confirm delivery</p>
            </div>
            <p style="margin-top:24px;color:#888;font-size:13px;">Thank you for shopping with us!</p>
          </div>
        </div>`;

      if (userEmail) await sendEmail(userEmail, "✅ Your Order is Accepted!", html);
    }

    // 🔴 Cancelled → restore stock + send email
    if (status === "Cancelled" && order.status !== "Cancelled") {
      for (let item of order.products) {
        const product = await Product.findById(item.productId);
        if (!product) continue;
        product.stock += item.qty;
        await product.save();
      }

      const productRows = order.products.map(p => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd;">${p.name}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center;">${p.qty}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right;">₹${p.price * p.qty}</td>
        </tr>`).join("");

      const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden;">
          <div style="background:#f44336;padding:20px;text-align:center;">
            <h1 style="color:white;margin:0;">❌ Order Cancelled</h1>
          </div>
          <div style="padding:24px;">
            <p>Hi <strong>${order.customerName}</strong>, your order has been cancelled.</p>
            <table style="width:100%;border-collapse:collapse;">
              <thead><tr style="background:#f5f5f5;">
                <th style="padding:8px;border:1px solid #ddd;text-align:left;">Product</th>
                <th style="padding:8px;border:1px solid #ddd;">Qty</th>
                <th style="padding:8px;border:1px solid #ddd;text-align:right;">Price</th>
              </tr></thead>
              <tbody>${productRows}</tbody>
            </table>
            <p style="text-align:right;font-size:18px;margin-top:12px;"><strong>Total: ₹${order.totalAmount}</strong></p>
            <p style="color:#888;margin-top:24px;">Sorry for the inconvenience. Contact us for any queries.</p>
          </div>
        </div>`;

      if (userEmail) await sendEmail(userEmail, "❌ Your Order has been Cancelled", html);
    }

    // 🟢 Cancelled → back to active = reduce stock again
    if (order.status === "Cancelled" && status !== "Cancelled") {
      for (let item of order.products) {
        const product = await Product.findById(item.productId);
        if (!product) continue;
        if (product.stock < item.qty) return res.status(400).json({ message: `Not enough stock for: ${product.name}` });
        product.stock -= item.qty;
        await product.save();
      }
    }

    order.status = status;
    await order.save();
    res.json({ message: "Order status updated" });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


// ✅ Verify OTP → mark order as Delivered
router.post("/verify-otp/:id", async (req, res) => {
  try {
    const { otp } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Accepted") return res.status(400).json({ message: "Order is not in Accepted state" });
    if (order.otp !== otp) return res.status(400).json({ message: "Invalid OTP. Please try again." });

    // ✅ OTP matched → mark as Delivered
    order.status = "Delivered";
    order.otp = ""; // clear OTP after use
    await order.save();

    res.json({ message: "OTP verified! Order marked as Delivered." });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


// ✅ Get Orders by User ID
router.get("/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});


// ✅ Get All Orders (Admin)
router.get("/all", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});


// ✅ Delete Order
router.delete("/delete/:id", async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
