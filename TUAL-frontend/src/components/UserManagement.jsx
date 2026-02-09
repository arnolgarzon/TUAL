import React, { useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../hooks/useAuth";

export default function UserManagement() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "empleado",
  });

  const isAdminEmpresa = useMemo(
    () => String(user?.rol || "").toLowerCase() === "admin_empresa",
    [user]
  );

  const fetchUsuarios = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/empresa/usuarios");
      setUsuarios(res.data?.usuarios || []);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.response?.data?.error ||
          "Error cargando usuarios"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/empresa/usuarios", form);
      setForm({ nombre: "", email: "", password: "", rol: "empleado" });
      fetchUsuarios();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.response?.data?.error ||
          "Error creando empleado"
      );
    }
  };

  const toggleActivo = async (id, activoActual) => {
    setError("");
    try {
      await api.patch(`/empresa/usuarios/${id}/activo`, { activo: !activoActual });
      fetchUsuarios();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.response?.data?.error ||
          "Error actualizando estado"
      );
    }
  };

  const changeRol = async (id, rol) => {
    setError("");
    try {
      await api.patch(`/empresa/usuarios/${id}/rol`, { rol });
      fetchUsuarios();
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.response?.data?.error ||
          "Error actualizando rol"
      );
    }
  };

  if (!isAdminEmpresa) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Usuarios</h2>
        <p>No tienes permisos para administrar usuarios internos.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2>Usuarios internos</h2>
          <p style={{ color: "#555" }}>
            Crea empleados con contraseña temporal (se les pedirá cambiarla al iniciar sesión).
          </p>
        </div>
        <button onClick={fetchUsuarios} disabled={loading}>
          {loading ? "Cargando..." : "Refrescar"}
        </button>
      </div>

      {error ? (
        <div style={{ marginTop: 12, padding: 10, background: "#ffe6e6", color: "#900" }}>
          {error}
        </div>
      ) : null}

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3>Crear empleado</h3>

        <form onSubmit={handleCreate} style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            required
          />

          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />

          <input
            placeholder="Contraseña temporal (mín 8 + 1 número)"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            required
            minLength={8}
          />

          <select
            value={form.rol}
            onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}
          >
            <option value="empleado">Empleado</option>
            <option value="admin_empresa">Admin empresa</option>
          </select>

          <button type="submit">Crear</button>
        </form>
      </div>

      <div style={{ marginTop: 16 }}>
        <h3>Lista de usuarios</h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Nombre
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Email
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Rol
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Estado
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id}>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{u.nombre}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{u.email}</td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    <select value={u.rol} onChange={(e) => changeRol(u.id, e.target.value)}>
                      <option value="empleado">empleado</option>
                      <option value="admin_empresa">admin_empresa</option>
                    </select>

                    {u.must_change_password ? (
                      <span style={{ marginLeft: 8, fontSize: 12, color: "#555" }}>
                        (Debe cambiar clave)
                      </span>
                    ) : null}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    {u.activo ? "Activo" : "Inactivo"}
                  </td>
                  <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                    <button onClick={() => toggleActivo(u.id, u.activo)}>
                      {u.activo ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}

              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 12, color: "#666" }}>
                    No hay usuarios creados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}