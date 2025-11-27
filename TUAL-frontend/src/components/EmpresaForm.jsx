import { useState } from 'react';
import axios from 'axios';

function EmpresaForm() {
  const [form, setForm] = useState({
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    email: '',
    sector: ''
  });

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/empresas', form);
      alert('Empresa registrada: ' + res.data.nombre);
    } catch (err) {
      alert('Error al registrar');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px', margin: 'auto' }}>
      <input name="nombre" placeholder="Nombre" onChange={handleChange} />
      <input name="nit" placeholder="NIT" onChange={handleChange} />
      <input name="direccion" placeholder="Dirección" onChange={handleChange} />
      <input name="telefono" placeholder="Teléfono" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="sector" placeholder="Sector" onChange={handleChange} />
      <button type="submit">Registrar Empresa</button>
    </form>
  );
}

export default EmpresaForm;