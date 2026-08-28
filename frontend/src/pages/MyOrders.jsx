import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CreditCard,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../services/api";

import "./MyOrders.css";


/* =========================================================
   HELPERS
========================================================= */

const formatPrice = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};


const formatDate = (value) => {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};


const getStatusClass = (status) => {
  const normalized = String(status || "")
    .toLowerCase()
    .trim();

  if (normalized === "pending") {
    return "status-pending";
  }

  if (normalized === "confirmed") {
    return "status-confirmed";
  }

  if (
    normalized === "shipped" ||
    normalized === "out for delivery"
  ) {
    return "status-shipped";
  }

  if (normalized === "delivered") {
    return "status-delivered";
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled"
  ) {
    return "status-cancelled";
  }

  return "status-pending";
};


const canCancelOrder = (status) => {
  const blockedStatuses = [
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
    "Canceled",
  ];

  return !blockedStatuses.includes(status);
};


/* =========================================================
   COMPONENT
========================================================= */

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [expandedOrders, setExpandedOrders] =
    useState({});

  const [cancellingOrder, setCancellingOrder] =
    useState(null);


  /* =========================================================
     LOAD ORDERS
  ========================================================= */

  const loadOrders = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get("/orders/my");

      const receivedOrders =
        response?.data?.orders || [];

      setOrders(
        Array.isArray(receivedOrders)
          ? receivedOrders
          : []
      );
    } catch (err) {
      console.error(
        "MY ORDERS ERROR:",
        err
      );

      if (err?.response?.status === 401) {
        toast.error("Please login first");

        navigate("/login", {
          state: {
            from: "/orders",
          },
        });

        return;
      }

      setError(
        err?.response?.data?.message ||
          "Unable to load your orders"
      );

      toast.error(
        err?.response?.data?.message ||
          "Unable to load orders"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  /* =========================================================
     INITIAL LOAD
  ========================================================= */

  useEffect(() => {
    loadOrders();
  }, []);


  /* =========================================================
     EXPAND / COLLAPSE
  ========================================================= */

  const toggleExpanded = (orderId) => {
    setExpandedOrders((current) => ({
      ...current,
      [orderId]: !current[orderId],
    }));
  };


  /* =========================================================
     CANCEL ORDER
  ========================================================= */

  const cancelOrder = async (orderId) => {
    if (!orderId) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    try {
      setCancellingOrder(orderId);

      const response = await api.patch(
        `/orders/${orderId}/cancel`,
        {
          reason: "Cancelled by customer",
        }
      );

      const updatedOrder =
        response?.data?.order;

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          String(order._id) === String(orderId)
            ? updatedOrder || {
                ...order,
                status: "Cancelled",
                cancelledAt: new Date().toISOString(),
              }
            : order
        )
      );

      toast.success(
        "Order cancelled successfully"
      );
    } catch (err) {
      console.error(
        "CANCEL ORDER ERROR:",
        err
      );

      if (err?.response?.status === 401) {
        toast.error("Please login first");

        navigate("/login", {
          state: {
            from: "/orders",
          },
        });

        return;
      }

      toast.error(
        err?.response?.data?.message ||
          "Unable to cancel order"
      );
    } finally {
      setCancellingOrder(null);
    }
  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <main className="my-orders-page">
        <div className="orders-shell">

          <div className="orders-skeleton-header">
            <div className="skeleton skeleton-small" />

            <div className="skeleton skeleton-title" />

            <div className="skeleton skeleton-text" />
          </div>


          {Array.from({ length: 3 }).map(
            (_, index) => (
              <div
                key={index}
                className="orders-skeleton-card"
              >
                <div className="skeleton skeleton-image" />

                <div className="skeleton-content">
                  <div className="skeleton skeleton-line" />
                  <div className="skeleton skeleton-line short" />
                  <div className="skeleton skeleton-line" />
                </div>
              </div>
            )
          )}

        </div>
      </main>
    );
  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (error && orders.length === 0) {
    return (
      <main className="my-orders-page">
        <div className="orders-shell">

          <div className="orders-empty-card">

            <div className="orders-error-icon">
              <XCircle size={30} />
            </div>

            <h2>
              Unable to load orders
            </h2>

            <p>
              {error}
            </p>

            <button
              type="button"
              className="orders-primary-button"
              onClick={() => loadOrders()}
            >
              <RefreshCw size={16} />
              Try Again
            </button>

          </div>

        </div>
      </main>
    );
  }


  /* =========================================================
     EMPTY
  ========================================================= */

  if (orders.length === 0) {
    return (
      <main className="my-orders-page">
        <div className="orders-shell">

          <div className="orders-empty-card">

            <div className="orders-empty-icon">
              <ShoppingBag size={30} />
            </div>

            <p className="orders-eyebrow">
              VKART
            </p>

            <h2>
              No orders yet
            </h2>

            <p>
              You haven't placed any orders yet.
              Start shopping and your orders
              will appear here.
            </p>

            <Link
              to="/products"
              className="orders-primary-button"
            >
              <ShoppingBag size={16} />
              Browse Products
            </Link>

          </div>

        </div>
      </main>
    );
  }


  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <main className="my-orders-page">

      <div className="orders-shell">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="orders-header">

          <div>

            <p className="orders-eyebrow">
              VKART
            </p>

            <h1>
              My Orders
            </h1>

            <p className="orders-subtitle">
              Track and manage all your orders
              in one place.
            </p>

          </div>


          <div className="orders-header-actions">

            <Link
              to="/products"
              className="orders-secondary-button"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>

            <button
              type="button"
              className="orders-refresh-button"
              onClick={() => loadOrders(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "spin" : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>

          </div>

        </header>


        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <div className="orders-toolbar">

          <div className="orders-count">

            <ClipboardList size={18} />

            <span>
              {orders.length}{" "}
              {orders.length === 1
                ? "Order"
                : "Orders"}
            </span>

          </div>

          <span className="orders-count-note">
            Latest orders shown first
          </span>

        </div>


        {/* ===================================================
            ORDERS LIST
        =================================================== */}

        <div className="orders-list">

          {orders.map((order) => {

            const orderId =
              order._id ||
              order.id ||
              order.orderId;

            const status =
              order.status || "Pending";

            const statusClass =
              getStatusClass(status);

            const isExpanded =
              Boolean(
                expandedOrders[orderId]
              );

            const items =
              Array.isArray(order.items)
                ? order.items
                : [];

            const subtotal =
              Number(order.subtotal) || 0;

            const deliveryCharge =
              Number(
                order.deliveryCharge
              ) || 0;

            const discount =
              Number(order.discount) || 0;

            const total =
              Number(
                order.totalAmount
              ) || 0;

            const address =
              order.shippingAddress || {};

            return (
              <article
                key={orderId}
                className="order-card"
              >

                {/* =========================================
                    TOP
                ========================================= */}

                <div className="order-card-top">

                  <div className="order-id-block">

                    <span className="order-label">
                      ORDER ID
                    </span>

                    <h2>
                      #{String(orderId).slice(-8).toUpperCase()}
                    </h2>

                  </div>


                  <div
                    className={`order-status ${statusClass}`}
                  >
                    <span className="status-dot" />

                    {status}
                  </div>

                </div>


                {/* =========================================
                    INFO GRID
                ========================================= */}

                <div className="order-info-grid">

                  <div className="order-info-item">

                    <Package size={18} />

                    <div>
                      <span>
                        Items
                      </span>

                      <strong>
                        {items.length}{" "}
                        {items.length === 1
                          ? "Product"
                          : "Products"}
                      </strong>
                    </div>

                  </div>


                  <div className="order-info-item">

                    <div className="order-price-symbol">
                      ₹
                    </div>

                    <div>
                      <span>
                        Total
                      </span>

                      <strong>
                        {formatPrice(total)}
                      </strong>
                    </div>

                  </div>


                  <div className="order-info-item">

                    <CreditCard size={18} />

                    <div>
                      <span>
                        Payment
                      </span>

                      <strong>
                        {order.paymentMethod ||
                          "COD"}
                      </strong>
                    </div>

                  </div>


                  <div className="order-info-item">

                    <Truck size={18} />

                    <div>
                      <span>
                        Ordered On
                      </span>

                      <strong>
                        {formatDate(
                          order.createdAt
                        )}
                      </strong>
                    </div>

                  </div>

                </div>


                {/* =========================================
                    PRODUCTS
                ========================================= */}

                <div className="order-products">

                  {items.length === 0 ? (
                    <div className="order-product-empty">
                      <Package size={17} />
                      No products found
                    </div>
                  ) : (
                    items.map(
                      (item, index) => {

                        const product =
                          item.product || {};

                        const image =
                          item.image ||
                          product.images?.[0] ||
                          product.image ||
                          "";

                        const name =
                          item.name ||
                          product.name ||
                          "Product";

                        const price =
                          Number(
                            item.price
                          ) || 0;

                        const quantity =
                          Number(
                            item.quantity
                          ) || 1;

                        return (
                          <div
                            className="order-product"
                            key={
                              item._id ||
                              `${orderId}-${index}`
                            }
                          >

                            <div className="order-product-image">

                              {image ? (
                                <img
                                  src={image}
                                  alt={name}
                                />
                              ) : (
                                <ShoppingBag
                                  size={22}
                                />
                              )}

                            </div>


                            <div className="order-product-info">

                              <h3>
                                {name}
                              </h3>

                              <p>
                                Qty: {quantity}
                              </p>

                            </div>


                            <strong className="order-product-price">
                              {formatPrice(
                                price *
                                  quantity
                              )}
                            </strong>

                          </div>
                        );
                      }
                    )
                  )}

                </div>


                {/* =========================================
                    EXPAND BUTTON
                ========================================= */}

                <button
                  type="button"
                  className="order-expand-button"
                  onClick={() =>
                    toggleExpanded(orderId)
                  }
                >
                  {isExpanded ? (
                    <>
                      Hide Order Details
                      <ChevronUp size={15} />
                    </>
                  ) : (
                    <>
                      View Order Details
                      <ChevronDown size={15} />
                    </>
                  )}
                </button>


                {/* =========================================
                    EXPANDED DETAILS
                ========================================= */}

                {isExpanded && (
                  <div className="order-expanded">

                    {/* ADDRESS */}

                    <section className="order-detail-section">

                      <div className="detail-heading">

                        <MapPin size={17} />

                        <h3>
                          Delivery Address
                        </h3>

                      </div>


                      <div className="address-box">

                        <strong>
                          {address.fullName ||
                            "—"}
                        </strong>

                        <p>
                          {address.addressLine ||
                            "—"}
                          <br />

                          {address.city || "—"},{" "}
                          {address.state || "—"}{" "}
                          -{" "}
                          {address.pincode ||
                            "—"}
                        </p>

                        <span>
                          Phone:{" "}
                          {address.phone ||
                            "—"}
                        </span>

                      </div>

                    </section>


                    {/* PRICE */}

                    <section className="order-detail-section">

                      <div className="detail-heading">

                        <CreditCard size={17} />

                        <h3>
                          Price Details
                        </h3>

                      </div>


                      <div className="price-breakdown">

                        <div>
                          <span>
                            Subtotal
                          </span>

                          <strong>
                            {formatPrice(
                              subtotal
                            )}
                          </strong>
                        </div>


                        <div>
                          <span>
                            Delivery
                          </span>

                          <strong>
                            {deliveryCharge === 0
                              ? "FREE"
                              : formatPrice(
                                  deliveryCharge
                                )}
                          </strong>
                        </div>


                        <div>
                          <span>
                            Discount
                          </span>

                          <strong>
                            {discount > 0
                              ? `-${formatPrice(
                                  discount
                                )}`
                              : "₹0"}
                          </strong>
                        </div>


                        <div className="price-total">

                          <span>
                            Total
                          </span>

                          <strong>
                            {formatPrice(total)}
                          </strong>

                        </div>

                      </div>

                    </section>

                  </div>
                )}


                {/* =========================================
                    ACTIONS
                ========================================= */}

                <div className="order-actions">

                  {canCancelOrder(status) ? (
                    <button
                      type="button"
                      className="orders-cancel-button"
                      onClick={() =>
                        cancelOrder(orderId)
                      }
                      disabled={
                        cancellingOrder ===
                        orderId
                      }
                    >

                      {cancellingOrder ===
                      orderId ? (
                        <>
                          <span className="button-spinner" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <XCircle size={16} />
                          Cancel Order
                        </>
                      )}

                    </button>
                  ) : (
                    <span className="order-final-status">
                      {status === "Cancelled" ||
                      status === "Canceled"
                        ? `Cancelled ${
                            order.cancelledAt
                              ? `on ${formatDate(
                                  order.cancelledAt
                                )}`
                              : ""
                          }`
                        : `Order ${status.toLowerCase()}`}
                    </span>
                  )}

                </div>

              </article>
            );
          })}

        </div>

      </div>

    </main>
  );
}


export default MyOrders;