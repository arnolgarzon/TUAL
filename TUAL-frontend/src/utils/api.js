import axios from "axios";

// 1. Configuración de la instancia
const apiClient = axios.create({
    baseURL: "http://localhost:5000/api", 
    headers: {
        'Content-Type': 'application/json',
    },
});

// 2. Interceptor de Peticiones (Request)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 3. Interceptor de Respuestas (Response) - MEJORA ADICIONAL
// Captura errores 401 (Token expirado) globalmente
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Sesión expirada o no autorizada. Redirigiendo...");
            // Opcional: localStorage.removeItem("token");
            // window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// 4. Funciones CRUD Específicas
export const fetchProtectedData = async (endpoint) => {
    try {
        const response = await apiClient.get(endpoint);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error en GET ${endpoint}`);
    }
};

export const postProtectedData = async (endpoint, data) => {
    try {
        const response = await apiClient.post(endpoint, data);
        return response.data; 
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error en POST ${endpoint}`);
    }
};

export const putProtectedData = async (endpoint, data) => {
    try {
        const response = await apiClient.put(endpoint, data);
        return response.data; 
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error en PUT ${endpoint}`);
    }
};

export const deleteProtectedData = async (endpoint) => {
    try {
        const response = await apiClient.delete(endpoint);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Error en DELETE ${endpoint}`);
    }
};

// ---------------------------------------------------------
// 5. EXPORTACIÓN POR DEFECTO (Esto soluciona tu error)
// ---------------------------------------------------------
export default apiClient;