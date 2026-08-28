import {
  Heart,
  ShoppingBag,
  User,
  LogOut,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import { useAuth } from "../context/AuthContext";


function Navbar() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const [cartCount, setCartCount] =
    useState(0);

  const [showProfile, setShowProfile] =
    useState(false);

  const profileRef =
    useRef(null);


  // =====================================================
  // UPDATE CART COUNT
  // =====================================================

  const updateCartCount = () => {
    try {
      const cart =
        JSON.parse(
          localStorage.getItem(
            "vkart-cart"
          ) || "[]"
        );

      const count =
        cart.reduce(
          (total, item) =>
            total +
            Number(
              item.quantity || 0
            ),
          0
        );

      setCartCount(count);
    } catch {
      setCartCount(0);
    }
  };


  // =====================================================
  // CART LISTENER
  // =====================================================

  useEffect(() => {
    updateCartCount();

    window.addEventListener(
      "vkart-cart-updated",
      updateCartCount
    );

    return () => {
      window.removeEventListener(
        "vkart-cart-updated",
        updateCartCount
      );
    };
  }, []);


  // =====================================================
  // CLOSE PROFILE DROPDOWN
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    setShowProfile(false);

    logout();

    navigate("/login", {
      replace: true,
    });
  };


  // =====================================================
  // PROFILE
  // =====================================================

  const handleProfile = () => {
    setShowProfile(false);

    navigate("/profile");
  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-white/95 backdrop-blur">

      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 sm:px-8">


        {/* =================================================
            LOGO
        ================================================= */}

        <Link
          to="/"
          className="text-xl font-extrabold tracking-tight"
        >
          VKART
        </Link>


        {/* =================================================
            RIGHT
        ================================================= */}

        <div className="flex items-center gap-2">


          {/* =================================================
              WISHLIST
          ================================================= */}

          <Link
            to="/wishlist"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl hover:bg-[#f6f6f3]"
          >
            <Heart size={20} />
          </Link>


          {/* =================================================
              CART
          ================================================= */}

          <Link
            to="/cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl hover:bg-[#f6f6f3]"
          >

            <ShoppingBag size={20} />

            {cartCount > 0 && (
              <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                {cartCount > 99
                  ? "99+"
                  : cartCount}
              </span>
            )}

          </Link>


          {/* =================================================
              PROFILE
          ================================================= */}

          <div
            ref={profileRef}
            className="relative"
          >

            <button
              type="button"
              onClick={() =>
                setShowProfile(
                  (current) =>
                    !current
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-[#f6f6f3]"
              aria-label="Profile menu"
            >
              <User size={20} />
            </button>


            {/* =================================================
                PROFILE DROPDOWN
            ================================================= */}

            {showProfile && (
              <div className="absolute right-0 top-14 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">


                {/* USER INFO */}

                <div className="border-b border-gray-100 px-4 py-4">

                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name ||
                      "VKART User"}
                  </p>

                  {user?.phone && (
                    <p className="mt-1 text-xs text-gray-500">
                      {user.phone}
                    </p>
                  )}

                </div>


                {/* PROFILE */}

                <button
                  type="button"
                  onClick={
                    handleProfile
                  }
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-[#f6f6f3]"
                >

                  <User size={18} />

                  My Profile

                </button>


                {/* LOGOUT */}

                <button
                  type="button"
                  onClick={
                    handleLogout
                  }
                  className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >

                  <LogOut size={18} />

                  Logout

                </button>

              </div>
            )}

          </div>

        </div>

      </div>

    </header>
  );
}


export default Navbar;