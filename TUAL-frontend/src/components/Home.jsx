import React from "react";
import { Link } from "react-router-dom";
import LoginForm from "./LoginForm";

const Home = ({ usuario, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">TUAL</h1>
        {usuario && (
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            Cerrar sesión
          </button>
        )}
      </header>

      <main className="flex-1 p-6">
        <h2 className="text-xl font-semibold mb-4">
          Bienvenido {usuario ? usuario.email : "invitado"}
        </h2>

        {!usuario ? (
          <div>
            <p className="text-gray-700 mb-4">
              Por favor inicia sesión para acceder a tus empresas y módulos.
            </p>
            <LoginForm onLogin={() => window.location.reload()} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card Empresas */}
            <div className="bg-white shadow rounded p-4">
              <h3 className="text-lg font-bold mb-2">Empresas</h3>
              <p className="text-gray-600 mb-3">
                Administra y consulta la información de tus empresas.
              </p>
              <Link
                to="/empresas"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
              >
                Ir a Empresas
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-200 text-center p-4 text-sm text-gray-600">
        © {new Date().getFullYear()} TUAL - Plataforma modular de gestión
      </footer>
    </div>
  );
};

export default Home;