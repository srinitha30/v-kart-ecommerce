import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api",

  headers: {
    "Content-Type":
      "application/json",
  },
});


// =====================================================
// ADD JWT TOKEN
// =====================================================

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        "vkart_token"
      );

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) =>
    Promise.reject(error)
);


// =====================================================
// AUTH ERROR
// =====================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (
      error?.response?.status ===
      401
    ) {
      console.log(
        "Authentication expired or missing"
      );
    }

    return Promise.reject(error);
  }
);


export default api;