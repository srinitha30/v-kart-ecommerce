const express = require("express");

const {
  getProfile,
  updateProfile,
} = require("../controllers/profileController");

const protect = require("../middleware/authmiddleware");

const router = express.Router();


// GET PROFILE
router.get(
  "/profile",
  protect,
  getProfile
);


// UPDATE PROFILE
router.put(
  "/profile",
  protect,
  updateProfile
);


module.exports = router;