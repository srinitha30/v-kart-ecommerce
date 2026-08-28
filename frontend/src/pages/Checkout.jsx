import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  User,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const formatPrice = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

function Checkout() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(
    Math.max(
      1,
      Number(searchParams.get("quantity")) || 1
    )
  );

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] =
    useState("COD");

  /* =====================================================
     LOAD CHECKOUT
  ===================================================== */

  useEffect(() => {
    let mounted = true;

    const loadCheckout = async () => {
      /*
       * IMPORTANT
       * AuthContext saves token as:
       *
       * localStorage.setItem("vkart_token", data.token)
       *
       * So we MUST read vkart_token here.
       */

      const token =
        localStorage.getItem("vkart_token");

      console.log(
        "CHECKOUT TOKEN EXISTS:",
        Boolean(token)
      );

      if (!token) {
        toast.error("Please login to continue");

        navigate("/login", {
          replace: true,
          state: {
            from: `/checkout/${slug}?quantity=${quantity}`,
          },
        });

        return;
      }

      try {
        setLoading(true);
        setError("");

        /*
         * Load product
         */

        const response = await api.get(
          `/products/${slug}`
        );

        console.log(
          "CHECKOUT PRODUCT RESPONSE:",
          response?.data
        );

        const receivedProduct =
          response?.data?.product ||
          response?.data?.data ||
          response?.data;

        if (!receivedProduct) {
          throw new Error(
            "Product not found"
          );
        }

        if (!mounted) {
          return;
        }

        setProduct(receivedProduct);

        /*
         * Auto-fill logged-in user
         *
         * AuthContext uses:
         * vkart_user
         */

        const savedUser =
          localStorage.getItem("vkart_user");

        if (savedUser) {
          try {
            const user =
              JSON.parse(savedUser);

            setForm((current) => ({
              ...current,

              fullName:
                user?.name ||
                user?.fullName ||
                "",

              email:
                user?.email ||
                "",

              phone:
                user?.phone ||
                "",
            }));
          } catch (userError) {
            console.error(
              "USER DATA ERROR:",
              userError
            );
          }
        }
      } catch (err) {
        console.error(
          "CHECKOUT LOAD ERROR:",
          err
        );

        if (
          err?.response?.status === 401
        ) {
          /*
           * Remove CORRECT token key
           */

          localStorage.removeItem(
            "vkart_token"
          );

          localStorage.removeItem(
            "vkart_user"
          );

          toast.error(
            "Session expired. Please login again."
          );

          navigate("/login", {
            replace: true,
            state: {
              from: `/checkout/${slug}?quantity=${quantity}`,
            },
          });

          return;
        }

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Unable to load checkout."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (slug) {
      loadCheckout();
    } else {
      setError(
        "Product slug is missing."
      );
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [slug, navigate]);

  /* =====================================================
     FORM
  ===================================================== */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  /* =====================================================
     PRICE
  ===================================================== */

  const price =
    Number(product?.price) || 0;

  const discount =
    Number(product?.discount) || 0;

  const finalPrice =
    discount > 0
      ? Math.max(
          0,
          price -
            (price * discount) / 100
        )
      : price;

  const stock =
    Number(product?.stock) || 0;

  const subtotal =
    finalPrice * quantity;

  const deliveryCharge =
    subtotal >= 999 ? 0 : 49;

  const totalAmount =
    subtotal + deliveryCharge;

  /* =====================================================
     QUANTITY
  ===================================================== */

  const decreaseQuantity = () => {
    setQuantity((current) =>
      Math.max(1, current - 1)
    );
  };

  const increaseQuantity = () => {
    setQuantity((current) => {
      if (current >= stock) {
        toast.error(
          "Maximum available stock reached"
        );

        return current;
      }

      return current + 1;
    });
  };

  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    if (!form.fullName.trim()) {
      toast.error(
        "Please enter your full name"
      );
      return false;
    }

    if (!form.email.trim()) {
      toast.error(
        "Please enter your email"
      );
      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      toast.error(
        "Please enter a valid email"
      );
      return false;
    }

    if (
      !/^[0-9]{10}$/.test(
        form.phone
      )
    ) {
      toast.error(
        "Enter a valid 10 digit phone number"
      );
      return false;
    }

    if (!form.addressLine.trim()) {
      toast.error(
        "Please enter your address"
      );
      return false;
    }

    if (!form.city.trim()) {
      toast.error(
        "Please enter your city"
      );
      return false;
    }

    if (!form.state.trim()) {
      toast.error(
        "Please enter your state"
      );
      return false;
    }

    if (
      !/^[0-9]{6}$/.test(
        form.pincode
      )
    ) {
      toast.error(
        "Enter a valid 6 digit pincode"
      );
      return false;
    }

    if (stock <= 0) {
      toast.error(
        "Product is out of stock"
      );
      return false;
    }

    if (quantity > stock) {
      toast.error(
        "Selected quantity is not available"
      );
      return false;
    }

    return true;
  };

  /* =====================================================
     PLACE ORDER
  ===================================================== */

  const placeOrder = async () => {
    /*
     * IMPORTANT
     * Read the SAME token used by AuthContext.
     */

    const token =
      localStorage.getItem("vkart_token");

    console.log(
      "PLACE ORDER TOKEN EXISTS:",
      Boolean(token)
    );

    if (!token) {
      toast.error(
        "Please login before placing order"
      );

      navigate("/login", {
        replace: true,
        state: {
          from: `/checkout/${slug}?quantity=${quantity}`,
        },
      });

      return;
    }

    if (!product) {
      toast.error(
        "Product not available"
      );
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setPlacingOrder(true);

      const productId =
        product?._id ||
        product?.id;

      if (!productId) {
        toast.error(
          "Product ID is missing"
        );
        return;
      }

      /*
       * ORDER DATA
       */

      const orderData = {
        items: [
          {
            product: productId,

            name:
              product?.name || "",

            image:
              product?.images?.[0] ||
              product?.image ||
              "",

            price: finalPrice,

            quantity,
          },
        ],

        customer: {
          name:
            form.fullName.trim(),

          email:
            form.email.trim(),

          phone:
            form.phone.trim(),
        },

        shippingAddress: {
          fullName:
            form.fullName.trim(),

          phone:
            form.phone.trim(),

          addressLine:
            form.addressLine.trim(),

          city:
            form.city.trim(),

          state:
            form.state.trim(),

          pincode:
            form.pincode.trim(),
        },

        paymentMethod,

        deliveryFee:
          deliveryCharge,
      };

      console.log(
        "========== PLACING ORDER =========="
      );

      console.log(
        "ORDER DATA:",
        orderData
      );

      /*
       * IMPORTANT
       *
       * Send vkart_token manually.
       *
       * This makes Checkout independent
       * from whether api.js automatically
       * adds Authorization or not.
       */

      const response =
        await api.post(
          "/orders",
          orderData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      console.log(
        "ORDER RESPONSE:",
        response?.data
      );

      const createdOrder =
        response?.data?.order ||
        response?.data?.data ||
        response?.data;

      /*
       * SAVE LAST ORDER ID
       */

      const orderId =
        createdOrder?._id ||
        createdOrder?.id ||
        createdOrder?.orderId;

      if (orderId) {
        localStorage.setItem(
          "vkart-last-order-id",
          String(orderId)
        );
      }

      /*
       * SUCCESS
       */

      toast.success(
        "Order placed successfully!"
      );

      /*
       * Go to My Orders
       */

      navigate("/orders", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "PLACE ORDER ERROR:",
        err
      );

      console.error(
        "ORDER SERVER RESPONSE:",
        err?.response?.data
      );

      /*
       * AUTH ERROR
       */

      if (
        err?.response?.status === 401
      ) {
        localStorage.removeItem(
          "vkart_token"
        );

        localStorage.removeItem(
          "vkart_user"
        );

        toast.error(
          "Session expired. Please login again."
        );

        navigate("/login", {
          replace: true,
          state: {
            from:
              `/checkout/${slug}?quantity=${quantity}`,
          },
        });

        return;
      }

      /*
       * SERVER ERROR
       */

      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error;

      toast.error(
        serverMessage ||
          err?.message ||
          "Unable to place order."
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f6f3] px-5 py-10">

        <div className="mx-auto max-w-[1280px] animate-pulse">

          <div className="h-4 w-32 rounded bg-black/10" />

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_0.65fr]">

            <div className="rounded-[28px] bg-white p-8">

              <div className="h-8 w-60 rounded bg-black/10" />

              <div className="mt-8 space-y-4">

                <div className="h-12 rounded-xl bg-black/[0.06]" />

                <div className="h-12 rounded-xl bg-black/[0.06]" />

                <div className="h-32 rounded-xl bg-black/[0.06]" />

                <div className="h-12 rounded-xl bg-black/[0.06]" />

              </div>

            </div>

            <div className="h-[500px] rounded-[28px] bg-white" />

          </div>

        </div>

      </main>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#f6f6f3] px-5 py-16">

        <div className="mx-auto max-w-[650px] rounded-[28px] bg-white p-10 text-center shadow-sm">

          <Package
            size={42}
            className="mx-auto text-red-500"
          />

          <h1 className="mt-5 text-2xl font-extrabold">
            Checkout unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/45">
            {error ||
              "Unable to load this product."}
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex rounded-xl bg-[#171717] px-5 py-3 text-sm font-bold text-white hover:bg-indigo-600"
          >
            Back to products
          </Link>

        </div>

      </main>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-[#171717]">

      {/* HEADER */}

      <section className="mx-auto max-w-[1280px] px-5 pb-7 pt-8 sm:px-8 lg:px-10">

        <Link
          to={`/products/${product.slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/45 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Back to product
        </Link>

        <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">
          VKART CHECKOUT
        </p>

        <h1 className="mt-2 font-['Manrope'] text-4xl font-extrabold tracking-[-0.04em] sm:text-5xl">
          Complete your order
        </h1>

        <p className="mt-3 text-sm text-black/45">
          Enter your delivery details and place your order securely.
        </p>

      </section>

      {/* CONTENT */}

      <section className="mx-auto max-w-[1280px] px-5 pb-20 sm:px-8 lg:px-10">

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.35fr_0.65fr]">

          {/* LEFT */}

          <div className="space-y-6">

            {/* CUSTOMER */}

            <div className="rounded-[26px] border border-black/[0.06] bg-white p-6 shadow-sm sm:p-8">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <User size={19} />
                </div>

                <div>

                  <h2 className="text-xl font-extrabold">
                    Customer details
                  </h2>

                  <p className="mt-1 text-xs text-black/40">
                    Enter your contact details.
                  </p>

                </div>

              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-xs font-bold">
                    Full name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-xs font-bold">
                    Email address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                </div>

                <div className="sm:col-span-2">

                  <label className="mb-2 block text-xs font-bold">
                    Phone number
                  </label>

                  <div className="flex">

                    <div className="flex h-12 items-center rounded-l-xl border border-r-0 border-black/[0.08] bg-[#f1f1ed] px-4 text-sm font-semibold text-black/50">
                      +91
                    </div>

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={(event) => {
                        const value =
                          event.target.value.replace(
                            /\D/g,
                            ""
                          );

                        setForm(
                          (current) => ({
                            ...current,
                            phone:
                              value.slice(
                                0,
                                10
                              ),
                          })
                        );
                      }}
                      placeholder="10 digit mobile number"
                      className="h-12 w-full rounded-r-xl border border-black/[0.08] bg-[#fafaf8] px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />

                  </div>

                </div>

              </div>

            </div>

            {/* ADDRESS */}

            <div className="rounded-[26px] border border-black/[0.06] bg-white p-6 shadow-sm sm:p-8">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <MapPin size={19} />
                </div>

                <div>

                  <h2 className="text-xl font-extrabold">
                    Delivery address
                  </h2>

                  <p className="mt-1 text-xs text-black/40">
                    Where should we deliver your order?
                  </p>

                </div>

              </div>

              <div className="mt-7 space-y-5">

                <div>

                  <label className="mb-2 block text-xs font-bold">
                    Address
                  </label>

                  <textarea
                    name="addressLine"
                    value={form.addressLine}
                    onChange={handleChange}
                    rows={4}
                    placeholder="House / Flat number, street, area"
                    className="w-full resize-none rounded-xl border border-black/[0.08] bg-[#fafaf8] p-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-xs font-bold">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="Chennai"
                      className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />

                  </div>

                  <div>

                    <label className="mb-2 block text-xs font-bold">
                      State
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      placeholder="Tamil Nadu"
                      className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />

                  </div>

                </div>

                <div>

                  <label className="mb-2 block text-xs font-bold">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={(event) => {
                      const value =
                        event.target.value.replace(
                          /\D/g,
                          ""
                        );

                      setForm(
                        (current) => ({
                          ...current,
                          pincode:
                            value.slice(
                              0,
                              6
                            ),
                        })
                      );
                    }}
                    placeholder="600001"
                    className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#fafaf8] px-4 text-sm outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />

                </div>

              </div>

            </div>

            {/* PAYMENT */}

            <div className="rounded-[26px] border border-black/[0.06] bg-white p-6 shadow-sm sm:p-8">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <CreditCard size={19} />
                </div>

                <div>

                  <h2 className="text-xl font-extrabold">
                    Payment method
                  </h2>

                  <p className="mt-1 text-xs text-black/40">
                    Choose your payment method.
                  </p>

                </div>

              </div>

              <div className="mt-7 space-y-3">

                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-5 ${
                    paymentMethod === "COD"
                      ? "border-indigo-600 bg-indigo-50/40"
                      : "border-black/[0.08]"
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={
                      paymentMethod === "COD"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <Package
                    size={18}
                    className="text-indigo-600"
                  />

                  <div>

                    <p className="text-sm font-bold">
                      Cash on Delivery
                    </p>

                    <p className="mt-1 text-xs text-black/40">
                      Pay when your order arrives.
                    </p>

                  </div>

                </label>

                <label
                  className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-5 ${
                    paymentMethod === "ONLINE"
                      ? "border-indigo-600 bg-indigo-50/40"
                      : "border-black/[0.08]"
                  }`}
                >

                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={
                      paymentMethod ===
                      "ONLINE"
                    }
                    onChange={(event) =>
                      setPaymentMethod(
                        event.target.value
                      )
                    }
                  />

                  <CreditCard
                    size={18}
                    className="text-indigo-600"
                  />

                  <div>

                    <p className="text-sm font-bold">
                      Online Payment
                    </p>

                    <p className="mt-1 text-xs text-black/40">
                      Payment gateway can be connected next.
                    </p>

                  </div>

                </label>

              </div>

            </div>

          </div>

          {/* RIGHT SUMMARY */}

          <aside className="lg:sticky lg:top-24 lg:self-start">

            <div className="overflow-hidden rounded-[26px] border border-black/[0.06] bg-white shadow-sm">

              <div className="border-b border-black/[0.06] p-6">

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600">
                  ORDER SUMMARY
                </p>

                <h2 className="mt-2 text-2xl font-extrabold">
                  Your order
                </h2>

              </div>

              <div className="p-6">

                <div className="flex gap-4">

                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f0f0ec]">

                    {product?.images?.[0] ||
                    product?.image ? (
                      <img
                        src={
                          product?.images?.[0] ||
                          product?.image
                        }
                        alt={
                          product?.name ||
                          "Product"
                        }
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <ShoppingBag
                          size={20}
                          className="text-black/20"
                        />
                      </div>
                    )}

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-600">
                      {product?.category ||
                        "Product"}
                    </p>

                    <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5">
                      {product?.name}
                    </h3>

                    <p className="mt-2 text-sm font-extrabold">
                      {formatPrice(
                        finalPrice
                      )}
                    </p>

                  </div>

                </div>

                {/* QUANTITY */}

                <div className="mt-6 flex items-center justify-between">

                  <span className="text-sm font-semibold text-black/45">
                    Quantity
                  </span>

                  <div className="flex items-center overflow-hidden rounded-xl border border-black/[0.08]">

                    <button
                      type="button"
                      onClick={
                        decreaseQuantity
                      }
                      className="flex h-9 w-9 items-center justify-center hover:bg-black/5"
                    >
                      −
                    </button>

                    <span className="flex h-9 w-10 items-center justify-center border-x border-black/[0.06] text-xs font-bold">
                      {quantity}
                    </span>

                    <button
                      type="button"
                      onClick={
                        increaseQuantity
                      }
                      className="flex h-9 w-9 items-center justify-center hover:bg-black/5"
                    >
                      +
                    </button>

                  </div>

                </div>

                {/* PRICE */}

                <div className="mt-6 space-y-3 border-t border-black/[0.06] pt-6">

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
                      {deliveryCharge === 0
                        ? "FREE"
                        : formatPrice(
                            deliveryCharge
                          )}
                    </span>

                  </div>

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

                {/* PLACE ORDER */}

                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={
                    placingOrder ||
                    stock <= 0
                  }
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 py-4 text-sm font-bold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {placingOrder ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Placing order...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={18}
                      />

                      Place Order
                    </>
                  )}

                </button>

                {/* SECURITY */}

                <div className="mt-5 flex gap-3 rounded-2xl bg-[#f6f6f3] p-4">

                  <ShieldCheck
                    size={19}
                    className="shrink-0 text-emerald-600"
                  />

                  <p className="text-[11px] leading-5 text-black/45">
                    Your delivery and order details are securely processed by VKART.
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </section>

    </main>
  );
}

export default Checkout;