const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
=========================================================
HELPER
=========================================================
*/

const getUserId = (req) => {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    null
  );
};

/*
=========================================================
CREATE ORDER
POST /api/orders

AUTHENTICATION REQUIRED
=========================================================
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Please login before placing an order",
      });
    }

    const {
      items,
      shippingAddress,
      customer,
      paymentMethod = "COD",
      subtotal,
      deliveryFee,
      total,
    } = req.body;

    /*
    ===============================================
    BASIC VALIDATION
    ===============================================
    */

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one product",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    if (
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.addressLine ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    if (!customer?.email) {
      return res.status(400).json({
        success: false,
        message: "Customer email is required",
      });
    }

    /*
    ===============================================
    BUILD ORDER ITEMS
    ===============================================
    */

    const orderItems = [];

    let calculatedSubtotal = 0;

    for (const item of items) {
      const productId =
        item.product ||
        item.productId ||
        item._id;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: "Product ID is missing",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(productId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      const product =
        await Product.findById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${productId}`,
        });
      }

      /*
      =============================================
      STOCK CHECK
      =============================================
      */

      const quantity =
        Number(item.quantity) || 1;

      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid product quantity",
        });
      }

      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} has only ${product.stock} item(s) in stock`,
        });
      }

      /*
      =============================================
      ACTUAL PRODUCT PRICE
      =============================================
      */

      const originalPrice =
        Number(product.price) || 0;

      const discount =
        Number(product.discount) || 0;

      const finalPrice =
        discount > 0
          ? originalPrice -
            (originalPrice * discount) / 100
          : originalPrice;

      calculatedSubtotal +=
        finalPrice * quantity;

      orderItems.push({
        product: product._id,

        name: product.name,

        image:
          product.images?.[0] ||
          product.image ||
          "",

        price: finalPrice,

        quantity,
      });
    }

    /*
    ===============================================
    DELIVERY CHARGE
    ===============================================
    */

    const requestedDelivery =
      Number(deliveryFee);

    const deliveryCharge =
      Number.isFinite(requestedDelivery)
        ? Math.max(0, requestedDelivery)
        : calculatedSubtotal >= 999
        ? 0
        : 49;

    /*
    ===============================================
    FINAL TOTAL
    ===============================================
    */

    const finalTotal =
      calculatedSubtotal +
      deliveryCharge;

    /*
    ===============================================
    CREATE ORDER
    ===============================================
    */

    const order =
      await Order.create({
        /*
          IMPORTANT:
          This comes from the verified JWT.
          User cannot choose another user ID.
        */

        user: userId,

        items: orderItems,

        shippingAddress: {
          fullName:
            shippingAddress.fullName.trim(),

          phone:
            shippingAddress.phone.trim(),

          addressLine:
            shippingAddress.addressLine.trim(),

          city:
            shippingAddress.city.trim(),

          state:
            shippingAddress.state.trim(),

          pincode:
            shippingAddress.pincode.trim(),
        },

        subtotal:
          Math.round(
            calculatedSubtotal * 100
          ) / 100,

        deliveryCharge:
          Math.round(
            deliveryCharge * 100
          ) / 100,

        discount: 0,

        totalAmount:
          Math.round(
            finalTotal * 100
          ) / 100,

        paymentMethod:
          paymentMethod === "ONLINE"
            ? "RAZORPAY"
            : "COD",

        paymentStatus: "Pending",

        transactionId: "",

        status: "Pending",
      });

    /*
    ===============================================
    REDUCE PRODUCT STOCK
    ===============================================
    */

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            stock: -item.quantity,
          },
        }
      );
    }

    /*
    ===============================================
    RESPONSE
    ===============================================
    */

    return res.status(201).json({
      success: true,

      message: "Order placed successfully",

      order: {
        id: order._id,
        orderId: order._id,
        status: order.status,
        paymentStatus:
          order.paymentStatus,
        totalAmount:
          order.totalAmount,
        createdAt:
          order.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create order",
    });
  }
});

/*
=========================================================
GET MY ORDERS
GET /api/orders/my

AUTHENTICATION REQUIRED
=========================================================
*/

router.get(
  "/my",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Please login",
        });
      }

      const orders =
        await Order.find({
          user: userId,
        })
          .populate(
            "items.product",
            "name slug images price"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,
        count: orders.length,
        orders,
      });
    } catch (error) {
      console.error(
        "GET MY ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to fetch orders",
      });
    }
  }
);

/*
=========================================================
GET SINGLE ORDER
GET /api/orders/:id

AUTHENTICATION REQUIRED
=========================================================
*/

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Please login",
        });
      }

      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      /*
        IMPORTANT:
        Both _id AND user are checked.
        So one user cannot access another
        user's order.
      */

      const order =
        await Order.findOne({
          _id: id,
          user: userId,
        }).populate(
          "items.product",
          "name slug images price"
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      return res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      console.error(
        "GET ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to fetch order",
      });
    }
  }
);

/*
=========================================================
CANCEL ORDER
PATCH /api/orders/:id/cancel

AUTHENTICATION REQUIRED
=========================================================
*/

router.patch(
  "/:id/cancel",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Please login",
        });
      }

      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }

      /*
        IMPORTANT:
        Only the logged-in user's order
        can be cancelled.
      */

      const order =
        await Order.findOne({
          _id: id,
          user: userId,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      if (
        [
          "Shipped",
          "Out for Delivery",
          "Delivered",
          "Cancelled",
        ].includes(order.status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This order cannot be cancelled",
        });
      }

      order.status = "Cancelled";

      order.cancelledAt =
        new Date();

      order.cancellationReason =
        req.body?.reason ||
        "Cancelled by customer";

      /*
      =============================================
      RESTORE STOCK
      =============================================
      */

      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          {
            $inc: {
              stock: item.quantity,
            },
          }
        );
      }

      await order.save();

      return res.status(200).json({
        success: true,
        message:
          "Order cancelled successfully",
        order,
      });
    } catch (error) {
      console.error(
        "CANCEL ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to cancel order",
      });
    }
  }
);

module.exports = router;