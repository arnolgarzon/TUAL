import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchProtectedData } from "../utils/api";
import {
  Briefcase,
  Users,
  FileText,
  ArrowRight,
  ClipboardList,
  Loader2,
  Package,
  Receipt,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ===============================
   TARJETA KPI
================================*/
const SummaryCard = ({ title, value, icon: Icon, color, link }) => (
  <Link
    to={link}
    className="flex flex-col justify-between p-5 bg-white rounded-2xl shadow-md
               hover:shadow-xl transition-all duration-300
               border border-gray-200 hover:-translate-y-1"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">
          {value ?? 0}
        </p>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`h-6 w-6 ${color.replace("bg-", "text-")}`} />
      </div>
    </div>

    <div className="flex items-center text-sm font-medium text-blue-600 mt-4">
      Ver detalle
      <ArrowRight className="h-4 w-4 ml-1" />
    </div>
  </Link>
);

const Dashboard = () => {
  const { usuario } = useAuth();
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModules, setActiveModules] = useState([]);

  const userRole = String(usuario?.rol || "").toLowerCase();

  /* ===============================
     CARGAR MÓDULOS ACTIVOS
  ================================*/
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const data = await fetchProtectedData("/empresa/config");

        const enabled = (data.modulos || [])
          .filter((m) => m.enabled)
          .map((m) => m.modulo.toLowerCase());

        setActiveModules(enabled);
      } catch (err) {
        console.error("Error cargando módulos:", err);
      }
    };

    if (usuario) fetchModules();
  }, [usuario]);

  /* ===============================
     CARGAR MÉTRICAS
  ================================*/
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (userRole === "superadmin") {
          const resp = await fetchProtectedData("/superadmin/stats");

          setCards([
            {
              title: "Empresas Totales",
              value: resp?.totalEmpresas ?? 0,
              icon: Briefcase,
              color: "bg-blue-600",
              link: "/dashboard/empresas",
            },
            {
              title: "Usuarios Globales",
              value: resp?.totalUsuarios ?? 0,
              icon: Users,
              color: "bg-indigo-600",
              link: "/dashboard/usuarios",
            },
            {
              title: "Clientes Globales",
              value: resp?.totalClientes ?? 0,
              icon: FileText,
              color: "bg-purple-600",
              link: "/dashboard/clientes-global",
            },
          ]);
        } else {
          const resp = await fetchProtectedData("/empresa/config/stats");

          const dynamicCards = [];

          if (activeModules.includes("clientes")) {
            dynamicCards.push({
              title: "Clientes",
              value: resp?.totalClientes ?? 0,
              icon: FileText,
              color: "bg-purple-600",
              link: "/dashboard/clientes",
            });
          }

          if (activeModules.includes("usuarios")) {
            dynamicCards.push({
              title: "Usuarios",
              value: resp?.totalUsuarios ?? 0,
              icon: Users,
              color: "bg-indigo-600",
              link: "/dashboard/usuarios-internos",
            });
          }

          if (activeModules.includes("ordenes")) {
            dynamicCards.push({
              title: "Órdenes",
              value: resp?.totalOrdenes ?? 0,
              icon: ClipboardList,
              color: "bg-amber-600",
              link: "/dashboard/ordenes",
            });
          }

          if (activeModules.includes("inventario")) {
            dynamicCards.push({
              title: "Inventario",
              value: resp?.totalInventario ?? 0,
              icon: Package,
              color: "bg-green-600",
              link: "/dashboard/inventario",
            });
          }

          if (activeModules.includes("facturacion")) {
            dynamicCards.push({
              title: "Facturación",
              value: resp?.totalFacturacion ?? 0,
              icon: Receipt,
              color: "bg-red-600",
              link: "/dashboard/facturacion",
            });
          }

          setCards(dynamicCards);
        }
      } catch (e) {
        setError(
          e.response?.data?.message ||
            "No se pudieron cargar las métricas."
        );
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (usuario && activeModules) {
      fetchDashboardData();
    }
  }, [usuario, activeModules, userRole]);

  return (
    <div className="space-y-8">
      <div className="p-6 bg-white rounded-2xl shadow-md border-l-4 border-blue-600">
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
          Hola, {usuario?.nombre || usuario?.email}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {new Date().toLocaleDateString("es-CO", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}{" "}
          ·{" "}
          <span className="font-semibold capitalize text-blue-700">
            {userRole.replace("_", " ")}
          </span>
        </p>
      </div>

      <h3 className="text-xl font-bold text-gray-800">
        Panel de métricas
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-600 bg-red-50 border border-red-300 rounded-xl">
          {error}
        </div>
      ) : cards.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 border rounded-xl">
          No hay módulos activos configurados.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => (
            <SummaryCard key={c.title} {...c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
