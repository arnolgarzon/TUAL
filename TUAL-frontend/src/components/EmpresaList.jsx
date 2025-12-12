import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchProtectedData, deleteProtectedData } from '../utils/api';
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';

const EmpresaList = () => {
    const { usuario } = useAuth();
    const [empresas, setEmpresas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // ✅ CORRECCIÓN: Usar useEffect para llamar a la función de carga de datos
    useEffect(() => {
      fetchEmpresas();
    }, []); // El array vacío [] asegura que se ejecute solo una vez al montar el componente.

    // Función para obtener la lista de empresas (filtrada automáticamente por el Backend)
    const fetchEmpresas = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Usar la función importada para hacer la petición GET
            const response = await fetchProtectedData('/empresas');
            setEmpresas(response.empresas || []);
        } catch (err) {
            console.error("Error al obtener empresas:", err);
            // Capturamos el mensaje de error del backend
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Error de red al conectar con el servidor.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (empresaId, empresaName) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar la empresa "${empresaName}"? Esta acción es irreversible.`)) {
            return;
        }
        try {
            await deleteProtectedData(`/empresas/${empresaId}`);
            setEmpresas(empresas.filter(emp => emp.id !== empresaId));
            alert(`Empresa ${empresaName} eliminada con éxito.`);
        } catch (err) {
            console.error("Error al eliminar empresa:", err);
            const errorMessage = err.response?.data?.message || "Error al eliminar la empresa.";
            setError(errorMessage);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg text-gray-700">Cargando empresas...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600 border border-red-300 bg-red-50 rounded-lg flex flex-col items-center">
                <AlertTriangle className="w-10 h-10 mb-3" />
                <h3 className="font-bold text-lg mb-2">Error al cargar los datos</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Empresas</h1>
                {usuario.rol === 'superadmin' && (
                    <button
                        onClick={() => navigate('/dashboard/empresas/crear')}
                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIT</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {empresas.map((empresa) => (
                            <tr key={empresa.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{empresa.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{empresa.nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{empresa.nit}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{empresa.telefono}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-center space-x-2">
                                    <button onClick={() => navigate(`/dashboard/empresas/${empresa.id}`)} title="Editar" className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition">
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    {usuario.rol === 'superadmin' && (
                                        <button onClick={() => handleDelete(empresa.id, empresa.nombre)} title="Eliminar" className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {empresas.length === 0 && !isLoading && (
                    <div className="p-10 text-center text-gray-500">
                        No se encontraron empresas.
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmpresaList;