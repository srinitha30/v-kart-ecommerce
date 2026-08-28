import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Heart,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../services/api";

/* =========================================================
   CATEGORIES
   ========================================================= */

const categories = [
  {
    name: "Electronics",
    description: "Smart tech for everyday life",
    image:
      "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?auto=format&fit=crop&w=1000&q=90",
  },
  {
    name: "Fashion",
    description: "Styles made for you",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1000&q=90",
  },
  {
    name: "Beauty",
    description: "Care that feels good",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1000&q=90",
  },
  {
    name: "Home & Living",
    description: "Make space feel yours",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=90",
  },
];

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
   HOME
   ========================================================= */

function Home() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [wishlist, setWishlist] = useState([]);

  /* =======================================================
     FETCH REAL PRODUCTS
     ======================================================= */

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");

        const receivedProducts =
          response?.data?.products ||
          response?.data?.data ||
          response?.data ||
          [];

        setProducts(
          Array.isArray(receivedProducts)
            ? receivedProducts.slice(0, 4)
            : []
        );
      } catch (error) {
        console.error("Home products error:", error);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  /* =======================================================
     WISHLIST
     ======================================================= */

  const toggleWishlist = (id) => {
    setWishlist((current) => {
      if (current.includes(id)) {
        toast("Removed from wishlist");

        return current.filter(
          (item) => item !== id
        );
      }

      toast.success("Added to wishlist");

      return [...current, id];
    });
  };

  /* =======================================================
     CART
     ======================================================= */

  const addToCart = (product) => {
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    toast.success(
      `${product.name} added to cart`
    );
  };

  return (
    <main className="bg-[#f6f6f3] text-[#171717]">

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 pb-5 pt-4 sm:px-6 lg:px-8 lg:pt-6">

        <div className="relative min-h-[560px] overflow-hidden rounded-[28px] bg-[#151515] shadow-[0_20px_60px_rgba(0,0,0,0.12)]">

          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=90"
            alt="VKART shopping"
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/15" />

          <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative z-10 flex min-h-[560px] items-center px-7 py-14 sm:px-12 lg:px-16">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/75 backdrop-blur-md">
                <Sparkles size={13} />
                Curated for everyday living
              </div>

              <h1 className="mt-6 max-w-3xl font-['Manrope'] text-[46px] font-extrabold leading-[0.98] tracking-[-0.055em] text-white sm:text-[64px] lg:text-[78px]">
                Good products.
                <span className="block text-indigo-300">
                  Better shopping.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-[15px] leading-7 text-white/65 sm:text-[17px]">
                Discover carefully selected products, transparent
                pricing, and a shopping experience designed around
                what matters to you.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">

                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-[#171717] transition hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Start shopping
                  <ArrowRight size={17} />
                </Link>

                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/10"
                >
                  Explore collection
                </Link>

              </div>

              <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-white/55">

                <span className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-300" />
                  Secure checkout
                </span>

                <span className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-300" />
                  Easy returns
                </span>

                <span className="flex items-center gap-2">
                  <Check size={14} className="text-indigo-300" />
                  Trusted products
                </span>

              </div>

            </div>
          </div>
        </div>
      </section>


      {/* =====================================================
          TRUST STRIP
          ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6 lg:px-8">

        <div className="grid overflow-hidden rounded-[22px] border border-black/[0.06] bg-white shadow-[0_8px_28px_rgba(0,0,0,0.03)] sm:grid-cols-3">

          <div className="flex items-center gap-4 border-b border-black/[0.06] p-5 sm:border-b-0 sm:border-r sm:p-6">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Truck size={20} />
            </div>

            <div>
              <p className="text-sm font-bold">
                Fast delivery
              </p>

              <p className="mt-1 text-xs text-black/40">
                Track every order
              </p>
            </div>

          </div>


          <div className="flex items-center gap-4 border-b border-black/[0.06] p-5 sm:border-b-0 sm:border-r sm:p-6">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck size={20} />
            </div>

            <div>
              <p className="text-sm font-bold">
                Secure payments
              </p>

              <p className="mt-1 text-xs text-black/40">
                Protected transactions
              </p>
            </div>

          </div>


          <div className="flex items-center gap-4 p-5 sm:p-6">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Sparkles size={20} />
            </div>

            <div>
              <p className="text-sm font-bold">
                Curated quality
              </p>

              <p className="mt-1 text-xs text-black/40">
                Products worth buying
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* =====================================================
          CATEGORIES
          ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 pb-10 pt-14 sm:px-6 lg:px-8">

        <div className="mb-8 flex items-end justify-between">

          <div>

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              Browse
            </p>

            <h2 className="mt-2 font-['Manrope'] text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Shop by category
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-black/45">
              Explore collections selected to make finding
              what you need easy.
            </p>

          </div>

          <Link
            to="/products"
            className="hidden items-center gap-2 text-sm font-bold text-black/55 transition hover:text-indigo-600 sm:flex"
          >
            View all
            <ChevronRight size={17} />
          </Link>

        </div>


        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {categories.map((category) => (

            <Link
              key={category.name}
              to={`/products?category=${encodeURIComponent(
                category.name
              )}`}
              className="group relative min-h-[330px] overflow-hidden rounded-[24px] bg-black"
            >

              <img
                src={category.image}
                alt={category.name}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">

                <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/55">
                  Collection
                </p>

                <h3 className="mt-2 font-['Manrope'] text-2xl font-bold tracking-[-0.03em]">
                  {category.name}
                </h3>

                <p className="mt-1 text-sm text-white/60">
                  {category.description}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  Explore
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-1"
                  />
                </div>

              </div>

            </Link>

          ))}

        </div>

      </section>


      {/* =====================================================
          REAL FEATURED PRODUCTS
          ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 pb-16 pt-10 sm:px-6 lg:px-8">

        <div className="mb-8 flex items-end justify-between">

          <div>

            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">
              Trending now
            </p>

            <h2 className="mt-2 font-['Manrope'] text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
              Picks worth seeing
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-black/45">
              Popular products from your VKART collection.
            </p>

          </div>

          <Link
            to="/products"
            className="hidden items-center gap-2 text-sm font-bold text-black/55 transition hover:text-indigo-600 sm:flex"
          >
            Shop all
            <ChevronRight size={17} />
          </Link>

        </div>


        {loadingProducts ? (

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-[22px] border border-black/[0.06] bg-white"
                >
                  <div className="aspect-square bg-black/[0.06]" />

                  <div className="space-y-3 p-4">
                    <div className="h-3 w-20 rounded bg-black/10" />
                    <div className="h-5 w-full rounded bg-black/10" />
                    <div className="h-5 w-2/3 rounded bg-black/10" />
                    <div className="h-7 w-24 rounded bg-black/10" />
                  </div>
                </div>
              )
            )}

          </div>

        ) : products.length === 0 ? (

          <div className="rounded-[24px] border border-black/[0.06] bg-white px-6 py-16 text-center">

            <ShoppingBag
              size={28}
              className="mx-auto text-black/25"
            />

            <h3 className="mt-4 font-['Manrope'] text-xl font-extrabold">
              No products available yet
            </h3>

            <p className="mt-2 text-sm text-black/40">
              Check the shop for the latest collection.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-5 py-3 text-sm font-bold text-white hover:bg-indigo-600"
            >
              Visit shop
              <ArrowRight size={16} />
            </Link>

          </div>

        ) : (

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {products.map((product) => {

              const id =
                product._id ||
                product.id;

              const slug =
                product.slug ||
                product._id ||
                product.id;

              const image =
                product.images?.[0] ||
                product.image ||
                "";

              const price =
                Number(product.price) || 0;

              const discount =
                Number(product.discount) || 0;

              const finalPrice =
                discount > 0
                  ? price -
                    (price * discount) / 100
                  : price;

              const rating =
                Number(product.rating) || 0;

              const reviewCount =
                Number(product.reviewCount) || 0;

              const isWishlisted =
                wishlist.includes(id);

              return (
                <article
                  key={id}
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
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-black/30">
                          No image
                        </div>
                      )}

                    </Link>


                    {discount > 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-indigo-600 px-3 py-1.5 text-[9px] font-bold tracking-wide text-white">
                        {discount}% OFF
                      </span>
                    )}


                    <button
                      type="button"
                      aria-label="Wishlist product"
                      onClick={() =>
                        toggleWishlist(id)
                      }
                      className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition ${
                        isWishlisted
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-white/70 bg-white/90 text-black/65 hover:text-indigo-600"
                      }`}
                    >
                      <Heart
                        size={17}
                        fill={
                          isWishlisted
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>

                  </div>


                  {/* INFO */}

                  <div className="p-4">

                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-600">
                      {product.category || "Collection"}
                    </p>

                    <Link
                      to={`/products/${slug}`}
                      className="mt-2 block"
                    >
                      <h3 className="min-h-[48px] font-['Manrope'] text-base font-bold leading-6 tracking-[-0.02em] transition hover:text-indigo-600">
                        {product.name}
                      </h3>
                    </Link>


                    <div className="mt-3 flex items-center gap-2">

                      <div className="flex items-center gap-1">

                        <Star
                          size={14}
                          fill="currentColor"
                          className="text-amber-400"
                        />

                        <span className="text-xs font-bold">
                          {rating.toFixed(1)}
                        </span>

                      </div>

                      <span className="text-xs text-black/35">
                        ({reviewCount})
                      </span>

                    </div>


                    <div className="mt-4 flex items-end justify-between gap-3">

                      <div>

                        <p className="font-['Manrope'] text-xl font-extrabold tracking-[-0.03em]">
                          {formatPrice(finalPrice)}
                        </p>

                        {discount > 0 && (
                          <p className="mt-1 text-xs text-black/30 line-through">
                            {formatPrice(price)}
                          </p>
                        )}

                      </div>


                      <button
                        type="button"
                        aria-label="Add to cart"
                        disabled={product.stock === 0}
                        onClick={() =>
                          addToCart(product)
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#171717] text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ShoppingBag size={18} />
                      </button>

                    </div>

                  </div>

                </article>
              );
            })}

          </div>

        )}

      </section>


      {/* =====================================================
          WHY VKART
          ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-8">

        <div className="overflow-hidden rounded-[28px] bg-[#171717]">

          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">

            <div className="p-7 sm:p-10 lg:p-14">

              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-300">
                Why VKART
              </p>

              <h2 className="mt-3 max-w-lg font-['Manrope'] text-3xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-4xl">
                Shopping should feel simple.
              </h2>

              <p className="mt-4 max-w-lg text-sm leading-6 text-white/55">
                Useful products, transparent pricing, and a cleaner
                shopping experience.
              </p>

              <Link
                to="/products"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#171717] transition hover:-translate-y-0.5"
              >
                Shop VKART
                <ArrowRight size={16} />
              </Link>

            </div>


            <div className="grid border-t border-white/[0.08] sm:grid-cols-2 lg:border-l lg:border-t-0">

              <div className="border-b border-white/[0.08] p-7 sm:border-r sm:p-9 lg:border-b-0">

                <ShieldCheck
                  size={22}
                  className="text-indigo-300"
                />

                <h3 className="mt-5 font-['Manrope'] text-lg font-bold text-white">
                  Secure by design
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  Clear product information and protected checkout.
                </p>

              </div>


              <div className="p-7 sm:p-9">

                <Heart
                  size={22}
                  className="text-indigo-300"
                />

                <h3 className="mt-5 font-['Manrope'] text-lg font-bold text-white">
                  Curated for you
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  Discover collections built around everyday needs.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
          ===================================================== */}

      <section className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">

        <div className="rounded-[28px] border border-black/[0.06] bg-white px-7 py-12 text-center shadow-[0_10px_35px_rgba(0,0,0,0.04)] sm:px-12 sm:py-16">

          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-indigo-600">
            Ready when you are
          </p>

          <h2 className="mx-auto mt-3 max-w-2xl font-['Manrope'] text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl lg:text-5xl">
            Find something you'll love.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-black/45 sm:text-base">
            Browse the complete VKART collection and find your next
            favourite product.
          </p>

          <Link
            to="/products"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#171717] px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600"
          >
            Shop all products
            <ArrowRight size={17} />
          </Link>

        </div>

      </section>

    </main>
  );
}

export default Home;