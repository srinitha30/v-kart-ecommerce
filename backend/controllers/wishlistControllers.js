const mongoose = require("mongoose");

const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

/* =========================================================
   ADD TO WISHLIST
   POST /api/wishlist
========================================================= */

const addToWishlist = async (req, res) => {
  try {
    console.log("\n========== ADD WISHLIST ==========");

    console.log("REQ.USER:", req.user);
    console.log("REQ.BODY:", req.body);

    const userId = req.user?.id;
    const { productId } = req.body;

    console.log("USER ID:", userId);
    console.log("PRODUCT ID:", productId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      !productId ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /* Check existing */

    const existing = await Wishlist.findOne({
      user: userId,
      product: productId,
    });

    if (existing) {
      console.log(
        "ALREADY EXISTS:",
        existing
      );

      return res.status(200).json({
        success: true,
        message: "Product already in wishlist",
        wishlist: existing,
      });
    }

    /* Create */

    const wishlist = await Wishlist.create({
      user: userId,
      product: productId,
    });

    console.log(
      "WISHLIST CREATED:",
      wishlist
    );

    /* Populate */

    const populatedWishlist =
      await Wishlist.findById(
        wishlist._id
      ).populate(
        "product",
        "name images slug price discount stock category"
      );

    console.log(
      "POPULATED WISHLIST:",
      populatedWishlist
    );

    return res.status(201).json({
      success: true,
      message: "Added to wishlist",
      wishlist: populatedWishlist,
    });

  } catch (error) {
    console.error(
      "ADD WISHLIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to add to wishlist",
      error: error.message,
    });
  }
};


/* =========================================================
   GET MY WISHLIST
   GET /api/wishlist
========================================================= */

const getWishlist = async (req, res) => {
  try {
    console.log("\n========== GET WISHLIST ==========");

    console.log("REQ.USER:", req.user);

    const userId = req.user?.id;

    console.log(
      "GET USER ID:",
      userId
    );

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const wishlist =
      await Wishlist.find({
        user: userId,
      })
        .populate(
          "product",
          "name images slug price discount stock category"
        )
        .sort({
          createdAt: -1,
        });

    console.log(
      "WISHLIST FROM DB:",
      wishlist
    );

    console.log(
      "WISHLIST COUNT:",
      wishlist.length
    );

    return res.status(200).json({
      success: true,
      wishlist,
    });

  } catch (error) {
    console.error(
      "GET WISHLIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load wishlist",
      error: error.message,
    });
  }
};


/* =========================================================
   REMOVE FROM WISHLIST
   DELETE /api/wishlist/:productId
========================================================= */

const removeFromWishlist = async (
  req,
  res
) => {
  try {
    console.log(
      "\n========== REMOVE WISHLIST =========="
    );

    const userId = req.user?.id;
    const { productId } = req.params;

    console.log("USER ID:", userId);
    console.log("PRODUCT ID:", productId);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const deleted =
      await Wishlist.findOneAndDelete({
        user: userId,
        product: productId,
      });

    console.log(
      "DELETED:",
      deleted
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Product is not in wishlist",
      });
    }

    return res.json({
      success: true,
      message: "Removed from wishlist",
    });

  } catch (error) {
    console.error(
      "REMOVE WISHLIST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to remove from wishlist",
      error: error.message,
    });
  }
};


module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};