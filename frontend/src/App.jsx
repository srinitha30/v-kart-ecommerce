import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

import "./App.css";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import MyOrders from "./pages/MyOrders";

// =====================================================
// COMMON LAYOUT
// =====================================================

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />

      <div className="app-body">
        <Sidebar />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

// =====================================================
// ROOT REDIRECT
// =====================================================

function RootRedirect() {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  // Wait until localStorage auth is restored
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f6f6f3",
          fontFamily:
            "DM Sans, sans-serif",
        }}
      >
        <p>Loading VKART...</p>
      </div>
    );
  }

  // Logged in → Home
  if (isAuthenticated) {
    return (
      <Navigate
        to="/home"
        replace
      />
    );
  }

  // Not logged in → Login
  return (
    <Navigate
      to="/login"
      replace
    />
  );
}

// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />

        <Routes>

          {/* =================================================
              ROOT
          ================================================= */}

          <Route
            path="/"
            element={
              <RootRedirect />
            }
          />

          {/* =================================================
              LOGIN
          ================================================= */}

          <Route
            path="/login"
            element={
              <Login />
            }
          />

          {/* =================================================
              REGISTER
          ================================================= */}

          <Route
            path="/register"
            element={
              <Register />
            }
          />

          {/* =================================================
              HOME
          ================================================= */}

          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout>
                  <Home />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* =================================================
              PRODUCTS
          ================================================= */}

          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Layout>
                  <Products />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* =================================================
              PRODUCT DETAILS
          ================================================= */}

          <Route
            path="/products/:slug"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProductDetails />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* =================================================
              CHECKOUT
          ================================================= */}

          <Route
            path="/checkout/:slug"
            element={
              <ProtectedRoute>
                <Layout>
                  <Checkout />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* =================================================
              CART
          ================================================= */}

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Layout>
                  <Cart />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* =================================================
              WISHLIST
          ================================================= */}

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <Layout>
                  <Wishlist />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* =================================================
              MY ORDERS
          ================================================= */}

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Layout>
                  <MyOrders />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* =================================================
              UNKNOWN URL
          ================================================= */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;