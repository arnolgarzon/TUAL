import express from "express";
import cors from "cors";
import router from "./src/routes/index.js";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", router); // esto crea /api/empresas

app.listen(5000, () => {
  console.log("🚀 Servidor TUAL corriendo en http://localhost:5000");
});