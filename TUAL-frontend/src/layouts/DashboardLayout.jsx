// src/layouts/DashboardLayout.jsx

import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import { Home, Briefcase, Users, Settings, LogOut, Menu, X, ChevronDown, UserCheck } from 'lucide-react';
// Asegúrate de que esta ruta sea correcta para tu logo
import tualLogo from '../assets/icono.png'; 

// Definición de enlaces para el Sidebar
// path debe ser relativo al "/dashboard" (ej: index es /dashboard)
const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home, roles: ['superadmin', 'admin_empresa'] },
    { name: 'Empresas', path: '/dashboard/empresas', icon: Briefcase, roles: ['superadmin', 'admin_empresa'] },
    // 🛑 Mejora: Este módulo solo será visible para el Super Usuario
    { name: 'Usuarios', path: '/dashboard/usuarios', icon: Users, roles: ['super_usuario'] }, 
];

const DashboardLayout = ({ onLogout }) => {
    const { usuario } = useAuth();
    const location = useLocation(); // Hook para saber la ruta actual
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Determina si el usuario tiene el rol necesario para un módulo
    const hasAccess = (requiredRoles) => {
        if (!usuario || !usuario.rol) return false;
        // Si el rol del usuario está incluido en los roles requeridos
        return requiredRoles.includes(usuario.rol); 
    };

    // ----------------------------------------------------
    // Sub-componente: Sidebar
    // ----------------------------------------------------
    const Sidebar = () => (
        <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                        md:relative md:translate-x-0 transition duration-300 ease-in-out 
                        w-64 bg-gray-800 text-white flex flex-col z-30`}>
            
            {/* Logo y Encabezado */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 h-16">
                <div className="flex items-center">
                    <img src={tualLogo} alt="TUAL Logo" className="h-8 w-auto mr-2 invert" />
                    <span className="text-xl font-bold tracking-wider">TUAL</span>
                </div>
                <button 
                    className="md:hidden text-gray-400 hover:text-white"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <X className="h-6 w-6" />
                </button>
            </div>

            {/* Navegación Principal */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    // 🛑 Mejora: Solo renderiza si el usuario tiene el rol necesario
                    if (!hasAccess(item.roles)) {
                        return null; 
                    }
                    
                    const Icon = item.icon;
                    // Resalta el enlace si la ruta actual comienza con el path (útil para rutas anidadas)
                    const isActive = location.pathname.startsWith(item.path) && item.path.length > 1; 
                    const isRootActive = item.path === '/dashboard' && location.pathname === '/dashboard';
                    
                    return (
                        <Link 
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)} 
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg 
                                ${isActive || isRootActive
                                    ? 'bg-blue-600 text-white shadow-lg' 
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150'
                                }`}
                        >
                            <Icon className="h-5 w-5 mr-3" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Configuración y Logout (Fondo del Sidebar) */}
            <div className="p-4 border-t border-gray-700 space-y-1">
                <Link 
                    to="/dashboard/configuracion"
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg 
                                text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150"
                >
                    <Settings className="h-5 w-5 mr-3" />
                    Configuración
                </Link>
                <button
                    onClick={onLogout} // 🛑 Usa la prop onLogout
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg w-full
                                text-red-400 hover:bg-gray-700 hover:text-red-300 transition duration-150"
                >
                    <LogOut className="h-5 w-5 mr-3" />
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );

    // ----------------------------------------------------
    // Sub-componente: Header (Barra Superior)
    // ----------------------------------------------------
    const Header = () => {
        // 🛑 Mejora: Función para obtener el título de la página actual
        const getPageTitle = () => {
            const currentItem = navItems.find(item => location.pathname.startsWith(item.path));
            if (location.pathname === '/dashboard') return 'Dashboard';
            if (location.pathname.includes('/configuracion')) return 'Configuración';
            if (currentItem) return currentItem.name;
            return 'Panel de Control'; // Fallback
        };

        return (
            <header className="flex items-center justify-between bg-white shadow-md p-4 h-16 border-b border-gray-200">
                
                {/* Botón de Menú (Solo en Móvil) */}
                <button 
                    className="text-gray-600 hover:text-gray-900 md:hidden"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu className="h-6 w-6" />
                </button>
                
                {/* Título de la Página Actual */}
                <h1 className="text-xl font-semibold text-gray-800">
                    {getPageTitle()}
                </h1>

                {/* Menú de Usuario */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition duration-150 focus:outline-none"
                    >
                        {/* 🛑 Mejora: Indicador de Rol */}
                        {usuario?.rol === 'super_usuario' && (
                            <UserCheck className="h-5 w-5 text-purple-600" title="Super Usuario" />
                        )}
                        <span className="text-gray-700 text-sm font-medium hidden sm:inline">
                            {usuario?.nombre || usuario?.email || 'Usuario TUAL'}
                        </span>
                        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown del Perfil */}
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-40 py-1 border">
                            <div className="px-4 py-2 text-sm text-gray-900 border-b mb-1 font-semibold">
                                {usuario?.email}
                            </div>
                            <Link 
                                to="/dashboard/perfil" 
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setIsDropdownOpen(false)}
                            >
                                Ver Perfil
                            </Link>
                            <div className="border-t my-1"></div>
                            <button
                                onClick={() => { onLogout(); setIsDropdownOpen(false); }}
                                className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </header>
        );
    };

    // ----------------------------------------------------
    // RENDERIZADO PRINCIPAL
    // ----------------------------------------------------
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <Sidebar />

            {/* Overlay para móvil */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Contenido Principal */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header />

                {/* Outlet (Donde se renderizan los módulos específicos) */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
                    {/* El padding aquí aplica al contenido de los módulos */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;