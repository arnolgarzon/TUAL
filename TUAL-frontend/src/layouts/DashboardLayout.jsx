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
  Menu,
  X,
  MessageCircle,
  Package,
  BarChart3,
  FileText,
  Receipt,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const DashboardLayout = ({ onLogout }) => {
  const { usuario, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModules, setActiveModules] = useState([]);

  const userRole = String(usuario?.rol || "").toLowerCase();
  const empresaId = usuario?.empresa_id;
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
        const res = await fetch(
          `http://localhost:5000/api/empresa/config/${empresaId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();

        const enabled = (data.modulos || [])
          .filter((m) => m.enabled)
          .map((m) => m.modulo.toLowerCase());

        setActiveModules(enabled);
      } catch (err) {
        console.error("Error cargando módulos:", err);
      }
    };

    if (empresaId) fetchModules();
  }, [empresaId]);

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

    userRole === "superadmin" && {
      name: "Usuarios (Global)",
      href: "/dashboard/usuarios",
      icon: Users,
      roles: ["superadmin"],
    },

    userRole === "superadmin" && {
      name: "Clientes Global",
      href: "/dashboard/clientes-global",
      icon: Globe,
      roles: ["superadmin"],
    },

    activeModules.includes("usuarios") &&
      userRole === "admin_empresa" && {
        name: "Usuarios internos",
        href: "/dashboard/usuarios-internos",
        icon: Users,
        roles: ["admin_empresa"],
      },

    activeModules.includes("clientes") && {
      name: "Clientes",
      icon: UserCheck,
      roles: ["admin_empresa", "empleado"],
      children: [
        { name: "Listado", href: "/dashboard/clientes" },
        { name: "Nuevo cliente", href: "/dashboard/clientes/crear" },
      ],
    },

    /* 🔥 NUEVO MÓDULO ORDENES */
    activeModules.includes("ordenes") && {
      name: "Órdenes de Trabajo",
      icon: ClipboardList,
      roles: ["admin_empresa", "empleado"],
      children: [
        { name: "Listado", href: "/dashboard/ordenes" },
        { name: "Crear orden", href: "/dashboard/ordenes/crear" },
      ],
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

    activeModules.includes("reportes") && {
      name: "Reportes",
      href: "/dashboard/reportes",
      icon: FileText,
      roles: ["admin_empresa", "superadmin"],
    },

    activeModules.includes("facturacion") && {
      name: "Facturación",
      href: "/dashboard/facturacion",
      icon: Receipt,
      roles: ["admin_empresa"],
    },

    userRole === "admin_empresa" && {
      name: "Configuración",
      href: "/dashboard/configuracion",
      icon: Settings,
      roles: ["admin_empresa"],
    },

    {
      name: "Cambiar contraseña",
      href: "/cambiar-clave",
      icon: KeyRound,
      roles: ["superadmin", "admin_empresa", "empleado"],
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
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-blue-700">TUAL</span>
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

      <div className="flex-1 flex flex-col">
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
