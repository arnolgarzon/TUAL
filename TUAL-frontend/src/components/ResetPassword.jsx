import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, CheckCircle, AlertTriangle } from "lucide-react";
import api from "../utils/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!/\d/.test(newPassword)) {
      setError("La contraseña debe contener al menos un número.");
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

      // Redirigir al login luego de unos segundos
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-2">
          Restablecer contraseña
        </h2>
        <p className="text-sm text-center text-gray-600 mb-6">
          Ingresa tu nueva contraseña para recuperar el acceso
        </p>

        {success ? (
          <div className="flex flex-col items-center text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
            <p className="text-green-700 font-semibold">
              Contraseña actualizada correctamente
            </p>
            <p className="text-sm text-gray-600">
              Serás redirigido al inicio de sesión…
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
