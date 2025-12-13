// src/components/TallerForm.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchProtectedData, postProtectedData } from '../utils/api';
import { Save, Loader2, ArrowLeft, AlertTriangle, Contact, Car } from 'lucide-react';

const TallerForm = ({ isEdit }) => {
    const navigate = useNavigate();
    const { usuario } = useAuth();

    // ----------------------------------------------------
    // ESTADOS
    // ----------------------------------------------------
    const [formData, setFormData] = useState({
        cliente_id: '',
        vehiculo_id: '',
        motivo_visita: '',
        estado: 'Recibido', // Estado por defecto
    });
    const [clientes, setClientes] = useState([]);
    const [vehiculos, setVehiculos] = useState([]);

    // ✅ NUEVO: Estados para la búsqueda y selección
    const [searchTermCliente, setSearchTermCliente] = useState('');
    const [filteredClientes, setFilteredClientes] = useState([]);
    const [selectedCliente, setSelectedCliente] = useState(null);

    const [searchTermVehiculo, setSearchTermVehiculo] = useState('');
    const [filteredVehiculos, setFilteredVehiculos] = useState([]);
    const [selectedVehiculo, setSelectedVehiculo] = useState(null);

    const [loadingState, setLoadingState] = useState({
        data: true,
        submission: false,
    });
    const [error, setError] = useState(null);


    // ----------------------------------------------------
    // EFECTO 1: Cargar Clientes y Vehículos
    // ----------------------------------------------------
    useEffect(() => {
        const loadClientesVehiculos = async () => {
            setLoadingState(prev => ({ ...prev, data: true }));
            setError(null);
            try {
                const clientesResponse = await fetchProtectedData('/clientes');
                setClientes(clientesResponse.clientes || []);

                const vehiculosResponse = await fetchProtectedData('/vehiculos');
                setVehiculos(vehiculosResponse.vehiculos || []);

            } catch (err) {
                console.error("Error al cargar clientes y vehículos:", err);
                setError(`Error al cargar datos: ${err.message}`);
            } finally {
                setLoadingState(prev => ({ ...prev, data: false }));
            }
        };

        loadClientesVehiculos();
    }, []);

    // ✅ NUEVO: EFECTO 2: Filtrar clientes según el término de búsqueda
    useEffect(() => {
        if (searchTermCliente) {
            const lowercasedTerm = searchTermCliente.toLowerCase();
            setFilteredClientes(
                clientes.filter(c =>
                    c.nombre.toLowerCase().includes(lowercasedTerm) ||
                    c.email?.toLowerCase().includes(lowercasedTerm)
                )
            );
        } else {
            setFilteredClientes([]);
        }
    }, [searchTermCliente, clientes]);

    // ✅ NUEVO: EFECTO 3: Filtrar vehículos del cliente seleccionado
    useEffect(() => {
        if (selectedCliente && searchTermVehiculo) {
            const lowercasedTerm = searchTermVehiculo.toLowerCase();
            const vehiculosDelCliente = vehiculos.filter(v => v.cliente_id === selectedCliente.id);
            setFilteredVehiculos(vehiculosDelCliente.filter(v => v.placa.toLowerCase().includes(lowercasedTerm)));
        } else {
            setFilteredVehiculos([]);
        }
    }, [searchTermVehiculo, vehiculos, selectedCliente]);

    // ----------------------------------------------------
    // MANEJADORES
    // ----------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ✅ NUEVO: Manejadores para la selección
    const handleSelectCliente = (cliente) => {
        setSelectedCliente(cliente);
        setFormData(prev => ({ ...prev, cliente_id: cliente.id }));
        setSearchTermCliente('');
        setFilteredClientes([]);
    };

    const handleSelectVehiculo = (vehiculo) => {
        setSelectedVehiculo(vehiculo);
        setFormData(prev => ({ ...prev, vehiculo_id: vehiculo.id }));
        setSearchTermVehiculo('');
        setFilteredVehiculos([]);
    };

    const resetCliente = () => {
        setSelectedCliente(null);
        setFormData(prev => ({ ...prev, cliente_id: '', vehiculo_id: '' })); // Resetear también vehículo
        setSelectedVehiculo(null);
    };

    const resetVehiculo = () => {
        setSelectedVehiculo(null);
        setFormData(prev => ({ ...prev, vehiculo_id: '' }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingState(prev => ({ ...prev, submission: true }));
        setError(null);

        if (!formData.cliente_id || !formData.vehiculo_id || !formData.motivo_visita) {
            setError("Por favor, complete todos los campos requeridos.");
            setLoadingState(prev => ({ ...prev, submission: false }));
            return;
        }

        try {
            // 🛑 Creación (POST)
            const response = await postProtectedData('/taller', formData);

            alert("Orden de taller creada con éxito!");
            navigate('/dashboard/taller');

        } catch (err) {
            console.error("Error en la sumisión:", err);
            setError(`Error al crear orden: ${err.message}`);
        } finally {
            setLoadingState(prev => ({ ...prev, submission: false }));
        }
    };

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------
    const title = "Crear Nueva Orden de Taller";

    if (loadingState.data) {
        return <div className="p-6 text-center text-blue-600 flex items-center justify-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Cargando datos...</div>;
    }

    if (error) {
        return (
            <div className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-lg text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Error al Cargar</h2>
                <p className="text-red-700 bg-red-100 p-3 rounded-md">{error}</p>
                <button
                    onClick={() => navigate('/dashboard/taller')}
                    className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" /> Volver al Listado
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-lg">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/dashboard/taller')}
                    className="p-2 mr-4 text-gray-600 hover:text-blue-600 transition"
                    title="Volver al listado"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-3xl font-extrabold text-gray-800">{title}</h1>
            </div>

            {/* Mensaje de Error */}
            {error && (
                <div className="mb-4 flex items-center p-3 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50">
                    <AlertTriangle className="w-5 h-5 mr-3" />
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* 1. Búsqueda y Selección de Cliente */}
                <div className="p-4 border rounded-lg bg-gray-50 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">1. Buscar Cliente *</label>
                    {selectedCliente ? (
                        <div className="flex items-center justify-between p-3 bg-blue-100 border border-blue-300 rounded-md">
                            <div>
                                <p className="font-bold text-blue-800">{selectedCliente.nombre}</p>
                                <p className="text-sm text-blue-700">{selectedCliente.email}</p>
                            </div>
                            <button type="button" onClick={resetCliente} className="text-sm text-red-600 hover:underline">Cambiar</button>
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Escribe el nombre o email del cliente..."
                                value={searchTermCliente}
                                onChange={(e) => setSearchTermCliente(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            {filteredClientes.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    {filteredClientes.map(cliente => (
                                        <li key={cliente.id} onClick={() => handleSelectCliente(cliente)} className="p-2 hover:bg-blue-50 cursor-pointer">
                                            {cliente.nombre} ({cliente.email})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    <Link to="/dashboard/clientes/crear" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center">
                        <Contact className="w-4 h-4 mr-1" /> O crear un nuevo cliente
                    </Link>
                </div>

                {/* 2. Búsqueda y Selección de Vehículo */}
                <div className={`p-4 border rounded-lg space-y-2 ${!selectedCliente ? 'bg-gray-200' : 'bg-gray-50'}`}>
                    <label className={`block text-sm font-medium ${!selectedCliente ? 'text-gray-400' : 'text-gray-700'}`}>2. Buscar Vehículo *</label>
                    {selectedVehiculo ? (
                        <div className="flex items-center justify-between p-3 bg-green-100 border border-green-300 rounded-md">
                            <div>
                                <p className="font-bold text-green-800">{selectedVehiculo.marca} {selectedVehiculo.modelo}</p>
                                <p className="text-sm text-green-700">Placa: {selectedVehiculo.placa}</p>
                            </div>
                            <button type="button" onClick={resetVehiculo} className="text-sm text-red-600 hover:underline">Cambiar</button>
                        </div>
                    ) : (
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={selectedCliente ? "Escribe la placa del vehículo..." : "Selecciona un cliente primero"}
                                value={searchTermVehiculo}
                                onChange={(e) => setSearchTermVehiculo(e.target.value)}
                                disabled={!selectedCliente}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            />
                            {filteredVehiculos.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                                    {filteredVehiculos.map(vehiculo => (
                                        <li key={vehiculo.id} onClick={() => handleSelectVehiculo(vehiculo)} className="p-2 hover:bg-blue-50 cursor-pointer">
                                            {vehiculo.marca} {vehiculo.modelo} ({vehiculo.placa})
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    <Link to="/dashboard/vehiculos/crear" target="_blank" className="text-blue-600 hover:text-blue-800 text-sm inline-flex items-center">
                        <Car className="w-4 h-4 mr-1" /> O crear un nuevo vehículo
                    </Link>
                </div>

                {/* 3. Motivo de Visita y Detalles de Recepción */}
                <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                    <label className="block text-sm font-medium text-gray-700">3. Detalles de la Recepción</label>
                    <div>
                        <label htmlFor="motivo_visita" className="block text-sm font-medium text-gray-700">Motivo de Visita *</label>
                        <textarea
                            id="motivo_visita"
                            name="motivo_visita"
                            rows="3"
                            value={formData.motivo_visita}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: Mantenimiento de 10,000 km, ruido en el motor al encender..."
                        />
                    </div>
                    {/* ✅ NUEVO: Campos para detalles del vehículo */}
                    <div>
                        <label htmlFor="observaciones_vehiculo" className="block text-sm font-medium text-gray-700">Observaciones del Estado del Vehículo (Rayones, Golpes, etc.)</label>
                        <textarea
                            id="observaciones_vehiculo"
                            name="observaciones_vehiculo"
                            rows="3"
                            value={formData.observaciones_vehiculo || ''}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej: Rayón en puerta delantera derecha, golpe leve en parachoques trasero."
                        />
                    </div>
                </div>

                {/* Botón de Envío */}
                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loadingState.submission || !selectedCliente || !selectedVehiculo}
                        className={`flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm transition duration-200 ${loadingState.submission || !selectedCliente || !selectedVehiculo
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                    >
                        {loadingState.submission ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Crear Orden
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TallerForm;