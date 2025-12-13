import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchProtectedData, deleteProtectedData } from '../utils/api';
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle, Search, Eye } from 'lucide-react';

const TallerList = () => {
    const { usuario } = useAuth();
    const [ordenes, setOrdenes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrdenes();
    }, []);

    const fetchOrdenes = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetchProtectedData('/taller');
            setOrdenes(response.ordenes || []);
        } catch (err) {
            console.error("Error al obtener órdenes de taller:", err);
            setError(err.response?.data?.message || "Error al cargar las órdenes.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (ordenId) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar la orden de taller #${ordenId}?`)) {
            return;
        }
        try {
            await deleteProtectedData(`/taller/${ordenId}`);
            setOrdenes(ordenes.filter(o => o.id !== ordenId));
            alert(`Orden #${ordenId} eliminada con éxito.`);
        } catch (err) {
            console.error("Error al eliminar orden:", err);
            setError(err.response?.data?.message || "Error al eliminar la orden.");
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        switch (status) {
            case 'Recibido': return `${baseClasses} bg-blue-100 text-blue-800`;
            case 'En Diagnóstico': return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case 'Aprobado': return `${baseClasses} bg-green-100 text-green-800`;
            case 'En Reparación': return `${baseClasses} bg-purple-100 text-purple-800`;
            case 'Listo': return `${baseClasses} bg-teal-100 text-teal-800`;
            case 'Entregado': return `${baseClasses} bg-gray-100 text-gray-800`;
            default: return `${baseClasses} bg-gray-100 text-gray-800`;
        }
    };

    const filteredOrdenes = ordenes.filter(orden =>
        orden.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.vehiculo_placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        orden.motivo_visita?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-10">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg text-gray-700">Cargando órdenes de taller...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-600 border border-red-300 bg-red-50 rounded-lg">
                <AlertTriangle className="w-10 h-10 mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-2">Error al cargar los datos</h3>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-0">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Recepción de Taller</h1>
                <button
                    onClick={() => navigate('/dashboard/taller/crear')}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200"
                >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Nueva Orden
                </button>
            </div>

            <div className="mb-4 relative">
                <input
                    type="text"
                    placeholder="Buscar por cliente, placa o motivo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 pl-10 border border-gray-300 rounded-lg"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>

            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden #</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehículo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrdenes.map((orden) => (
                            <tr key={orden.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{orden.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{orden.cliente_nombre}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{orden.vehiculo_marca} {orden.vehiculo_modelo} ({orden.vehiculo_placa})</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={getStatusBadge(orden.estado)}>{orden.estado}</span></td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                    <button onClick={() => navigate(`/dashboard/taller/${orden.id}`)} title="Ver/Editar" className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 transition">
                                        <Eye className="w-5 h-5" />
                                    </button>
                                    {(usuario.rol === 'superadmin' || usuario.rol === 'admin_empresa') && (
                                        <button onClick={() => handleDelete(orden.id)} title="Eliminar" className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredOrdenes.length === 0 && !isLoading && (
                    <div className="p-10 text-center text-gray-500">
                        No se encontraron órdenes de taller.
                    </div>
                )}
            </div>
        </div>
    );
};

export default TallerList;