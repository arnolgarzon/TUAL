import React, { useState } from "react";
import { Mail, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Debes ingresar tu correo electrónico.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "No fue posible procesar la solicitud. Intenta más tarde."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-2">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="text-sm text-center text-gray-600 mb-6">
          Ingresa tu correo y te enviaremos un enlace para restablecerla
        </p>

        {success ? (
          <div className="flex flex-col items-center text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <p className="text-green-700 font-semibold">
              Revisa tu correo electrónico
            </p>
            <p className="text-sm text-gray-600">
              Si el correo existe, recibirás un enlace para restablecer tu
              contraseña.
            </p>

            <Link
              to="/login"
              className="inline-flex items-center text-blue-600 hover:underline mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="h-4 w-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
            </button>

            <div className="pt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
