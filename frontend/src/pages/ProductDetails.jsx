import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  Zap,
} from "lucide-react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useMemo,
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
   PRODUCT DETAILS
========================================================= */

function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();


  /* =========================================================
     STATE
  ========================================================= */

  const [product, setProduct] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [selectedImage, setSelectedImage] = useState(0);

  const [wishlist, setWishlist] = useState(false);

  const [wishlistLoading, setWishlistLoading] = useState(false);

  const [checkingWishlist, setCheckingWishlist] = useState(true);


  /* =========================================================
     TOKEN
     
     IMPORTANT:
     AuthContext stores token as "vkart_token"
  ========================================================= */

  const getToken = () => {
    return (
      localStorage.getItem("vkart_token") ||
      localStorage.getItem("token") ||
      localStorage.getItem("vkart-token") ||
      localStorage.getItem("accessToken")
    );
  };


  /* =========================================================
     LOGIN CHECK
  ========================================================= */

  const isLoggedIn = () => {
    return Boolean(getToken());
  };


  /* =========================================================
     FETCH PRODUCT
  ========================================================= */

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/products/${slug}`
        );

        const receivedProduct =
          response?.data?.product ||
          response?.data?.data ||
          response?.data;

        if (!receivedProduct) {
          throw new Error("Product not found");
        }

        setProduct(receivedProduct);
        setQuantity(1);
        setSelectedImage(0);

      } catch (err) {
        console.error(
          "PRODUCT DETAILS ERROR:",
          err
        );

        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load product."
        );

      } finally {
        setLoading(false);
      }
    };


    if (slug) {
      fetchProduct();
    } else {
      setError("Product slug is missing.");
      setLoading(false);
    }

  }, [slug]);


  /* =========================================================
     CHECK WISHLIST
     
     Runs when product loads.
     
     GET /api/wishlist
  ========================================================= */

  useEffect(() => {

    const checkWishlist = async () => {

      if (!product) {
        return;
      }

      const token = getToken();

      /*
        User is not logged in.
        ProtectedRoute normally prevents this page,
        but this check keeps the component safe.
      */

      if (!token) {
        setWishlist(false);
        setCheckingWishlist(false);
        return;
      }


      const productId =
        product._id ||
        product.id;


      if (!productId) {
        setCheckingWishlist(false);
        return;
      }


      try {

        setCheckingWishlist(true);

        const response = await api.get(
          "/wishlist"
        );

        const wishlistItems =
          response?.data?.wishlist || [];


        const exists =
          Array.isArray(wishlistItems) &&
          wishlistItems.some((item) => {

            const wishlistProduct =
              item?.product;


            const wishlistProductId =
              wishlistProduct?._id ||
              wishlistProduct?.id ||
              wishlistProduct;


            return (
              String(wishlistProductId) ===
              String(productId)
            );

          });


        setWishlist(exists);

      } catch (err) {

        console.error(
          "CHECK WISHLIST ERROR:",
          err
        );


        if (
          err?.response?.status === 401
        ) {

          localStorage.removeItem(
            "vkart_token"
          );

          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "vkart-token"
          );

          localStorage.removeItem(
            "accessToken"
          );

          setWishlist(false);

          toast.error(
            "Session expired. Please login again."
          );

          navigate("/login", {
            replace: true,
            state: {
              from:
                `/products/${slug}`,
            },
          });

        }

      } finally {

        setCheckingWishlist(false);

      }

    };


    checkWishlist();

  }, [product, slug, navigate]);


  /* =========================================================
     PRICE
  ========================================================= */

  const price =
    Number(product?.price) || 0;

  const discount =
    Number(product?.discount) || 0;


  const finalPrice =
    discount > 0
      ? price -
        (price * discount) / 100
      : price;


  const totalPrice =
    finalPrice * quantity;


  /* =========================================================
     IMAGES
  ========================================================= */

  const images = useMemo(() => {

    if (!product) {
      return [];
    }


    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images;
    }


    if (product.image) {
      return [product.image];
    }


    return [];

  }, [product]);


  /* =========================================================
     STOCK
  ========================================================= */

  const stock =
    Number(product?.stock) || 0;


  const isOutOfStock =
    stock <= 0;


  /* =========================================================
     INCREASE QUANTITY
  ========================================================= */

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


  /* =========================================================
     DECREASE QUANTITY
  ========================================================= */

  const decreaseQuantity = () => {

    setQuantity((current) =>
      Math.max(1, current - 1)
    );

  };


  /* =========================================================
     TOGGLE WISHLIST
     
     ADD:
     POST /api/wishlist

     REMOVE:
     DELETE /api/wishlist/:productId
  ========================================================= */

  const toggleWishlist = async () => {

    if (!product) {
      return;
    }


    /* =====================================================
       LOGIN REQUIRED
    ===================================================== */

    if (!isLoggedIn()) {

      toast.error(
        "Please login first"
      );


      navigate("/login", {
        state: {
          from:
            `/products/${slug}`,
        },
      });


      return;
    }


    /* =====================================================
       PRODUCT ID
    ===================================================== */

    const productId =
      product._id ||
      product.id;


    if (!productId) {

      toast.error(
        "Product ID is missing"
      );

      return;
    }


    /* =====================================================
       PREVENT DOUBLE CLICK
    ===================================================== */

    if (wishlistLoading) {
      return;
    }


    try {

      setWishlistLoading(true);


      /* ===================================================
         REMOVE FROM WISHLIST
      =================================================== */

      if (wishlist) {

        await api.delete(
          `/wishlist/${productId}`
        );


        setWishlist(false);


        toast.success(
          "Removed from wishlist"
        );

      }


      /* ===================================================
         ADD TO WISHLIST
      =================================================== */

      else {

        await api.post(
          "/wishlist",
          {
            productId,
          }
        );


        setWishlist(true);


        toast.success(
          "Added to wishlist ❤️"
        );

      }

    } catch (err) {

      console.error(
        "WISHLIST ERROR:",
        err
      );


      /* ===================================================
         UNAUTHORIZED
      =================================================== */

      if (
        err?.response?.status === 401
      ) {

        localStorage.removeItem(
          "vkart_token"
        );

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "vkart-token"
        );

        localStorage.removeItem(
          "accessToken"
        );


        setWishlist(false);


        toast.error(
          "Please login again"
        );


        navigate("/login", {
          replace: true,
          state: {
            from:
              `/products/${slug}`,
          },
        });


        return;
      }


      /* ===================================================
         ALREADY EXISTS
      =================================================== */

      if (
        err?.response?.status === 409
      ) {

        setWishlist(true);


        toast.success(
          "Already in wishlist"
        );


        return;
      }


      toast.error(
        err?.response?.data?.message ||
        "Unable to update wishlist"
      );

    } finally {

      setWishlistLoading(false);

    }

  };


  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart = () => {

    if (!product) {
      return;
    }


    /* =====================================================
       LOGIN REQUIRED
    ===================================================== */

    if (!isLoggedIn()) {

      toast.error(
        "Please login first"
      );


      navigate("/login", {
        state: {
          from:
            `/products/${slug}`,
        },
      });


      return;
    }


    /* =====================================================
       STOCK CHECK
    ===================================================== */

    if (isOutOfStock) {

      toast.error(
        "Product is out of stock"
      );

      return;
    }


    try {

      const existingCart =
        JSON.parse(
          localStorage.getItem(
            "vkart-cart"
          ) || "[]"
        );


      const productId =
        product._id ||
        product.id;


      if (!productId) {

        toast.error(
          "Product ID is missing"
        );

        return;
      }


      /* ===================================================
         FIND EXISTING PRODUCT
      =================================================== */

      const existingIndex =
        existingCart.findIndex(
          (item) =>
            String(
              item.productId
            ) ===
            String(productId)
        );


      /* ===================================================
         PRODUCT ALREADY EXISTS
      =================================================== */

      if (existingIndex >= 0) {

        const currentQuantity =
          Number(
            existingCart[
              existingIndex
            ].quantity
          ) || 0;


        const newQuantity =
          currentQuantity +
          quantity;


        if (
          newQuantity >
          stock
        ) {

          toast.error(
            `Only ${stock} available`
          );

          return;
        }


        existingCart[
          existingIndex
        ].quantity = newQuantity;

      }


      /* ===================================================
         NEW PRODUCT
      =================================================== */

      else {

        existingCart.push({

          productId,

          name:
            product.name,

          price:
            finalPrice,

          image:
            images[0] || "",

          quantity,

          stock,

        });

      }


      /* ===================================================
         SAVE CART
      =================================================== */

      localStorage.setItem(
        "vkart-cart",
        JSON.stringify(
          existingCart
        )
      );


      /* ===================================================
         CART UPDATE EVENT
      =================================================== */

      window.dispatchEvent(
        new Event(
          "vkart-cart-updated"
        )
      );


      toast.success(
        `${product.name} added to cart`
      );

    } catch (err) {

      console.error(
        "CART ERROR:",
        err
      );


      toast.error(
        "Unable to add to cart"
      );

    }

  };


  /* =========================================================
     ORDER NOW
  ========================================================= */

  const orderNow = () => {

    if (!product) {
      return;
    }


    /* =====================================================
       LOGIN REQUIRED
    ===================================================== */

    if (!isLoggedIn()) {

      toast.error(
        "Please login first"
      );


      navigate("/login", {
        state: {
          from:
            `/products/${slug}`,
        },
      });


      return;
    }


    /* =====================================================
       STOCK
    ===================================================== */

    if (isOutOfStock) {

      toast.error(
        "Product is out of stock"
      );

      return;
    }


    const productSlug =
      product.slug ||
      product._id ||
      product.id;


    navigate(
      `/checkout/${productSlug}?quantity=${quantity}`
    );

  };


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {

    return (

      <main className="min-h-screen bg-[#f6f6f3] px-5 py-10 sm:px-8 lg:px-10">

        <div className="mx-auto max-w-[1280px] animate-pulse">

          <div className="h-4 w-32 rounded bg-black/10" />


          <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">

            <div className="aspect-square rounded-[28px] bg-black/[0.06]" />


            <div className="space-y-5">

              <div className="h-4 w-24 rounded bg-black/10" />

              <div className="h-12 w-3/4 rounded bg-black/10" />

              <div className="h-6 w-32 rounded bg-black/10" />

              <div className="h-32 rounded bg-black/[0.06]" />

              <div className="h-14 rounded-xl bg-black/[0.06]" />

            </div>

          </div>

        </div>

      </main>

    );

  }


  /* =========================================================
     ERROR
  ========================================================= */

  if (
    error ||
    !product
  ) {

    return (

      <main className="min-h-screen bg-[#f6f6f3] px-5 py-16">

        <div className="mx-auto max-w-[650px] rounded-[28px] bg-white p-10 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">

            <ShoppingBag size={22} />

          </div>


          <h1 className="mt-5 text-2xl font-extrabold">
            Product unavailable
          </h1>


          <p className="mt-3 text-sm text-black/45">
            {error ||
              "This product could not be found."}
          </p>


          <Link
            to="/products"
            className="mt-7 inline-flex rounded-xl bg-[#171717] px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
          >
            Back to products
          </Link>

        </div>

      </main>

    );

  }


  /* =========================================================
     MAIN UI
  ========================================================= */

  return (

    <main className="min-h-screen bg-[#f6f6f3] text-[#171717]">


      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <section className="mx-auto max-w-[1280px] px-5 pb-6 pt-8 sm:px-8 lg:px-10">

        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/45 transition hover:text-indigo-600"
        >

          <ArrowLeft size={17} />

          Back to products

        </Link>

      </section>


      {/* =====================================================
          PRODUCT SECTION
      ===================================================== */}

      <section className="mx-auto max-w-[1280px] px-5 pb-16 sm:px-8 lg:px-10">

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">


          {/* =================================================
              LEFT - PRODUCT IMAGE
          ================================================= */}

          <div>

            <div className="relative aspect-square overflow-hidden rounded-[30px] bg-[#ededE8]">


              {/* MAIN IMAGE */}

              {images.length > 0 ? (

                <img
                  src={
                    images[selectedImage] ||
                    images[0]
                  }
                  alt={product.name}
                  className="h-full w-full object-cover"
                />

              ) : (

                <div className="flex h-full items-center justify-center text-black/30">
                  No image available
                </div>

              )}


              {/* =================================================
                  DISCOUNT
              ================================================= */}

              {discount > 0 && (

                <span className="absolute left-5 top-5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white">

                  {discount}% OFF

                </span>

              )}


              {/* =================================================
                  ONLY ONE WISHLIST BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={toggleWishlist}
                disabled={
                  wishlistLoading ||
                  checkingWishlist
                }
                aria-label={
                  wishlist
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                title={
                  wishlist
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                className={`absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-md transition ${
                  wishlist
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-white/70 bg-white/90 text-black/60 hover:bg-white"
                } ${
                  wishlistLoading ||
                  checkingWishlist
                    ? "cursor-wait opacity-70"
                    : ""
                }`}
              >

                {wishlistLoading ? (

                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-indigo-600" />

                ) : (

                  <Heart
                    size={20}
                    fill={
                      wishlist
                        ? "currentColor"
                        : "none"
                    }
                  />

                )}

              </button>

            </div>


            {/* =================================================
                THUMBNAILS
            ================================================= */}

            {images.length > 1 && (

              <div className="mt-4 flex gap-3 overflow-x-auto">

                {images.map(
                  (image, index) => (

                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(index)
                      }
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 ${
                        selectedImage === index
                          ? "border-indigo-600"
                          : "border-transparent"
                      }`}
                    >

                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />

                    </button>

                  )
                )}

              </div>

            )}

          </div>


          {/* =================================================
              RIGHT - PRODUCT INFORMATION
          ================================================= */}

          <div className="flex flex-col justify-center">


            {/* CATEGORY */}

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">

              {product.category ||
                "VKART COLLECTION"}

            </p>


            {/* BRAND */}

            {product.brand && (

              <p className="mt-3 text-sm font-semibold text-black/40">

                {product.brand}

              </p>

            )}


            {/* PRODUCT NAME */}

            <h1 className="mt-3 text-4xl font-extrabold leading-tight tracking-[-0.05em] sm:text-5xl">

              {product.name}

            </h1>


            {/* RATING */}

            <div className="mt-5 flex items-center gap-3">

              <div className="flex items-center gap-1">

                <Star
                  size={17}
                  fill="currentColor"
                  className="text-amber-400"
                />

                <span className="text-sm font-bold">

                  {Number(
                    product.rating || 0
                  ).toFixed(1)}

                </span>

              </div>


              <span className="text-sm text-black/35">

                (
                {Number(
                  product.reviewCount
                ) || 0}{" "}
                reviews)

              </span>

            </div>


            {/* PRICE */}

            <div className="mt-7">

              <div className="flex items-end gap-3">

                <span className="text-3xl font-extrabold">

                  {formatPrice(
                    finalPrice
                  )}

                </span>


                {discount > 0 && (

                  <span className="pb-1 text-sm text-black/30 line-through">

                    {formatPrice(price)}

                  </span>

                )}

              </div>


              {discount > 0 && (

                <p className="mt-2 text-xs font-semibold text-emerald-600">

                  You save{" "}

                  {formatPrice(
                    price - finalPrice
                  )}

                </p>

              )}

            </div>


            {/* DESCRIPTION */}

            <div className="mt-8 border-y border-black/[0.07] py-7">

              <p className="text-sm leading-7 text-black/55">

                {product.description ||
                  "A quality product selected for everyday living."}

              </p>

            </div>


            {/* STOCK */}

            <div className="mt-6">

              {isOutOfStock ? (

                <p className="text-sm font-bold text-red-500">
                  Out of stock
                </p>

              ) : stock <= 5 ? (

                <p className="text-sm font-bold text-amber-600">

                  Only {stock} left in stock

                </p>

              ) : (

                <p className="text-sm font-bold text-emerald-600">

                  In stock

                </p>

              )}

            </div>


            {/* QUANTITY */}

            {!isOutOfStock && (

              <div className="mt-5 flex items-center gap-4">

                <span className="text-sm font-bold">
                  Quantity
                </span>


                <div className="flex items-center overflow-hidden rounded-xl border border-black/[0.08] bg-white">


                  {/* MINUS */}

                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    className="flex h-11 w-11 items-center justify-center transition hover:bg-black/[0.03]"
                  >

                    <Minus size={16} />

                  </button>


                  {/* COUNT */}

                  <span className="flex h-11 w-12 items-center justify-center border-x border-black/[0.06] text-sm font-bold">

                    {quantity}

                  </span>


                  {/* PLUS */}

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    className="flex h-11 w-11 items-center justify-center transition hover:bg-black/[0.03]"
                  >

                    <Plus size={16} />

                  </button>

                </div>

              </div>

            )}


            {/* TOTAL */}

            {!isOutOfStock && (

              <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-4">

                <span className="text-sm font-semibold text-black/45">
                  Total
                </span>


                <span className="text-xl font-extrabold">

                  {formatPrice(
                    totalPrice
                  )}

                </span>

              </div>

            )}


            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">


              {/* ADD TO CART */}

              <button
                type="button"
                onClick={addToCart}
                disabled={isOutOfStock}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#171717] px-5 py-4 text-sm font-bold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
              >

                <ShoppingBag size={18} />

                Add to Cart

              </button>


              {/* ORDER NOW */}

              <button
                type="button"
                onClick={orderNow}
                disabled={isOutOfStock}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >

                <Zap size={18} />

                Order Now

              </button>

            </div>


            {/* =================================================
                FEATURES
            ================================================= */}

            <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">


              {/* DELIVERY */}

              <div className="rounded-2xl bg-white p-4">

                <Truck
                  size={18}
                  className="text-indigo-600"
                />

                <p className="mt-3 text-xs font-bold">
                  Fast Delivery
                </p>

                <p className="mt-1 text-[11px] text-black/35">
                  Quick doorstep delivery
                </p>

              </div>


              {/* PAYMENT */}

              <div className="rounded-2xl bg-white p-4">

                <ShieldCheck
                  size={18}
                  className="text-indigo-600"
                />

                <p className="mt-3 text-xs font-bold">
                  Secure Payment
                </p>

                <p className="mt-1 text-[11px] text-black/35">
                  Safe checkout experience
                </p>

              </div>


              {/* QUALITY */}

              <div className="rounded-2xl bg-white p-4">

                <Check
                  size={18}
                  className="text-indigo-600"
                />

                <p className="mt-3 text-xs font-bold">
                  Quality Assured
                </p>

                <p className="mt-1 text-[11px] text-black/35">
                  Carefully selected products
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>

  );

}


export default ProductDetails;