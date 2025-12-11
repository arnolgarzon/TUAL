// src/components/DashboardLayout.jsx

import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Briefcase, Users, LogOut, LayoutDashboard, Settings } from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; 

// Definición de enlaces para la navegación lateral
const sidebarNav = [
    // 🛑 CORRECCIÓN CRÍTICA: Se añadió 'Superadmin' a la lista de roles permitidos
    { name: 'Inicio', href: '/dashboard', icon: LayoutDashboard, roles: ['Superadmin', 'admin_empresa', 'empleado'] },
    
    // 🛑 CORRECCIÓN CRÍTICA
    { name: 'Gestión de Usuarios', href: '/dashboard/usuarios', icon: Users, roles: ['superadmin'] },
    
    // 🛑 CORRECCIÓN CRÍTICA
    { name: 'Gestión de Empresas', href: '/dashboard/empresas', icon: Briefcase, roles: ['superadmin', 'admin_empresa'] },
    
    { name: 'Facturación', href: '/dashboard/facturas', icon: Settings, roles: ['admin_empresa', 'empleado'] },
];

const DashboardLayout = () => {
    const { usuario, logout, isLoading } = useAuth();
    const location = useLocation();

    // Lógica para resaltar enlaces anidados
    const getIsActive = (href) => {
        if (href === '/dashboard') {
            return location.pathname === href;
        }
        return location.pathname.startsWith(href);
    };
    
    if (isLoading) {
        // Mejorado: Spinner simple en lugar de solo texto para mejor UX
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        ); 
    }
    
    if (!usuario) {
        return <Navigate to="/login" replace />; 
    }

    // Filtra los enlaces basándose en el rol del usuario logueado ('Superadmin')
    const filteredNav = sidebarNav.filter(item => item.roles.includes(usuario.rol));
    

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar (Menú Izquierdo) */}
            <nav className="w-64 bg-white shadow-xl p-4 flex flex-col justify-between border-r border-gray-200">
                <div>
                    {/* Logo/Título de la Aplicación */}
                    <div className="text-2xl font-bold text-blue-700 mb-8 tracking-wider">
                        TUAL
                    </div>
                    
                    {/* Lista de Enlaces Navegables */}
                    <div className="space-y-2">
                        {filteredNav.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`flex items-center px-3 py-2 rounded-lg transition duration-150 ${
                                    getIsActive(item.href)
                                        ? 'bg-blue-100 text-blue-700 font-semibold shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
                
                {/* Footer del Sidebar con info de usuario y Logout */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="mb-3">
                         <p className="text-sm font-semibold text-gray-800 truncate">
                            {usuario.nombre || usuario.email || 'Usuario Desconocido'}
                        </p>
                        <p className="text-xs text-blue-500 capitalize font-medium">
                            {/* MEJORA: Capitalizar y limpiar el nombre del rol para la UI */}
                            Rol: {usuario.rol.replace('_', ' ')}
                        </p>
                    </div>
                   
                    <button
                        onClick={logout} 
                        className="flex items-center text-red-600 hover:text-red-800 text-sm transition font-medium"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            {/* Contenido Principal */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <Outlet /> 
            </main>
        </div>
    );
};

export default DashboardLayout;