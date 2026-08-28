import {
  Heart,
  Search,
  ShoppingBag,
  Star,
  ArrowUpRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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
   PRODUCT ID
========================================================= */

const getProductId = (product) => {
  if (!product) return "";

  return String(product._id || product.id || "");
};

/* =========================================================
   NORMALIZE WISHLIST
========================================================= */

const normalizeWishlistIds = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (!item) return null;

      if (
        typeof item === "string" ||
        typeof item === "number"
      ) {
        return String(item);
      }

      if (item.product) {
        if (typeof item.product === "string") {
          return String(item.product);
        }

        return String(
          item.product._id ||
            item.product.id ||
            ""
        );
      }

      return String(
        item._id ||
          item.id ||
          ""
      );
    })
    .filter(Boolean);
};

/* =========================================================
   PRODUCTS
========================================================= */

function Products() {
  const [searchParams] = useSearchParams();

  const categoryFromUrl =
    searchParams.get("category") || "All";

  /* =======================================================
     STATE
  ======================================================= */

  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState(categoryFromUrl);

  const [sortBy, setSortBy] =
    useState("default");

  const [showFilters, setShowFilters] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
   * IMPORTANT
   *
   * Wishlist contains MongoDB product IDs only.
   *
   * Example:
   *
   * [
   *   "68abc123...",
   *   "68def456..."
   * ]
   */

  const [wishlist, setWishlist] =
    useState([]);

  const [wishlistLoadingId, setWishlistLoadingId] =
    useState(null);

  /* =======================================================
     TOKEN
  ======================================================= */

  const getToken = () => {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("vkart_token") ||
      ""
    );
  };

  /* =======================================================
     CATEGORY FROM URL
  ======================================================= */

  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  /* =======================================================
     FETCH PRODUCTS
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/products");

        const receivedProducts =
          response?.data?.products ||
          response?.data?.data ||
          response?.data ||
          [];

        if (!mounted) return;

        if (Array.isArray(receivedProducts)) {
          setProducts(receivedProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error(
          "PRODUCTS FETCH ERROR:",
          err
        );

        if (!mounted) return;

        setError(
          "Unable to load products. Please try again."
        );

        toast.error(
          "Unable to load products"
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     FETCH WISHLIST FROM MONGODB
     
     NO LOCALSTORAGE WISHLIST
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchWishlist = async () => {
      const token = getToken();

      console.log(
        "========== WISHLIST LOAD =========="
      );

      console.log(
        "TOKEN EXISTS:",
        Boolean(token)
      );

      /*
       * User must be logged in because
       * wishlist belongs to a MongoDB user.
       */

      if (!token) {
        if (mounted) {
          setWishlist([]);
        }

        return;
      }

      try {
        const response = await api.get(
          "/wishlist",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log(
          "WISHLIST BACKEND RESPONSE:",
          response?.data
        );

        const backendWishlist =
          response?.data?.wishlist ||
          response?.data?.data ||
          response?.data ||
          [];

        const wishlistIds =
          normalizeWishlistIds(
            backendWishlist
          );

        if (mounted) {
          setWishlist(wishlistIds);
        }

        console.log(
          "MONGODB WISHLIST IDS:",
          wishlistIds
        );
      } catch (err) {
        console.error(
          "WISHLIST FETCH ERROR:",
          err
        );

        if (!mounted) return;

        setWishlist([]);

        if (
          err?.response?.status === 401
        ) {
          toast.error(
            "Please login again"
          );
        }
      }
    };

    fetchWishlist();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        products
          .map(
            (product) =>
              product?.category
          )
          .filter(Boolean)
      ),
    ];

    return [
      "All",
      ...uniqueCategories,
    ];
  }, [products]);

  /* =======================================================
     FILTER + SEARCH + SORT
  ======================================================= */

  const filteredProducts = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    let result = products.filter(
      (product) => {
        const productCategory =
          String(
            product?.category || ""
          );

        const productName =
          String(
            product?.name || ""
          );

        const productBrand =
          String(
            product?.brand || ""
          );

        const matchesCategory =
          selectedCategory === "All" ||
          productCategory ===
            selectedCategory;

        const matchesSearch =
          !query ||
          productName
            .toLowerCase()
            .includes(query) ||
          productBrand
            .toLowerCase()
            .includes(query) ||
          productCategory
            .toLowerCase()
            .includes(query);

        return (
          matchesCategory &&
          matchesSearch
        );
      }
    );

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a?.price || 0) -
          Number(b?.price || 0)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b?.price || 0) -
          Number(a?.price || 0)
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          Number(b?.rating || 0) -
          Number(a?.rating || 0)
      );
    }

    if (sortBy === "discount") {
      result.sort(
        (a, b) =>
          Number(b?.discount || 0) -
          Number(a?.discount || 0)
      );
    }

    return result;
  }, [
    products,
    selectedCategory,
    search,
    sortBy,
  ]);

  /* =======================================================
     TOGGLE WISHLIST
     
     MONGODB ONLY
  ======================================================= */

  const toggleWishlist = async (
    product
  ) => {
    const productId =
      getProductId(product);

    if (!productId) {
      toast.error(
        "Product ID is missing"
      );
      return;
    }

    const id = String(productId);

    const token = getToken();

    /*
     * IMPORTANT:
     * No token = don't save locally.
     * Wishlist is MongoDB based.
     */

    if (!token) {
      toast.error(
        "Please login to use wishlist"
      );
      return;
    }

    if (
      String(wishlistLoadingId) === id
    ) {
      return;
    }

    const isWishlisted =
      wishlist.some(
        (wishlistId) =>
          String(wishlistId) === id
      );

    /* =====================================================
       REMOVE FROM MONGODB
    ===================================================== */

    if (isWishlisted) {
      try {
        setWishlistLoadingId(id);

        console.log(
          "REMOVING WISHLIST:",
          id
        );

        await api.delete(
          `/wishlist/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        /*
         * Update UI ONLY after
         * MongoDB request succeeds.
         */

        setWishlist(
          (currentWishlist) =>
            currentWishlist.filter(
              (wishlistId) =>
                String(wishlistId) !== id
            )
        );

        toast.success(
          "Removed from wishlist"
        );

        console.log(
          "WISHLIST REMOVED FROM MONGODB:",
          id
        );
      } catch (err) {
        console.error(
          "WISHLIST REMOVE ERROR:",
          err
        );

        if (
          err?.response?.status === 401
        ) {
          toast.error(
            "Session expired. Please login again."
          );
        } else {
          toast.error(
            err?.response?.data?.message ||
              "Unable to remove from wishlist"
          );
        }
      } finally {
        setWishlistLoadingId(null);
      }

      return;
    }

    /* =====================================================
       ADD TO MONGODB
    ===================================================== */

    try {
      setWishlistLoadingId(id);

      console.log(
        "ADDING WISHLIST:",
        id
      );

      const response =
        await api.post(
          "/wishlist",
          {
            productId: id,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      console.log(
        "WISHLIST SAVED IN MONGODB:",
        response?.data
      );

      /*
       * Update UI ONLY after
       * backend succeeds.
       */

      setWishlist(
        (currentWishlist) => {
          if (
            currentWishlist.some(
              (wishlistId) =>
                String(wishlistId) === id
            )
          ) {
            return currentWishlist;
          }

          return [
            ...currentWishlist,
            id,
          ];
        }
      );

      toast.success(
        "Added to wishlist ❤️"
      );
    } catch (err) {
      console.error(
        "WISHLIST ADD ERROR:",
        err
      );

      /*
       * DO NOT update wishlist
       * if MongoDB request failed.
       */

      if (
        err?.response?.status === 401
      ) {
        toast.error(
          "Session expired. Please login again."
        );
      } else {
        toast.error(
          err?.response?.data?.message ||
            "Unable to add to wishlist"
        );
      }
    } finally {
      setWishlistLoadingId(null);
    }
  };

  /* =======================================================
     ADD TO CART
  ======================================================= */

  const addToCart = (product) => {
    const stock =
      Number(product?.stock) || 0;

    if (stock <= 0) {
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
        product?._id ||
        product?.id;

      if (!productId) {
        toast.error(
          "Product ID is missing"
        );
        return;
      }

      const existingItem =
        existingCart.find(
          (item) =>
            String(
              item?._id ||
                item?.id
            ) ===
            String(productId)
        );

      let updatedCart;

      if (existingItem) {
        updatedCart =
          existingCart.map(
            (item) => {
              const itemId =
                item?._id ||
                item?.id;

              if (
                String(itemId) ===
                String(productId)
              ) {
                return {
                  ...item,
                  quantity:
                    Number(
                      item?.quantity || 1
                    ) + 1,
                };
              }

              return item;
            }
          );
      } else {
        updatedCart = [
          ...existingCart,
          {
            ...product,
            quantity: 1,
          },
        ];
      }

      localStorage.setItem(
        "vkart-cart",
        JSON.stringify(
          updatedCart
        )
      );

      window.dispatchEvent(
        new Event(
          "vkart-cart-updated"
        )
      );

      toast.success(
        `${product?.name || "Product"} added to cart`
      );
    } catch (err) {
      console.error(
        "CART ERROR:",
        err
      );

      toast.error(
        "Unable to add product to cart"
      );
    }
  };

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const clearFilters = () => {
    setSelectedCategory("All");
    setSortBy("default");
    setSearch("");
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f6f3] px-5 py-10 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="animate-pulse">
            <div className="h-3 w-28 rounded bg-black/10" />

            <div className="mt-4 h-12 w-72 rounded bg-black/10" />

            <div className="mt-4 h-5 w-96 max-w-full rounded bg-black/10" />

            <div className="mt-8 h-16 w-full rounded-2xl bg-black/[0.06]" />

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({
                length: 8,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[22px] bg-white"
                  >
                    <div className="aspect-square bg-black/[0.06]" />

                    <div className="space-y-3 p-4">
                      <div className="h-3 w-20 rounded bg-black/10" />

                      <div className="h-5 w-full rounded bg-black/10" />

                      <div className="h-5 w-1/2 rounded bg-black/10" />

                      <div className="h-8 w-24 rounded bg-black/10" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="min-h-screen bg-[#f6f6f3] px-5 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-[700px] rounded-[28px] border border-black/[0.06] bg-white p-10 text-center shadow-[0_10px_35px_rgba(0,0,0,0.04)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <ShoppingBag size={22} />
          </div>

          <h1 className="mt-5 font-['Manrope'] text-2xl font-extrabold">
            Products unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/45">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-7 rounded-xl bg-[#171717] px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-600"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-[#171717]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-5 pb-6 pt-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              VKART COLLECTION
            </p>

            <h1 className="mt-2 font-['Manrope'] text-4xl font-extrabold leading-none tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Shop all products
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-black/45 sm:text-base">
              Discover products selected for quality,
              value, and everyday living.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-black/40">
            <ShoppingBag size={17} />

            <span>
              {filteredProducts.length} products
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-5 pb-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-3 rounded-[22px] border border-black/[0.06] bg-white p-3 shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:flex-row">

          <div className="flex h-12 flex-1 items-center gap-3 rounded-xl bg-[#f6f6f3] px-4">

            <Search
              size={19}
              className="shrink-0 text-black/30"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search products, brands or categories..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-black/30"
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="text-black/30 transition hover:text-black"
              >
                <X size={17} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                (current) =>
                  !current
              )
            }
            className={`flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition ${
              showFilters
                ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                : "border-black/[0.06] text-black/60 hover:bg-[#f6f6f3]"
            }`}
          >
            <SlidersHorizontal size={17} />

            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 rounded-[22px] border border-black/[0.06] bg-white p-5 shadow-[0_10px_35px_rgba(0,0,0,0.04)]">

            <div className="grid gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/40">
                  Category
                </label>

                <select
                  value={
                    selectedCategory
                  }
                  onChange={(event) =>
                    setSelectedCategory(
                      event.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#f6f6f3] px-4 text-sm font-semibold outline-none focus:border-indigo-500"
                >
                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-black/40">
                  Sort by
                </label>

                <select
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value
                    )
                  }
                  className="h-12 w-full rounded-xl border border-black/[0.08] bg-[#f6f6f3] px-4 text-sm font-semibold outline-none focus:border-indigo-500"
                >
                  <option value="default">
                    Recommended
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>

                  <option value="rating">
                    Highest Rated
                  </option>

                  <option value="discount">
                    Highest Discount
                  </option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">

              <span className="text-xs font-semibold text-black/35">
                Active:
              </span>

              {selectedCategory !==
                "All" && (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategory(
                      "All"
                    )
                  }
                  className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600"
                >
                  {selectedCategory}

                  <X
                    size={12}
                    className="ml-1 inline"
                  />
                </button>
              )}

              {sortBy !==
                "default" && (
                <button
                  type="button"
                  onClick={() =>
                    setSortBy(
                      "default"
                    )
                  }
                  className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-bold text-black/60"
                >
                  Sorted

                  <X
                    size={12}
                    className="ml-1 inline"
                  />
                </button>
              )}

              {(selectedCategory !==
                "All" ||
                sortBy !==
                  "default" ||
                search) && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="ml-auto text-xs font-bold text-red-500 hover:text-red-600"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          COLLECTION INFO
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-5 pb-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-semibold">
              {selectedCategory ===
              "All"
                ? "Featured collection"
                : selectedCategory}
            </p>

            <p className="mt-1 text-xs text-black/40">
              {filteredProducts.length}{" "}
              items available
            </p>
          </div>

          {selectedCategory !==
            "All" && (
            <button
              type="button"
              onClick={() =>
                setSelectedCategory(
                  "All"
                )
              }
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              View all
            </button>
          )}
        </div>
      </section>

      {/* =====================================================
          PRODUCT GRID
      ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-10">

        {filteredProducts.length ===
        0 ? (
          <div className="rounded-[24px] border border-black/[0.06] bg-white px-6 py-20 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f6f6f3] text-black/35">
              <Search size={22} />
            </div>

            <h2 className="mt-5 font-['Manrope'] text-xl font-extrabold">
              No products found
            </h2>

            <p className="mt-2 text-sm text-black/40">
              Try another search or choose
              a different category.
            </p>

            <button
              type="button"
              onClick={
                clearFilters
              }
              className="mt-6 rounded-xl bg-[#171717] px-5 py-3 text-xs font-bold text-white transition hover:bg-indigo-600"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {filteredProducts.map(
              (product) => {
                const id =
                  getProductId(
                    product
                  );

                const idString =
                  String(id);

                const slug =
                  product?.slug ||
                  product?._id ||
                  product?.id ||
                  "";

                const image =
                  product?.images?.[0] ||
                  product?.image ||
                  "";

                const rating =
                  Number(
                    product?.rating
                  ) || 0;

                const reviewCount =
                  Number(
                    product?.reviewCount
                  ) || 0;

                const price =
                  Number(
                    product?.price
                  ) || 0;

                const discount =
                  Number(
                    product?.discount
                  ) || 0;

                const stock =
                  Number(
                    product?.stock
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

                const isWishlisted =
                  wishlist.some(
                    (wishlistId) =>
                      String(
                        wishlistId
                      ) === idString
                  );

                const isWishlistLoading =
                  String(
                    wishlistLoadingId
                  ) === idString;

                return (
                  <article
                    key={idString}
                    className="group overflow-hidden rounded-[22px] border border-black/[0.06] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(0,0,0,0.08)]"
                  >

                    {/* IMAGE */}

                    <div className="relative aspect-square overflow-hidden bg-[#efefeb]">

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
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-sm text-black/30">
                            No image
                          </div>
                        )}
                      </Link>

                      {/* DISCOUNT */}

                      {discount > 0 && (
                        <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-3 py-1.5 text-[9px] font-bold tracking-wide text-white">
                          {discount}% OFF
                        </span>
                      )}

                      {/* STOCK */}

                      {stock <= 0 && (
                        <span className="absolute bottom-3 left-3 rounded-full bg-black/80 px-3 py-1.5 text-[9px] font-bold tracking-wide text-white backdrop-blur-md">
                          OUT OF STOCK
                        </span>
                      )}

                      {/* WISHLIST */}

                      <button
                        type="button"
                        disabled={
                          isWishlistLoading
                        }
                        aria-label={
                          isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                        onClick={(
                          event
                        ) => {
                          event.preventDefault();
                          event.stopPropagation();

                          toggleWishlist(
                            product
                          );
                        }}
                        className={`absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition ${
                          isWishlisted
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-white/70 bg-white/90 text-black/65 hover:bg-white hover:text-indigo-600"
                        } ${
                          isWishlistLoading
                            ? "cursor-not-allowed opacity-60"
                            : ""
                        }`}
                      >
                        {isWishlistLoading ? (
                          <span
                            className={`h-4 w-4 animate-spin rounded-full border-2 ${
                              isWishlisted
                                ? "border-white/30 border-t-white"
                                : "border-black/20 border-t-black"
                            }`}
                          />
                        ) : (
                          <Heart
                            size={17}
                            fill={
                              isWishlisted
                                ? "currentColor"
                                : "none"
                            }
                          />
                        )}
                      </button>
                    </div>

                    {/* CONTENT */}

                    <div className="p-4">

                      {/* CATEGORY */}

                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                        {product?.category ||
                          "Collection"}
                      </p>

                      {/* NAME */}

                      <Link
                        to={`/products/${slug}`}
                        className="mt-2 block"
                      >
                        <h2 className="min-h-[48px] font-['Manrope'] text-base font-bold leading-6 tracking-[-0.02em] transition hover:text-indigo-600">
                          {product?.name ||
                            "Unnamed Product"}
                        </h2>
                      </Link>

                      {/* BRAND */}

                      {product?.brand && (
                        <p className="mt-1 text-xs text-black/35">
                          {product.brand}
                        </p>
                      )}

                      {/* RATING */}

                      <div className="mt-3 flex items-center gap-2">

                        <div className="flex items-center gap-1">

                          <Star
                            size={14}
                            fill="currentColor"
                            className="text-amber-400"
                          />

                          <span className="text-xs font-bold">
                            {rating.toFixed(
                              1
                            )}
                          </span>
                        </div>

                        <span className="text-xs text-black/35">
                          ({reviewCount})
                        </span>
                      </div>

                      {/* PRICE */}

                      <div className="mt-4 flex items-end justify-between gap-3">

                        <div>

                          <p className="font-['Manrope'] text-xl font-extrabold tracking-[-0.03em]">
                            {formatPrice(
                              finalPrice
                            )}
                          </p>

                          {discount > 0 && (
                            <p className="mt-1 text-xs text-black/30 line-through">
                              {formatPrice(
                                price
                              )}
                            </p>
                          )}
                        </div>

                        {/* CART */}

                        <button
                          type="button"
                          aria-label="Add to cart"
                          onClick={() =>
                            addToCart(
                              product
                            )
                          }
                          disabled={
                            stock <= 0
                          }
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#171717] text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ShoppingBag
                            size={18}
                          />
                        </button>
                      </div>

                      {/* STOCK */}

                      <div className="mt-3">

                        {stock > 0 &&
                        stock <= 5 ? (
                          <p className="text-[11px] font-semibold text-orange-500">
                            Only {stock} left
                          </p>
                        ) : stock > 0 ? (
                          <p className="text-[11px] text-black/30">
                            In stock
                          </p>
                        ) : (
                          <p className="text-[11px] font-semibold text-red-500">
                            Currently unavailable
                          </p>
                        )}
                      </div>

                      {/* DETAILS */}

                      <Link
                        to={`/products/${slug}`}
                        className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-4 text-xs font-bold text-black/45 transition hover:text-indigo-600"
                      >
                        <span>
                          View details
                        </span>

                        <ArrowUpRight
                          size={15}
                        />
                      </Link>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default Products;