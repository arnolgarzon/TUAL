import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const useAuth = () => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUsuario(null);
      return;
    }

    try {
      const decoded = jwtDecode(token); // ahora sí funciona
      setUsuario(decoded);
    } catch (err) {
      console.error("Token inválido:", err);
      localStorage.removeItem("token");
      setUsuario(null);
    }
  }, []);

  return usuario;
};