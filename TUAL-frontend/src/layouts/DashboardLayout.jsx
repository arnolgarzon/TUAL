import React, { useState, useEffect } from "react";
import {
  Outlet,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  Briefcase,
  LogOut,
  LayoutDashboard,
  UserCheck,
  Settings,
  Menu,
  X,
  MessageCircle,
  Package,
  BarChart3,
  ClipboardList,
  ChevronDown,
  Users,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DashboardLayout = ({ onLogout }) => {
  const { usuario, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModules, setActiveModules] = useState([]);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const userRole = String(usuario?.rol || "").toLowerCase();
  const empresaNombre = usuario?.empresa_nombre || "Mi Empresa";

  const mustChangePassword =
    usuario?.must_change_password === true ||
    usuario?.mustChangePassword === true;

  /* ===============================
     CARGAR MÓDULOS ACTIVOS
  ================================*/
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_URL}/api/empresa/config`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error cargando configuración");

        const data = await res.json();

        const enabled = (data.modulos || [])
          .filter((m) => m.enabled === true)
          .map((m) => m.modulo.toLowerCase());

        setActiveModules(enabled);
      } catch (err) {
        console.error("Error cargando módulos:", err);
        setActiveModules([]);
      }
    };

    if (usuario) fetchModules();
  }, [usuario]);

  /* ===============================
     FORZAR CAMBIO DE CLAVE
     (Ahora redirige solo a Configuración)
  ================================*/
  useEffect(() => {
    if (
      !isLoading &&
      mustChangePassword &&
      location.pathname !== "/dashboard/configuracion"
    ) {
      navigate("/dashboard/configuracion", { replace: true });
    }
  }, [isLoading, mustChangePassword, location.pathname, navigate]);

  /* ===============================
     ABRIR SUBMENÚ AUTOMÁTICAMENTE
  ================================*/
  useEffect(() => {
    if (location.pathname.startsWith("/dashboard/configuracion")) {
      setOpenSubmenu("Configuración");
    }
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!usuario) return null;

  /* ===============================
     MENÚ DINÁMICO
  ================================*/
  const sidebarNav = [
    {
      name: "Inicio",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["superadmin", "admin_empresa", "empleado"],
    },

    userRole === "superadmin" && {
      name: "Empresas",
      href: "/dashboard/empresas",
      icon: Briefcase,
      roles: ["superadmin"],
    },

    activeModules.includes("clientes") && {
      name: "Clientes",
      href: "/dashboard/clientes",
      icon: UserCheck,
      roles: ["admin_empresa", "empleado"],
    },

    activeModules.includes("usuarios") && {
      name: "Usuarios",
      href: "/dashboard/usuarios",
      icon: Users,
      roles: ["admin_empresa"],
    },

    activeModules.includes("ordenes") && {
      name: "Órdenes",
      href: "/dashboard/ordenes",
      icon: ClipboardList,
      roles: ["admin_empresa", "empleado"],
    },

    activeModules.includes("inventario") && {
      name: "Inventario",
      href: "/dashboard/inventario",
      icon: Package,
      roles: ["admin_empresa"],
    },

    activeModules.includes("finanzas") && {
      name: "Finanzas",
      href: "/dashboard/finanzas",
      icon: BarChart3,
      roles: ["admin_empresa"],
    },

    {
      name: "Configuración",
      icon: Settings,
      roles: ["admin_empresa"],
      children: [
        {
          name: "General",
          href: "/dashboard/configuracion",
        },
      ],
    },

    {
      name: "Ayuda",
      href: "/dashboard/ayuda",
      icon: MessageCircle,
      roles: ["superadmin", "admin_empresa", "empleado"],
    },
  ].filter(Boolean);

  const filteredNav = sidebarNav.filter((item) =>
    item.roles.includes(userRole)
  );

  /* ===============================
     TÍTULO DINÁMICO MEJORADO
  ================================*/
  const activeTitle = (() => {
    for (const item of filteredNav) {
      if (item.href && location.pathname.startsWith(item.href)) {
        return item.name;
      }
      if (item.children) {
        for (const sub of item.children) {
          if (location.pathname.startsWith(sub.href)) {
            return item.name;
          }
        }
      }
    }
    return "TUAL";
  })();

  const doLogout = () => {
    setMenuOpen(false);
    if (onLogout) return onLogout();
    logout();
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static z-40 inset-y-0 left-0 w-64 bg-white border-r
        transform transition-transform duration-300
        ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="flex flex-col h-full justify-between">

          <div className="p-4 overflow-y-auto">

            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-blue-700">
                TUAL
              </span>
              <button
                className="md:hidden"
                onClick={() => setMenuOpen(false)}
              >
                <X />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-6 truncate">
              {empresaNombre}
            </p>

            <nav className="space-y-1">
              {filteredNav.map((item) => (
                <div key={item.name}>

                  {item.href && (
                    <NavLink
                      to={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 rounded-lg text-sm font-medium transition
                        ${
                          isActive
                            ? "bg-blue-600 text-white shadow"
                            : "text-gray-600 hover:bg-gray-100"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </NavLink>
                  )}

                  {item.children && (
                    <>
                      <button
                        onClick={() =>
                          setOpenSubmenu(
                            openSubmenu === item.name ? null : item.name
                          )
                        }
                        className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        <div className="flex items-center">
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.name}
                        </div>
                        <ChevronDown
                          className={`transition ${
                            openSubmenu === item.name ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {openSubmenu === item.name && (
                        <div className="ml-8 mt-1 space-y-1">
                          {item.children.map((sub) => (
                            <NavLink
                              key={sub.href}
                              to={sub.href}
                              onClick={() => setMenuOpen(false)}
                              className={({ isActive }) =>
                                `block px-3 py-1.5 rounded-md text-sm
                                ${
                                  isActive
                                    ? "bg-blue-100 text-blue-700"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`
                              }
                            >
                              {sub.name}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t">
            <p className="font-semibold truncate">
              {usuario.nombre || usuario.email}
            </p>
            <p className="text-xs text-blue-600 capitalize">
              {userRole}
            </p>

            <button
              onClick={doLogout}
              className="w-full mt-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 text-sm font-medium transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col">

        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b shadow-sm">
          <button onClick={() => setMenuOpen(true)}>
            <Menu />
          </button>
          <span className="font-bold text-blue-700 truncate">
            {activeTitle}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
