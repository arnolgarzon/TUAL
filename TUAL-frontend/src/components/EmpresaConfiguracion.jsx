import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { Save, Loader2 } from "lucide-react";

const EmpresaConfiguracion = () => {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchModulos();
  }, []);

  const fetchModulos = async () => {
    try {
      const res = await api.get("/empresa/modulos");
      setModulos(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModulo = (modulo) => {
    setModulos((prev) =>
      prev.map((m) =>
        m.modulo === modulo
          ? { ...m, enabled: !m.enabled }
          : m
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      await api.put("/empresa/modulos", { modulos });

      setMessage("Configuración actualizada correctamente ✅");

    } catch (error) {
      setMessage("Error al guardar configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configuración de Empresa</h2>
        <p className="text-gray-600">
          Activa o desactiva módulos disponibles para tu empresa
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        {modulos.map((m) => (
          <div
            key={m.modulo}
            className="flex items-center justify-between border-b pb-3"
          >
            <div>
              <p className="font-semibold capitalize">
                {m.modulo.replace("_", " ")}
              </p>
              <p className="text-sm text-gray-500">
                Controla el acceso a este módulo
              </p>
            </div>

            <button
              onClick={() => toggleModulo(m.modulo)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition
                ${
                  m.enabled
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
            >
              {m.enabled ? "Activo" : "Inactivo"}
            </button>
          </div>
        ))}
      </div>

      {message && (
        <div className="text-sm text-blue-700 bg-blue-100 p-3 rounded">
          {message}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className={`flex items-center px-6 py-3 rounded-lg text-white font-semibold
          ${
            saving
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
      >
        {saving ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            Guardando...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Guardar cambios
          </>
        )}
      </button>
    </div>
  );
};

export default EmpresaConfiguracion;
