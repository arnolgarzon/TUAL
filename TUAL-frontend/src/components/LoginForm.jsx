import React, { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, Lock, Mail, ArrowLeft } from "lucide-react";
import api from "../utils/api";
import tualLogo from "../assets/icono.png";

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const prettyError = (err) => {
    const data = err?.response?.data;

    if (data?.code === "EMAIL_NOT_VERIFIED") {
      return "Tu correo aún no está verificado. Contacta al administrador.";
    }
    if (data?.code === "USER_DISABLED") {
      return "Tu usuario está desactivado. Contacta al administrador.";
    }

    return (
      data?.message ||
      data?.error ||
      "Credenciales incorrectas. Verifica tu correo y contraseña."
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanEmail = String(email).trim().toLowerCase();

      const res = await api.post("/auth/login", {
        email: cleanEmail,
        password,
      });

      const { token, usuario, mustChangePassword } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem(
        "usuario",
        JSON.stringify({
          ...usuario,
          must_change_password: usuario?.must_change_password ?? false,
          email_verificado: usuario?.email_verificado ?? true,
        })
      );

      if (typeof onLogin === "function") {
        onLogin({
          token,
          usuario,
          mustChangePassword: mustChangePassword === true,
        });
      }
    } catch (err) {
      setError(prettyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        {/* HEADER */}
        <div className="text-center mb-6">
          <img
            src={tualLogo}
            alt="TUAL"
            className="h-12 sm:h-14 mx-auto mb-3"
          />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Iniciar sesión
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Accede al panel de tu empresa
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              placeholder="Correo electrónico"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-10 pr-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-10 pr-4 border rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* OLVIDÉ MI CLAVE */}
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <div
              className="text-sm text-red-700 bg-red-100 p-3 rounded-xl"
              aria-live="assertive"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 rounded-xl font-semibold text-white transition-all
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
          >
            {loading ? (
              "Verificando acceso..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                Ingresar
              </span>
            )}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 space-y-4 text-center text-sm">
          <Link to="/crear-empresa" className="text-blue-600 hover:underline">
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
