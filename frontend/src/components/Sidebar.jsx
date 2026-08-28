import {
  Home,
  ShoppingBag,
  Smartphone,
  Shirt,
  Sparkles,
  House,
  Heart,
  Package,
} from "lucide-react";

import { Link, useLocation } from "react-router-dom";

function Sidebar({ open = false, onClose = () => {} }) {
  const location = useLocation();

  /* =========================================================
     MENU ITEMS
     ========================================================= */

  const menuItems = [
    {
      label: "Home",
      icon: Home,
      path: "/",
    },
    {
      label: "Shop",
      icon: ShoppingBag,
      path: "/products",
    },
    {
      label: "Electronics",
      icon: Smartphone,
      path: "/products?category=Electronics",
    },
    {
      label: "Fashion",
      icon: Shirt,
      path: "/products?category=Fashion",
    },
    {
      label: "Beauty",
      icon: Sparkles,
      path: "/products?category=Beauty",
    },
    {
      label: "Home & Living",
      icon: House,
      path: "/products?category=Home%20%26%20Living",
    },
    {
      label: "My Orders",
      icon: Package,
      path: "/orders",
    },
  ];

  /* =========================================================
     ACTIVE CHECK
     ========================================================= */

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    if (path === "/products") {
      return (
        location.pathname === "/products" &&
        !location.search
      );
    }

    if (path === "/orders") {
      return location.pathname === "/orders";
    }

    return (
      location.pathname === "/products" &&
      location.search === `?${path.split("?")[1]}`
    );
  };

  /* =========================================================
     CLOSE SIDEBAR
     ========================================================= */

  const handleNavigation = () => {
    if (onClose) {
      onClose();
    }
  };

  /* =========================================================
     SIDEBAR
     ========================================================= */

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
          ===================================================== */}

      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="
            fixed
            inset-0
            z-[80]
            cursor-default
            border-0
            bg-black/25
            p-0
            backdrop-blur-[2px]
            lg:hidden
          "
        />
      )}

      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside
        className={`vkart-sidebar ${open ? "open" : ""}`}
      >
        {/* ===================================================
            SIDEBAR HEADER
            =================================================== */}

        <div className="mb-7 px-2">
          <p
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.18em]
              text-indigo-600
            "
          >
            Browse
          </p>

          <h2
            className="
              mt-1
              font-['Manrope']
              text-[22px]
              font-extrabold
              tracking-[-0.04em]
              text-[#171717]
            "
          >
            Explore
          </h2>
        </div>

        {/* ===================================================
            MAIN NAVIGATION
            =================================================== */}

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={handleNavigation}
                className={`
                  group

                  flex
                  min-h-[48px]
                  w-full
                  items-center
                  gap-3

                  rounded-xl

                  px-3

                  text-sm
                  font-semibold

                  transition-all
                  duration-200

                  ${
                    active
                      ? `
                        bg-indigo-600
                        text-white
                        shadow-[0_6px_18px_rgba(79,70,229,0.18)]
                      `
                      : `
                        text-black/50
                        hover:bg-black/[0.045]
                        hover:text-[#171717]
                      `
                  }
                `}
              >
                {/* ICON */}

                <span
                  className={`
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl

                    transition-all
                    duration-200

                    ${
                      active
                        ? "bg-white/15 text-white"
                        : `
                          bg-black/[0.035]
                          text-black/50
                          group-hover:bg-white
                          group-hover:text-indigo-600
                        `
                    }
                  `}
                >
                  <Icon
                    size={18}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                </span>

                {/* LABEL */}

                <span className="truncate">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* ===================================================
            DIVIDER
            =================================================== */}

        <div className="my-6 h-px bg-black/[0.07]" />

        {/* ===================================================
            WISHLIST
            =================================================== */}

        <Link
          to="/wishlist"
          onClick={handleNavigation}
          className={`
            group
            flex
            min-h-[48px]
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            text-sm
            font-semibold
            transition-all
            duration-200

            ${
              location.pathname === "/wishlist"
                ? `
                  bg-indigo-600
                  text-white
                  shadow-[0_6px_18px_rgba(79,70,229,0.18)]
                `
                : `
                  text-black/50
                  hover:bg-black/[0.045]
                  hover:text-[#171717]
                `
            }
          `}
        >
          <span
            className={`
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              transition-all
              duration-200

              ${
                location.pathname === "/wishlist"
                  ? "bg-white/15 text-white"
                  : `
                    bg-black/[0.035]
                    text-black/50
                    group-hover:bg-white
                    group-hover:text-indigo-600
                  `
              }
            `}
          >
            <Heart
              size={18}
              strokeWidth={
                location.pathname === "/wishlist"
                  ? 2.2
                  : 1.8
              }
            />
          </span>

          <span>
            Wishlist
          </span>
        </Link>

        {/* ===================================================
            BOTTOM BRAND CARD
            =================================================== */}

        <div
          className="
            mt-8
            rounded-2xl
            border
            border-black/[0.05]
            bg-white
            p-4
            shadow-[0_8px_25px_rgba(0,0,0,0.04)]
          "
        >
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-indigo-50
                text-[11px]
                font-extrabold
                text-indigo-600
              "
            >
              V
            </div>

            <p
              className="
                font-['Manrope']
                text-sm
                font-extrabold
                tracking-[-0.03em]
              "
            >
              VKART
              <span className="text-indigo-600">
                .
              </span>
            </p>
          </div>

          <p
            className="
              mt-3
              text-xs
              leading-5
              text-black/40
            "
          >
            Everything you need,
            <br />
            all in one place.
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;