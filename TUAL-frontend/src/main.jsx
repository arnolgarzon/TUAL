import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // ✅ Router para navegación
import App from "./App.jsx";
import "./index.css"; // ✅ TailwindCSS y estilos globales

// Punto de entrada principal
const rootElement = document.getElementById("root");

createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);