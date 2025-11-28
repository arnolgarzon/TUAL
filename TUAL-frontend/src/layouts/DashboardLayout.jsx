// src/layouts/DashboardLayout.jsx

import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import { Home, Briefcase, Users, Settings, LogOut, Menu, X, ChevronDown } from 'lucide-react';
// Asume que tienes un logo para el sidebar
import tualLogo from '../assets/icono.png'; 

// Definición de enlaces para el Sidebar
const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Empresas', path: '/empresas', icon: Briefcase },
    { name: 'Usuarios', path: '/usuarios', icon: Users },
];

const DashboardLayout = () => {
    // Obtenemos los datos del usuario y la función de logout
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Debes tener esta función disponible globalmente o pasarla desde App.jsx
    // Como estamos usando useAuth, podemos implementarla aquí, asumiendo que useAuth
    // también proporciona setAuthenticatedUser. Si no, usa el handleLogout que pasaste al Home.
    const handleLogout = () => {
        localStorage.removeItem("token");
        // Si tu useAuth devuelve setAuthenticatedUser, úsalo aquí
        // setAuthenticatedUser(null);
        navigate("/"); 
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
                    const Icon = item.icon;
                    // Resalta el enlace si la ruta actual coincide
                    const isActive = location.pathname === item.path; 

                    return (
                        <Link 
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)} // Cierra en móvil
                            className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg 
                                ${isActive 
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
                    to="/configuracion"
                    className="flex items-center px-4 py-2 text-sm font-medium rounded-lg 
                                text-gray-300 hover:bg-gray-700 hover:text-white transition duration-150"
                >
                    <Settings className="h-5 w-5 mr-3" />
                    Configuración
                </Link>
                <button
                    onClick={handleLogout}
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
    const Header = () => (
        <header className="flex items-center justify-between bg-white shadow-md p-4 h-16">
            
            {/* Botón de Menú (Solo en Móvil) */}
            <button 
                className="text-gray-600 hover:text-gray-900 md:hidden"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu className="h-6 w-6" />
            </button>
            
            {/* Título de la Página Actual (Simple) */}
            <h1 className="text-xl font-semibold text-gray-800 hidden md:block">
                {/* 🛑 A FUTURO: Implementar lógica para mostrar el nombre de la página actual */}
                Dashboard
            </h1>

            {/* Menú de Usuario */}
            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition duration-150"
                >
                    <span className="text-gray-700 text-sm font-medium">
                        {/* Muestra el nombre del usuario decodificado del token */}
                        {usuario?.nombre || usuario?.email || 'Usuario'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>

                {/* Dropdown del Perfil */}
                {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-40 py-1 border">
                        <Link 
                            to="/perfil" 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            Ver Perfil
                        </Link>
                        <div className="border-t my-1"></div>
                        <button
                            onClick={() => { handleLogout(); setIsDropdownOpen(false); }}
                            className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </header>
    );

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
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                    {/* Renderiza el componente de la ruta actual (Dashboard, EmpresaList, etc.) */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;