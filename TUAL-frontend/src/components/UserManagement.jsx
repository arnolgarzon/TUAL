// src/components/UserManagement.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
// Asumimos que tienes una función de utilidad para la API
import { fetchProtectedData, deleteProtectedData } from '../utils/api'; // 🛑 Asegúrate de crear este utility file

const UserManagement = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // --------------------------------------------------------
    // FUNCIÓN DE CARGA DE DATOS (READ)
    // --------------------------------------------------------
    const loadUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // El backend ya tiene implementada la seguridad para que solo el Superadmin acceda.
            const response = await fetchProtectedData('/usuarios');
            
            // response.usuarios contiene el array de usuarios
            setUsuarios(response.usuarios || []); 
        } catch (err) {
            console.error("Error al cargar usuarios:", err);
            setError("No se pudieron cargar los datos de usuarios. Verifique la conexión.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // --------------------------------------------------------
    // FUNCIÓN DE ELIMINAR (DELETE)
    // --------------------------------------------------------
    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"? Esta acción es irreversible.`)) {
            return;
        }

        try {
            await deleteProtectedData(`/usuarios/${userId}`);
            
            // Actualiza la lista sin recargar toda la página
            setUsuarios(usuarios.filter(user => user.id !== userId));
            
            alert(`Usuario ${userName} eliminado con éxito.`); // Reemplazar con toast/notificación real
        } catch (err) {
            console.error("Error al eliminar usuario:", err);
            alert("Error al eliminar usuario. Consulte la consola.");
        }
    };

    // --------------------------------------------------------
    // RENDERIZADO
    // --------------------------------------------------------
    if (isLoading) {
        return <div className="p-6 text-center text-blue-600">Cargando lista de usuarios...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600 border border-red-300 bg-red-50 rounded-lg">{error}</div>;
    }

    return (
        <div className="p-4 md:p-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>
                <button
                    onClick={() => navigate('/dashboard/usuarios/crear')}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Crear Usuario
                </button>
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.nombre_empresa || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-center space-x-2">
                                    <button
                                        onClick={() => navigate(`/dashboard/usuarios/${user.id}`)}
                                        title="Editar"
                                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id, user.nombre)}
                                        title="Eliminar"
                                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {usuarios.length === 0 && !isLoading && (
                    <div className="p-10 text-center text-gray-500">
                        No se encontraron usuarios en el sistema.
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;