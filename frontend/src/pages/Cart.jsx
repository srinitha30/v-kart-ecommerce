import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  ArrowRight,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";


const formatPrice = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};


function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);


  /* =========================================================
     LOAD CART
  ========================================================= */

  const loadCart = () => {
    try {
      const savedCart = JSON.parse(
        localStorage.getItem("vkart-cart") || "[]"
      );

      setCart(
        Array.isArray(savedCart)
          ? savedCart
          : []
      );
    } catch (error) {
      console.error("CART LOAD ERROR:", error);
      setCart([]);
    }
  };


  useEffect(() => {
    loadCart();

    window.addEventListener(
      "vkart-cart-updated",
      loadCart
    );

    return () => {
      window.removeEventListener(
        "vkart-cart-updated",
        loadCart
      );
    };
  }, []);


  /* =========================================================
     SAVE CART
  ========================================================= */

  const saveCart = (updatedCart) => {
    localStorage.setItem(
      "vkart-cart",
      JSON.stringify(updatedCart)
    );

    setCart(updatedCart);

    window.dispatchEvent(
      new Event("vkart-cart-updated")
    );
  };


  /* =========================================================
     INCREASE
  ========================================================= */

  const increaseQuantity = (index) => {
    const updatedCart = [...cart];

    const item = updatedCart[index];

    const currentQuantity =
      Number(item.quantity) || 1;

    const stock =
      Number(item.stock) || 0;

    if (
      stock > 0 &&
      currentQuantity >= stock
    ) {
      toast.error(
        "Maximum available stock reached"
      );

      return;
    }

    updatedCart[index].quantity =
      currentQuantity + 1;

    saveCart(updatedCart);
  };


  /* =========================================================
     DECREASE
  ========================================================= */

  const decreaseQuantity = (index) => {
    const updatedCart = [...cart];

    const currentQuantity =
      Number(
        updatedCart[index].quantity
      ) || 1;

    if (currentQuantity <= 1) {
      return;
    }

    updatedCart[index].quantity =
      currentQuantity - 1;

    saveCart(updatedCart);
  };


  /* =========================================================
     REMOVE
  ========================================================= */

  const removeItem = (index) => {
    const updatedCart = cart.filter(
      (_, itemIndex) =>
        itemIndex !== index
    );

    saveCart(updatedCart);

    toast.success("Item removed from cart");
  };


  /* =========================================================
     TOTALS
  ========================================================= */

  const subtotal = cart.reduce(
    (total, item) => {
      return (
        total +
        Number(item.price || 0) *
          Number(item.quantity || 0)
      );
    },
    0
  );

  const itemCount = cart.reduce(
    (total, item) => {
      return (
        total +
        Number(item.quantity || 0)
      );
    },
    0
  );


  /* =========================================================
     EMPTY CART
  ========================================================= */

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6f6f3] px-5 py-12 sm:px-8 lg:px-10">

        <div className="mx-auto max-w-[900px]">

          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-black/45 hover:text-indigo-600"
          >
            <ArrowLeft size={17} />
            Continue shopping
          </Link>


          <div className="mt-10 rounded-[30px] bg-white p-10 text-center sm:p-16">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <ShoppingBag size={26} />
            </div>


            <h1 className="mt-6 font-['Manrope'] text-3xl font-extrabold">
              Your cart is empty
            </h1>


            <p className="mt-3 text-sm text-black/45">
              Add some products to your cart
              and they will appear here.
            </p>


            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-6 py-3 text-sm font-bold text-white hover:bg-indigo-600"
            >
              Start Shopping
              <ArrowRight size={16} />
            </Link>

          </div>

        </div>

      </main>
    );
  }


  /* =========================================================
     MAIN CART
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-[#171717]">

      <section className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 lg:px-10">

        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/45 hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Continue shopping
        </Link>


        <div className="mt-7">

          <h1 className="font-['Manrope'] text-4xl font-extrabold tracking-[-0.04em]">
            Shopping Cart
          </h1>

          <p className="mt-2 text-sm text-black/40">
            {itemCount}{" "}
            {itemCount === 1
              ? "item"
              : "items"}{" "}
            in your cart
          </p>

        </div>


        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">


          {/* =================================================
             CART ITEMS
          ================================================= */}

          <div className="space-y-4">

            {cart.map((item, index) => {

              const itemTotal =
                Number(item.price || 0) *
                Number(item.quantity || 0);

              return (
                <div
                  key={
                    item.productId ||
                    index
                  }
                  className="flex gap-4 rounded-2xl bg-white p-4 sm:p-5"
                >

                  {/* IMAGE */}

                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#f0f0ec] sm:h-28 sm:w-28">

                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-black/20">
                        <ShoppingBag size={22} />
                      </div>
                    )}

                  </div>


                  {/* INFO */}

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <h2 className="font-['Manrope'] text-base font-extrabold sm:text-lg">
                          {item.name}
                        </h2>

                        <p className="mt-1 text-sm font-semibold text-indigo-600">
                          {formatPrice(
                            item.price
                          )}
                        </p>

                      </div>


                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(index)
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-black/35 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={17} />
                      </button>

                    </div>


                    {/* BOTTOM */}

                    <div className="mt-5 flex items-center justify-between">

                      {/* QUANTITY */}

                      <div className="flex items-center overflow-hidden rounded-xl border border-black/[0.08]">

                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(index)
                          }
                          className="flex h-9 w-9 items-center justify-center text-black/50 hover:bg-[#f6f6f3]"
                        >
                          <Minus size={14} />
                        </button>


                        <span className="flex h-9 w-10 items-center justify-center border-x border-black/[0.06] text-sm font-bold">
                          {item.quantity}
                        </span>


                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(index)
                          }
                          className="flex h-9 w-9 items-center justify-center text-black/50 hover:bg-[#f6f6f3]"
                        >
                          <Plus size={14} />
                        </button>

                      </div>


                      {/* TOTAL */}

                      <span className="font-['Manrope'] text-base font-extrabold">
                        {formatPrice(
                          itemTotal
                        )}
                      </span>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>


          {/* =================================================
             SUMMARY
          ================================================= */}

          <div>

            <div className="sticky top-24 rounded-2xl bg-white p-6">

              <h2 className="font-['Manrope'] text-xl font-extrabold">
                Order Summary
              </h2>


              <div className="mt-6 space-y-4">

                <div className="flex justify-between text-sm">

                  <span className="text-black/45">
                    Subtotal
                  </span>

                  <span className="font-bold">
                    {formatPrice(subtotal)}
                  </span>

                </div>


                <div className="flex justify-between text-sm">

                  <span className="text-black/45">
                    Delivery
                  </span>

                  <span className="font-bold text-emerald-600">
                    Free
                  </span>

                </div>


                <div className="border-t border-black/[0.07] pt-4">

                  <div className="flex items-center justify-between">

                    <span className="font-bold">
                      Total
                    </span>

                    <span className="font-['Manrope'] text-2xl font-extrabold">
                      {formatPrice(subtotal)}
                    </span>

                  </div>

                </div>

              </div>


              <button
                type="button"
                onClick={() => {
                  const token =
                    localStorage.getItem("token") ||
                    localStorage.getItem("vkart-token") ||
                    localStorage.getItem("accessToken");

                  if (!token) {
                    toast.error(
                      "Please login before checkout"
                    );

                    navigate("/login");
                    return;
                  }

                  navigate("/checkout");
                }}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 text-sm font-bold text-white hover:bg-indigo-700"
              >
                Proceed to Checkout
                <ArrowRight size={17} />
              </button>


              <Link
                to="/products"
                className="mt-3 flex w-full items-center justify-center rounded-xl border border-black/[0.08] px-5 py-3 text-sm font-bold hover:bg-[#f6f6f3]"
              >
                Continue Shopping
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


export default Cart;