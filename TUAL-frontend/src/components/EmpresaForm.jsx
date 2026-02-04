import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Briefcase, Save, Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { fetchProtectedData, putProtectedData } from "../utils/api";

const initialForm = {
  nombre: "",
  nit: "",
  telefono: "",
  direccion: "",
  email: "",
  sector: "",
  activo: true,
  admin_id: "",
};

const EmpresaForm = ({ isEdit = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const isSuperAdmin = String(usuario?.rol || "").toLowerCase() === "superadmin";

  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(Boolean(isEdit));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const loadEmpresa = async () => {
      if (!isEdit) return;

      if (!id) {
        setError("No se encontró el ID de la empresa en la ruta.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const resp = await fetchProtectedData(`/superadmin/empresas/${id}`);
        const empresa = resp?.empresa ?? resp;

        setForm({
          nombre: empresa?.nombre || "",
          nit: empresa?.nit || "",
          telefono: empresa?.telefono || "",
          direccion: empresa?.direccion || "",
          email: empresa?.email || "",
          sector: empresa?.sector || "",
          activo: typeof empresa?.activo === "boolean" ? empresa.activo : true,
          admin_id: empresa?.admin_id || "",
        });
      } catch (e) {
        console.error(e);
        setError(e.response?.data?.message || "No se pudo cargar la empresa.");
      } finally {
        setIsLoading(false);
      }
    };

    loadEmpresa();
  }, [isEdit, id]);

  if (!isSuperAdmin) {
    return (
      <div className="p-6 bg-white rounded-xl shadow border max-w-3xl mx-auto">
        <p className="text-red-600 font-semibold">
          Acceso denegado: este módulo es solo para superadmin.
        </p>
      </div>
    );
  }

  const onChange = (key) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    setIsSaving(true);
    try {
      await putProtectedData(`/superadmin/empresas/${id}`, {
        nombre: form.nombre,
        nit: form.nit || null,
        telefono: form.telefono || null,
        direccion: form.direccion || null,
        email: form.email || null,
        sector: form.sector || null,
        activo: form.activo,
        admin_id: form.admin_id || null,
      });

      setSuccess("Empresa actualizada correctamente.");
      setTimeout(() => navigate("/dashboard/empresas"), 800);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "No se pudo guardar la empresa.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
        <p className="mt-3 text-gray-700">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <Briefcase className="w-6 h-6 mr-3 text-blue-600" />
          {isEdit ? `Editar Empresa #${id}` : "Empresa"}
        </h2>

        <button
          onClick={() => navigate("/dashboard/empresas")}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          type="button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-3" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 flex items-center">
          <Save className="h-5 w-5 mr-3" />
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              value={form.nombre}
              onChange={onChange("nombre")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">NIT</label>
            <input
              value={form.nit}
              onChange={onChange("nit")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Teléfono</label>
            <input
              value={form.telefono}
              onChange={onChange("telefono")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              value={form.email}
              onChange={onChange("email")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sector</label>
            <input
              value={form.sector}
              onChange={onChange("sector")}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Dirección</label>
          <input
            value={form.direccion}
            onChange={onChange("direccion")}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="activo"
            type="checkbox"
            checked={form.activo}
            onChange={onChange("activo")}
          />
          <label htmlFor="activo" className="text-sm text-gray-700">
            Empresa activa
          </label>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-lg font-medium text-white transition ${
            isSaving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Guardar cambios
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EmpresaForm;