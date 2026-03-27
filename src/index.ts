import express from "express";
import { errorHandler } from "./middlewares/errorHandler";

import authRouter from "./routes/auth.routes";
import userRouter from "./routes/user.routes";
import recipeRouter from "./routes/recipe.routes";
import favoriteRouter from "./routes/favorite.routes";

import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON
app.use(express.json());

// Registro e inicio de sesión
app.use("/api/auth", authRouter);

app.use("/api/users", userRouter); // CRUD de usuarios
app.use("/api/recipes", recipeRouter); // CRUD de recetas
app.use("api/favorites", favoriteRouter); // CRD de favoritos

app.use(errorHandler);

// Iniciar el servidor HTTP
app.listen(PORT, () => {
	console.log(`Servidor corriendo en http://localhost:${PORT} 🚀`);
});
