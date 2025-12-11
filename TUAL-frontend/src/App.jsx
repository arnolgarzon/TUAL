// src/App.jsx

import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
// Hook de Autenticación
import { useAuth } from "./hooks/useAuth";

// -------------------------------------------------------------------
// 1. COMPONENTES PÚBLICOS
// -------------------------------------------------------------------
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";

// -------------------------------------------------------------------
// 2. COMPONENTES DEL ÁREA PRIVADA (Módulos)
// -------------------------------------------------------------------
// 🛑 Importación corregida basada en la estructura de carpetas: /src/components/
import DashboardLayout from "./components/DashboardLayout"; 
import Dashboard from "./components/Dashboard";
import EmpresaList from "./components/EmpresaList";
import UserManagement from "./components/UserManagement";
import EmpresaForm from "./components/EmpresaForm";
// 🛑 NUEVO: Componente para Crear/Editar usuarios (asumiendo su creación futura)
import UserForm from "./components/UserForm"; 


// -------------------------------------------------------------------
// 3. COMPONENTE DE UTILIDAD: Protección de Rutas por Rol
// -------------------------------------------------------------------
const RoleProtected = ({ children, allowedRoles }) => {
    const { usuario, isLoading } = useAuth();

    // Si el usuario aún está cargando, bloquea la renderización (muestra spinner en App)
    if (isLoading) return null;

    // Si el usuario existe y su rol está en la lista de permitidos, renderiza el componente
    if (usuario && allowedRoles.includes(usuario.rol)) {
        return children;
    }

    // Si no tiene el rol permitido o no está autenticado, redirige al Dashboard principal
    // (App.jsx ya maneja la redirección a /login si no hay usuario, esto maneja el permiso de rol)
    return <Navigate to="/dashboard" replace />;
};


function App() {
    // 🛑 Desestructuración de useAuth. Incluye setAuthenticatedUser, usuario e isLoading
    const { usuario, isLoading, setAuthenticatedUser } = useAuth();
    const navigate = useNavigate();

    // Función de Login: Llama al setter del hook para guardar el estado y el token
    const handleLogin = (responseFromBackend) => {
        // responseFromBackend = { token: '...', usuario: { ... } }
        setAuthenticatedUser(responseFromBackend);
        // Redirige al dashboard después de un login exitoso
        navigate("/dashboard", { replace: true });
    };

    // -------------------------------------------------------------------
    // Pantalla de Carga Inicial (Se muestra mientras isLoading es true)
    // -------------------------------------------------------------------
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-xl">
                    <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                        <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                    </svg>
                    <h1 className="text-gray-800 text-lg font-medium">Verificando sesión...</h1>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------
    // 4. ESTRUCTURA PRINCIPAL DE RUTAS
    // -------------------------------------------------------------------
    return (
        <Routes>

            {/* 1. RUTAS PÚBLICAS */}
            <Route
                path="/"
                element={usuario ? <Navigate to="/dashboard" replace /> : <Home />}
            />
            <Route
                path="/login"
                element={usuario ? <Navigate to="/dashboard" replace /> : <LoginForm onLogin={handleLogin} />}
            />
            <Route
                path="/register"
                element={usuario ? <Navigate to="/dashboard" replace /> : <RegisterForm />}
            />

            {/* 2. RUTAS PRIVADAS (PADRE DASHBOARD) */}
            <Route
                path="/dashboard"
                // El layout se renderiza si el usuario existe. Si no, redirige a /login.
                element={usuario ? <DashboardLayout /> : <Navigate to="/login" replace />}
            >
                {/* 2.1 Ruta de Inicio (Ruta index se inyecta en el <Outlet />) */}
                <Route index element={<Dashboard />} />

                {/* 2.2 CRUD DE EMPRESAS */}
                {/* Lista de Empresas (Super Admin y Admin Empresa) */}
                <Route
                    path="empresas"
                    element={
                        <RoleProtected allowedRoles={['super_usuario', 'admin_empresa']}>
                            <EmpresaList />
                        </RoleProtected>
                    }
                />
                {/* Crear Empresa (Solo Super Admin) */}
                <Route
                    path="empresas/crear"
                    element={
                        <RoleProtected allowedRoles={['super_usuario']}>
                            <EmpresaForm isEdit={false} />
                        </RoleProtected>
                    }
                />
                {/* Editar/Ver Detalle de Empresa (Super Admin y Admin Empresa) */}
                <Route
                    path="empresas/:id"
                    element={
                        <RoleProtected allowedRoles={['super_usuario', 'admin_empresa']}>
                            <EmpresaForm isEdit={true} />
                        </RoleProtected>
                    }
                />

                {/* 2.3 CRUD DE USUARIOS 🛑 RUTAS COMPLETADAS */}
                {/* Lista de Usuarios (Solo Super Admin) */}
                <Route
                    path="usuarios"
                    element={
                        <RoleProtected allowedRoles={['super_usuario']}>
                            <UserManagement />
                        </RoleProtected>
                    }
                />
                {/* 🛑 NUEVO: Crear Usuario (Solo Super Admin) */}
                <Route
                    path="usuarios/crear"
                    element={
                        <RoleProtected allowedRoles={['super_usuario']}>
                            <UserForm isEdit={false} />
                        </RoleProtected>
                    }
                />
                {/* 🛑 NUEVO: Editar/Ver Detalle de Usuario (Solo Super Admin) */}
                <Route
                    path="usuarios/:id"
                    element={
                        <RoleProtected allowedRoles={['super_usuario']}>
                            <UserForm isEdit={true} />
                        </RoleProtected>
                    }
                />
                
                {/* 2.4 OTROS MÓDULOS */}
                <Route path="configuracion" element={<div>Configuración de la App (En desarrollo)</div>} />

            </Route>

            {/* 3. FALLBACK: Redirige al inicio si la ruta no existe */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;