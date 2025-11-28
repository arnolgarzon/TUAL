// src/components/Dashboard.jsx

import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Briefcase, Users, FileText, Settings, PlusCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Datos de ejemplo para las tarjetas de resumen
const summaryData = [
    { title: 'Empresas Activas', value: 1, icon: Briefcase, color: 'bg-blue-500', link: '/dashboard/empresas' },
    { title: 'Usuarios Activos', value: 5, icon: Users, color: 'bg-green-500', link: '/dashboard/usuarios' },
    { title: 'Facturas Pendientes', value: 3, icon: FileText, color: 'bg-yellow-500', link: '/dashboard/facturas' },
    { title: 'Configuración Pendiente', value: 'Baja', icon: Settings, color: 'bg-indigo-500', link: '/dashboard/configuracion' },
];

const Dashboard = () => {
    const { usuario } = useAuth(); // Obtenemos el usuario autenticado

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
                    <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
                </div>
            </div>
            <div className="flex items-center text-sm font-medium text-blue-600 mt-4">
                Ver más
                <ArrowRight className="h-4 w-4 ml-1" />
            </div>
        </Link>
    );

    // ----------------------------------------------------
    // RENDERIZADO PRINCIPAL
    // ----------------------------------------------------
    return (
        <div className="space-y-6">
            
            {/* 1. Encabezado de Bienvenida */}
            <div className="p-6 bg-white rounded-xl shadow-xl border-l-4 border-blue-600">
                <h2 className="text-3xl font-extrabold text-gray-900">
                    ¡Bienvenido, {usuario?.nombre || usuario?.email || 'Administrador'}! 
                </h2>
                <p className="text-gray-600 mt-1">
                    Este es tu Panel de Control Central. Revisa un resumen de tu actividad.
                </p>
            </div>

            {/* 2. Resumen de Métricas (Tarjetas) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryData.map((data, index) => (
                    <SummaryCard key={index} {...data} />
                ))}
            </div>

            {/* 3. Acciones Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Botón para crear nueva empresa */}
                <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-purple-500">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Crear Nueva Empresa
                    </h3>
                    <p className="text-gray-600 mt-2 text-sm">
                        Registra una nueva unidad de negocio o cliente bajo tu cuenta TUAL.
                    </p>
                    <Link
                        to="/dashboard/empresas/crear" // Asume esta ruta en el futuro
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent 
                                   text-sm font-medium rounded-lg shadow-sm text-white 
                                   bg-purple-600 hover:bg-purple-700 transition duration-150"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Registrar Empresa
                    </Link>
                </div>

                {/* Área para Gráficas o Avisos */}
                <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-red-500">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Avisos y Novedades
                    </h3>
                    <p className="text-gray-600 mt-2 text-sm">
                        ⚠️ **Falta de Configuración:** Por favor, completa tu zona horaria en Configuración.
                    </p>
                    <Link
                        to="/dashboard/configuracion"
                        className="mt-4 text-sm font-medium text-red-600 hover:text-red-700 transition duration-150"
                    >
                        Ir a Configuración
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;