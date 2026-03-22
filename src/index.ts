import express, { Request, Response } from "express";
import pool, { testConnection } from "./config/database";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON
app.use(express.json());

// Ruta de prueba
app.get("/ping", (req, res) => {
	res.json({
		message: "pong",
		timestamp: new Date(),
	});
});

// Iniciar el servidor HTTP
app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT} 🚀`);
});
