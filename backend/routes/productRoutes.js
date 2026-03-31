const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const multer = require("multer");
const path = require("path");


// ✅ multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ================= CREATE PRODUCT =================
router.post("/", upload.single("image"), async (req, res) => {
 try {

    // const product = new Product({
    //   name: req.body.name,
    //   price: Number(req.body.price),
    //   description: req.body.description,
    //   stock: req.body.stock ? parseInt(req.body.stock) : 0,
    //   image: req.file ? req.file.filename : ""

    const stockValue = req.body.stock ? parseInt(req.body.stock) : 0;
  


    const product = new Product({
      name: req.body.name,
      price: Number(req.body.price),
      description: req.body.description,
      stock: stockValue,
      originalStock: stockValue,   // ✅ ADD THIS
      image: req.file ? req.file.filename : ""
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

    console.log("UPDATE BODY:", req.body);
    console.log("UPDATE FILE:", req.file);

    const stockValue = req.body.stock ? parseInt(req.body.stock) : 0;

    const updateData = {
      name: req.body.name,
      price: Number(req.body.price),
      description: req.body.description,
      stock: req.body.stock ? parseInt(req.body.stock) : 0,
      originalStock: stockValue
    };

    // ✅ update image only if new uploaded
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
      // { returnDocument: "after" }
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

// ================= UPDATE PRODUCT =================
// router.put("/:id", async (req, res) => {
//   try {
//     const updated = await Product.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       // { new: true }
//       { returnDocument: "after" }
//     );

//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

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