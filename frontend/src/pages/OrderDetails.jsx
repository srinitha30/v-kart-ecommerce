import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../services/api";


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
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const formatDateTime = (value) => {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};


/* =========================================================
   STATUS ICON
========================================================= */

const getStatusIcon = (status) => {
  switch (status) {
    case "Delivered":
      return <CheckCircle2 size={18} />;

    case "Shipped":
      return <Truck size={18} />;

    case "Out for Delivery":
      return <Truck size={18} />;

    case "Cancelled":
      return <XCircle size={18} />;

    default:
      return <Clock3 size={18} />;
  }
};


/* =========================================================
   STATUS CLASS
========================================================= */

const getStatusClass = (status) => {
  switch (status) {
    case "Delivered":
      return "bg-emerald-50 text-emerald-700";

    case "Shipped":
      return "bg-blue-50 text-blue-700";

    case "Out for Delivery":
      return "bg-indigo-50 text-indigo-700";

    case "Cancelled":
      return "bg-red-50 text-red-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
};


/* =========================================================
   ORDER DETAILS
========================================================= */

function OrderDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [cancelling, setCancelling] =
    useState(false);

  const [error, setError] =
    useState("");


  /* =======================================================
     LOAD ORDER
  ======================================================= */

  useEffect(() => {

    const loadOrder = async () => {

      const token =
        localStorage.getItem("token");

      if (!token) {

        navigate("/login", {
          replace: true,
          state: {
            from:
              `/orders/${id}`,
          },
        });

        return;
      }


      try {

        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/orders/${id}`
          );


        const receivedOrder =
          response?.data?.order ||
          response?.data?.data ||
          response?.data;


        if (!receivedOrder) {
          throw new Error(
            "Order not found"
          );
        }


        setOrder(
          receivedOrder
        );

      } catch (err) {

        console.error(
          "ORDER DETAILS ERROR:",
          err
        );


        if (
          err?.response?.status === 401
        ) {

          localStorage.removeItem(
            "token"
          );

          navigate("/login", {
            replace: true,
            state: {
              from:
                `/orders/${id}`,
            },
          });

          return;
        }


        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load order"
        );

      } finally {

        setLoading(false);

      }
    };


    if (id) {
      loadOrder();
    } else {

      setError(
        "Order ID is missing"
      );

      setLoading(false);

    }

  }, [id, navigate]);


  /* =======================================================
     CANCEL ORDER
  ======================================================= */

  const cancelOrder = async () => {

    if (!order?._id) {
      return;
    }


    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this order?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setCancelling(true);


      const response =
        await api.patch(
          `/orders/${order._id}/cancel`,
          {
            reason:
              "Cancelled by customer",
          }
        );


      const updatedOrder =
        response?.data?.order;


      if (updatedOrder) {

        setOrder(
          updatedOrder
        );

      } else {

        setOrder(
          (current) => ({
            ...current,
            status:
              "Cancelled",
            cancelledAt:
              new Date(),
          })
        );

      }


      toast.success(
        "Order cancelled successfully"
      );

    } catch (err) {

      console.error(
        "CANCEL ORDER ERROR:",
        err
      );


      if (
        err?.response?.status === 401
      ) {

        localStorage.removeItem(
          "token"
        );

        toast.error(
          "Session expired. Please login again."
        );

        navigate("/login", {
          state: {
            from:
              `/orders/${id}`,
          },
        });

        return;
      }


      toast.error(
        err?.response?.data?.message ||
          "Unable to cancel order"
      );

    } finally {

      setCancelling(false);

    }
  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {

    return (

      <main className="min-h-screen bg-[#f6f6f3] px-5 py-10">

        <div className="mx-auto max-w-[1200px] animate-pulse">

          <div className="h-4 w-32 rounded bg-black/10" />

          <div className="mt-8 h-10 w-72 rounded bg-black/10" />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">

            <div className="h-[500px] rounded-[26px] bg-white" />

            <div className="h-[400px] rounded-[26px] bg-white" />

          </div>

        </div>

      </main>
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error || !order) {

    return (

      <main className="min-h-screen bg-[#f6f6f3] px-5 py-16">

        <div className="mx-auto max-w-[600px] rounded-[28px] bg-white p-10 text-center shadow-sm">

          <XCircle
            size={44}
            className="mx-auto text-red-500"
          />

          <h1 className="mt-5 text-2xl font-extrabold">
            Order not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/45">
            {error ||
              "Unable to load this order."}
          </p>

          <Link
            to="/orders"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-sm font-bold text-white hover:bg-indigo-600"
          >
            <ArrowLeft size={17} />
            Back to orders
          </Link>

        </div>

      </main>
    );
  }


  /* =======================================================
     ORDER DATA
  ======================================================= */

  const orderId =
    order._id ||
    order.id ||
    order.orderId;


  const items =
    Array.isArray(order.items)
      ? order.items
      : [];


  const status =
    order.status ||
    "Pending";


  const shippingAddress =
    order.shippingAddress ||
    {};


  const paymentMethod =
    order.paymentMethod ||
    "COD";


  const paymentStatus =
    order.paymentStatus ||
    "Pending";


  const subtotal =
    Number(
      order.subtotal
    ) || 0;


  const deliveryCharge =
    Number(
      order.deliveryCharge
    ) || 0;


  const discount =
    Number(
      order.discount
    ) || 0;


  const totalAmount =
    Number(
      order.totalAmount
    ) ||
    Number(
      order.total
    ) ||
    0;


  const canCancel =
    ![
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ].includes(status);


  /* =======================================================
     MAIN
  ======================================================= */

  return (

    <main className="min-h-screen bg-[#f6f6f3] text-[#171717]">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="mx-auto max-w-[1200px] px-5 pb-7 pt-8 sm:px-8 lg:px-10">

        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/45 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to orders
        </Link>


        <div className="mt-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              VKART ORDER
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
              Order Details
            </h1>

            <p className="mt-2 text-sm text-black/45">
              Order #{String(orderId).slice(-8)}
            </p>

          </div>


          {/* STATUS */}

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${getStatusClass(
              status
            )}`}
          >

            {getStatusIcon(status)}

            {status}

          </div>

        </div>

      </section>


      {/* =================================================
          CONTENT
      ================================================= */}

      <section className="mx-auto max-w-[1200px] px-5 pb-20 sm:px-8 lg:px-10">

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="space-y-6">

            {/* =================================================
                ORDER ITEMS
            ================================================= */}

            <div className="rounded-[26px] border border-black/[0.06] bg-white shadow-sm">

              <div className="border-b border-black/[0.06] p-6">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <ShoppingBag size={18} />
                  </div>

                  <div>

                    <h2 className="text-lg font-extrabold">
                      Ordered products
                    </h2>

                    <p className="text-xs text-black/40">
                      {items.length} product
                      {items.length !== 1
                        ? "s"
                        : ""}
                    </p>

                  </div>

                </div>

              </div>


              <div className="divide-y divide-black/[0.06]">

                {items.length === 0 ? (

                  <div className="p-8 text-center text-sm text-black/40">
                    No products found in this order.
                  </div>

                ) : (

                  items.map(
                    (item, index) => {

                      const itemImage =
                        item.image ||
                        item.images?.[0] ||
                        item.product?.images?.[0] ||
                        "";

                      const itemName =
                        item.name ||
                        item.product?.name ||
                        "Product";

                      const itemPrice =
                        Number(
                          item.price
                        ) || 0;

                      const itemQuantity =
                        Number(
                          item.quantity
                        ) || 1;


                      return (

                        <div
                          key={
                            item._id ||
                            item.product?._id ||
                            index
                          }
                          className="flex gap-4 p-6"
                        >

                          {/* IMAGE */}

                          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f0f0ec]">

                            {itemImage ? (

                              <img
                                src={itemImage}
                                alt={itemName}
                                className="h-full w-full object-cover"
                              />

                            ) : (

                              <div className="flex h-full items-center justify-center">
                                <Package
                                  size={22}
                                  className="text-black/20"
                                />
                              </div>

                            )}

                          </div>


                          {/* INFO */}

                          <div className="min-w-0 flex-1">

                            <h3 className="text-sm font-bold leading-5 sm:text-base">
                              {itemName}
                            </h3>

                            <p className="mt-2 text-xs text-black/40">
                              Quantity:{" "}
                              <span className="font-bold text-black/70">
                                {itemQuantity}
                              </span>
                            </p>

                            <p className="mt-2 text-sm font-extrabold">
                              {formatPrice(
                                itemPrice *
                                  itemQuantity
                              )}
                            </p>

                          </div>

                        </div>

                      );
                    }
                  )

                )}

              </div>

            </div>


            {/* =================================================
                DELIVERY ADDRESS
            ================================================= */}

            <div className="rounded-[26px] border border-black/[0.06] bg-white p-6 shadow-sm">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <MapPin size={18} />
                </div>

                <div className="min-w-0">

                  <h2 className="text-lg font-extrabold">
                    Delivery address
                  </h2>

                  <div className="mt-4 space-y-2 text-sm text-black/55">

                    <p className="font-bold text-black">
                      {shippingAddress.fullName ||
                        "N/A"}
                    </p>

                    <p>
                      {shippingAddress.addressLine ||
                        "N/A"}
                    </p>

                    <p>
                      {shippingAddress.city ||
                        ""}
                      {shippingAddress.city &&
                      shippingAddress.state
                        ? ", "
                        : ""}
                      {shippingAddress.state ||
                        ""}
                    </p>

                    <p>
                      Pincode:{" "}
                      {shippingAddress.pincode ||
                        "N/A"}
                    </p>

                    <p className="flex items-center gap-2 pt-1">
                      <Phone
                        size={15}
                      />

                      {shippingAddress.phone ||
                        "N/A"}
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                ORDER TIMELINE
            ================================================= */}

            <div className="rounded-[26px] border border-black/[0.06] bg-white p-6 shadow-sm">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Truck size={18} />
                </div>

                <div>

                  <h2 className="text-lg font-extrabold">
                    Order status
                  </h2>

                  <p className="mt-1 text-xs text-black/40">
                    Current status of your order.
                  </p>

                </div>

              </div>


              <div className="mt-6 space-y-4">

                {/* PLACED */}

                <div className="flex gap-4">

                  <div className="flex flex-col items-center">

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2
                        size={16}
                      />
                    </div>

                    <div className="mt-1 h-full w-px bg-black/10" />

                  </div>

                  <div className="pb-5">

                    <p className="text-sm font-bold">
                      Order placed
                    </p>

                    <p className="mt-1 text-xs text-black/40">
                      {formatDateTime(
                        order.createdAt
                      )}
                    </p>

                  </div>

                </div>


                {/* CURRENT STATUS */}

                <div className="flex gap-4">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    {getStatusIcon(
                      status
                    )}
                  </div>

                  <div>

                    <p className="text-sm font-bold">
                      {status}
                    </p>

                    <p className="mt-1 text-xs text-black/40">
                      Your order is currently{" "}
                      {status.toLowerCase()}.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              RIGHT SUMMARY
          ================================================= */}

          <aside className="lg:sticky lg:top-24 lg:self-start">

            <div className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-sm">

              {/* SUMMARY HEADER */}

              <div className="border-b border-black/[0.06] p-6">

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                  ORDER SUMMARY
                </p>

                <h2 className="mt-2 text-2xl font-extrabold">
                  Payment details
                </h2>

              </div>


              <div className="p-6">

                {/* DATE */}

                <div className="mb-5 flex items-center gap-3 rounded-2xl bg-[#f6f6f3] p-4">

                  <CalendarDays
                    size={18}
                    className="text-indigo-600"
                  />

                  <div>

                    <p className="text-[10px] font-bold uppercase tracking-wider text-black/35">
                      Order date
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {formatDate(
                        order.createdAt
                      )}
                    </p>

                  </div>

                </div>


                {/* PRICE */}

                <div className="space-y-3 border-t border-black/[0.06] pt-5">

                  <div className="flex justify-between text-sm">

                    <span className="text-black/45">
                      Subtotal
                    </span>

                    <span className="font-semibold">
                      {formatPrice(
                        subtotal
                      )}
                    </span>

                  </div>


                  <div className="flex justify-between text-sm">

                    <span className="text-black/45">
                      Delivery
                    </span>

                    <span className="font-semibold">

                      {deliveryCharge ===
                      0
                        ? "FREE"
                        : formatPrice(
                            deliveryCharge
                          )}

                    </span>

                  </div>


                  {discount > 0 && (

                    <div className="flex justify-between text-sm">

                      <span className="text-black/45">
                        Discount
                      </span>

                      <span className="font-semibold text-emerald-600">
                        -{" "}
                        {formatPrice(
                          discount
                        )}
                      </span>

                    </div>

                  )}


                  <div className="flex items-end justify-between border-t border-black/[0.06] pt-4">

                    <span className="font-bold">
                      Total
                    </span>

                    <span className="text-2xl font-extrabold">
                      {formatPrice(
                        totalAmount
                      )}
                    </span>

                  </div>

                </div>


                {/* PAYMENT */}

                <div className="mt-6 rounded-2xl border border-black/[0.06] p-4">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-black/35">
                    Payment
                  </p>

                  <div className="mt-2 flex items-center justify-between">

                    <span className="text-sm font-bold">
                      {paymentMethod ===
                      "RAZORPAY"
                        ? "Online Payment"
                        : "Cash on Delivery"}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                        paymentStatus ===
                        "Paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {paymentStatus}
                    </span>

                  </div>

                </div>


                {/* TRANSACTION */}

                {order.transactionId && (

                  <div className="mt-4 rounded-2xl bg-[#f6f6f3] p-4">

                    <p className="text-[10px] font-bold uppercase tracking-wider text-black/35">
                      Transaction ID
                    </p>

                    <p className="mt-1 break-all text-xs font-semibold text-black/60">
                      {order.transactionId}
                    </p>

                  </div>

                )}


                {/* CANCEL */}

                {canCancel && (

                  <button
                    type="button"
                    onClick={
                      cancelOrder
                    }
                    disabled={
                      cancelling
                    }
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    {cancelling ? (

                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />

                        Cancelling...
                      </>

                    ) : (

                      <>
                        <XCircle
                          size={17}
                        />

                        Cancel Order
                      </>

                    )}

                  </button>

                )}


                {/* CANCELLED INFO */}

                {status ===
                  "Cancelled" && (

                  <div className="mt-6 rounded-2xl bg-red-50 p-4">

                    <p className="text-sm font-bold text-red-700">
                      Order cancelled
                    </p>

                    {order.cancelledAt && (

                      <p className="mt-1 text-xs text-red-600/70">
                        Cancelled on{" "}
                        {formatDateTime(
                          order.cancelledAt
                        )}
                      </p>

                    )}

                    {order.cancellationReason && (

                      <p className="mt-2 text-xs leading-5 text-red-600/70">
                        Reason:{" "}
                        {
                          order.cancellationReason
                        }
                      </p>

                    )}

                  </div>

                )}

              </div>

            </div>

          </aside>

        </div>

      </section>

    </main>
  );
}


export default OrderDetails;