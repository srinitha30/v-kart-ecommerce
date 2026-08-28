import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // RESTORE LOGIN SESSION
  // =====================================================

  useEffect(() => {
    try {
      const savedToken =
        localStorage.getItem("vkart_token");

      const savedUser =
        localStorage.getItem("vkart_user");

      console.log(
        "AUTH RESTORE TOKEN:",
        Boolean(savedToken)
      );

      // -------------------------------------------------
      // If token exists, restore login
      // -------------------------------------------------

      if (savedToken) {
        setToken(savedToken);

        if (savedUser) {
          try {
            setUser(JSON.parse(savedUser));
          } catch (error) {
            console.error(
              "INVALID SAVED USER:",
              error
            );

            localStorage.removeItem(
              "vkart_user"
            );

            setUser(null);
          }
        }
      } else {
        // No token = not logged in
        setToken(null);
        setUser(null);

        localStorage.removeItem(
          "vkart_user"
        );
      }
    } catch (error) {
      console.error(
        "AUTH RESTORE ERROR:",
        error
      );

      localStorage.removeItem(
        "vkart_token"
      );

      localStorage.removeItem(
        "vkart_user"
      );

      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // =====================================================
  // RESPONSE HELPER
  // =====================================================

  const getResponseData = async (response) => {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        message: text,
      };
    }
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const login = async (phone, password) => {
    try {
      console.log(
        "LOGIN REQUEST:",
        `${API_URL}/api/auth/login`
      );

      const cleanPhone =
        String(phone || "").trim();

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            phone: cleanPhone,
            password,
          }),
        }
      );

      const data =
        await getResponseData(response);

      console.log(
        "LOGIN RESPONSE:",
        response.status,
        data
      );

      // -------------------------------------------------
      // Backend error
      // -------------------------------------------------

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            `Login failed (${response.status})`
        );
      }

      // -------------------------------------------------
      // Token check
      // -------------------------------------------------

      if (!data?.token) {
        throw new Error(
          "Login successful but authentication token was not returned"
        );
      }

      // -------------------------------------------------
      // User check
      // -------------------------------------------------

      const loggedInUser =
        data?.user || null;

      // -------------------------------------------------
      // SAVE LOGIN SESSION
      // -------------------------------------------------

      localStorage.setItem(
        "vkart_token",
        data.token
      );

      localStorage.setItem(
        "vkart_user",
        JSON.stringify(
          loggedInUser || {}
        )
      );

      // -------------------------------------------------
      // UPDATE STATE
      // -------------------------------------------------

      setToken(data.token);
      setUser(loggedInUser);

      console.log(
        "LOGIN SUCCESS"
      );

      return data;
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      throw error;
    }
  };

  // =====================================================
  // REGISTER
  // =====================================================

  const register = async (
    name,
    phone,
    password
  ) => {
    try {
      console.log(
        "REGISTER REQUEST:",
        `${API_URL}/api/auth/register`
      );

      const cleanName =
        String(name || "").trim();

      const cleanPhone =
        String(phone || "").trim();

      console.log(
        "REGISTER DATA:",
        {
          name: cleanName,
          phone: cleanPhone,
          passwordLength:
            password?.length || 0,
        }
      );

      const response = await fetch(
        `${API_URL}/api/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: cleanName,
            phone: cleanPhone,
            password,
          }),
        }
      );

      const data =
        await getResponseData(response);

      console.log(
        "REGISTER STATUS:",
        response.status
      );

      console.log(
        "REGISTER RESPONSE:",
        data
      );

      // -------------------------------------------------
      // BACKEND ERROR
      // -------------------------------------------------

      if (!response.ok) {
        const backendMessage =
          data?.message ||
          data?.error ||
          data?.errors?.[0]?.message;

        if (response.status === 400) {
          throw new Error(
            backendMessage ||
              "Invalid registration details"
          );
        }

        if (response.status === 409) {
          throw new Error(
            backendMessage ||
              "Phone number already registered"
          );
        }

        if (response.status === 500) {
          throw new Error(
            backendMessage ||
              "Server error during registration"
          );
        }

        throw new Error(
          backendMessage ||
            `Registration failed (${response.status})`
        );
      }

      // -------------------------------------------------
      // REGISTRATION SUCCESS
      //
      // IMPORTANT:
      // DO NOT AUTO LOGIN
      // DO NOT SAVE TOKEN
      // DO NOT SET USER
      // -------------------------------------------------

      console.log(
        "REGISTER SUCCESS - LOGIN REQUIRED"
      );

      // Clear any existing session just in case
      localStorage.removeItem(
        "vkart_token"
      );

      localStorage.removeItem(
        "vkart_user"
      );

      // Make sure application is logged out
      setToken(null);
      setUser(null);

      // -------------------------------------------------
      // Return registration response
      // Register.jsx will navigate to /login
      // -------------------------------------------------

      return data;
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      throw error;
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const logout = () => {
    console.log(
      "LOGOUT"
    );

    // Remove current auth
    localStorage.removeItem(
      "vkart_token"
    );

    localStorage.removeItem(
      "vkart_user"
    );

    // Remove old auth keys
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "vkart-user"
    );

    // Clear state
    setToken(null);
    setUser(null);
  };

  // =====================================================
  // AUTH CONTEXT
  // =====================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,

        isAuthenticated:
          Boolean(token),

        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// =====================================================
// USE AUTH
// =====================================================

export function useAuth() {
  return useContext(AuthContext);
}