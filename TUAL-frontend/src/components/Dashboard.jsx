import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchProtectedData } from '../utils/api';
import {
  Briefcase,
  Users,
  FileText,
  ArrowRight,
  Loader2,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SummaryCard = ({ title, value, icon: Icon, color, link }) => (
  <Link
    to={link}
    className="flex flex-col justify-between p-5 bg-white rounded-xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 border border-gray-200"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      const isSuperAdmin = usuario?.rol === 'superadmin';

      try {
        if (isSuperAdmin) {
          const resp = await fetchProtectedData('/superadmin/stats');

          // resp.stats.empresas.total, resp.stats.empresas.activas, etc.
          const s = resp?.stats || {};

          const empresasTotal = s?.empresas?.total ?? 0;
          const empresasActivas = s?.empresas?.activas ?? 0;
          const usuariosTotal = s?.usuarios?.total ?? 0;
          const clientesTotal = s?.clientes?.total ?? 0;

          setCards([
            {
              title: 'Empresas Totales',
              value: empresasTotal,
              icon: Briefcase,
              color: 'bg-blue-600',
              link: '/dashboard/empresas',
            },
            {
              title: 'Empresas Activas',
              value: empresasActivas,
              icon: Briefcase,
              color: 'bg-green-600',
              link: '/dashboard/empresas',
            },
            {
              title: 'Usuarios (Login)',
              value: usuariosTotal,
              icon: Users,
              color: 'bg-indigo-600',
              link: '/dashboard/usuarios',
            },
            {
              title: 'Clientes (Global)',
              value: clientesTotal,
              icon: FileText,
              color: 'bg-purple-600',
              link: '/dashboard/clientes', // si no existe aún, lo cambiamos
            },
          ]);
        } else {
          // Si luego implementas dashboard por empresa, aquí lo conectamos
          setCards([
            {
              title: 'Panel de Empresa',
              value: '—',
              icon: BarChart3,
              color: 'bg-gray-600',
              link: '/dashboard',
            },
          ]);
        }
      } catch (e) {
        console.error('Error al cargar estadísticas:', e);
        setError(e.response?.data?.message || 'No se pudieron cargar las métricas.');
        setCards([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (usuario) fetchDashboardData();
  }, [usuario]);

  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="p-6 bg-white rounded-xl shadow-xl border-l-4 border-blue-600">
        <h2 className="text-3xl font-extrabold text-gray-900">
          ¡Hola, {usuario?.nombre || usuario?.email || 'Administrador'}!
        </h2>
        <p className="text-gray-600 mt-1">
          {new Date().toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}{' '}
          | Rol:{' '}
          <span className="font-semibold capitalize text-blue-700">
            {String(usuario?.rol || '').replace('_', ' ')}
          </span>
        </p>
      </div>

      <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">
        Resumen de Métricas {usuario?.rol === 'superadmin' ? 'Globales' : 'de tu Empresa'}
      </h3>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center justify-center h-32 bg-gray-200 rounded-xl shadow-md">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl shadow-md animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="p-6 text-center text-red-600 border border-red-300 bg-red-50 rounded-lg">
          {error}
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