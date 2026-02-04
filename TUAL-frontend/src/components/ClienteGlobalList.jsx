import React, { useEffect, useMemo, useState } from "react";
import { fetchProtectedData } from "../utils/api";
import { Loader2, AlertTriangle, Search } from "lucide-react";

const ClienteGlobalList = () => {
  const [clientes, setClientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const resp = await fetchProtectedData("/superadmin/clientes");
        const data = Array.isArray(resp) ? resp : resp?.data || resp?.clientes || [];
        setClientes(data);
      } catch (e) {
        console.error(e);
        setError(e.response?.data?.message || "No se pudieron cargar los clientes globales.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return clientes;
    return clientes.filter((c) => {
      const nombre = String(c.nombre || "").toLowerCase();
      const doc = String(c.documento || c.nit || c.identificacion || "").toLowerCase();
      const empresa = String(c.empresa_nombre || "").toLowerCase();
      return nombre.includes(term) || doc.includes(term) || empresa.includes(term);
    });
  }, [clientes, q]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-700">Cargando clientes globales...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 border border-red-300 bg-red-50 rounded-lg flex flex-col items-center">
        <AlertTriangle className="w-10 h-10 mb-3" />
        <h3 className="font-bold text-lg mb-2">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Clientes Global (Superadmin)</h1>

        <div className="flex items-center bg-white border rounded-lg px-3 py-2 shadow-sm w-full md:w-96">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por cliente / documento / empresa…"
            className="w-full outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{c.id}</td>
                <td className="px-6 py-4 text-sm">{c.nombre || "—"}</td>
                <td className="px-6 py-4 text-sm">{c.empresa_nombre || "—"}</td>
                <td className="px-6 py-4 text-sm">{c.telefono || "—"}</td>
                <td className="px-6 py-4 text-sm">{c.email || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-10 text-center text-gray-500">No hay resultados.</div>
        )}
      </div>
    </div>
  );
};

export default ClienteGlobalList;