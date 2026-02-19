import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  LogIn,
  Lock,
  Mail,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import api from "../utils/api";
import tualLogo from "../assets/icono.png";

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* PANEL IZQUIERDO – Branding (Desktop) */}
      <div className="hidden lg:flex w-1/2 bg-blue-700 text-white items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <img src={tualLogo} alt="TUAL" className="h-16" />
          <h1 className="text-4xl font-bold leading-tight">
            Gestión empresarial inteligente
          </h1>
          <p className="text-blue-100">
            Centraliza clientes, órdenes, inventario y finanzas en una sola
            plataforma diseñada para crecer contigo.
          </p>

          <div className="flex items-center gap-3 text-blue-100">
            <ShieldCheck className="h-6 w-6" />
            <span>Acceso seguro y controlado</span>
          </div>
        </div>
      </div>

      {/* PANEL DERECHO – Login */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

          {/* HEADER */}
          <div className="text-center mb-8">
            <img
              src={tualLogo}
              alt="TUAL"
              className="h-12 mx-auto mb-3 lg:hidden"
            />
            <h2 className="text-2xl font-bold text-gray-900">
              Iniciar sesión
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Accede al panel administrativo de tu empresa
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <div
                className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg"
                aria-live="assertive"
              >
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.98]"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Verificando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Ingresar
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 space-y-4 text-center text-sm">
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
    </div>
  );
};

export default LoginForm;
