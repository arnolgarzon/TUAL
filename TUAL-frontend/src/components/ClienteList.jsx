import { useEffect, useState } from "react";
import { getClientes, deleteCliente } from "./clienteService";
import { Link } from "react-router-dom";

const ClienteList = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClientes = async () => {
    try {
      const res = await getClientes();
      setClientes(res.data);
    } catch (err) {
      console.error("Error cargando clientes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  if (loading) return <p className="p-6">Cargando clientes...</p>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Link
          to="crear"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Nuevo Cliente
        </Link>
      </div>

      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr className="border-b">
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{c.nombre}</td>
              <td className="p-2">{c.email}</td>
              <td className="p-2 flex justify-center gap-3">
                <Link to={`${c.id}`} className="text-blue-600">
                  Editar
                </Link>
                <button
                  onClick={() => deleteCliente(c.id).then(fetchClientes)}
                  className="text-red-600"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClienteList;
