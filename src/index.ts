import express from "express";
import "dotenv/config";
import pool from "./database";

// Instancia Express
const app = express();

// Puerto local
const PORT =  process.env.PORT || 5000;

// Middleware JSON: Convierte automáticamente el body de requests JSON a objetos JavaScript
app.use(express.json());

// Endpoint raíz
app.get("/", (req, res) => {
    res.json({ message: "¡Backend de Recetas funcionando!"});
})
// Endpoint de prueba de conexión a la base de datos
app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({
            status: "healthy",
            database: "connected",
            timeStamp: new Date().toISOString()
        });
    } catch (error: any) {
        res.status(500).json({
            status: "unhealthy",
            database: "disconnected",
            error: error.message
        });
    }
});

// Inicia servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
})