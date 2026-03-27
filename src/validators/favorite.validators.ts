// src/validators/favorite.validator.ts
import { param } from "express-validator";

// Validador para el ID de receta en los parámetros
export const recipeIdParamValidator = [
	param("id")
		.isInt({ min: 1 })
		.withMessage("El ID de la receta debe ser un número entero positivo"),
];
