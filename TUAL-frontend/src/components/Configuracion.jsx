import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { CheckCircle, Loader2 } from "lucide-react";

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
  const empresaId = usuario?.empresa_id;

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
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!empresaId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/empresa/config/${empresaId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = await res.json();

        setModulos(data.modulos || []);
        setEmpresa(data.empresa || empresa);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [empresaId]);

  const handleChange = (e) => {
    setEmpresa({ ...empresa, [e.target.name]: e.target.value });
  };

  const savePerfil = async () => {
    await fetch(
      `http://localhost:5000/api/empresa/config/${empresaId}/perfil`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(empresa),
      }
    );

    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const isEnabled = (key) =>
    modulos.some((m) => m.modulo === key && m.enabled);

  const toggleModule = async (key) => {
    const newState = !isEnabled(key);

    await fetch(
      `http://localhost:5000/api/empresa/config/${empresaId}/modulo`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          modulo: key,
          enabled: newState,
        }),
      }
    );

    setModulos((prev) =>
      prev.map((m) =>
        m.modulo === key ? { ...m, enabled: newState } : m
      )
    );

    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
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

      {/* Tabs */}
      <div className="flex gap-4 border-b pb-2">
        <button onClick={() => setTab("perfil")} className={tab==="perfil" ? "font-bold" : ""}>Perfil</button>
        <button onClick={() => setTab("modulos")} className={tab==="modulos" ? "font-bold" : ""}>Módulos</button>
      </div>

      {/* PERFIL */}
      {tab === "perfil" && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <input name="nombre" value={empresa.nombre} onChange={handleChange} placeholder="Nombre Empresa" className="input" />
          <input name="nit" value={empresa.nit} onChange={handleChange} placeholder="NIT" className="input" />
          <input name="direccion" value={empresa.direccion} onChange={handleChange} placeholder="Dirección" className="input" />
          <input name="telefono" value={empresa.telefono} onChange={handleChange} placeholder="Teléfono" className="input" />
          <input name="email" value={empresa.email} onChange={handleChange} placeholder="Email Corporativo" className="input" />

          <button
            onClick={savePerfil}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Guardar Perfil
          </button>
        </div>
      )}

      {/* MODULOS */}
      {tab === "modulos" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableModules.map((mod) => (
            <div key={mod.key} className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-semibold">{mod.name}</h3>
              <button
                onClick={() => toggleModule(mod.key)}
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
    </div>
  );
};

export default Configuracion;
