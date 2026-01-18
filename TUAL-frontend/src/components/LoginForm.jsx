import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Lock, Mail, ArrowLeft } from "lucide-react";
import api from "../utils/api";
import tualLogo from "../assets/icono.png";

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);

      onLogin(res.data.usuario);

      navigate("/dashboard", { replace: true });

    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Credenciales incorrectas. Verifica tu correo y contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        {/* HEADER */}
        <div className="text-center mb-8">
          <img src={tualLogo} alt="TUAL" className="h-14 mx-auto mb-3" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Iniciar sesión
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Accede al panel de tu empresa
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Correo electrónico"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Contraseña"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition
              ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? (
              "Verificando acceso..."
            ) : (
              <span className="flex items-center justify-center">
                <LogIn className="w-5 h-5 mr-2" />
                Ingresar
              </span>
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 space-y-4 text-center text-sm">

          <Link
            to="/crear-empresa"
            className="text-blue-600 hover:underline"
          >
            ¿Aún no tienes empresa en TUAL? Crear una
          </Link>

          <div className="pt-4 border-t">
            <Link
              to="/"
              className="inline-flex items-center text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
