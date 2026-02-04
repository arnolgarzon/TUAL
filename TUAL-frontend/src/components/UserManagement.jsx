import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, AlertTriangle, Power } from 'lucide-react';
import { fetchProtectedData, patchProtectedData } from '../utils/api';

const UserManagement = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchProtectedData('/superadmin/usuarios-auth');
      const data = Array.isArray(response)
        ? response
        : response?.data || response?.usuarios || [];
      setUsuarios(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'No se pudieron cargar los usuarios.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleToggleActivo = async (user) => {
    const nextActivo = !Boolean(user.activo);
    const confirm = window.confirm(
      `${nextActivo ? '¿Activar' : '¿Desactivar'} al usuario "${user.nombre}"?`
    );
    if (!confirm) return;

    try {
      setBusyId(user.id);
      await patchProtectedData(`/superadmin/usuarios-auth/${user.id}/estado`, {
        activo: nextActivo,
      });
      await loadUsers();
    } catch (err) {
      console.error('Error al cambiar estado usuario:', err);
      setError(
        err.response?.data?.message ||
          'No se pudo actualizar el estado del usuario.'
      );
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center text-blue-600 flex justify-center items-center">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Cargando lista de usuarios...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 border border-red-300 bg-red-50 rounded-lg flex flex-col items-center">
        <AlertTriangle className="w-10 h-10 mb-3" />
        <div>{error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios (Login)</h1>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 capitalize">{user.rol}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.empresa_nombre || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex justify-center">
                    <button
                      onClick={() => handleToggleActivo(user)}
                      disabled={busyId === user.id}
                      title="Activar / Desactivar"
                      className="text-yellow-700 hover:text-yellow-900 p-2 rounded-full hover:bg-yellow-50 disabled:opacity-50"
                    >
                      {busyId === user.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Power className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div className="p-10 text-center text-gray-500">
            No se encontraron usuarios en el sistema.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;