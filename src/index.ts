import express from "express";

// Instancia Express
const app = express();

// Puerto local
const PORT =  5000;

// Middleware JSON: Convierte automáticamente el body de requests JSON a objetos JavaScript
app.use(express.json());

// Endpoint raíz
app.get("/", (req, res) => {
    res.json({ message: "¡Backend de Recetas funcionando!"});
})

// Inicia servidor
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
})