import React from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  LogOut,
  LayoutDashboard,
  UserCheck,
  Settings,
  Globe,
  KeyRound,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

// Roles canónicos
// superadmin | admin_empresa | empleado
const sidebarNav = [
  {
    name: "Inicio",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["superadmin", "admin_empresa", "empleado"],
  },
  {
    name: "Empresas",
    href: "/dashboard/empresas",
    icon: Briefcase,
    roles: ["superadmin"],
  },
  {
    name: "Usuarios (Global)",
    href: "/dashboard/usuarios",
    icon: Users,
    roles: ["superadmin"],
  },
  {
    name: "Clientes Global",
    href: "/dashboard/clientes-global",
    icon: Globe,
    roles: ["superadmin"],
  },

  // Usuarios internos por empresa (ADMIN_EMPRESA)
  {
    name: "Usuarios internos",
    href: "/dashboard/usuarios-internos",
    icon: Users,
    roles: ["admin_empresa"],
  },

  {
    name: "Clientes",
    icon: UserCheck,
    roles: ["admin_empresa", "empleado"],
    children: [
      { name: "Listado", href: "/dashboard/clientes" },
      { name: "Nuevo cliente", href: "/dashboard/clientes/crear" },
    ],
  },

  // Cambiar contraseña (todos)
  {
    name: "Cambiar contraseña",
    href: "/cambiar-clave",
    icon: KeyRound,
    roles: ["superadmin", "admin_empresa", "empleado"],
  },

  {
    name: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
    roles: ["admin_empresa"],
  },
];

const DashboardLayout = ({ onLogout }) => {
  const { usuario, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = String(usuario?.rol || "").toLowerCase();
  const mustChangePassword =
    usuario?.must_change_password === true || usuario?.mustChangePassword === true;

  // ✅ IMPORTANTE: Hooks SIEMPRE antes de returns condicionales
  React.useEffect(() => {
    if (!isLoading && mustChangePassword && location.pathname !== "/cambiar-clave") {
      navigate("/cambiar-clave", { replace: true });
    }
  }, [isLoading, mustChangePassword, location.pathname, navigate]);

  const isActive = (href) => {
    if (!href) return false;
    if (href === "/dashboard") return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!usuario) return null;

  const filteredNav = sidebarNav
    .filter((item) => item.roles.includes(userRole))
    .filter((item) => {
      if (!mustChangePassword) return true;
      const allowed = new Set(["Inicio", "Cambiar contraseña"]);
      return allowed.has(item.name);
    });

  const doLogout = () => {
    if (typeof onLogout === "function") return onLogout();
    return logout();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shadow-sm">
        <div className="p-4">
          <div className="text-2xl font-bold text-blue-700 mb-6 tracking-wide">
            TUAL
          </div>

          {mustChangePassword ? (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
              <div className="flex items-start gap-2">
                <ShieldAlert className="h-5 w-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Acción requerida</p>
                  <p className="text-xs mt-1">
                    Debes cambiar tu contraseña para continuar usando el sistema.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <nav className="space-y-1">
            {filteredNav.map((item) => (
              <div key={item.name}>
                {item.href && (
                  <NavLink
                    to={item.href}
                    className={() =>
                      `flex items-center px-3 py-2 rounded-lg transition text-sm font-medium ${
                        isActive(item.href)
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </NavLink>
                )}

                {item.children && (
                  <div className="mt-2">
                    <div className="flex items-center px-3 py-2 text-gray-700 font-semibold text-sm">
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </div>

                    <div className="ml-8 space-y-1">
                      {item.children.map((sub) => (
                        <NavLink
                          key={sub.href}
                          to={sub.href}
                          className={() =>
                            `block px-3 py-1.5 rounded-md text-sm transition ${
                              isActive(sub.href)
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                            }`
                          }
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {usuario.nombre || usuario.email}
          </p>
          <p className="text-xs text-blue-600 capitalize">{userRole}</p>

          <button
            onClick={doLogout}
            className="flex items-center mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;