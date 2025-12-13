import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Inicia en true para verificar la sesión

    // Efecto para verificar si hay una sesión guardada en localStorage al cargar la app
    useEffect(() => {
        const checkLoggedIn = () => {
            const storedUser = localStorage.getItem('usuario');
            const token = localStorage.getItem('token');

            if (storedUser && token) {
                setUsuario(JSON.parse(storedUser));
            }
            setIsLoading(false);
        };

        checkLoggedIn();
    }, []);

    // Función para iniciar sesión
    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, { email, password });

            if (response.data && response.data.token && response.data.usuario) {
                const { token, usuario: userData } = response.data;

                // Guardar en localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('usuario', JSON.stringify(userData));

                // Actualizar el estado
                setUsuario(userData);

                return userData; // Devolver los datos del usuario para el componente Login
            } else {
                throw new Error('Respuesta de login inválida del servidor.');
            }
        } catch (error) {
            // Propagar el error para que el componente Login lo maneje
            const errorMessage = error.response?.data?.message || 'Error de red o servidor no responde.';
            throw new Error(errorMessage);
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        // Limpiar localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        // Limpiar el estado
        setUsuario(null);
    };

    // Función para actualizar el estado del usuario (usada en App.jsx)
    const setAuthenticatedUser = (userData) => {
        if (userData) {
            setUsuario(userData);
        } else {
            logout(); // Si se pasa null, se cierra la sesión
        }
    };

    const value = {
        usuario,
        isLoading,
        login,
        logout,
        setAuthenticatedUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};