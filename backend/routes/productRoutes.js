const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer + Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "ecommerce-products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const upload = multer({ storage });

// ================= CREATE PRODUCT =================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const stockValue = req.body.stock ? parseInt(req.body.stock) : 0;

    const product = new Product({
      name: req.body.name,
      price: Number(req.body.price),
      description: req.body.description,
      stock: stockValue,
      originalStock: stockValue,
      image: req.file ? req.file.path : ""  // ✅ Cloudinary returns full URL in req.file.path
    });

    await product.save();
    res.json(product);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// ================= GET ALL PRODUCTS =================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= UPDATE PRODUCT =================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const stockValue = req.body.stock ? parseInt(req.body.stock) : 0;

    const updateData = {
      name: req.body.name,
      price: Number(req.body.price),
      description: req.body.description,
      stock: stockValue,
      originalStock: stockValue
    };

    // ✅ update image only if new one uploaded
    if (req.file) {
      updateData.image = req.file.path; // ✅ Cloudinary full URL
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// ================= GET SINGLE PRODUCT =================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= DELETE PRODUCT =================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
