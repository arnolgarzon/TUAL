import React, { useState } from "react";
import { Package, Plus, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const Inventario = () => {
  // 🔥 Datos simulados para demo
  const [productos] = useState([
    { id: 1, nombre: "Laptop HP", stock: 12, precio: 2500000 },
    { id: 2, nombre: "Mouse Logitech", stock: 3, precio: 90000 },
    { id: 3, nombre: "Teclado Mecánico", stock: 0, precio: 180000 },
  ]);

  const getStockStatus = (stock) => {
    if (stock === 0) return "Sin stock";
    if (stock <= 5) return "Stock bajo";
    return "Disponible";
  };

  const getStockColor = (stock) => {
    if (stock === 0) return "text-red-600";
    if (stock <= 5) return "text-amber-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="text-blue-600" />
            Inventario
          </h1>
          <p className="text-sm text-gray-500">
            Gestión de productos y control de stock
          </p>
        </div>

        <Link
          to="#"
          className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          <Plus size={16} />
          Nuevo Producto
        </Link>
      </div>

      {/* TABLA */}
      <div className="bg-white shadow-md rounded-2xl overflow-hidden border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Producto</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr
                key={p.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 font-medium">{p.nombre}</td>
                <td className="px-4 py-3">
                  ${p.precio.toLocaleString("es-CO")}
                </td>
                <td className="px-4 py-3">{p.stock}</td>
                <td
                  className={`px-4 py-3 font-semibold ${getStockColor(
                    p.stock
                  )}`}
                >
                  {p.stock === 0 && (
                    <AlertTriangle
                      size={14}
                      className="inline mr-1"
                    />
                  )}
                  {getStockStatus(p.stock)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {productos.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No hay productos registrados.
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventario;
