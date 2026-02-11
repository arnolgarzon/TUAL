import React, { useState, useEffect } from "react";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
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
  Menu,
  X,
  MessageCircle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

/* ===============================
   CONFIG SIDEBAR
================================*/
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

  /* 🔐 Seguridad */
  {
    name: "Cambiar contraseña",
    href: "/cambiar-clave",
    icon: KeyRound,
    roles: ["superadmin", "admin_empresa", "empleado"],
  },

  /* 🛟 AYUDA (CHECKLIST SENA) */
  {
    name: "Ayuda",
    href: "/dashboard/ayuda",
    icon: MessageCircle,
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

  const [menuOpen, setMenuOpen] = useState(false);

  const userRole = String(usuario?.rol || "").toLowerCase();
  const mustChangePassword =
    usuario?.must_change_password === true ||
    usuario?.mustChangePassword === true;

  /* ===============================
     FORZAR CAMBIO DE CLAVE
  ================================*/
  useEffect(() => {
    if (
      !isLoading &&
      mustChangePassword &&
      location.pathname !== "/cambiar-clave"
    ) {
      navigate("/cambiar-clave", { replace: true });
    }
  }, [isLoading, mustChangePassword, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!usuario) return null;

  const filteredNav = sidebarNav
    .filter((item) => item.roles.includes(userRole))
    .filter((item) => {
      if (!mustChangePassword) return true;
      return ["Inicio", "Cambiar contraseña", "Ayuda"].includes(item.name);
    });

  const doLogout = () => {
    setMenuOpen(false);
    if (onLogout) return onLogout();
    logout();
  };

  const isActive = (href) =>
    href === "/dashboard"
      ? location.pathname === href
      : location.pathname.startsWith(href);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ================= MOBILE OVERLAY ================= */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed md:static z-40 inset-y-0 left-0 w-64 bg-white border-r
        transform transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-2xl font-bold text-blue-700">TUAL</span>
              <button
                className="md:hidden"
                onClick={() => setMenuOpen(false)}
              >
                <X />
              </button>
            </div>

            {mustChangePassword && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <div className="flex gap-2">
                  <ShieldAlert className="h-5 w-5" />
                  <p>
                    Debes cambiar tu contraseña para continuar usando el sistema.
                  </p>
                </div>
              </div>
            )}

            <nav className="space-y-1">
              {filteredNav.map((item) => (
                <div key={item.name}>
                  {item.href && (
                    <NavLink
                      to={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition
                        ${
                          isActive(item.href)
                            ? "bg-blue-100 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </NavLink>
                  )}

                  {item.children && (
                    <div className="ml-6 mt-2 space-y-1">
                      {item.children.map((sub) => (
                        <NavLink
                          key={sub.href}
                          to={sub.href}
                          onClick={() => setMenuOpen(false)}
                          className={`block px-3 py-1.5 rounded-md text-sm
                            ${
                              isActive(sub.href)
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t">
            <p className="font-semibold truncate">
              {usuario.nombre || usuario.email}
            </p>
            <p className="text-xs text-blue-600 capitalize">{userRole}</p>

            <button
              onClick={doLogout}
              className="flex items-center mt-3 text-red-600 hover:text-red-800 text-sm"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR MOBILE */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm">
          <button onClick={() => setMenuOpen(true)}>
            <Menu />
          </button>
          <span className="font-bold text-blue-700">TUAL</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
