import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  HelpCircle,
  ArrowRightCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const QUICK_OPTIONS = [
  { label: "👤 Crear un cliente", key: "crear cliente" },
  { label: "📋 Ver mis clientes", key: "ver clientes" },
  { label: "👥 Usuarios del sistema", key: "usuarios" },
  { label: "🔐 Cambiar mi contraseña", key: "contraseña" },
  { label: "🏢 Información de la empresa", key: "empresa" },
];

const HelpCenter = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hola 👋 Soy tu asistente de ayuda de TUAL.\n\nSolo toca un botón o escribe lo que quieras hacer 😊",
    },
  ]);

  const [input, setInput] = useState("");

  /* ===============================
     AUTO SCROLL
  ================================*/
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===============================
     RESPUESTAS SIMPLES (IA GUIADA)
  ================================*/
  const getBotResponse = (text) => {
    const msg = text.toLowerCase();

    if (msg.includes("crear cliente")) {
      return {
        text:
          "Perfecto 👍\n\nPara crear un cliente:\n1️⃣ Ve a Clientes\n2️⃣ Pulsa “Nuevo cliente”\n3️⃣ Llena el formulario\n\n¿Vamos allá?",
        action: () => navigate("/dashboard/clientes/crear"),
        actionLabel: "👉 Crear cliente",
      };
    }

    if (msg.includes("ver cliente")) {
      return {
        text: "Aquí puedes ver todos tus clientes registrados 📋",
        action: () => navigate("/dashboard/clientes"),
        actionLabel: "👉 Ver clientes",
      };
    }

    if (msg.includes("usuario")) {
      return {
        text:
          "Desde Usuarios puedes ver y administrar personas del sistema 👥",
        action: () => navigate("/dashboard/usuarios-internos"),
        actionLabel: "👉 Ir a usuarios",
      };
    }

    if (msg.includes("contraseña") || msg.includes("clave")) {
      return {
        text:
          "Por seguridad 🔐 es buena idea cambiar tu contraseña de vez en cuando.",
        action: () => navigate("/cambiar-clave"),
        actionLabel: "👉 Cambiar contraseña",
      };
    }

    if (msg.includes("empresa")) {
      return {
        text:
          "Aquí puedes ver y editar la información de tu empresa 🏢",
        action: () => navigate("/dashboard/configuracion"),
        actionLabel: "👉 Ver empresa",
      };
    }

    return {
      text:
        "No pasa nada 😊\n\nPuedes tocar uno de los botones de abajo o escribir algo como:\n• crear cliente\n• ver clientes\n• cambiar contraseña",
    };
  };

  /* ===============================
     ENVIAR MENSAJE
  ================================*/
  const sendMessage = (text) => {
    if (!text.trim()) return;

    const userMessage = { from: "user", text };
    const botReply = getBotResponse(text);

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        from: "bot",
        text: botReply.text,
        action: botReply.action,
        actionLabel: botReply.actionLabel,
      },
    ]);

    setInput("");
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow border">

      {/* HEADER */}
      <div className="flex items-center gap-2 p-4 bg-blue-50 border-b rounded-t-xl">
        <HelpCircle className="text-blue-600" />
        <h2 className="font-bold text-blue-700">
          Ayuda fácil de TUAL
        </h2>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2 ${
              msg.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.from === "bot" && (
              <Bot className="text-blue-600 mt-1" />
            )}

            <div
              className={`max-w-xs sm:max-w-md px-4 py-3 rounded-xl text-sm whitespace-pre-line ${
                msg.from === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {msg.text}

              {msg.action && (
                <button
                  onClick={msg.action}
                  className="mt-3 flex items-center gap-1 text-blue-700 text-xs underline"
                >
                  {msg.actionLabel}
                  <ArrowRightCircle className="h-4 w-4" />
                </button>
              )}
            </div>

            {msg.from === "user" && (
              <User className="text-gray-400 mt-1" />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* BOTONES RÁPIDOS */}
      <div className="px-4 py-2 border-t bg-gray-50 flex flex-wrap gap-2">
        {QUICK_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => sendMessage(opt.key)}
            className="bg-white border rounded-full px-4 py-2 text-sm shadow hover:bg-blue-50"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="p-4 flex gap-2 border-t">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Escribe o toca un botón 👆"
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => sendMessage(input)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default HelpCenter;
