import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

/* ------------------------------
   COMPONENTES PÚBLICOS
--------------------------------*/
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import RegisterEmpresa from "./components/RegisterEmpresa";

/* Legacy / interno */
import RegisterForm from "./components/RegisterForm";

/* ------------------------------
   LAYOUT PRIVADO
--------------------------------*/
import DashboardLayout from "./layouts/DashboardLayout"; // IMPORTANTE: usa el de layouts

/* ------------------------------
   MÓDULOS PRIVADOS
--------------------------------*/
import Dashboard from "./components/Dashboard";

/* Empresas */
import EmpresaList from "./components/EmpresaList";
import EmpresaForm from "./components/EmpresaForm";

/* Usuarios */
import UserManagement from "./components/UserManagement";
import UserForm from "./components/UserForm";

/* Clientes */
import ClienteList from "./components/ClienteList";
import ClienteForm from "./components/ClienteForm";

/* Superadmin extra */
import ClienteGlobalList from "./components/ClienteGlobalList";

/* ------------------------------
   PROTECCIÓN POR ROL
--------------------------------*/
const RoleProtected = ({ children, allowedRoles }) => {
  const { usuario, isLoading } = useAuth();

  if (isLoading) return null;

  if (usuario && allowedRoles.includes(usuario.rol)) {
    return children;
  }

  return <Navigate to="/dashboard" replace />;
};

function App() {
  const { usuario, isLoading, setAuthenticatedUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (dataFromLogin) => {
    const normalizedData = dataFromLogin?.usuario
      ? dataFromLogin
      : {
          usuario: dataFromLogin,
          token: localStorage.getItem("token"),
        };

    setAuthenticatedUser(normalizedData);
    navigate("/dashboard", { replace: true });
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    navigate("/login", { replace: true });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Verificando sesión…</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* ---------- PÚBLICAS ---------- */}
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

      {/* ---------- PRIVADAS ---------- */}
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

        {/* EMPRESAS (SUPERADMIN) */}
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

        {/* USUARIOS (SUPERADMIN - usuarios-auth globales) */}
        <Route
          path="usuarios"
          element={
            <RoleProtected allowedRoles={["superadmin"]}>
              <UserManagement />
            </RoleProtected>
          }
        />

        {/* (Opcional) Usuarios internos por empresa (ADMIN_EMPRESA) */}
        <Route
          path="usuarios/crear"
          element={
            <RoleProtected allowedRoles={["admin_empresa"]}>
              <UserForm />
            </RoleProtected>
          }
        />

        {/* CLIENTES (POR EMPRESA) */}
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

        {/* CLIENTES GLOBAL (SUPERADMIN) */}
        <Route
          path="clientes-global"
          element={
            <RoleProtected allowedRoles={["superadmin"]}>
              <ClienteGlobalList />
            </RoleProtected>
          }
        />
      </Route>

      <Route path="" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;