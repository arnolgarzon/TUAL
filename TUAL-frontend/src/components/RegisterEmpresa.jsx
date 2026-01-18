import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, ArrowLeft, CheckCircle2 } from "lucide-react";
import api from "../utils/api";
import tualLogo from "../assets/icono.png";

const RegisterEmpresa = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    nit: "",
    emailAdmin: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      /**
       * 🔑 Registro completo:
       * Empresa + usuario administrador inicial
       */
      await api.post("/public/registro-empresa", {
        nombre: form.nombre,
        nit: form.nit,
        email: form.emailAdmin,
        password: form.password,
        rol: "ADMIN", // preparado para backend
      });

      setSuccess(
        "Empresa creada exitosamente 🎉 Ya puedes iniciar sesión como administrador."
      );

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1800);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "No se pudo completar el registro. Verifica los datos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">

        {/* HEADER */}
        <div className="text-center mb-6">
          <img src={tualLogo} alt="TUAL" className="h-16 mx-auto mb-3" />
          <h2 className="text-2xl font-extrabold text-gray-900">
            Crea tu empresa en TUAL
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Registra tu empresa y su administrador principal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* EMPRESA */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Nombre de la empresa
            </label>
            <div className="relative mt-1">
              <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="nombre"
                required
                value={form.nombre}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">NIT</label>
            <input
              type="text"
              name="nit"
              required
              value={form.nit}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ADMIN */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email del administrador
            </label>
            <input
              type="email"
              name="emailAdmin"
              required
              value={form.emailAdmin}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* MENSAJES */}
          {error && (
            <div className="text-sm text-red-700 bg-red-100 p-2 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center text-sm text-green-700 bg-green-100 p-2 rounded">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {success}
            </div>
          )}

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full py-3 rounded-lg font-semibold text-white transition
              ${loading || success
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? "Creando empresa..." : "Crear empresa"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-sm text-blue-600 hover:underline inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterEmpresa;
