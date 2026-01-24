import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchProtectedData, deleteProtectedData } from '../utils/api';
import {
  PlusCircle,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  Power
} from 'lucide-react';

const EmpresaList = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [empresas, setEmpresas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 📦 Obtener empresas
   */
  const fetchEmpresas = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchProtectedData('/superadmin/empresas');

      // 🔐 Normalizamos cualquier formato de backend
      const data = Array.isArray(response)
        ? response
        : response?.data || response?.empresas || [];

      setEmpresas(data);
    } catch (err) {
      console.error('Error al obtener empresas:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'No se pudo cargar la lista de empresas.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  /**
   * 🗑️ Eliminar empresa
   */
  const handleDelete = async (empresaId, empresaName) => {
    const confirm = window.confirm(
      `¿Eliminar la empresa "${empresaName}"?\n\nEsta acción NO se puede deshacer.`
    );
    if (!confirm) return;

    try {
      setIsDeleting(true);
      await deleteProtectedData(`/empresas/${empresaId}`);
      await fetchEmpresas();
      alert(`Empresa "${empresaName}" eliminada correctamente.`);
    } catch (err) {
      console.error('Error al eliminar empresa:', err);
      setError(
        err.response?.data?.message || 'No se pudo eliminar la empresa.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * ⏳ Loading
   */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-700">
          Cargando empresas...
        </span>
      </div>
    );
  }

  /**
   * ❌ Error
   */
  if (error) {
    return (
      <div className="p-6 text-center text-red-600 border border-red-300 bg-red-50 rounded-lg flex flex-col items-center">
        <AlertTriangle className="w-10 h-10 mb-3" />
        <h3 className="font-bold text-lg mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Gestión de Empresas
        </h1>

        {usuario?.rol === 'superadmin' && (
          <button
            onClick={() => navigate('/dashboard/empresas/crear')}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Crear Empresa
          </button>
        )}
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIT</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {empresas.map((empresa) => (
              <tr key={empresa.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{empresa.id}</td>
                <td className="px-6 py-4 text-sm">{empresa.nombre}</td>
                <td className="px-6 py-4 text-sm">{empresa.nit || '—'}</td>
                <td className="px-6 py-4 text-sm">{empresa.telefono || '—'}</td>

                <td className="px-6 py-4 flex justify-center gap-2">
                  <button
                    title="Editar"
                    onClick={() => navigate(`/dashboard/empresas/${empresa.id}`)}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                  >
                    <Edit className="w-5 h-5" />
                  </button>

                  {usuario?.rol === 'superadmin' && (
                    <>
                      <button
                        title="Activar / Suspender (pendiente backend)"
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full"
                      >
                        <Power className="w-5 h-5" />
                      </button>

                      <button
                        disabled={isDeleting}
                        title="Eliminar"
                        onClick={() => handleDelete(empresa.id, empresa.nombre)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full disabled:opacity-50"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {empresas.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No hay empresas registradas.
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpresaList;
