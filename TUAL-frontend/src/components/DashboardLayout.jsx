// src/components/DashboardLayout.jsx

import React from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import {
  Briefcase,
  Users,
  LogOut,
  LayoutDashboard,
  Settings,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

// 🔐 ROLES CANÓNICOS DEL SISTEMA
// superadmin | admin | operador
const sidebarNav = [
  {
    name: 'Inicio',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['superadmin', 'admin', 'operador'],
  },
  {
    name: 'Empresas',
    href: '/dashboard/empresas',
    icon: Briefcase,
    roles: ['superadmin'],
  },
  {
    name: 'Usuarios',
    href: '/dashboard/usuarios',
    icon: Users,
    roles: ['superadmin', 'admin'],
  },
  {
    name: 'Clientes',
    icon: UserCheck,
    roles: ['admin', 'operador'],
    children: [
      {
        name: 'Listado',
        href: '/dashboard/clientes',
      },
      {
        name: 'Nuevo cliente',
        href: '/dashboard/clientes/nuevo',
      },
    ],
  },
  {
    name: 'Configuración',
    href: '/dashboard/configuracion',
    icon: Settings,
    roles: ['admin'],
  },
];

const DashboardLayout = () => {
  const { usuario, logout, isLoading } = useAuth();
  const location = useLocation();

  const isActive = (href) => {
    if (!href) return false;
    if (href === '/dashboard') return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  const userRole = usuario.rol?.toLowerCase();

  const filteredNav = sidebarNav.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shadow-sm">
        <div className="p-4">
          <div className="text-2xl font-bold text-blue-700 mb-8 tracking-wide">
            TUAL
          </div>

          <nav className="space-y-1">
            {filteredNav.map(item => (
              <div key={item.name}>
                {/* ITEM SIMPLE */}
                {item.href && (
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition text-sm font-medium ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
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
                    <div className="flex items-center px-3 py-2 text-gray-700 font-semibold text-sm">
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </div>

                    <div className="ml-8 space-y-1">
                      {item.children.map(sub => (
                        <Link
                          key={sub.href}
                          to={sub.href}
                          className={`block px-3 py-1.5 rounded-md text-sm transition ${
                            isActive(sub.href)
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
          </nav>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {usuario.nombre || usuario.email}
          </p>
          <p className="text-xs text-blue-600 capitalize">
            {userRole}
          </p>

          <button
            onClick={logout}
            className="flex items-center mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
