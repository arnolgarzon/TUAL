// utils/api.js (ejemplo)
// - baseURL debe ser el mismo que ya usas (si /superadmin/empresas funciona, está bien)

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchProtectedData = async (url) => (await api.get(url)).data;
export const deleteProtectedData = async (url) => (await api.delete(url)).data;
export const patchProtectedData = async (url, body) => (await api.patch(url, body)).data;
export const postProtectedData = async (url, body) => (await api.post(url, body)).data;
export const putProtectedData = async (url, body) => (await api.put(url, body)).data;

export default api;