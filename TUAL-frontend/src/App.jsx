import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import LoginForm from "./components/LoginForm";
import EmpresaList from "./components/EmpresaList";
import { useAuth } from "./hooks/useAuth";

function App() {
  const usuario = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home usuario={usuario} onLogout={handleLogout} />} />
        <Route path="/login" element={<LoginForm onLogin={() => window.location.reload()} />} />
        <Route path="/empresas" element={<EmpresaList usuario={usuario} />} />
      </Routes>
    </Router>
  );
}

export default App;