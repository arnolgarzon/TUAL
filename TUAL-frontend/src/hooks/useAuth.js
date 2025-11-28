import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const useAuth = () => {
    const [usuario, setUsuario] = useState(null);
    // 1. AÑADIDO: Estado de carga, crucial para App.jsx
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        const token = localStorage.getItem("token");

        // 1. Si no hay token, terminamos la carga
        if (!token) {
            setUsuario(null);
            setIsLoading(false); // <--- Finaliza carga
            return;
        }

        try {
            const decoded = jwtDecode(token);
            
            // 2. AÑADIDO: Verificación de expiración del token (futuro)
            const currentTime = Date.now() / 1000; 
            
            if (decoded.exp < currentTime) {
                // Token expirado
                console.warn("Token expirado. Cerrando sesión.");
                localStorage.removeItem("token");
                setUsuario(null);
            } else {
                // Token válido y no expirado
                // NOTA: Asumimos que los datos del usuario están en el payload del token (decoded)
                setUsuario(decoded); 
            }
        } catch (err) {
            // Error en la decodificación (token corrupto o inválido)
            console.error("Token inválido o corrupto:", err);
            localStorage.removeItem("token");
            setUsuario(null);
        } finally {
             // 3. AÑADIDO: SIEMPRE terminamos la carga, sea exitoso o fallido
            setIsLoading(false); 
        }
    }, []);

    // 4. AÑADIDO: Función setter para actualizar el estado desde LoginForm/Logout
    const setAuthenticatedUser = (userData) => {
        setUsuario(userData);
        // Opcional: Si los datos vienen de una API, ya están "frescos",
        // pero si los actualizas sin recargar, también debes parar la carga.
        setIsLoading(false); 
    };

    // 5. DEVOLVER EL OBJETO COMPLETO
    return { 
        usuario, // Los datos del token (incluyendo nombre, si está ahí)
        isLoading, // Necesario para bloquear la UI al inicio
        setAuthenticatedUser // Necesario para manejar Login/Logout
    };
};