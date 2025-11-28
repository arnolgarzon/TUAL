// index.js

import express from "express";
import cors from "cors";
import router from "./src/routes/index.js";
import dotenv from 'dotenv';

// Cargar variables de entorno del archivo .env
dotenv.config();

const app = express();

// ----------------------------------------------------
// 1. CONFIGURACIÓN DE MIDDLEWARES
// ----------------------------------------------------

// 1.1. CONFIGURACIÓN DE CORS (CRÍTICO para solucionar el Error de Red)
// Es crucial especificar el origen de tu frontend para mayor seguridad.
// ASUMIMOS que tu frontend corre en el puerto 3000.
const allowedOrigins = [
    process.env.CLIENT_URL || 'http://localhost:3000', // URL de tu frontend
    // Agrega otras URLs si tu app tiene subdominios, etc.
];

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como Postman o curl) y orígenes permitidos
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // Rechazar cualquier otro origen
            callback(new Error('Acceso CORS no permitido por el servidor'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'], // Headers requeridos (Especialmente el token 'Authorization')
    credentials: true // Permite que las cookies o headers de auth sean enviados
}));


// 1.2. Middleware para parsear JSON (Fundamental)
app.use(express.json());

// ----------------------------------------------------
// 2. RUTAS
// ----------------------------------------------------

// 2.1. Ruta base para la API
app.use("/api", router); 


// ----------------------------------------------------
// 3. MANEJO DE ERRORES (ROBUSTEZ)
// ----------------------------------------------------

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ 
        message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` 
    });
});

// Middleware de manejo de errores general (CAPTURA CUALQUIER ERROR)
app.use((err, req, res, next) => {
    console.error(err.stack); // Muestra el error en la terminal del servidor
    const statusCode = err.status || 500;
    
    // Si estamos en producción, no enviamos detalles sensibles del error
    const message = process.env.NODE_ENV === 'production' && statusCode === 500
        ? 'Error interno del servidor. Inténtalo de nuevo más tarde.'
        : err.message || 'Error desconocido del servidor.';

    res.status(statusCode).json({
        error: message
    });
});


// ----------------------------------------------------
// 4. INICIO DEL SERVIDOR
// ----------------------------------------------------

// Usar el puerto de las variables de entorno o 5000 por defecto
const PORT = process.env.PORT || 5000; 

app.listen(PORT, () => {
    console.log(`🚀 Servidor TUAL corriendo en http://localhost:${PORT}`);
    console.log(`Cliente permitido: ${allowedOrigins[0]}`);
});