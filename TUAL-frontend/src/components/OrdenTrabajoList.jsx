import React, { useState } from "react";
import { Wrench, CheckCircle, Clock, AlertCircle } from "lucide-react";

const OrdenTrabajoList = () => {
  const [ordenes] = useState([
    {
      id: 1,
      numero: "OT-001",
      cliente: "Empresa ABC",
      fecha: "2026-02-15",
      estado: "Abierta",
    },
    {
      id: 2,
      numero: "OT-002",
      cliente: "Juan Pérez",
      fecha: "2026-02-14",
      estado: "En proceso",
    },
    {
      id: 3,
      numero: "OT-003",
      cliente: "Tech Solutions",
      fecha: "2026-02-12",
      estado: "Finalizada",
    },
  ]);

  const estadoColor = (estado) => {
    if (estado === "Finalizada") return "text-green-600";
    if (estado === "En proceso") return "text-blue-600";
    return "text-red-600";
  };

  const estadoIcon = (estado) => {
    if (estado === "Finalizada") return <CheckCircle size={14} className="inline mr-1" />;
    if (estado === "En proceso") return <Clock size={14} className="inline mr-1" />;
    return <AlertCircle size={14} className="inline mr-1" />;
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="text-blue-600" />
          Órdenes de Trabajo
        </h1>
        <p className="text-sm text-gray-500">
          Gestión y seguimiento del trabajo operativo
        </p>
      </div>

      {/* TABLA */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">N° Orden</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
              <tr key={orden.id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-semibold">{orden.numero}</td>
                <td className="px-4 py-3">{orden.cliente}</td>
                <td className="px-4 py-3">{orden.fecha}</td>
                <td className={`px-4 py-3 font-semibold ${estadoColor(orden.estado)}`}>
                  {estadoIcon(orden.estado)}
                  {orden.estado}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ordenes.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No hay órdenes registradas.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdenTrabajoList;
