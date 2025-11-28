import React from "react";
// 1. IMPORTAR useNavigate
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"; 
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import EmpresaList from "./components/EmpresaList";

// 2. Importamos el hook que maneja toda la lógica de autenticación, carga y persistencia
// ASUMIMOS: useAuth devuelve { usuario, isLoading, setAuthenticatedUser }
import { useAuth } from "./hooks/useAuth"; 

function App() {
  // 3. OBTENER EL ESTADO COMPLETO DEL HOOK
  const { usuario, isLoading, setAuthenticatedUser } = useAuth();
  const navigate = useNavigate();

  // 4. FUNCIÓN DE LOGIN (Actualiza el estado y navega, sin recarga)
  const handleLogin = (usuarioData) => {
    // El LoginForm se encarga de guardar el token en localStorage.
    // Aquí solo actualizamos el estado en tiempo real.
    setAuthenticatedUser(usuarioData); 
    navigate("/", { replace: true }); 
  };

  // 5. FUNCIÓN DE LOGOUT (Limpia el estado y navega)
  const handleLogout = () => {
    // Limpiar token
    localStorage.removeItem("token");
    setAuthenticatedUser(null); 
    // Redirigir al home
    navigate("/"); 
  };
  
  // 6. SOLUCIÓN AL FLICKER: BLOQUEO DE RENDERIZADO INICIAL
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-xl">
            <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
            </svg>
            <h1 className="text-gray-800 text-lg font-medium">Verificando sesión...</h1>
        </div>
      </div>
    ); 
  }

  return (
    <Routes>
      {/* 7. RUTAS OPTIMIZADAS */}
      
      <Route 
        path="/" 
        element={<Home usuario={usuario} onLogout={handleLogout} />} 
      />

      {/* Autenticación: Si ya está logueado, redirigir a Home */}
      <Route 
        path="/login" 
        element={
          usuario 
            ? <Navigate to="/" replace /> 
            : <LoginForm onLogin={handleLogin} /> 
        } 
      />
      
      <Route path="/register" element={usuario ? <Navigate to="/" replace /> : <RegisterForm />} /> 

      {/* Rutas privadas (usando replace para limpiar el historial) */}
      <Route
        path="/empresas"
        element={usuario ? <EmpresaList usuario={usuario} /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/usuarios"
        element={usuario ? <div>Gestión de usuarios</div> : <Navigate to="/login" replace />}
      />
      <Route
        path="/configuracion"
        element={usuario ? <div>Configuración de la app</div> : <Navigate to="/login" replace />}
      />
      
      {/* Fallback para rutas no encontradas */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;