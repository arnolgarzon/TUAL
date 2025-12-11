
import React from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus } from 'lucide-react';
import tualLogo from '../assets/icono.png'; 

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden"> 

      {/* HERO CENTRAL */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-6 py-12 
                       bg-gradient-to-br from-blue-50 to-indigo-100"> 
        <div className="max-w-4xl w-full">
          
          <div className="mb-6 animate-fade-in-down"> 
                
                {/* ICONO DEL LOGO */}
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


          {/* TÍTULO PRINCIPAL */}
          <h2 className="text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
            La plataforma que transforma tu negocio.
          </h2>
          
          {/* DESCRIPCIÓN */}
          <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
            Enfócate en lo que realmente importa. TUAL simplifica por completo la administración y el crecimiento de tu empresa.
          </p>

          {/* BOTONES DE ACCESO */}
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