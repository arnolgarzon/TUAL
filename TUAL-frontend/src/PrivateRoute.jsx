// src/components/routes/PrivateRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Componente para proteger rutas.
 * Si el usuario está autenticado, renderiza el contenido (o el Outlet anidado).
 * Si no, redirige a la página de login.
 */
const PrivateRoute = () => {
    const { usuario, isLoading } = useAuth();

    // No renderizar nada mientras se verifica la autenticación
    if (isLoading) {
        return null;
    }

    // Si hay usuario, permite el acceso a las rutas anidadas.
    // Si no, redirige a la página de login.
    return usuario ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;