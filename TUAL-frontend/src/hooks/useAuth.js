// src/hooks/useAuth.js
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const useAuth = () => {
  const [usuario, setUsuario] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthenticatedUser = (userData) => {
    // userData puede ser:
    // - null (logout)
    // - { token, usuario, mustChangePassword } (login)
    // - { usuario, token } (compat)
    // - objeto usuario directo (legacy)

    if (userData === null) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      setUsuario(null);
      setIsLoading(false);
      return;
    }

    const token = userData?.token || localStorage.getItem("token") || null;
    const usuarioObj = userData?.usuario || (userData?.id ? userData : null);

    if (token) localStorage.setItem("token", token);

    // Guardamos usuario completo en localStorage para persistencia real
    if (usuarioObj) {
      // Inyectamos mustChangePassword si el backend lo manda fuera del objeto
      const mergedUser = {
        ...usuarioObj,
        must_change_password:
          usuarioObj?.must_change_password ??
          userData?.mustChangePassword ??
          false,
      };

      localStorage.setItem("usuario", JSON.stringify(mergedUser));
      setUsuario(mergedUser);
    } else {
      // Si por alguna razón no vino usuario, intentamos mantener lo que ya exista
      const storedUser = localStorage.getItem("usuario");
      setUsuario(storedUser ? JSON.parse(storedUser) : null);
    }

    setIsLoading(false);
  };

  const logout = () => {
    setAuthenticatedUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUserStr = localStorage.getItem("usuario");

    if (!token) {
      setUsuario(null);
      setIsLoading(false);
      return;
    }

    // Validar expiración del token
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded?.exp && decoded.exp < currentTime) {
        console.warn("Token expirado. Cerrando sesión.");
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
        setIsLoading(false);
        return;
      }

      // Preferimos el usuario guardado (más completo que el JWT)
      if (storedUserStr) {
        const storedUser = JSON.parse(storedUserStr);

        // (Opcional) completar faltantes desde JWT
        const merged = {
          ...decoded,
          ...storedUser, // storedUser gana (tiene must_change_password, activo, etc.)
        };

        setUsuario(merged);
      } else {
        // Fallback: si no hay usuario guardado, usamos el JWT
        setUsuario(decoded);
      }
    } catch (err) {
      console.error("Token inválido o corrupto:", err);
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      setUsuario(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    usuario,
    isLoading,
    setAuthenticatedUser,
    logout,
  };
};