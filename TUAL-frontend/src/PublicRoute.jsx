// src/components/routes/PublicRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente para rutas públicas (como Login, Register).
 * Si el usuario ya está autenticado, lo redirige al dashboard.
 * Si no, renderiza el contenido de la ruta pública (Outlet).
 */
const PublicRoute = () => {
    const { usuario, isLoading } = useAuth();

    // No renderizar nada mientras se verifica la autenticación
    if (isLoading) {
        return null;
    }

    // Si hay usuario, redirige al dashboard. Si no, muestra la página pública.
    return usuario ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

export default PublicRoute;