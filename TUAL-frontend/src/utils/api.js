import axios from "axios";

/*
  IMPORTANTE:
  VITE_API_URL debe ser SOLO:
  http://localhost:5000

  NO debe incluir /api
*/

const baseURL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${baseURL}/api`,
});

/* ===============================
   INTERCEPTOR REQUEST
================================ */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ===============================
   INTERCEPTOR RESPONSE
================================ */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Sesión expirada. Redirigiendo a login...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/* ===============================
   HELPERS
================================ */
export const fetchProtectedData = async (url) =>
  (await api.get(url)).data;

export const deleteProtectedData = async (url) =>
  (await api.delete(url)).data;

export const patchProtectedData = async (url, body) =>
  (await api.patch(url, body)).data;

export const postProtectedData = async (url, body) =>
  (await api.post(url, body)).data;

export const putProtectedData = async (url, body) =>
  (await api.put(url, body)).data;

export default api;
