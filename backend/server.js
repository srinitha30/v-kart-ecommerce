require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

/*
=========================================================
ENVIRONMENT
=========================================================
*/

const PORT = process.env.PORT || 5000;

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

/*
=========================================================
MIDDLEWARE
=========================================================
*/

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      FRONTEND_URL,
    ],
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

/*
=========================================================
ROUTES
=========================================================
*/

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/Wishlistroutes");
const productRoutes = require("./routes/productroutes");

/*
=========================================================
API ROUTES
=========================================================
*/

app.use("/api/auth", authRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/wishlist", wishlistRoutes);

app.use("/api/products", productRoutes);

/*
=========================================================
HEALTH CHECK
=========================================================
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VKART API is running",
  });
});

/*
=========================================================
API HEALTH CHECK
=========================================================
*/

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VKART backend is healthy",
  });
});

/*
=========================================================
404 HANDLER
=========================================================
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
    path: req.originalUrl,
  });
});

/*
=========================================================
ERROR HANDLER
=========================================================
*/

app.use((error, req, res, next) => {
  console.error("SERVER ERROR:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/*
=========================================================
MONGODB CONNECTION
=========================================================
*/

const startServer = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI is missing in environment variables"
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error(
        "JWT_SECRET is missing in environment variables"
      );
    }

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      "MongoDB successfully connected"
    );

    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `VKART server running on port ${PORT}`
      );

      console.log(
        `Frontend URL: ${FRONTEND_URL}`
      );
    });
  } catch (error) {
    console.error(
      "Server startup error:",
      error.message
    );

    process.exit(1);
  }
};

startServer();