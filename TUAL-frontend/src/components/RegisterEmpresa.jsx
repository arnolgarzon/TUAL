import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Building2,
  ArrowLeft,
  CheckCircle2,
  Mail,
  Lock,
} from "lucide-react";
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

  const passwordsMatch =
    form.password && form.confirmPassword &&
    form.password === form.confirmPassword;

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

    if (!passwordsMatch) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await api.post("/public/registro-empresa", {
        nombre: form.nombre.trim(),
        nit: form.nit.trim(),
        email: form.emailAdmin.trim().toLowerCase(),
        password: form.password,
        rol: "ADMIN",
      });

      setSuccess(
        "Empresa creada exitosamente 🎉 Redirigiendo al inicio de sesión..."
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8 overflow-y-auto">

        {/* HEADER */}
        <div className="text-center mb-6">
          <img src={tualLogo} alt="TUAL" className="h-14 mx-auto mb-3" />
          <h2 className="text-2xl font-extrabold text-gray-900">
            Crea tu empresa
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configura tu empresa y su administrador
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* EMPRESA */}
          <section>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Datos de la empresa
            </p>

            <div className="space-y-3">
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre de la empresa"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                  autoComplete="organization"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <input
                type="text"
                name="nit"
                placeholder="NIT"
                required
                value={form.nit}
                onChange={handleChange}
                inputMode="numeric"
                className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </section>

          {/* ADMIN */}
          <section>
            <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Administrador principal
            </p>

            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="emailAdmin"
                  placeholder="Correo del administrador"
                  required
                  value={form.emailAdmin}
                  onChange={handleChange}
                  autoComplete="email"
                  autoCapitalize="none"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  required
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirmar contraseña"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 ${
                  form.confirmPassword
                    ? passwordsMatch
                      ? "border-green-400 focus:ring-green-500"
                      : "border-red-400 focus:ring-red-500"
                    : "focus:ring-blue-500"
                }`}
              />
            </div>
          </section>

          {/* MENSAJES */}
          {error && (
            <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center text-sm text-green-700 bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {success}
            </div>
          )}

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading || success}
            className={`w-full py-3 rounded-lg font-semibold text-white transition
              ${
                loading || success
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
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
