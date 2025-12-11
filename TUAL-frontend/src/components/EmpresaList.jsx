// src/components/EmpresaList.jsx (Línea 5 - Corrección)

import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
// 🛑 CORRECCIÓN: Usar el nombre de archivo api.js, si ese es el nombre real
import { fetchProtectedData } from "../utils/api"; 
import { Briefcase, Loader2, PlusCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const EmpresaList = () => {
    const { usuario } = useAuth();
    const [empresas, setEmpresas] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Función para obtener la lista de empresas (filtrada automáticamente por el Backend)
    const fetchEmpresas = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // 🛑 CORRECCIÓN 2: Usar la función importada para hacer la petición GET
            const response = await fetchProtectedData('/empresas'); 
            setEmpresas(response.data);
        } catch (err) {
            console.error("Error al obtener empresas:", err);
            // Capturamos el mensaje de error del backend
            const errorMessage = err.response?.data?.message || err.response?.data?.error || "Error de red al conectar con el servidor.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (usuario) {
            fetchEmpresas();
        }
    }, [usuario]);
    
    // --- Renderizado de Estados ---

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg text-gray-700">Cargando empresas...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm m-4">
                <div className="flex items-center">
                    <AlertTriangle className="h-6 w-6 mr-3" />
                    <p className="font-bold">Error de Acceso o Carga:</p>
                </div>
                <p className="mt-2">{error}</p>
            </div>
        );
    }

    // --- Renderizado Principal ---

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Briefcase className="mr-2 text-blue-600" />
                    Gestión de Empresas
                    <span className="ml-3 text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {empresas.length} Encontradas
                    </span>
                </h2>
                
                {/* 🛑 CORRECCIÓN 3: Solo el Superadmin puede crear */}
                {usuario?.rol === 'Superadmin' && (
                    <Link
                        to="/dashboard/empresas/crear" 
                        className="inline-flex items-center px-4 py-2 border border-transparent 
                                   text-sm font-medium rounded-lg shadow-sm text-white 
                                   bg-purple-600 hover:bg-purple-700 transition duration-150"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Nueva Empresa
                    </Link>
                )}
            </div>

            {empresas.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID / Nombre</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">NIT</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email / Teléfono</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {empresas.map((empresa) => (
                                <tr key={empresa.id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <span className="font-mono text-gray-400 text-xs mr-2">#{empresa.id}</span>
                                        {empresa.nombre}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{empresa.nit}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {empresa.email || 'N/A'} / {empresa.telefono || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                         ${empresa.estado === 'ACTIVA' 
                                                             ? 'bg-green-100 text-green-800' 
                                                             : 'bg-red-100 text-red-800'}`}>
                                            {empresa.estado || 'INACTIVA'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        {/* Botón de Ver Detalles/Editar */}
                                        <Link 
                                            to={`/dashboard/empresas/${empresa.id}`}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            Ver/Editar
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg mt-4 border border-dashed border-gray-300">
                    <p className="text-gray-500">No se encontraron empresas asociadas a tu cuenta.</p>
                </div>
            )}
        </div>
    );
};

export default EmpresaList;