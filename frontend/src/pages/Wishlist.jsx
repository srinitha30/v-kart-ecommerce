import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowLeft,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  useEffect,
  useState,
} from "react";

import toast from "react-hot-toast";

import api from "../services/api";

/* =========================================================
   PRICE FORMAT
========================================================= */

const formatPrice = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

/* =========================================================
   GET PRODUCT FROM WISHLIST ITEM
========================================================= */

const getProductFromItem = (item) => {
  if (!item) {
    return null;
  }

  /*
   Backend normally returns:

   {
     _id: "...",
     user: "...",
     product: {
       _id: "...",
       name: "...",
       price: ...
     }
   }
  */

  if (item.product) {
    return item.product;
  }

  /*
   If backend directly returns product
  */

  return item;
};

/* =========================================================
   GET PRODUCT ID
========================================================= */

const getProductId = (item) => {
  const product = getProductFromItem(item);

  if (!product) {
    return "";
  }

  return String(
    product?._id ||
      product?.id ||
      ""
  );
};

/* =========================================================
   WISHLIST
========================================================= */

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  const [loading, setLoading] = useState(true);

  const [removingId, setRemovingId] = useState(null);

  /* =======================================================
     LOAD WISHLIST FROM MONGODB
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadWishlist = async () => {
      try {
        setLoading(true);

        console.log(
          "================================="
        );

        console.log(
          "LOADING WISHLIST FROM DATABASE"
        );

        console.log(
          "================================="
        );

        /*
         * Your login token.
         */

        const token =
          localStorage.getItem("token") ||
          localStorage.getItem("vkart_token");

        console.log(
          "TOKEN EXISTS:",
          Boolean(token)
        );

        /*
         * User must be logged in.
         */

        if (!token) {
          if (mounted) {
            setWishlist([]);
          }

          toast.error(
            "Please login to view your wishlist"
          );

          return;
        }

        /* =================================================
           GET WISHLIST
        ================================================= */

        const response = await api.get(
          "/wishlist",
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        console.log(
          "WISHLIST API RESPONSE:",
          response?.data
        );

        /*
         * Support common backend response formats.
         */

        const backendWishlist =
          response?.data?.wishlist ??
          response?.data?.data ??
          response?.data ??
          [];

        console.log(
          "WISHLIST DATA:",
          backendWishlist
        );

        if (!mounted) {
          return;
        }

        if (
          Array.isArray(
            backendWishlist
          )
        ) {
          setWishlist(
            backendWishlist
          );
        } else {
          setWishlist([]);
        }
      } catch (error) {
        console.error(
          "================================="
        );

        console.error(
          "WISHLIST LOAD ERROR:",
          error
        );

        console.error(
          "STATUS:",
          error?.response?.status
        );

        console.error(
          "DATA:",
          error?.response?.data
        );

        console.error(
          "================================="
        );

        if (!mounted) {
          return;
        }

        /*
         * Do NOT redirect to products.
         */

        if (
          error?.response?.status === 401
        ) {
          toast.error(
            "Please login again"
          );
        } else {
          toast.error(
            error?.response?.data?.message ||
              "Unable to load wishlist"
          );
        }

        setWishlist([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadWishlist();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     REMOVE WISHLIST
  ======================================================= */

  const removeFromWishlist = async (
    productId
  ) => {
    const id = String(
      productId || ""
    );

    if (!id) {
      toast.error(
        "Product ID is missing"
      );

      return;
    }

    if (
      String(removingId) === id
    ) {
      return;
    }

    try {
      setRemovingId(id);

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem(
          "vkart_token"
        );

      if (!token) {
        toast.error(
          "Please login again"
        );

        return;
      }

      console.log(
        "REMOVING WISHLIST PRODUCT:",
        id
      );

      /*
       * Remove from MongoDB.
       */

      const response =
        await api.delete(
          `/wishlist/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      console.log(
        "REMOVE RESPONSE:",
        response?.data
      );

      /*
       * Remove from UI only after
       * backend succeeds.
       */

      setWishlist(
        (currentWishlist) =>
          currentWishlist.filter(
            (item) =>
              getProductId(item) !== id
          )
      );

      toast.success(
        "Removed from wishlist"
      );
    } catch (error) {
      console.error(
        "REMOVE WISHLIST ERROR:",
        error
      );

      console.error(
        "REMOVE ERROR RESPONSE:",
        error?.response?.data
      );

      toast.error(
        error?.response?.data?.message ||
          "Unable to remove from wishlist"
      );
    } finally {
      setRemovingId(null);
    }
  };

  /* =======================================================
     LOADING UI
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f6f3] px-5 py-10 sm:px-8 lg:px-10">

        <div className="mx-auto max-w-[1200px]">

          <div className="h-4 w-32 animate-pulse rounded bg-black/10" />

          <div className="mt-8 h-10 w-64 animate-pulse rounded bg-black/10" />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl bg-white"
              >
                <div className="aspect-square animate-pulse bg-black/[0.06]" />

                <div className="space-y-3 p-5">

                  <div className="h-4 animate-pulse rounded bg-black/10" />

                  <div className="h-4 w-1/2 animate-pulse rounded bg-black/10" />

                  <div className="h-10 animate-pulse rounded bg-black/[0.06]" />

                </div>
              </div>
            ))}

          </div>

        </div>

      </main>
    );
  }

  /* =======================================================
     EMPTY WISHLIST
  ======================================================= */

  if (wishlist.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6f6f3] px-5 py-16">

        <div className="mx-auto max-w-[600px] rounded-[28px] border border-black/[0.06] bg-white p-10 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">

            <Heart
              size={28}
              fill="currentColor"
            />

          </div>

          <h1 className="mt-6 text-2xl font-extrabold">
            Your wishlist is empty
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/45">
            Products you add to your wishlist
            will appear here.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
          >
            <ShoppingBag size={17} />
            Browse Products
          </Link>

        </div>

      </main>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-[#171717]">

      <section className="mx-auto max-w-[1200px] px-5 pb-16 pt-8 sm:px-8 lg:px-10">

        {/* =================================================
            BACK TO PRODUCTS
        ================================================= */}

        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/45 transition hover:text-indigo-600"
        >
          <ArrowLeft size={17} />
          Continue shopping
        </Link>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mt-8">

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">
            VKART
          </p>

          <div className="mt-2 flex items-center gap-3">

            <Heart
              size={30}
              className="text-indigo-600"
              fill="currentColor"
            />

            <h1 className="text-4xl font-extrabold tracking-tight">
              My Wishlist
            </h1>

          </div>

          <p className="mt-3 text-sm text-black/45">
            {wishlist.length}{" "}
            {wishlist.length === 1
              ? "item"
              : "items"}{" "}
            saved
          </p>

        </div>

        {/* =================================================
            WISHLIST PRODUCTS
        ================================================= */}

        <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {wishlist.map((item, index) => {

            const product =
              getProductFromItem(
                item
              );

            if (!product) {
              return null;
            }

            const productId =
              getProductId(item);

            if (!productId) {
              return null;
            }

            const image =
              product?.images?.[0] ||
              product?.image ||
              "";

            const price =
              Number(
                product?.price
              ) || 0;

            const discount =
              Number(
                product?.discount
              ) || 0;

            const finalPrice =
              discount > 0
                ? Math.max(
                    0,
                    price -
                      (price *
                        discount) /
                        100
                  )
                : price;

            const stock =
              Number(
                product?.stock
              ) || 0;

            const isRemoving =
              String(
                removingId
              ) ===
              String(
                productId
              );

            const slug =
              product?.slug ||
              productId;

            return (
              <article
                key={
                  item?._id ||
                  `${productId}-${index}`
                }
                className="group overflow-hidden rounded-[22px] border border-black/[0.06] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >

                {/* =================================================
                    IMAGE
                ================================================= */}

                <div className="relative aspect-square overflow-hidden bg-[#eeeeea]">

                  <Link
                    to={`/products/${slug}`}
                    className="block h-full w-full"
                  >

                    {image ? (
                      <img
                        src={image}
                        alt={
                          product?.name ||
                          "Product"
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-black/20">
                        <ShoppingBag
                          size={28}
                        />
                      </div>
                    )}

                  </Link>

                  {/* DISCOUNT */}

                  {discount > 0 && (
                    <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-3 py-1.5 text-[10px] font-bold text-white">
                      {discount}% OFF
                    </span>
                  )}

                  {/* REMOVE */}

                  <button
                    type="button"
                    disabled={
                      isRemoving
                    }
                    onClick={() =>
                      removeFromWishlist(
                        productId
                      )
                    }
                    className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-red-500 shadow-sm transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Remove from wishlist"
                  >

                    {isRemoving ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500/30 border-t-red-500" />
                    ) : (
                      <Trash2
                        size={17}
                      />
                    )}

                  </button>

                </div>

                {/* =================================================
                    PRODUCT INFO
                ================================================= */}

                <div className="p-5">

                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    {product?.category ||
                      "Product"}
                  </p>

                  <Link
                    to={`/products/${slug}`}
                  >
                    <h2 className="mt-2 line-clamp-2 min-h-[40px] text-sm font-bold leading-5 transition hover:text-indigo-600">
                      {product?.name ||
                        "Unnamed Product"}
                    </h2>
                  </Link>

                  {/* PRICE */}

                  <div className="mt-3 flex items-center gap-2">

                    <span className="text-lg font-extrabold">
                      {formatPrice(
                        finalPrice
                      )}
                    </span>

                    {discount > 0 && (
                      <span className="text-xs text-black/30 line-through">
                        {formatPrice(
                          price
                        )}
                      </span>
                    )}

                  </div>

                  {/* STOCK */}

                  {stock <= 0 ? (
                    <p className="mt-2 text-xs font-bold text-red-500">
                      Out of stock
                    </p>
                  ) : (
                    <p className="mt-2 text-xs font-semibold text-emerald-600">
                      In stock
                    </p>
                  )}

                  {/* VIEW PRODUCT */}

                  <Link
                    to={`/products/${slug}`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#171717] px-4 py-3 text-xs font-bold text-white transition hover:bg-indigo-600"
                  >
                    <ShoppingBag
                      size={15}
                    />

                    View Product
                  </Link>

                </div>

              </article>
            );
          })}

        </div>

      </section>

    </main>
  );
}

export default Wishlist;