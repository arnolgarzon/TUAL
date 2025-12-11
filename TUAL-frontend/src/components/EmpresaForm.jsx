// src/components/EmpresaForm.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, UserPlus, Save, Loader2, AlertTriangle, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; 
import { fetchProtectedData, postProtectedData, putProtectedData } from '../utils/api';

const initialForm = {
    nombre: '',
    nit: '',
    telefono: '',
    direccion: '',
    email: '',
    sector: '',
    admin_id: '', // Solo relevante para Super Admin al crear
    estado: 'ACTIVA', // Por defecto
};

const EmpresaForm = ({ isEdit = false }) => {
    const { id } = useParams(); // Captura el ID si estamos en modo edición
    const navigate = useNavigate();
    const { usuario } = useAuth();
    
    const [formData, setFormData] = useState(initialForm);
    const [usuariosAdmin, setUsuariosAdmin] = useState([]); // Lista de Admins para asignar
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const isSuperAdmin = usuario?.rol === 'super_usuario';

    // ----------------------------------------------------
    // LÓGICA DE CARGA (Para modo Edición)
    // ----------------------------------------------------
    useEffect(() => {
        // 1. Cargar lista de posibles administradores (Solo Super Admin)
        if (isSuperAdmin) {
             // 🛑 A FUTURO: Implementar la llamada GET /api/usuarios/admins
             // setUsuariosAdmin(fetchedAdmins); 
             // PLACEHOLDER:
             setUsuariosAdmin([
                { id: 1, nombre: 'Admin Global' },
                { id: 2, nombre: 'Juan Pérez (Admin Empresa 1)' },
             ]);
        }
        
        // 2. Cargar datos de la empresa si estamos editando
        if (isEdit && id) {
            setIsLoading(true);
            // 🛑 A FUTURO: Implementar la llamada GET /api/empresas/:id
            // La lógica de seguridad del Backend debe asegurar que Admin Empresa solo 
            // pueda pedir el detalle de SU empresa.
            
            // PLACEHOLDER de carga:
            setTimeout(() => {
                const fetchedData = {
                    nombre: 'Empresa Demo S.A.S.',
                    nit: '900.123.456-7',
                    telefono: '3001234567',
                    direccion: 'Calle Falsa 123',
                    email: 'contacto@demo.com',
                    sector: 'Tecnología',
                    admin_id: 2,
                    estado: 'ACTIVA',
                };
                setFormData(fetchedData);
                setIsLoading(false);
            }, 500);
        }
    }, [isEdit, id, isSuperAdmin]);


    // ----------------------------------------------------
    // MANEJO DEL FORMULARIO
    // ----------------------------------------------------
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            let response;
            const dataToSend = isSuperAdmin ? formData : (
                // Si NO es Super Admin, solo puede actualizar ciertos campos (nombre, teléfono, etc.)
                // No se le permite cambiar el 'admin_id' o el 'estado'
                { nombre: formData.nombre, telefono: formData.telefono, direccion: formData.direccion, email: formData.email, sector: formData.sector }
            );

            if (isEdit) {
                // Llama al endpoint de Actualización (PUT)
                response = await api.put(`/empresas/${id}`, dataToSend);
                setSuccess("Empresa actualizada exitosamente.");
            } else {
                // Llama al endpoint de Creación (POST)
                response = await api.post('/empresas', dataToSend);
                setSuccess("Empresa registrada exitosamente.");
                // Limpiar formulario si la creación fue exitosa
                setFormData(initialForm); 
            }
            
            // Opcional: Redirigir al listado después de una edición
            if (isEdit) {
                 setTimeout(() => navigate('/dashboard/empresas'), 2000);
            }

        } catch (err) {
            console.error("Error en la operación:", err);
            setError(err.response?.data?.error || "Error al procesar la solicitud.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && isEdit) {
        return <div className="p-10 text-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" /> Cargando datos...</div>;
    }

    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------
    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <Briefcase className="w-6 h-6 mr-3 text-blue-600" />
                {isEdit ? "Editar Empresa #" + id : "Registrar Nueva Empresa"}
            </h2>
            <p className="text-gray-600 mb-8">{isEdit ? "Modifica la información general de la unidad de negocio." : "Asigna un NIT único y un administrador."}</p>

            {/* Mensajes de feedback */}
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex items-center" role="alert">
                    <AlertTriangle className="h-5 w-5 mr-3" />
                    <p>{error}</p>
                </div>
            )}
             {success && (
                <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 flex items-center" role="alert">
                    <Save className="h-5 w-5 mr-3" />
                    <p>{success}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Campo Nombre */}
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                        <input
                            type="text"
                            name="nombre"
                            id="nombre"
                            required
                            value={formData.nombre}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    {/* Campo NIT (Solo visible/editable si es Super Admin o Creación) */}
                    <div>
                        <label htmlFor="nit" className="block text-sm font-medium text-gray-700">NIT/Identificación Fiscal</label>
                        <input
                            type="text"
                            name="nit"
                            id="nit"
                            required={!isEdit || isSuperAdmin}
                            disabled={isEdit && !isSuperAdmin} // No editable al editar, a menos que sea Super Admin
                            value={formData.nit}
                            onChange={handleChange}
                            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm ${isEdit && !isSuperAdmin ? 'bg-gray-100' : ''}`}
                        />
                         {isEdit && !isSuperAdmin && <p className="mt-1 text-xs text-gray-500">El NIT no se puede modificar.</p>}
                    </div>
                </div>

                {/* Campos de Contacto */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
                        <input type="tel" name="telefono" id="telefono" value={formData.telefono} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                    <div>
                        <label htmlFor="sector" className="block text-sm font-medium text-gray-700">Sector</label>
                        <input type="text" name="sector" id="sector" value={formData.sector} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>
                </div>
                
                {/* Campo Dirección */}
                 <div>
                    <label htmlFor="direccion" className="block text-sm font-medium text-gray-700">Dirección Completa</label>
                    <input type="text" name="direccion" id="direccion" value={formData.direccion} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                </div>


                {/* Campos de Administración (Solo Super Admin) */}
                {isSuperAdmin && (
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                        <h3 className="font-bold text-blue-700 mb-3 flex items-center">
                            <UserPlus className="h-5 w-5 mr-2" />
                            Configuración de TUAL (Solo Super Admin)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Asignar Administrador (admin_id) */}
                            <div>
                                <label htmlFor="admin_id" className="block text-sm font-medium text-gray-700">Asignar Administrador</label>
                                <select 
                                    name="admin_id" 
                                    id="admin_id" 
                                    required={!isEdit} // Requerido solo al crear
                                    value={formData.admin_id} 
                                    onChange={handleChange} 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                >
                                    <option value="">Seleccione un usuario...</option>
                                    {usuariosAdmin.map(admin => (
                                        <option key={admin.id} value={admin.id}>{admin.nombre} (ID: {admin.id})</option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Estado de la Empresa */}
                            {isEdit && (
                                <div>
                                    <label htmlFor="estado" className="block text-sm font-medium text-gray-700">Estado de Licencia</label>
                                    <select 
                                        name="estado" 
                                        id="estado" 
                                        value={formData.estado} 
                                        onChange={handleChange} 
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    >
                                        <option value="ACTIVA">ACTIVA</option>
                                        <option value="INACTIVA">INACTIVA</option>
                                        <option value="PENDIENTE">PENDIENTE</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* Botón de envío */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent 
                                rounded-lg shadow-sm text-lg font-medium text-white transition duration-200 
                                ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="h-5 w-5 mr-2" />
                            {isEdit ? "Actualizar Empresa" : "Crear Empresa"}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default EmpresaForm;