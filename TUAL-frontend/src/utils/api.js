// src/utils/apiClient.js (Versión robusta y exportable)

import axios from "axios";

// --------------------------------------------------------
// 1. Cliente Base de Axios
// --------------------------------------------------------
const apiClient = axios.create({
    // Asegúrate de que este puerto y dominio sean correctos para tu backend
    baseURL: "http://localhost:5000/api", 
    headers: {
        'Content-Type': 'application/json',
    },
});

// --------------------------------------------------------
// 2. Interceptor para incluir el token
// --------------------------------------------------------
apiClient.interceptors.request.use((config) => {
    // El token se asume que se guarda directamente como el valor JWT (sin 'Bearer ')
    const token = localStorage.getItem("token"); 

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// --------------------------------------------------------
// 3. Funciones CRUD Específicas (Exportables)
// --------------------------------------------------------

/**
 * Realiza una petición GET protegida.
 * @param {string} endpoint - Ejemplo: '/usuarios' o '/empresas/1'
 * @returns {Promise<any>} Los datos de respuesta (response.data)
 */
export const fetchProtectedData = async (endpoint) => {
    try {
        const response = await apiClient.get(endpoint);
        return response.data; // Devuelve los datos directamente
    } catch (error) {
        // Manejo de errores centralizado
        const errorMessage = error.response?.data?.message || `Error en GET ${endpoint}: ${error.message}`;
        throw new Error(errorMessage);
    }
};

/**
 * Realiza una petición POST protegida (Creación).
 */
export const postProtectedData = async (endpoint, data) => {
    try {
        const response = await apiClient.post(endpoint, data);
        return response.data; 
    } catch (error) {
        const errorMessage = error.response?.data?.message || `Error en POST ${endpoint}: ${error.message}`;
        throw new Error(errorMessage);
    }
};

/**
 * Realiza una petición PUT protegida (Actualización).
 */
export const putProtectedData = async (endpoint, data) => {
    try {
        const response = await apiClient.put(endpoint, data);
        return response.data; 
    } catch (error) {
        const errorMessage = error.response?.data?.message || `Error en PUT ${endpoint}: ${error.message}`;
        throw new Error(errorMessage);
    }
};

/**
 * Realiza una petición DELETE protegida.
 */
export const deleteProtectedData = async (endpoint) => {
    try {
        const response = await apiClient.delete(endpoint);
        return response.data;
    } catch (error) {
        const errorMessage = error.response?.data?.message || `Error en DELETE ${endpoint}: ${error.message}`;
        throw new Error(errorMessage);
    }
};
