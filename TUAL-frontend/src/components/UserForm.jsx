// src/components/UserForm.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import { fetchProtectedData, postProtectedData, putProtectedData } from '../utils/api';
import { Save, Loader2, ArrowLeft, AlertTriangle } from 'lucide-react';

// Roles disponibles en el sistema (definidos por el Backend)
const AVAILABLE_ROLES = [
    { value: 'Superadmin', label: 'Super Administrador' }, // Usamos 'Superadmin' ya que ese es el valor en la DB
    { value: 'admin_empresa', label: 'Administrador de Empresa' },
    { value: 'empleado', label: 'Empleado' }
];

const UserForm = ({ isEdit }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { usuario: loggedUser } = useAuth(); // Usuario actualmente logueado
    
    // ----------------------------------------------------
    // ESTADOS
    // ----------------------------------------------------
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '', // Solo se usa en Create y opcionalmente en Update
        rol: AVAILABLE_ROLES[2].value, // Default: empleado
        empresa_id: '',
    });
    const [empresas, setEmpresas] = useState([]); // Para el select de empresas
    const [loadingState, setLoadingState] = useState({
        data: true, // Carga inicial (datos de usuario o empresas)
        submission: false, // Envío del formulario
    });
    const [error, setError] = useState(null);
    const [isPasswordRequired, setIsPasswordRequired] = useState(!isEdit); // Requerido en Create

    // ----------------------------------------------------
    // EFECTO 1: Cargar Empresas y datos del Usuario (si es Edición)
    // ----------------------------------------------------
    useEffect(() => {
        const loadFormData = async () => {
            setLoadingState(prev => ({ ...prev, data: true }));
            setError(null);
            try {
                // 1. Cargar lista de empresas (para el SELECT)
                // Se asume que el Superadmin tiene acceso a la lista completa de empresas.
                const empresasResponse = await fetchProtectedData('/empresas');
                setEmpresas(empresasResponse.empresas || []);
                
                // 2. Si es edición, cargar datos del usuario
                if (isEdit && id) {
                    const userResponse = await fetchProtectedData(`/usuarios/${id}`);
                    setFormData({
                        nombre: userResponse.nombre || '',
                        email: userResponse.email || '',
                        rol: userResponse.rol || AVAILABLE_ROLES[2].value,
                        // Asignamos el ID, no el nombre de la empresa
                        empresa_id: userResponse.empresa_id || '', 
                        password: '', // Nunca precargamos la contraseña
                    });
                    // La contraseña no es obligatoria al editar
                    setIsPasswordRequired(false); 
                }
            } catch (err) {
                console.error("Error al cargar datos del formulario:", err);
                setError(`Error al cargar datos: ${err.message}`);
            } finally {
                setLoadingState(prev => ({ ...prev, data: false }));
            }
        };

        loadFormData();
    }, [isEdit, id]);
    
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
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingState(prev => ({ ...prev, submission: true }));
        setError(null);

        // 🛑 VALIDACIÓN BÁSICA: Asegurar que los campos requeridos estén llenos
        if (!formData.nombre || !formData.email || !formData.rol || (!formData.password && isPasswordRequired)) {
            setError("Por favor, complete todos los campos requeridos.");
            setLoadingState(prev => ({ ...prev, submission: false }));
            return;
        }

        try {
            let response;
            const dataToSubmit = {
                ...formData,
                // Si la empresa_id es vacío (string), enviamos null al backend para la DB
                empresa_id: formData.empresa_id === '' ? null : parseInt(formData.empresa_id),
            };

            if (isEdit) {
                // 🛑 Edición (PUT)
                // Eliminamos la contraseña si está vacía para no hacer un hash vacío o cambiarla accidentalmente.
                if (dataToSubmit.password === '') {
                    delete dataToSubmit.password;
                }
                response = await putProtectedData(`/usuarios/${id}`, dataToSubmit);
            } else {
                // 🛑 Creación (POST)
                response = await postProtectedData('/usuarios', dataToSubmit);
            }

            alert(`Usuario ${isEdit ? 'actualizado' : 'creado'} con éxito!`); // Usar notificación real aquí
            navigate('/dashboard/usuarios'); // Navegar de vuelta a la lista
            
        } catch (err) {
            console.error("Error en la sumisión:", err);
            setError(`Error al ${isEdit ? 'actualizar' : 'crear'} usuario: ${err.message}`);
        } finally {
            setLoadingState(prev => ({ ...prev, submission: false }));
        }
    };
    
    // ----------------------------------------------------
    // RENDERIZADO
    // ----------------------------------------------------
    const title = isEdit ? `Editar Usuario (ID: ${id})` : "Crear Nuevo Usuario";
    
    if (loadingState.data) {
        return <div className="p-6 text-center text-blue-600 flex items-center justify-center"><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Cargando datos...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 bg-white shadow-xl rounded-lg">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/dashboard/usuarios')}
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
                
                {/* 1. Campos de Información Básica */}
                <div className="grid md:grid-cols-2 gap-6 border p-4 rounded-lg bg-gray-50">
                    <div>
                        <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre Completo *</label>
                        <input
                            type="text"
                            name="nombre"
                            id="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email *</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* 2. Campo de Seguridad y Roles */}
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="rol" className="block text-sm font-medium text-gray-700">Rol del Usuario *</label>
                        <select
                            name="rol"
                            id="rol"
                            value={formData.rol}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            // 🛑 PREVENCIÓN: No permitir que el Superadmin cambie su propio rol (si el ID coincide)
                            disabled={isEdit && loggedUser.id === parseInt(id)} 
                        >
                            {AVAILABLE_ROLES.map(role => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                         {isEdit && loggedUser.id === parseInt(id) && (
                            <p className="mt-1 text-xs text-yellow-600">No puedes cambiar tu propio rol.</p>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña {isPasswordRequired ? '*' : '(Dejar vacío para no cambiar)'}</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            required={isPasswordRequired}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={isEdit ? "**********" : "Mínimo 8 caracteres"}
                        />
                         {isEdit && (
                            <p className="mt-1 text-xs text-gray-500">Solo si deseas cambiar la contraseña.</p>
                        )}
                    </div>
                </div>

                {/* 3. Selección de Empresa */}
                <div className="border p-4 rounded-lg bg-gray-50">
                     <label htmlFor="empresa_id" className="block text-sm font-medium text-gray-700">Asignar a Empresa (Opcional)</label>
                        <select
                            name="empresa_id"
                            id="empresa_id"
                            value={formData.empresa_id}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">-- No Asignar Empresa --</option>
                            {empresas.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.nombre}</option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Requerido para roles 'admin_empresa' o 'empleado'.</p>
                </div>

                {/* Botón de Envío */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loadingState.submission}
                        className={`flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-lg transition duration-200 ${
                            loadingState.submission 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        {loadingState.submission ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                {isEdit ? 'Actualizando...' : 'Creando...'}
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                {isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;