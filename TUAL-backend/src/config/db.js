import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

/**
 * Validación mínima de envs (no loguea secretos)
 */
const requiredEnvs = ["DB_HOST", "DB_USER", "DB_NAME", "DB_PORT"];
const missing = requiredEnvs.filter((k) => !process.env[k]);

if (missing.length > 0) {
  console.error(`❌ Faltan variables de entorno: ${missing.join(", ")}`);
  // En producción conviene fallar rápido
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

const DB_PORT = Number(process.env.DB_PORT);
if (Number.isNaN(DB_PORT)) {
  console.error("❌ DB_PORT debe ser un número válido");
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}

// Log seguro (sin password)
if (process.env.NODE_ENV !== "production") {
  console.log("🗄️ DB Config:", {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    port: DB_PORT,
  });
}

export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // NO la loguees
  database: process.env.DB_NAME,
  port: DB_PORT,

  // Opcional (recomendado)
  // max: 10,
  // idleTimeoutMillis: 30000,
  // connectionTimeoutMillis: 10000,
  // ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

/**
 * Errores inesperados en conexiones "idle" del pool
 */
pool.on("error", (err) => {
  console.error("🔥 Error inesperado en el pool de PostgreSQL:", err);
});

/**
 * Helper opcional para queries, por si quieres centralizar
 * (puedes usar pool.query directamente si prefieres).
 */
export const query = (text, params) => pool.query(text, params);

/**
 * Smoke test de conexión (opcional):
 * - En dev ayuda a confirmar que conecta.
 * - En prod puedes dejarlo también, pero no es obligatorio.
 */
export async function testDbConnection() {
  try {
    const res = await pool.query("SELECT 1 AS ok");
    if (process.env.NODE_ENV !== "production") {
      console.log("✅ PostgreSQL conectado (SELECT 1):", res.rows?.[0]);
    }
    return true;
  } catch (err) {
    console.error("❌ Error conectando a PostgreSQL:", err.message);
    return false;
  }
}