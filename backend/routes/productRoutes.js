const express = require("express");
const mongoose = require("mongoose");

const {
  createProduct,
  getProducts,
  getProductBySlug,
} = require("../controllers/productController");

const Product = require("../models/Product");

const router = express.Router();

/* =========================================================
   GET ALL PRODUCTS

   GET /api/products
========================================================= */

router.get("/", getProducts);

/* =========================================================
   GET SINGLE PRODUCT

   GET /api/products/:value

   Supports BOTH:

   1. MongoDB Product ID
   2. Product Slug

   This is important because Checkout
   may send either one.
========================================================= */

router.get("/:value", async (req, res) => {
  try {
    const { value } = req.params;

    let product = null;

    /* =====================================================
       OPTION 1
       CHECK MONGODB ID
    ===================================================== */

    if (mongoose.Types.ObjectId.isValid(value)) {
      product = await Product.findById(value);
    }

    /* =====================================================
       OPTION 2
       CHECK PRODUCT SLUG

       If ID search didn't find anything,
       try slug.
    ===================================================== */

    if (!product) {
      product = await Product.findOne({
        slug: value,
      });
    }

    /* =====================================================
       PRODUCT NOT FOUND
    ===================================================== */

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /* =====================================================
       SUCCESS
    ===================================================== */

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "GET SINGLE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load product",
    });
  }
});

/* =========================================================
   CREATE PRODUCT

   POST /api/products
========================================================= */

router.post("/", createProduct);

/* =========================================================
   EXPORT
========================================================= */

module.exports = router;