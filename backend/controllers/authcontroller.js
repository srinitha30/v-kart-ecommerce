const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =====================================================
// GENERATE TOKEN
// =====================================================

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is missing in .env file"
    );
  }

  return jwt.sign(
    {
      id: user._id.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================

const register = async (req, res) => {
  try {
    console.log("========== REGISTER ==========");
    console.log("REGISTER BODY:", req.body);

    // Convert everything to string safely
    const name = String(
      req.body?.name || ""
    ).trim();

    const phone = String(
      req.body?.phone || ""
    ).trim();

    const password = String(
      req.body?.password || ""
    );

    // =================================================
    // VALIDATION
    // =================================================

    if (!name || !phone || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, phone and password are required",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number must contain exactly 10 digits",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    // =================================================
    // CHECK EXISTING USER
    // =================================================

    const existingUser =
      await User.findOne({
        phone: phone,
      });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          "Phone number already registered",
      });
    }

    // =================================================
    // HASH PASSWORD
    // =================================================

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // =================================================
    // CREATE USER
    // =================================================

    const user =
      await User.create({
        name: name,
        phone: phone,
        password: hashedPassword,
      });

    console.log(
      "USER CREATED:",
      user._id.toString()
    );

    // =================================================
    // GENERATE TOKEN
    // =================================================

    const token =
      generateToken(user);

    // =================================================
    // SUCCESS RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,
      message:
        "Registration successful",

      token: token,

      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(
      "========== REGISTER ERROR =========="
    );

    console.error(
      "ERROR NAME:",
      error?.name
    );

    console.error(
      "ERROR MESSAGE:",
      error?.message
    );

    console.error(
      "ERROR CODE:",
      error?.code
    );

    console.error(
      "FULL ERROR:",
      error
    );

    console.error(
      "===================================="
    );

    // Duplicate phone
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Phone number already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Server error during registration",
    });
  }
};

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

const login = async (req, res) => {
  try {
    console.log("========== LOGIN ==========");
    console.log("LOGIN BODY:", req.body);

    // =================================================
    // GET DATA
    // =================================================

    const phone = String(
      req.body?.phone || ""
    ).trim();

    const password = String(
      req.body?.password || ""
    );

    // =================================================
    // VALIDATION
    // =================================================

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number and password are required",
      });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number must contain exactly 10 digits",
      });
    }

    // =================================================
    // FIND USER
    // =================================================

    const user =
      await User.findOne({
        phone: phone,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid phone number or password",
      });
    }

    // =================================================
    // CHECK PASSWORD
    // =================================================

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid phone number or password",
      });
    }

    // =================================================
    // GENERATE TOKEN
    // =================================================

    const token =
      generateToken(user);

    console.log(
      "LOGIN SUCCESS:",
      user._id.toString()
    );

    // =================================================
    // SUCCESS RESPONSE
    // =================================================

    return res.status(200).json({
      success: true,
      message:
        "Login successful",

      token: token,

      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error(
      "========== LOGIN ERROR =========="
    );

    console.error(
      "ERROR NAME:",
      error?.name
    );

    console.error(
      "ERROR MESSAGE:",
      error?.message
    );

    console.error(
      "ERROR CODE:",
      error?.code
    );

    console.error(
      "FULL ERROR:",
      error
    );

    console.error(
      "================================="
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Server error during login",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  register,
  login,
};