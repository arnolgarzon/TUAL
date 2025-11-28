import React from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus, ArrowRight } from 'lucide-react';
import tualLogo from '../assets/icono.png'; // Tu logo (solo el icono)


const Home = ({ usuario, onLogout }) => {
  return (
    // Aseguramos que el contenedor principal NO tiene scroll, si el scroll aparece, 
    // es forzado por el navegador/OS, no por el contenido de los divs.
    <div className="min-h-screen flex flex-col bg-gray-900 overflow-hidden"> 
      
      {/* HEADER CONDICIONAL */}
      {usuario && (
        <header className="bg-white/95 backdrop-blur-sm shadow-lg p-4 flex justify-between items-center sticky top-0 z-20 border-b border-gray-100">
          <Link to="/" className="flex items-center space-x-2">
            <img src={tualLogo} alt="Logo de TUAL" className="h-7 w-auto" /> 
            <span className="text-2xl font-extrabold text-gray-900">TUAL</span> {/* CLASE CORREGIDA */}
          </Link>
          <div className="flex items-center space-x-4">
            <p className="text-sm font-medium text-gray-700 hidden sm:block">
              Hola, <strong className="text-blue-600">{usuario.email.split('@')[0]}</strong>
            </p>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-transform duration-200 hover:scale-[1.03] shadow-md"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>
      )}

      {/* HERO CENTRAL */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-6 py-6 
                       bg-gradient-to-br from-blue-50 to-indigo-100"> 
        <div className="max-w-4xl w-full">
          
          {/* Contenido Superior del Hero (Logo, Marca, Eslogan) */}
          {!usuario ? ( 
            <div className="mb-6 animate-fade-in-down"> 
                
                {/* ICONO DEL LOGO: REDUCIDO a h-32 */}
                <img 
                    src={tualLogo} 
                    alt="Logo de TUAL" 
                    className="h-32 w-auto mx-auto mb-3 drop-shadow-2xl" 
                />
                
                {/* NOMBRE DE LA MARCA */}
                <h1 className="text-7xl font-extrabold text-gray-900 mb-1"> 
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800">TUAL</span>
                </h1>
                
                {/* ESLOGAN */}
                <p className="text-xl font-semibold uppercase tracking-widest text-blue-600">
                    Gestión Inteligente
                </p>
            </div>
          ) : ( 
            <div className="mb-8"></div>
          )}

          {/* TÍTULO PRINCIPAL DINÁMICO */}
          <h2 className="text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
            {usuario ? (
                `¡Bienvenido de nuevo, ${usuario.email.split('@')[0]}!`
            ) : (
                `La plataforma que transforma tu negocio.`
            )}
          </h2>
          
          {/* DESCRIPCIÓN DINÁMICA */}
          <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
            {usuario ? (
                "Accede a todos tus módulos de gestión. ¡Estamos listos para hacer crecer tu negocio!"
            ) : (
                `Enfócate en lo que realmente importa. TUAL simplifica por completo la administración y el crecimiento de tu empresa.`
            )}
          </p>

          {/* BOTONES PRINCIPALES */}
          {!usuario ? (
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
              <Link
                to="/login"
                className="inline-flex items-center justify-center w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-[1.05] ring-4 ring-transparent hover:ring-blue-400/50"
              >
                <LogIn className="w-5 h-5 mr-2" /> Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center w-full sm:w-auto bg-white border border-gray-300 text-gray-800 font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.05] hover:shadow-xl hover:text-blue-600"
              >
                <UserPlus className="w-5 h-5 mr-2 text-blue-600" /> Registrarse Ahora
              </Link>
            </div>
          ) : (
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-[1.05] ring-4 ring-emerald-300/50"
            >
              Ir a mis Módulos <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full bg-gray-900 text-center p-4 text-sm text-gray-400 border-t border-blue-500">
        © {new Date().getFullYear()} TUAL · Tu negocio, más simple ·
        <span className="text-blue-400 hover:text-blue-300 ml-1"> Privacidad</span>
      </footer>
    </div>
  );
};

export default Home;