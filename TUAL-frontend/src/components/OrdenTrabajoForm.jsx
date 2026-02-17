import React, { useState } from "react";
import { Wrench, Save } from "lucide-react";

const OrdenTrabajoForm = () => {
  const [formData, setFormData] = useState({
    cliente: "",
    descripcion: "",
    fecha: "",
    estado: "Abierta",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Nueva Orden:", formData);

    alert("Orden creada correctamente 🚀");

    setFormData({
      cliente: "",
      descripcion: "",
      fecha: "",
      estado: "Abierta",
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="text-blue-600" />
          Crear Orden de Trabajo
        </h1>
        <p className="text-sm text-gray-500">
          Registra una nueva orden operativa en el sistema
        </p>
      </div>

      {/* FORMULARIO */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl shadow-md border space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">
            Cliente
          </label>
          <input
            type="text"
            name="cliente"
            value={formData.cliente}
            onChange={handleChange}
            required
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Descripción del Trabajo
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
            rows="3"
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Fecha
          </label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Estado
          </label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Abierta">Abierta</option>
            <option value="En proceso">En proceso</option>
            <option value="Finalizada">Finalizada</option>
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          <Save size={16} />
          Guardar Orden
        </button>
      </form>
    </div>
  );
};

export default OrdenTrabajoForm;
