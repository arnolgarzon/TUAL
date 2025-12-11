// src/components/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchProtectedData } from '../utils/api'; 
import { Briefcase, Users, FileText, Settings, PlusCircle, ArrowRight, TrendingUp, DollarSign, Loader2, BarChart3, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

// ----------------------------------------------------
// Sub-componente: Tarjeta de Resumen 
// ----------------------------------------------------
const SummaryCard = ({ title, value, icon: Icon, color, link }) => (
    <Link 
        to={link}
        className="flex flex-col justify-between p-5 bg-white rounded-xl shadow-lg 
                   hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 
                   border border-gray-200"
    >
        <div className="flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
                {/* Aseguramos el color del ícono */}
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
    const [stats, setStats] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    // ----------------------------------------------------
    // FUNCIÓN DE CARGA DE DATOS
    // ----------------------------------------------------
    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
            // 🛑 Estandarizado a 'Superadmin'
            const isSuperAdmin = usuario?.rol === 'Superadmin';
            const role = usuario?.rol;
            
            try {
                // 🛑 A FUTURO: Implementación de la llamada real al Backend.
                // const response = await fetchProtectedData(`/dashboard/stats?role=${role}`); 
                // setStats(response.data); 

                // Mantenemos la simulación temporal
                await new Promise(resolve => setTimeout(resolve, 600)); 
                let data;

                if (isSuperAdmin) { // Usamos la variable booleana
                    data = {
                        'Empresas Totales': { value: '18', icon: Briefcase, color: 'bg-blue-600', link: '/dashboard/empresas' },
                        'Usuarios Globales': { value: '45', icon: Users, color: 'bg-green-600', link: '/dashboard/usuarios' },
                        'Ingresos (Mes)': { value: '$12k', icon: DollarSign, color: 'bg-indigo-600', link: '/dashboard/finanzas' },
                        'Tasa de Crecimiento': { value: '+12%', icon: TrendingUp, color: 'bg-purple-600', link: '/dashboard/reportes' },
                    };
                } else {
                    data = {
                        'Facturas Pendientes': { value: 7, icon: FileText, color: 'bg-red-600', link: '/dashboard/facturas' },
                        'Empleados en Nómina': { value: 5, icon: Users, color: 'bg-yellow-600', link: '/dashboard/rrhh' },
                        'Último Cierre Fiscal': { value: '15/11/2025', icon: Settings, color: 'bg-gray-600', link: '/dashboard/configuracion' },
                        'Horas Trabajadas (Mes)': { value: '160h', icon: Clock, color: 'bg-cyan-600', link: '/dashboard/tiempos' },
                    };
                }
                setStats(data);
                
            } catch (error) {
                console.error("Error al cargar estadísticas:", error);
                // NOTA: Podrías añadir un estado de error al usuario
                setStats({}); 
            } finally {
                setIsLoading(false);
            }
        };

        if (usuario) {
            fetchDashboardData();
        }
    }, [usuario]);

    // ----------------------------------------------------
    // Sub-componente: Contenido Principal (Separación por Rol)
    // ----------------------------------------------------
    const RenderDashboardContent = () => {
        // 🛑 Estandarizado a 'Superadmin'
        const isSuperAdmin = usuario?.rol === 'Superadmin';
        
        if (isSuperAdmin) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 p-6 bg-white rounded-xl shadow-lg border-t-4 border-indigo-500">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Tendencia de Crecimiento Global (TUAL)
                        </h3>
                        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400">
                            <BarChart3 className="h-8 w-8 mr-2" /> [Placeholder: Gráfica de Ingresos Mensuales]
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-purple-500">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Acciones Críticas
                        </h3>
                        <div className="space-y-3">
                            <Link to="/dashboard/usuarios" className="flex items-center text-blue-600 hover:text-blue-800 transition">
                                <Users className="h-5 w-5 mr-2" /> Gestionar Usuarios
                            </Link>
                            <Link to="/dashboard/empresas" className="flex items-center text-blue-600 hover:text-blue-800 transition">
                                <Briefcase className="h-5 w-5 mr-2" /> Revisar Empresas
                            </Link>
                            <Link to="/logs" className="flex items-center text-blue-600 hover:text-blue-800 transition">
                                <Settings className="h-5 w-5 mr-2" /> Logs del Sistema
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Acciones Rápidas */}
                <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-purple-500">
                    <h3 className="text-xl font-semibold text-gray-800">Crear Nueva Factura</h3>
                    <p className="text-gray-600 mt-2 text-sm">
                        Genera una nueva factura electrónica para un cliente.
                    </p>
                    <Link
                        to="/dashboard/facturas/crear" 
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent 
                                   text-sm font-medium rounded-lg shadow-sm text-white 
                                   bg-purple-600 hover:bg-purple-700 transition duration-150"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" /> Generar Factura
                    </Link>
                </div>

                {/* 2. Avisos y Tareas */}
                <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-red-500">
                    <h3 className="text-xl font-semibold text-gray-800">Tareas Pendientes</h3>
                    <ul className="text-gray-700 mt-2 text-sm space-y-1">
                        <li>⚠️ Pagar impuesto IVA (Vence: 30/11)</li>
                        <li>⚙️ Configurar Certificado Digital</li>
                        <li>📅 Programar Pago de Nómina</li>
                    </ul>
                    <Link
                        to="/dashboard/tareas"
                        className="mt-4 text-sm font-medium text-red-600 hover:text-red-700 transition duration-150 block"
                    >
                        Ver todas las Tareas
                    </Link>
                </div>
                
                {/* 3. Panel Informativo / Gráfica Local */}
                <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-green-500">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Estado de Flujo de Caja
                    </h3>
                    <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg text-gray-400">
                        <BarChart3 className="h-8 w-8 mr-2" /> [Placeholder: Mini-Gráfica Local]
                    </div>
                </div>
            </div>
        );
    };


    // ----------------------------------------------------
    // RENDERIZADO PRINCIPAL DEL DASHBOARD
    // ----------------------------------------------------
    return (
        <div className="space-y-8 p-4 md:p-8">
            
            {/* 1. Encabezado de Bienvenida (Mejorado con fecha) */}
            <div className="p-6 bg-white rounded-xl shadow-xl border-l-4 border-blue-600">
                <h2 className="text-3xl font-extrabold text-gray-900">
                    ¡Hola, {usuario?.nombre || usuario?.email || 'Administrador'}! 
                </h2>
                <p className="text-gray-600 mt-1">
                    {new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | 
                    Rol: <span className="font-semibold capitalize text-blue-700">{usuario?.rol.replace('_', ' ')}</span>
                </p>
            </div>

            {/* 2. Resumen de Métricas (Tarjetas) */}
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">
                Resumen de Métricas {usuario?.rol === 'Superadmin' ? 'Globales' : 'de tu Empresa'}
            </h3>
            
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    <div className="flex items-center justify-center h-32 bg-gray-200 rounded-xl shadow-md">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded-xl shadow-md"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(stats).map(([title, data]) => (
                        <SummaryCard key={title} title={title} {...data} />
                    ))}
                </div>
            )}
            
            {/* 3. Contenido Principal / Widgets */}
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-2 pt-4">
                Actividad y Acciones Rápidas
            </h3>
            
            <RenderDashboardContent />

        </div>
    );
};

export default Dashboard;