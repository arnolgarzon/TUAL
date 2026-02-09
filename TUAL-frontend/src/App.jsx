import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

/* ==============================
   COMPONENTES PÚBLICOS
================================*/
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import RegisterEmpresa from "./components/RegisterEmpresa";
import RegisterForm from "./components/RegisterForm";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

/* ==============================
   LAYOUT PRIVADO
================================*/
import DashboardLayout from "./layouts/DashboardLayout";

/* ==============================
   MÓDULOS PRIVADOS
================================*/
import Dashboard from "./components/Dashboard";

/* Empresas */
import EmpresaList from "./components/EmpresaList";
import EmpresaForm from "./components/EmpresaForm";

/* Usuarios */
import UserManagement from "./components/UserManagement";
import UserForm from "./components/UserForm";

/* Seguridad */
import ChangePassword from "./components/ChangePassword";

/* Clientes */
import ClienteList from "./components/ClienteList";
import ClienteForm from "./components/ClienteForm";

/* Superadmin */
import ClienteGlobalList from "./components/ClienteGlobalList";

/* ==============================
   PROTECCIÓN POR ROL
================================*/
const RoleProtected = ({ children, allowedRoles }) => {
  const { usuario, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Validando permisos…</p>
      </div>
    );
  }

  if (usuario && allowedRoles.includes(usuario.rol)) {
    return children;
  }

  return <Navigate to="/dashboard" replace />;
};

function App() {
  const { usuario, isLoading, setAuthenticatedUser } = useAuth();
  const navigate = useNavigate();

  /* ==============================
     LOGIN / LOGOUT
  ================================*/
  const handleLogin = (loginResponse) => {
    const normalized = loginResponse?.usuario
      ? {
          usuario: loginResponse.usuario,
          token: loginResponse.token,
          mustChangePassword: loginResponse.mustChangePassword,
        }
      : {
          usuario: loginResponse,
          token: localStorage.getItem("token"),
        };

    setAuthenticatedUser(normalized);

    const mustChange =
      normalized?.mustChangePassword === true ||
      normalized?.usuario?.must_change_password === true;

    if (mustChange) {
      navigate("/cambiar-clave", { replace: true });
      return;
    }

    navigate("/dashboard", { replace: true });
  };

  const handleLogout = () => {
    localStorage.clear();
    setAuthenticatedUser(null);
    navigate("/login", { replace: true });
  };

  /* ==============================
     LOADING GLOBAL
  ================================*/
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verificando sesión…</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* ==========================
          RUTAS PÚBLICAS
      ============================*/}
      <Route
        path="/"
        element={usuario ? <Navigate to="/dashboard" replace /> : <Home />}
      />

      <Route
        path="/login"
        element={
          usuario ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginForm onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/crear-empresa"
        element={
          usuario ? <Navigate to="/dashboard" replace /> : <RegisterEmpresa />
        }
      />

      <Route
        path="/register"
        element={
          usuario ? <Navigate to="/dashboard" replace /> : <RegisterForm />
        }
      />

      {/* 🔐 RECUPERACIÓN DE CONTRASEÑA */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-clave/:token" element={<ResetPassword />} />

      {/* ==========================
          PRIVADA SIN LAYOUT
      ============================*/}
      <Route
        path="/cambiar-clave"
        element={
          usuario ? <ChangePassword /> : <Navigate to="/login" replace />
        }
      />

      {/* ==========================
          PRIVADAS CON LAYOUT
      ============================*/}
      <Route
        path="/dashboard"
        element={
          usuario ? (
            <DashboardLayout onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<Dashboard />} />

        {/* EMPRESAS */}
        <Route
          path="empresas"
          element={
            <RoleProtected allowedRoles={["superadmin"]}>
              <EmpresaList />
            </RoleProtected>
          }
        />
        <Route
          path="empresas/:id"
          element={
            <RoleProtected allowedRoles={["superadmin"]}>
              <EmpresaForm isEdit />
            </RoleProtected>
          }
        />

        {/* USUARIOS */}
        <Route
          path="usuarios"
          element={
            <RoleProtected allowedRoles={["superadmin"]}>
              <UserManagement />
            </RoleProtected>
          }
        />
        <Route
          path="usuarios-internos"
          element={
            <RoleProtected allowedRoles={["admin_empresa"]}>
              <UserManagement />
            </RoleProtected>
          }
        />
        <Route
          path="usuarios/crear"
          element={
            <RoleProtected allowedRoles={["admin_empresa"]}>
              <UserForm />
            </RoleProtected>
          }
        />

        {/* CLIENTES */}
        <Route
          path="clientes"
          element={
            <RoleProtected allowedRoles={["admin_empresa", "empleado"]}>
              <ClienteList />
            </RoleProtected>
          }
        />
        <Route
          path="clientes/crear"
          element={
            <RoleProtected allowedRoles={["admin_empresa"]}>
              <ClienteForm />
            </RoleProtected>
          }
        />
        <Route
          path="clientes/:id"
          element={
            <RoleProtected allowedRoles={["admin_empresa"]}>
              <ClienteForm />
            </RoleProtected>
          }
        />

        {/* CLIENTES GLOBAL */}
        <Route
          path="clientes-global"
          element={
            <RoleProtected allowedRoles={["superadmin"]}>
              <ClienteGlobalList />
            </RoleProtected>
          }
        />
      </Route>

      {/* ==========================
          FALLBACK
      ============================*/}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
