import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { CheckCircle, Loader2, Shield } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const availableModules = [
  { key: "clientes", name: "Clientes" },
  { key: "usuarios", name: "Usuarios" },
  { key: "inventario", name: "Inventario" },
  { key: "finanzas", name: "Finanzas" },
  { key: "reportes", name: "Reportes" },
  { key: "facturacion", name: "Facturación" },
];

const Configuracion = () => {
  const { usuario } = useAuth();

  const [tab, setTab] = useState("perfil");
  const [empresa, setEmpresa] = useState({
    nombre: "",
    nit: "",
    direccion: "",
    telefono: "",
    email: "",
    moneda: "COP",
  });

  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Seguridad
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const token = localStorage.getItem("token");

  const mustChangePassword =
    usuario?.must_change_password === true ||
    usuario?.mustChangePassword === true;

  /* ===============================
     CARGAR CONFIGURACIÓN
  ================================*/
  useEffect(() => {
    if (!usuario) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/empresa/config`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Error cargando configuración");

        const data = await res.json();

        setModulos(data.modulos || []);
        setEmpresa(data.empresa || {});
      } catch (err) {
        console.error("Error configuración:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [usuario]);

  /* ===============================
     FORZAR TAB SEGURIDAD
  ================================*/
  useEffect(() => {
    if (mustChangePassword) {
      setTab("seguridad");
    }
  }, [mustChangePassword]);

  /* ===============================
     PERFIL
  ================================*/
  const handleChange = (e) => {
    setEmpresa({ ...empresa, [e.target.name]: e.target.value });
  };

  const savePerfil = async () => {
    try {
      setSaving(true);

      const res = await fetch(`${API_URL}/api/empresa/config/perfil`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(empresa),
      });

      if (!res.ok) throw new Error("Error guardando perfil");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ===============================
     MÓDULOS
  ================================*/
  const isEnabled = (key) =>
    modulos.some((m) => m.modulo === key && m.enabled);

  const toggleModule = async (key) => {
    try {
      setSaving(true);
      const newState = !isEnabled(key);

      const res = await fetch(`${API_URL}/api/empresa/config/modulo`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          modulo: key,
          enabled: newState,
        }),
      });

      if (!res.ok) throw new Error("Error actualizando módulo");

      setModulos((prev) => {
        const exists = prev.some((m) => m.modulo === key);

        if (!exists) {
          return [...prev, { modulo: key, enabled: newState }];
        }

        return prev.map((m) =>
          m.modulo === key ? { ...m, enabled: newState } : m
        );
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ===============================
     CAMBIO DE CONTRASEÑA
  ================================*/
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const savePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      setSaving(true);

      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      if (!res.ok) throw new Error("Error cambiando contraseña");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error(err.message);
      alert("Error al cambiar contraseña");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center mt-20">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Configuración Empresarial</h1>

      {success && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle size={18} />
          Configuración actualizada correctamente
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-8 border-b pb-2">
        {["perfil", "modulos", "seguridad"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 ${
              tab === t
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            {t === "perfil"
              ? "Perfil"
              : t === "modulos"
              ? "Módulos"
              : "Seguridad"}
          </button>
        ))}
      </div>

      {/* PERFIL */}
      {tab === "perfil" && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <input name="nombre" value={empresa.nombre || ""} onChange={handleChange} placeholder="Nombre Empresa" className="input" />
          <input name="nit" value={empresa.nit || ""} onChange={handleChange} placeholder="NIT" className="input" />
          <input name="direccion" value={empresa.direccion || ""} onChange={handleChange} placeholder="Dirección" className="input" />
          <input name="telefono" value={empresa.telefono || ""} onChange={handleChange} placeholder="Teléfono" className="input" />
          <input name="email" value={empresa.email || ""} onChange={handleChange} placeholder="Email Corporativo" className="input" />

          <button onClick={savePerfil} disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            {saving ? "Guardando..." : "Guardar Perfil"}
          </button>
        </div>
      )}

      {/* MÓDULOS */}
      {tab === "modulos" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableModules.map((mod) => (
            <div key={mod.key} className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-semibold">{mod.name}</h3>
              <button
                onClick={() => toggleModule(mod.key)}
                disabled={saving}
                className={`mt-3 px-4 py-2 rounded-lg ${
                  isEnabled(mod.key)
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {isEnabled(mod.key) ? "Activo" : "Inactivo"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SEGURIDAD */}
      {tab === "seguridad" && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4 max-w-md">
          <h3 className="font-semibold flex items-center gap-2">
            <Shield size={18} />
            Cambiar contraseña
          </h3>

          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            placeholder="Contraseña actual"
            className="input"
          />

          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            placeholder="Nueva contraseña"
            className="input"
          />

          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            placeholder="Confirmar nueva contraseña"
            className="input"
          />

          <button
            onClick={savePassword}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            {saving ? "Actualizando..." : "Cambiar contraseña"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Configuracion;
