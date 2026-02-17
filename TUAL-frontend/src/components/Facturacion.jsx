import React, { useState } from "react";
import { Receipt, Plus, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Facturacion = () => {
  // 🔥 Datos simulados para demo
  const [facturas] = useState([
    { id: 1, cliente: "Empresa ABC", total: 1200000, estado: "Pagada" },
    { id: 2, cliente: "Juan Pérez", total: 450000, estado: "Pendiente" },
    { id: 3, cliente: "Tech Solutions", total: 890000, estado: "Pagada" },
  ]);

  const getEstadoColor = (estado) => {
    if (estado === "Pagada") return "text-green-600";
    return "text-amber-600";
  };

  const getEstadoIcon = (estado) => {
    if (estado === "Pagada") return <CheckCircle size={14} className="inline mr-1" />;
    return <Clock size={14} className="inline mr-1" />;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Receipt className="text-blue-600" />
            Facturación
          </h1>
          <p className="text-sm text-gray-500">
            Gestión y control de facturas emitidas
          </p>
        </div>

        <Link
          to="#"
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Nueva Factura
        </Link>
      </div>

      {/* TABLA */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((f) => (
              <tr key={f.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium">{f.cliente}</td>
                <td className="px-4 py-3">
                  ${f.total.toLocaleString("es-CO")}
                </td>
                <td className={`px-4 py-3 font-semibold ${getEstadoColor(f.estado)}`}>
                  {getEstadoIcon(f.estado)}
                  {f.estado}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {facturas.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No hay facturas registradas.
          </div>
        )}
      </div>
    </div>
  );
};

export default Facturacion;
