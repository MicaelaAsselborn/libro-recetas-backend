import express, { Request, Response } from "express";
import { errorHandler } from "./middlewares/errorHandler";

import userRouter from "./routes/user.routes";

import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON
app.use(express.json());

app.use("/api/users", userRouter);

app.use(errorHandler);

// Iniciar el servidor HTTP
app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT} 🚀`);
});
