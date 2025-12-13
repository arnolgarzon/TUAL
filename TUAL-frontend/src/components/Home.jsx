import React from "react";
import { Link } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import tualLogo from "../assets/icono.png";

// Componente reutilizable de botón
const Button = ({ children, variant = "primary", to }) => {
  const base =
    "inline-flex items-center justify-center px-8 py-3 rounded-xl font-bold transition-all duration-300 transform";
  const styles =
    variant === "primary"
      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-2xl hover:scale-[1.05] ring-4 ring-transparent hover:ring-blue-400/50"
      : "bg-white border border-gray-300 text-gray-800 hover:text-blue-600 hover:shadow-xl hover:scale-[1.05]";
  return (
    <Link to={to} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
};

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* HERO CENTRAL */}
      <main className="flex-grow flex flex-col justify-center items-center text-center px-6 py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-800">
                TUAL
              </span>
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
            Enfócate en lo que realmente importa. TUAL simplifica por completo
            la administración y el crecimiento de tu empresa.
          </p>

          {/* BOTONES DE ACCESO */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Button to="/login" variant="primary">
              <LogIn className="w-5 h-5 mr-2" /> Iniciar sesión
            </Button>
            <Button to="/register" variant="secondary">
              <UserPlus className="w-5 h-5 mr-2 text-blue-600" /> Registrarse
              Ahora
            </Button>
          </div>
        </div>
      </main>

      {/* SECCIÓN DE FEATURES */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center mb-12">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Todo lo que tu negocio necesita
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Herramientas simples, potentes y seguras para crecer sin
            complicaciones.
          </p>
        </div>

        {/* GRID DE FEATURES */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 */}
          <div className="flex flex-col items-center text-center p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 17v-6h13v6H9zM4 6h16v2H4z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Dashboard claro
            </h4>
            <p className="text-gray-600">
              Visualiza todo en un panel minimalista y moderno.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center text-center p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-indigo-100 p-4 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-indigo-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">
              Automatización
            </h4>
            <p className="text-gray-600">
              Ahorra tiempo con procesos inteligentes y automáticos.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center text-center p-6 rounded-xl shadow-md hover:shadow-lg transition">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 11c0-1.1.9-2 2-2h6v6h-6c-1.1 0-2-.9-2-2z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Seguridad</h4>
            <p className="text-gray-600">
              Tus datos siempre protegidos con estándares de confianza.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-gray-900 text-center p-6 text-sm text-gray-400 border-t border-blue-500">
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <Link to="/privacy" className="hover:text-blue-300">
            Privacidad
          </Link>
          <Link to="/terms" className="hover:text-blue-300">
            Términos
          </Link>
          <Link to="/about" className="hover:text-blue-300">
            Sobre TUAL
          </Link>
        </div>
        <p className="mt-4">
          © {new Date().getFullYear()} TUAL · Tu negocio, más simple
        </p>
      </footer>
    </div>
  );
};

export default Home;