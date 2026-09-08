import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://0hw8tf6g-3001.inc1.devtunnels.ms/",
  // baseURL: "https://416zwbs6-3003.inc1.devtunnels.ms/api/v1",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach auth token on every request
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error messages
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-token");
        localStorage.removeItem("auth-user");
        document.cookie =
          "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        if (!window.location.pathname.startsWith("/auth/login")) {
          window.location.href = "/auth/login";
        }
      }
    }

    const data = error.response?.data;
    let message = data?.message ?? error.message;

    if (data?.error && Array.isArray(data.error)) {
      message = data.error.map((err: any) => err.message).join("\n");
    }

    toast.error(message);
    return Promise.reject(new Error(message));
  },
);

export default axiosInstance;
