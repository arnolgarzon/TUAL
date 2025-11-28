import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Importamos useNavigate
import { LogIn, Lock, Mail, UserPlus } from 'lucide-react'; 
import tualLogo from '../assets/icono.png'; 

// El componente se llama LoginForm para coincidir con tu archivo.
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate(); // Inicializar el hook de navegación

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); 
    setIsLoading(true);

    console.log(email, password);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // 1. Guardar token
      localStorage.setItem("token", res.data.token);

      // 2. Actualizar estado global del usuario (llama a handleLogin en App.jsx)
      onLogin(res.data.usuario);
      
      // 3. REDIRECCIÓN EXITOSA
      navigate("/", { replace: true }); // Redirigir al Home sin recargar

    } catch (err) {
      // Manejar el error de la API
      setError(err.response?.data?.error || "Error al iniciar sesión. Verifica tus credenciales.");
      
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    // Fondo similar al Home para coherencia
    <div className="min-h-screen flex items-center justify-center p-4 
                    bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* Tarjeta del Formulario: Centrada y Elevada */}
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl 
                      transition-all duration-300 transform hover:shadow-3xl">
        
        {/* Encabezado del Formulario */}
        <div className="text-center mb-8">
          <img 
            src={tualLogo} 
            alt="Logo de TUAL" 
            className="h-12 w-auto mx-auto mb-2 drop-shadow-md" 
          />
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            Iniciar Sesión
          </h2>
          <p className="text-sm text-gray-600">
            Bienvenido de vuelta. ¡Gestiona tu negocio!
          </p>
        </div>

        {/* --- FORMULARIO CON LÓGICA INTEGRADA --- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Campo de Correo Electrónico */}
          <div>
            <label htmlFor="email" className="sr-only">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Correo Electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
              />
            </div>
          </div>

          {/* Campo de Contraseña */}
          <div>
            <label htmlFor="password" className="sr-only">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg 
                           focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm"
              />
            </div>
          </div>
          
          {/* Mostrar Error */}
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg border border-red-300">
              {error}
            </div>
          )}

          {/* Opción de "¿Olvidaste la Contraseña?" */}
          <div className="flex items-center justify-end text-sm">
            <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Botón de Login */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent 
                        rounded-lg shadow-lg text-white font-semibold transition-all duration-300 
                        ${
                          isLoading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.01] ring-4 ring-blue-300/50'
                        }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" /> Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Enlace para registrarse */}
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Eres nuevo en TUAL?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 transition-colors flex items-center justify-center mt-2">
            <UserPlus className="w-4 h-4 mr-1" /> Crea una cuenta aquí
          </Link>
        </p>

      </div>
    </div>
  );
};

export default LoginForm;