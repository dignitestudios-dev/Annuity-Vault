import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1",
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
    const data = error.response?.data;
    let message = data?.message ?? error.message;

    if (data?.error && Array.isArray(data.error)) {
      message = data.error.map((err: any) => err.message).join("\n");
    }

    toast.error(message);
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
