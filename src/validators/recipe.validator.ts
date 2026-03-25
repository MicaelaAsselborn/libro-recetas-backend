// src/validators/recipe.validator.ts
import { body, query, param } from "express-validator";
import { Category } from "../types/recipe";

// Validación para creación de receta
export const createRecipeValidator = [
	body("title")
		.notEmpty()
		.withMessage("El título es obligatorio")
		.isLength({ min: 3, max: 200 })
		.withMessage("El título debe tener entre 3 y 200 caracteres"),

	body("description")
		.optional()
		.isLength({ max: 1000 })
		.withMessage("La descripción no puede exceder los 1000 caracteres"),

	body("image_url")
		.optional()
		.isURL()
		.withMessage("La URL de la imagen debe ser válida"),

	body("ingredients")
		.isArray({ min: 1 })
		.withMessage("Debe haber al menos un ingrediente")
		.custom((ingredients) => {
			for (const ingredient of ingredients) {
				if (
					!ingredient.name ||
					!ingredient.quantity ||
					!ingredient.unit
				) {
					throw new Error(
						"Cada ingrediente debe tener nombre, cantidad y unidad",
					);
				}
			}
			return true;
		}),

	body("instructions")
		.isArray({ min: 1 })
		.withMessage("Debe haber al menos una instrucción")
		.custom((instructions) => {
			for (const instruction of instructions) {
				if (!instruction.step || !instruction.text) {
					throw new Error(
						"Cada instrucción debe tener número y texto",
					);
				}
			}
			return true;
		}),

	body("category")
		.notEmpty()
		.withMessage("La categoría es obligatoria")
		.isIn(Object.values(Category))
		.withMessage(
			`Categoría inválida. Debe ser: ${Object.values(Category).join(", ")}`,
		),

	body("tags")
		.optional()
		.isArray()
		.withMessage("Las etiquetas deben ser un array de strings")
		.custom((tags) => {
			if (tags && tags.some((tag: any) => typeof tag !== "string")) {
				throw new Error("Las etiquetas deben ser strings");
			}
			return true;
		}),

	body("is_public")
		.optional()
		.isBoolean()
		.withMessage("is_public debe ser true o false"),
];

// Validación para actualización (todos opcionales)
export const updateRecipeValidator = [
	param("id").isInt({ min: 1 }).withMessage("ID inválido"),

	body("title")
		.optional()
		.isLength({ min: 3, max: 200 })
		.withMessage("El título debe tener entre 3 y 200 caracteres"),

	body("description")
		.optional()
		.isLength({ max: 1000 })
		.withMessage("La descripción no puede exceder los 1000 caracteres"),

	body("image_url")
		.optional()
		.isURL()
		.withMessage("La URL de la imagen debe ser válida"),

	body("ingredients")
		.optional()
		.isArray()
		.withMessage("Los ingredientes deben ser un array")
		.custom((ingredients) => {
			if (ingredients) {
				for (const ingredient of ingredients) {
					if (
						!ingredient.name ||
						!ingredient.quantity ||
						!ingredient.unit
					) {
						throw new Error(
							"Cada ingrediente debe tener nombre, cantidad y unidad",
						);
					}
				}
			}
			return true;
		}),

	body("instructions")
		.optional()
		.isArray()
		.withMessage("Las instrucciones deben ser un array")
		.custom((instructions) => {
			if (instructions) {
				for (const instruction of instructions) {
					if (!instruction.step || !instruction.text) {
						throw new Error(
							"Cada instrucción debe tener número y texto",
						);
					}
				}
			}
			return true;
		}),

	body("category")
		.notEmpty()
		.withMessage("La categoría es obligatoria")
		.isIn(Object.values(Category))
		.withMessage(
			`Categoría inválida. Debe ser: ${Object.values(Category).join(", ")}`,
		),

	body("tags")
		.optional()
		.isArray()
		.withMessage("Las etiquetas deben ser un array de strings")
		.custom((tags) => {
			if (tags && tags.some((tag: any) => typeof tag !== "string")) {
				throw new Error("Las etiquetas deben ser strings");
			}
			return true;
		}),

	body("is_public")
		.optional()
		.isBoolean()
		.withMessage("is_public debe ser true o false"),

	body("is_active")
		.optional()
		.isBoolean()
		.withMessage("is_active debe ser true o false"),
];

// Validación para búsqueda con filtros (query params)
export const findAllRecipesValidator = [
	query("category")
		.optional()
		.isIn(Object.values(Category))
		.withMessage(
			`Categoría inválida. Debe ser: ${Object.values(Category).join(", ")}`,
		),

	query("tag").optional().isString().withMessage("El tag debe ser un texto"),

	query("title")
		.optional()
		.isString()
		.withMessage("El título de búsqueda debe ser texto"),

	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("El límite debe ser un número entre 1 y 100"),

	query("offset")
		.optional()
		.isInt({ min: 0 })
		.withMessage("El offset debe ser un número positivo"),

	query("isActive")
		.optional()
		.isBoolean()
		.withMessage("isActive debe ser true o false"),

	query("my").optional().isBoolean().withMessage("my debe ser true o false"),

	query("author")
		.optional()
		.isInt({ min: 1 })
		.withMessage("author debe ser un ID válido"),

	query("onlyPublic")
		.optional()
		.isBoolean()
		.withMessage("onlyPublic debe ser true o false"),
];

// Validación para ID en parámetros
export const idParamValidator = [
	param("id").isInt({ min: 1 }).withMessage("ID inválido"),
];
