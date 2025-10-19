// src/utils/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

// Add access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refresh = localStorage.getItem("refresh");
      if (refresh) {
        try {
          const res = await axios.post("http://127.0.0.1:8000/api/accounts/token_refresh/", {
            refresh,
          });

          // Save new access token
          localStorage.setItem("token", res.data.access);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          localStorage.clear();
          window.location.href = "/sign-in";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;