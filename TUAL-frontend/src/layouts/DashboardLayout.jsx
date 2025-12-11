// src/layouts/DashboardLayout.jsx

import React, { useState, useCallback } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
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
    { name: 'Usuarios', path: '/dashboard/usuarios', icon: Users, roles: ['superadmin'] }, 
];

// Sub-componente Sidebar optimizado
const Sidebar = React.memo(({ isOpen, closeSidebar, onLogout, hasAccess }) => (
    <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                    md:relative md:translate-x-0 transition duration-300 ease-in-out 
                    w-64 bg-gray-800 text-white flex flex-col z-30`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700 h-16">
            <div className="flex items-center">
                <img src={tualLogo} alt="TUAL Logo" className="h-8 w-auto mr-2 invert" />
                <span className="text-xl font-bold tracking-wider">TUAL</span>
            </div>
            <button className="md:hidden text-gray-400 hover:text-white" onClick={closeSidebar} aria-label="Cerrar menú">
                <X className="h-6 w-6" />
            </button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
                if (!hasAccess(item.roles)) return null;
                const Icon = item.icon;
                return (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === '/dashboard'}
                        onClick={closeSidebar}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${
                                isActive
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            }`
                        }
                    >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                    </NavLink>
                );
            })}
        </nav>
        <div className="p-4 border-t border-gray-700 space-y-1">
            <NavLink
                to="/dashboard/configuracion"
                onClick={closeSidebar}
                className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${
                        isActive
                            ? 'bg-gray-700 text-white' 
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                }
            >
                <Settings className="h-5 w-5 mr-3" />
                Configuración
            </NavLink>
            <button
                onClick={onLogout}
                className="flex items-center px-4 py-2 text-sm font-medium rounded-lg w-full text-red-400 hover:bg-gray-700 hover:text-red-300 transition duration-150"
            >
                <LogOut className="h-5 w-5 mr-3" />
                Cerrar Sesión
            </button>
        </div>
    </div>
));

// Sub-componente Header optimizado
const Header = React.memo(({ openSidebar, onLogout, usuario }) => {
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = () => {
        setIsDropdownOpen(false);
        onLogout();
    };

    // ✅ MEJORA: Título dinámico basado en la ruta actual.
    const getPageTitle = useCallback(() => {
        const path = location.pathname;
        // Busca de la ruta más específica a la más general
        const currentItem = [...navItems].reverse().find(item => path.startsWith(item.path));
        
        if (path.includes('/configuracion')) return 'Configuración';
        if (path.includes('/perfil')) return 'Mi Perfil';
        if (currentItem) return currentItem.name;
        return 'Panel de Control'; // Título por defecto
    }, [location.pathname]);

    return (
        <header className="flex items-center justify-between bg-white shadow-md p-4 h-16 border-b border-gray-200">
            <button className="text-gray-600 hover:text-gray-900 md:hidden" onClick={openSidebar} aria-label="Abrir menú">
                <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">
                {getPageTitle()}
            </h1>
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition"
                    aria-haspopup="true"
                    aria-expanded={isDropdownOpen}
                >
                    {usuario?.rol === 'superadmin' && (
                        <UserCheck className="h-5 w-5 text-purple-600" title="Super Usuario" />
                    )}
                    <span className="text-gray-700 text-sm font-medium hidden sm:inline">
                        {usuario?.nombre || 'Usuario'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-40 py-1 border" role="menu">
                        <div className="px-4 py-2 text-sm text-gray-900 border-b mb-1 font-semibold">
                            {usuario?.email}
                        </div>
                        <Link to="/dashboard/perfil" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsDropdownOpen(false)} role="menuitem">
                            Ver Perfil
                        </Link>
                        <div className="border-t my-1"></div>
                        <button onClick={handleLogout} className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left" role="menuitem">
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
});

const DashboardLayout = ({ onLogout }) => {
    const { usuario } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
    const openSidebar = useCallback(() => setIsSidebarOpen(true), []);

    const hasAccess = useCallback((requiredRoles) => {
        if (!usuario || !usuario.rol) return false;
        return requiredRoles.includes(usuario.rol);
    }, [usuario]);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} onLogout={onLogout} hasAccess={hasAccess} />

            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black opacity-50 z-20 md:hidden" onClick={closeSidebar} aria-hidden="true" />
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                <Header openSidebar={openSidebar} onLogout={onLogout} usuario={usuario} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;