import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; 
import { Briefcase, Mail, Lock, UserPlus } from 'lucide-react'; // Cambié User por Briefcase
import tualLogo from '../assets/icono.png'; 

const RegisterForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState(""); // 🛑 CAMBIO: Nombre del negocio
  
  const [error, setError] = useState(""); 
  const [validationErrors, setValidationErrors] = useState({}); // 🛑 NUEVO: Errores de validación
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // Función de validación frontend
  const validateForm = () => {
      let errors = {};
      
      // 1. Nombre de la empresa
      if (!nombreEmpresa.trim()) {
          errors.nombreEmpresa = "El nombre del negocio es obligatorio.";
      }

      // 2. Contraseñas
      if (password.length < 6) {
          errors.password = "La contraseña debe tener al menos 6 caracteres.";
      }
      if (password !== confirmPassword) {
          errors.confirmPassword = "Las contraseñas no coinciden.";
      }
      
      // 3. Email (Validación básica)
      if (!/\S+@\S+\.\S+/.test(email)) {
          errors.email = "Formato de correo electrónico no válido.";
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0; // Devuelve true si no hay errores
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // 🛑 Paso 1: Ejecutar validación de Frontend
    if (!validateForm()) {
        return; 
    }

    setIsLoading(true);

    try {
      await axios.post("http://localhost:5000/api/auth/register", { 
        // 🛑 Usamos nombreEmpresa en el payload, asumiendo que el backend lo acepta
        nombre: nombreEmpresa, 
        email, 
        password 
      });

      setError(null); 
      alert("✅ Registro exitoso. ¡Ahora puedes iniciar sesión!"); 
      navigate("/login", { replace: true }); 

    } catch (err) {
      // 🛑 Paso 2: Manejo de errores detallado del Backend
      const apiErrorMessage = err.response?.data?.error 
                            || err.response?.data?.message // a veces el mensaje de error viene en 'message'
                            || "Error de red. Asegúrate que el servidor esté encendido.";
                            
      setError(apiErrorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 
                    bg-gradient-to-br from-blue-50 to-indigo-100">
      
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl 
                      transition-all duration-300">
        
        <div className="text-center mb-8">
          <img 
            src={tualLogo} 
            alt="Logo de TUAL" 
            className="h-12 w-auto mx-auto mb-2 drop-shadow-md" 
          />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Registra tu Negocio
          </h2>
          <p className="text-sm text-gray-600">
            Únete a TUAL y comienza a gestionar tus empresas.
          </p>
        </div>

        {/* --- FORMULARIO --- */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Campo de Nombre del Negocio */}
          <div>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre de tu Negocio/Empresa" // 🛑 CAMBIO DE TEXTO
                value={nombreEmpresa}
                onChange={(e) => {setNombreEmpresa(e.target.value); setValidationErrors({})}}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm 
                           focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${validationErrors.nombreEmpresa ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
            </div>
            {validationErrors.nombreEmpresa && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.nombreEmpresa}</p>
            )}
          </div>

          {/* Campo de Correo Electrónico */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => {setEmail(e.target.value); setValidationErrors({})}}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm 
                           focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
            </div>
            {validationErrors.email && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Campo de Contraseña */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Contraseña (mínimo 6 caracteres)"
                value={password}
                onChange={(e) => {setPassword(e.target.value); setValidationErrors({})}}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm 
                           focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${validationErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
            </div>
            {validationErrors.password && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Campo de Confirmar Contraseña */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="password"
                placeholder="Confirmar Contraseña"
                value={confirmPassword}
                onChange={(e) => {setConfirmPassword(e.target.value); setValidationErrors({})}}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm 
                           focus:ring-blue-500 focus:border-blue-500 transition duration-150 ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                required
              />
            </div>
            {validationErrors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Mostrar Error de API */}
          {error && (
            <div className="p-3 text-sm text-white bg-red-600 rounded-lg border border-red-700 font-medium">
              **Error del Servidor:** {error}
            </div>
          )}

          {/* Botón de Registro con Spinner */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent 
                        rounded-lg shadow-lg text-white font-semibold transition-all duration-300 
                        ${
                          isLoading
                            ? 'bg-green-400 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 transform hover:scale-[1.01] ring-4 ring-green-300/50'
                        }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5 mr-2" /> Registrar Negocio
              </>
            )}
          </button>
        </form>
        
        {/* Enlace para iniciar sesión */}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
            Iniciar Sesión
          </Link>
        </p>

      </div>
    </div>
  );
};

export default RegisterForm;