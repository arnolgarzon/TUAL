// src/hooks/useAuth.js

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const useAuth = () => {
    const [usuario, setUsuario] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 

    // Función para actualizar el estado de autenticación (usada en login/logout)
    const setAuthenticatedUser = (userData) => {
        // userData puede ser:
        // 1. La respuesta del login: { token: '...', usuario: { id: 1, rol: '...', ... } }
        // 2. Un objeto vacío o null en caso de logout.
        
        // 🛑 CORRECCIÓN CRÍTICA: Aseguramos que solo almacenamos el objeto de usuario.
        // Si viene con la clave 'usuario', la usamos. Si no, usamos el objeto completo (para el token payload).
        const userToStore = userData?.usuario || userData; 
        
        // Guardar/Eliminar el token en localStorage
        if (userData?.token) {
            localStorage.setItem("token", userData.token);
        } else if (userData === null) {
            localStorage.removeItem("token");
        }

        setUsuario(userToStore);
        setIsLoading(false); 
    };

    // Función de Logout
    const logout = () => {
        setAuthenticatedUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setUsuario(null);
            setIsLoading(false); 
            return;
        }

        try {
            const decoded = jwtDecode(token);
            
            const currentTime = Date.now() / 1000; 
            
            if (decoded.exp < currentTime) {
                console.warn("Token expirado. Cerrando sesión.");
                localStorage.removeItem("token");
                setUsuario(null);
            } else {
                // Si el token es válido, establecemos el payload decodificado como el objeto usuario
                setUsuario(decoded); 
            }
        } catch (err) {
            console.error("Token inválido o corrupto:", err);
            localStorage.removeItem("token");
            setUsuario(null);
        } finally {
            setIsLoading(false); 
        }
    }, []);

    return { 
        usuario, 
        isLoading, 
        setAuthenticatedUser,
        logout // Exportamos la función de logout para usarla directamente en el Layout
    };
};