import { useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Eye,
  EyeOff,
  Lock,
  Phone,
  ShoppingBag,
} from "lucide-react";

import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";


export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();


  /* =========================================================
     STATE
  ========================================================= */

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);


  /* =========================================================
     WHERE TO GO AFTER LOGIN
  ========================================================= */

  const from =
    location.state?.from || "/";


  /* =========================================================
     LOGIN
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");


    /* -------------------------------------------------------
       VALIDATION
    ------------------------------------------------------- */

    const cleanPhone =
      phone.trim();

    if (!cleanPhone || !password) {
      setError(
        "Please enter phone number and password"
      );

      return;
    }


    if (cleanPhone.length < 10) {
      setError(
        "Please enter a valid phone number"
      );

      return;
    }


    try {
      setLoading(true);


      /* -----------------------------------------------------
         LOGIN THROUGH AUTH CONTEXT
      ----------------------------------------------------- */

      await login(
        cleanPhone,
        password
      );


      /* -----------------------------------------------------
         SUCCESS
      ----------------------------------------------------- */

      toast.success(
        "Login successful! Welcome to VKART 🎉"
      );


      /* -----------------------------------------------------
         GO TO ORIGINAL PAGE
      ----------------------------------------------------- */

      navigate(
        from,
        {
          replace: true,
        }
      );

    } catch (error) {

      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error?.message ||
        "Login failed. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">


        {/* ===================================================
            LOGO
        =================================================== */}

        <div className="mb-8 text-center">

          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white">

            <ShoppingBag size={27} />

          </div>


          <h1 className="text-3xl font-bold tracking-tight">
            VKART
          </h1>


          <p className="mt-2 text-gray-500">
            Welcome back. Login to continue.
          </p>

        </div>


        {/* ===================================================
            LOGIN CARD
        =================================================== */}

        <div className="rounded-3xl border border-gray-200 bg-white p-7 shadow-sm">


          <h2 className="mb-6 text-xl font-semibold">
            Login
          </h2>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

              {error}

            </div>

          )}


          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >


            {/* =================================================
                PHONE
            ================================================= */}

            <div>

              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium"
              >
                Phone Number
              </label>


              <div className="relative">

                <Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />


                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={phone}

                  onChange={(e) => {

                    const value =
                      e.target.value
                        .replace(/\D/g, "");

                    setPhone(value);

                  }}

                  placeholder="Enter phone number"

                  maxLength={10}

                  disabled={loading}

                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    pl-11
                    pr-4
                    outline-none
                    transition
                    focus:border-black
                    focus:ring-2
                    focus:ring-black/10
                    disabled:cursor-not-allowed
                    disabled:bg-gray-50
                  "
                />

              </div>

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>


              <div className="relative">

                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />


                <input
                  id="password"

                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }

                  autoComplete="current-password"

                  value={password}

                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }

                  placeholder="Enter password"

                  disabled={loading}

                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    pl-11
                    pr-12
                    outline-none
                    transition
                    focus:border-black
                    focus:ring-2
                    focus:ring-black/10
                    disabled:cursor-not-allowed
                    disabled:bg-gray-50
                  "
                />


                {/* SHOW PASSWORD */}

                <button
                  type="button"

                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }

                  disabled={loading}

                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }

                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    transition
                    hover:text-black
                    disabled:cursor-not-allowed
                  "
                >

                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}

                </button>

              </div>

            </div>


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"

              disabled={loading}

              className="
                flex
                h-12
                w-full
                items-center
                justify-center
                rounded-xl
                bg-black
                text-white
                font-semibold
                transition
                hover:bg-gray-800
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {loading ? (
                <>

                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  Logging in...

                </>
              ) : (
                "Login"
              )}

            </button>

          </form>


          {/* =================================================
              REGISTER
          ================================================= */}

          <div className="mt-6 text-center text-sm text-gray-500">

            Don't have an account?{" "}

            <Link
              to="/register"

              className="
                font-semibold
                text-black
                hover:underline
              "
            >
              Create account
            </Link>

          </div>

        </div>

      </div>

    </div>
  );
}