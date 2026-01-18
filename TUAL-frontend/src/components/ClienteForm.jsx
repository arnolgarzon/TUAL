import React, { useEffect, useState } from "react";
import { createCliente, getCliente, updateCliente } from "./clienteService";
import { useNavigate, useParams } from "react-router-dom";

export default function ClienteForm() {
  const [form, setForm] = useState({
    tipo: "persona",
    nombre: "",
    documento: "",
    telefono: "",
    email: "",
    direccion: "",
  });

  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  useEffect(() => {
    if (isEdit) {
      getCliente(id).then(({ data }) => setForm(data));
    }
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEdit) {
      await updateCliente(id, form);
    } else {
      await createCliente(form);
    }

    navigate("/dashboard/clientes");
  };

  return (
    <div className="max-w-xl bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">
        {isEdit ? "Editar Cliente" : "Nuevo Cliente"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="tipo"
          value={form.tipo}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="persona">Persona</option>
          <option value="empresa">Empresa</option>
        </select>

        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />

        <input
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Guardar
        </button>
      </form>
    </div>
  );
}
