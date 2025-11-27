import React, { useEffect, useState } from "react";
import api from "../utils/api";

const EmpresaList = ({ usuario }) => {
  const [empresas, setEmpresas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");

  useEffect(() => {
    const fetchEmpresas = async () => {
      try {
        const res = await api.get("/empresas");
        setEmpresas(res.data);
      } catch (err) {
        console.error("Error al cargar empresas:", err);
      }
    };
    fetchEmpresas();
  }, []);

  const crearEmpresa = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/empresas", { nombre, direccion });
      setEmpresas([...empresas, res.data]); // actualiza lista
      setNombre("");
      setDireccion("");
    } catch (err) {
      console.error("Error al crear empresa:", err);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div>
      <h2>Bienvenido {usuario.email}</h2>
      <button onClick={cerrarSesion}>Cerrar sesión</button>

      <h3>Crear nueva empresa</h3>
      <form onSubmit={crearEmpresa}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Dirección"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          required
        />
        <button type="submit">Guardar</button>
      </form>

      <h3>Lista de empresas</h3>
      <ul>
        {empresas.map((e) => (
          <li key={e.id}>{e.nombre} - {e.direccion}</li>
        ))}
      </ul>
    </div>
  );
};

export default EmpresaList;