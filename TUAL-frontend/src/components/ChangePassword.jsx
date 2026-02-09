import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";

export default function ChangePassword() {
  const navigate = useNavigate();
  const { usuario, logout, setAuthenticatedUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setOk("");
    setLoading(true);

    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      // ✅ Desbloquear localmente (sin esperar relogin)
      const storedStr = localStorage.getItem("usuario");
      const storedUser = storedStr ? JSON.parse(storedStr) : null;

      const updatedUser = {
        ...(storedUser || usuario || {}),
        must_change_password: false,
      };

      localStorage.setItem("usuario", JSON.stringify(updatedUser));

      // Actualiza estado de Auth (manteniendo token actual)
      const token = localStorage.getItem("token");
      setAuthenticatedUser({ token, usuario: updatedUser, mustChangePassword: false });

      setOk("Contraseña actualizada. Continuando...");
      setTimeout(() => navigate("/dashboard", { replace: true }), 500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error cambiando contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16 }}>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 16,
        }}
      >
        <h2>Cambiar contraseña</h2>
        <p style={{ color: "#555", marginTop: 6 }}>
          {usuario?.email ? `Usuario: ${usuario.email}` : "Debes cambiar tu contraseña para continuar."}
        </p>

        {error ? (
          <div style={{ marginTop: 12, padding: 10, background: "#ffe6e6", color: "#900" }}>
            {error}
          </div>
        ) : null}

        {ok ? (
          <div style={{ marginTop: 12, padding: 10, background: "#e6ffef", color: "#0a5" }}>
            {ok}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <input
            type="password"
            placeholder="Contraseña actual"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Nueva contraseña (mín 8 + 1 número)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Guardando..." : "Cambiar contraseña"}
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/", { replace: true });
            }}
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  );
}