// src/components/DashboardLayout.jsx

import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
    Briefcase,
    Users,
    LogOut,
    LayoutDashboard,
    Settings,
    UserCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// 🔐 IMPORTANTE: todos los roles en minúscula
const sidebarNav = [
    {
        name: 'Inicio',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['superadmin', 'admin_empresa', 'empleado'],
    },
    {
        name: 'Gestión de Usuarios',
        href: '/dashboard/usuarios',
        icon: Users,
        roles: ['superadmin'],
    },
    {
        name: 'Gestión de Empresas',
        href: '/dashboard/empresas',
        icon: Briefcase,
        roles: ['superadmin', 'admin_empresa'],
    },

    // 🆕 CLIENTES (con subopciones)
    {
        name: 'Clientes',
        icon: UserCheck,
        roles: ['admin_empresa', 'empleado'],
        children: [
            {
                name: 'Listado',
                href: '/dashboard/clientes',
            },
            {
                name: 'Nuevo Cliente',
                href: '/dashboard/clientes/nuevo',
            },
        ],
    },

    {
        name: 'Facturación',
        href: '/dashboard/facturas',
        icon: Settings,
        roles: ['admin_empresa', 'empleado'],
    },
];

const DashboardLayout = () => {
    const { usuario, logout, isLoading } = useAuth();
    const location = useLocation();

    const getIsActive = (href) => {
        if (!href) return false;
        if (href === '/dashboard') return location.pathname === href;
        return location.pathname.startsWith(href);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    if (!usuario) {
        return <Navigate to="/login" replace />;
    }

    // 🔐 normalizamos el rol del usuario
    const userRole = usuario.rol?.toLowerCase();

    const filteredNav = sidebarNav.filter(item =>
        item.roles.includes(userRole)
    );

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <nav className="w-64 bg-white shadow-xl p-4 flex flex-col justify-between border-r border-gray-200">
                <div>
                    <div className="text-2xl font-bold text-blue-700 mb-8 tracking-wider">
                        TUAL
                    </div>

                    <div className="space-y-2">
                        {filteredNav.map(item => (
                            <div key={item.name}>
                                {/* ITEM SIMPLE */}
                                {item.href && (
                                    <Link
                                        to={item.href}
                                        className={`flex items-center px-3 py-2 rounded-lg transition ${
                                            getIsActive(item.href)
                                                ? 'bg-blue-100 text-blue-700 font-semibold'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <item.icon className="h-5 w-5 mr-3" />
                                        {item.name}
                                    </Link>
                                )}

                                {/* ITEM CON SUBMENÚ */}
                                {item.children && (
                                    <div className="mt-2">
                                        <div className="flex items-center px-3 py-2 text-gray-700 font-semibold">
                                            <item.icon className="h-5 w-5 mr-3" />
                                            {item.name}
                                        </div>

                                        <div className="ml-8 space-y-1">
                                            {item.children.map(sub => (
                                                <Link
                                                    key={sub.href}
                                                    to={sub.href}
                                                    className={`block px-3 py-1 rounded-md text-sm transition ${
                                                        getIsActive(sub.href)
                                                            ? 'bg-blue-50 text-blue-700 font-medium'
                                                            : 'text-gray-600 hover:bg-gray-100'
                                                    }`}
                                                >
                                                    {sub.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                        {usuario.nombre || usuario.email}
                    </p>
                    <p className="text-xs text-blue-500 capitalize font-medium">
                        Rol: {userRole?.replace('_', ' ')}
                    </p>

                    <button
                        onClick={logout}
                        className="flex items-center mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            {/* Contenido */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
