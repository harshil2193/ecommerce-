require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);  // ✅ All order routes handled here (includes stock logic)
app.use("/api/payment", paymentRoutes); // ✅ Razorpay payment routes

mongoose.connect("process.env.MONGO_URI")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));

// =======================
// API 8: UPLOAD IMAGE
// =======================
const storage = multer.diskStorage({
  destination: (req,file,cb)=>{ cb(null,"uploads/"); },
  filename: (req,file,cb)=>{ cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage });



// =======================
// API 2: REGISTER
// =======================
app.post("/api/register", async (req, res) => {
  const User = require("./models/User");
  const exist = await User.findOne({email:req.body.email});
  if(exist){ return res.status(400).json({message:"User already exists"}); }
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

// =======================
// API 3: LOGIN
// =======================
app.post("/api/login", async (req, res) => {
  console.log("LOGIN BODY:", req.body);
  const User = require("./models/User");
  if (!req.body || !req.body.email || !req.body.password) {
    return res.status(400).json({ message: "Missing email or password" });
  }
  try {
    const user = await User.findOne({ email: req.body.email, password: req.body.password });
    if (user) { res.json(user); }
    else { res.status(401).json({ message: "Invalid login" }); }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// API 4: CART
// =======================
app.post("/api/cart", async (req, res) => {
  const Cart = require("./models/Cart");
  let cart = await Cart.findOne({userId: req.body.userId});
  if(cart){ cart.products = req.body.products; await cart.save(); }
  else { cart = new Cart(req.body); await cart.save(); }
  res.json(cart);
});

app.post("/api/cart/get", async (req, res) => {
  const Cart = require("./models/Cart");
  const cart = await Cart.findOne({userId: req.body.userId});
  if(cart){ res.json(cart); } else { res.json({products:[]}); }
});

app.get("/api/cart/:userId", async (req, res) => {
  const Cart = require("./models/Cart");
  const cart = await Cart.findOne({userId:req.params.userId});
  if(cart){ res.json(cart.products); } else { res.json([]); }
});

// =======================
// API 5: ADDRESS
// =======================
app.post("/api/address", async (req, res) => {
  const mongoose = require("mongoose");
  const Address = mongoose.model("Address", new mongoose.Schema({
    userId: String, name: String, phone: String,
    city: String, pincode: String, address: String
  }));
  const data = new Address(req.body);
  await data.save();
  res.json(data);
});

// =======================
// API 6: UPDATE USER
// =======================
app.post("/api/update-user", async (req, res) => {
  const User = require("./models/User");
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.body.userId,
      { name: req.body.name, email: req.body.email, password: req.body.password },
      { returnDocument: "after" }
    );
    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error updating user" });
  }
});

// =======================
// API 7: ADMIN DASHBOARD
// =======================
app.get("/api/dashboard", async (req, res) => {
  const Product = require("./models/Product");
  const Order = require("./models/Order");
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();
  const revenueData = await Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }]);
  res.json({ products: totalProducts, orders: totalOrders, revenue: revenueData[0]?.totalRevenue || 0 });
});

// =======================
// API: FORGOT PASSWORD - Send OTP to email
// =======================
app.post("/api/forgot-password", async (req, res) => {
  const User = require("./models/User");
  const nodemailer = require("nodemailer");

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "No account found with this email" });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Save OTP to user
    user.resetOtp = otp;
    user.resetOtpExpiry = expiry;
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"E-Commerce" <${process.env.GMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #4f46e5;">Password Reset Request</h2>
          <p>Your OTP to reset your password is:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #4f46e5; text-align: center; padding: 16px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 13px;">This OTP expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
          <p style="color: #6b7280; font-size: 13px;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    });

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to send OTP. Check your email config." });
  }
});

// =======================
// API: VERIFY RESET OTP
// =======================
app.post("/api/verify-reset-otp", async (req, res) => {
  const User = require("./models/User");
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetOtp !== req.body.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (Date.now() > user.resetOtpExpiry) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    res.json({ message: "OTP verified" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// API: RESET PASSWORD
// =======================
app.post("/api/reset-password", async (req, res) => {
  const User = require("./models/User");
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetOtp !== req.body.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (Date.now() > user.resetOtpExpiry) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // Update password and clear OTP
    user.password = req.body.newPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () => console.log("Server running"));