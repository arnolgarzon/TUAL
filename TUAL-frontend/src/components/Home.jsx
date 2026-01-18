import React from "react";
import { Link } from "react-router-dom";
import { LogIn, Building2 } from "lucide-react";
import tualLogo from "../assets/icono.png";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">

      {/* HERO */}
      <main className="flex-grow flex items-center justify-center px-4 sm:px-6 py-12">
        <div className="w-full max-w-5xl text-center">

          {/* LOGO + MARCA */}
          <div className="mb-8">
            <img
              src={tualLogo}
              alt="Logo de TUAL"
              className="h-24 sm:h-28 md:h-32 w-auto mx-auto mb-4 drop-shadow-xl"
            />

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800">
                TUAL
              </span>
            </h1>

            <p className="mt-2 text-sm sm:text-base font-semibold tracking-widest uppercase text-blue-600">
              Plataforma de gestión empresarial
            </p>
          </div>

          {/* MENSAJE PRINCIPAL */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5 leading-tight">
            Controla tu empresa desde un solo lugar
          </h2>

          <p className="text-base sm:text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
            TUAL es un sistema inteligente para administrar clientes, usuarios,
            facturación y operaciones de tu empresa de forma simple, segura y escalable.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              to="/crear-empresa"
              className="inline-flex items-center justify-center w-full sm:w-auto 
                         bg-blue-600 hover:bg-blue-700 text-white font-bold 
                         px-8 py-4 rounded-xl shadow-xl 
                         transition-all duration-300 transform hover:scale-[1.03]"
            >
              <Building2 className="w-5 h-5 mr-2" />
              Crear mi empresa
            </Link>

            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full sm:w-auto 
                         bg-white border border-gray-300 text-gray-800 font-semibold 
                         px-8 py-4 rounded-xl shadow-md 
                         transition-all duration-300 hover:text-blue-600"
            >
              <LogIn className="w-5 h-5 mr-2 text-blue-600" />
              Ya tengo cuenta
            </Link>
          </div>

          {/* MENSAJE DE CONFIANZA */}
          <p className="mt-8 text-sm text-gray-500">
            Ideal para pequeñas y medianas empresas que quieren crecer sin complicaciones.
          </p>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-center py-4 text-xs sm:text-sm text-gray-400">
        © {new Date().getFullYear()} TUAL · Gestión empresarial moderna
        <br />
        Design by ARNOL GARZON
      </footer>
    </div>
  );
};

export default Home;
