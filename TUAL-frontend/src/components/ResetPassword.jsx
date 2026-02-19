import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Lock,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import api from "../utils/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordValid = newPassword.length >= 8 && /\d/.test(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!passwordValid) {
      setError(
        "La contraseña debe tener mínimo 8 caracteres e incluir al menos un número."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      await api.post(`/auth/reset-password/${token}`, {
        newPassword,
      });

      setSuccess(true);

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2500);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "El enlace de recuperación es inválido o ha expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* LADO IZQUIERDO - Branding (Solo en desktop) */}
      <div className="hidden lg:flex w-1/2 bg-blue-700 text-white items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <h1 className="text-4xl font-bold">TUAL</h1>
          <p className="text-blue-100 leading-relaxed">
            Plataforma de gestión empresarial diseñada para optimizar cada
            proceso de tu organización.
          </p>

          <div className="flex items-center gap-3 text-blue-100">
            <ShieldCheck className="h-6 w-6" />
            <span>Seguridad y control centralizado</span>
          </div>
        </div>
      </div>

      {/* LADO DERECHO - Formulario */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Restablecer contraseña
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Define una nueva contraseña para continuar
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center text-center space-y-4">
              <CheckCircle className="h-14 w-14 text-green-600" />
              <p className="text-green-700 font-semibold">
                Contraseña actualizada correctamente
              </p>
              <p className="text-sm text-gray-500">
                Serás redirigido al inicio de sesión…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Nueva contraseña */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Nueva contraseña
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  />
                </div>

                {/* Indicador de fortaleza */}
                {newPassword && (
                  <p
                    className={`text-xs mt-2 ${
                      passwordValid
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {passwordValid
                      ? "Contraseña segura"
                      : "Debe tener mínimo 8 caracteres y un número"}
                  </p>
                )}
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(e.target.value)
                    }
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
                  <AlertTriangle className="h-4 w-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    Actualizando...
                  </>
                ) : (
                  "Actualizar contraseña"
                )}
              </button>

              {/* Volver al login */}
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Volver al inicio de sesión
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
