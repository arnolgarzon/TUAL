import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { fetchProtectedData } from "../utils/api";
import {
  Briefcase,
  Users,
  FileText,
  ArrowRight,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";

const SummaryCard = ({ title, value, icon: Icon, color, link }) => (
  <Link
    to={link}
    aria-label={`Ver detalle de ${title}`}
    className="flex flex-col justify-between p-4 sm:p-5 bg-white rounded-2xl shadow-md
               hover:shadow-xl transition-all duration-300
               active:scale-[0.98] border border-gray-200"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs sm:text-sm font-medium text-gray-500">
          {title}
        </p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
          {value}
        </p>
      </div>
      <div className={`p-2 sm:p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon
          className={`h-5 w-5 sm:h-6 sm:w-6 ${color.replace("bg-", "text-")}`}
        />
      </div>
    </div>

    <div className="flex items-center text-sm font-medium text-blue-600 mt-3">
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      const isSuperAdmin = usuario?.rol === "superadmin";

      try {
        if (isSuperAdmin) {
          const resp = await fetchProtectedData("/superadmin/stats");
          const s = resp?.stats || {};

          setCards([
            {
              title: "Empresas Totales",
              value: s?.empresas?.total ?? 0,
              icon: Briefcase,
              color: "bg-blue-600",
              link: "/dashboard/empresas",
            },
            {
              title: "Empresas Activas",
              value: s?.empresas?.activas ?? 0,
              icon: Briefcase,
              color: "bg-green-600",
              link: "/dashboard/empresas",
            },
            {
              title: "Usuarios",
              value: s?.usuarios?.total ?? 0,
              icon: Users,
              color: "bg-indigo-600",
              link: "/dashboard/usuarios",
            },
            {
              title: "Clientes Globales",
              value: s?.clientes?.total ?? 0,
              icon: FileText,
              color: "bg-purple-600",
              link: "/dashboard/clientes-global",
            },
          ]);
        } else {
          setCards([
            {
              title: "Panel de Empresa",
              value: "—",
              icon: BarChart3,
              color: "bg-gray-600",
              link: "/dashboard",
            },
          ]);
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

    if (usuario) fetchDashboardData();
  }, [usuario]);

  return (
    <div className="space-y-6 p-4 sm:p-6 md:p-8">
      {/* HEADER */}
      <div className="p-4 sm:p-6 bg-white rounded-2xl shadow-md border-l-4 border-blue-600">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
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
            {String(usuario?.rol || "").replace("_", " ")}
          </span>
        </p>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-gray-800">
        Resumen de métricas
      </h3>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-gray-200 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-600 bg-red-50 border border-red-300 rounded-xl">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <SummaryCard key={c.title} {...c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
