require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

/*
=========================================================
MIDDLEWARE
=========================================================
*/

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

/*
=========================================================
ROUTES
=========================================================
*/

const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const wishlistRoutes = require("./routes/Wishlistroutes");
const productRoutes = require("./routes/productRoutes");

/*
=========================================================
API ROUTES
=========================================================
*/

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/orders",
  orderRoutes
);

app.use(
  "/api/wishlist",
  wishlistRoutes
);

app.use(
  "/api/products",
  productRoutes
);

/*
=========================================================
HEALTH CHECK
=========================================================
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "VKART API is running",
  });
});

/*
=========================================================
MONGODB
=========================================================
*/

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(
      "MongoDB successfully connected"
    );

    app.listen(5000, () => {
      console.log(
        "VKART server running on port 5000"
      );
    });
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );
  });