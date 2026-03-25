import { AppError } from "../middlewares/errorHandler";
import { FindRecipesFilters } from "../types/recipe";
import { NextFunction, Request, Response } from "express";

import * as recipeService from "../services/recipe.service";

// Buscar todas las recetas
export const findAllRecipes = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const filters: FindRecipesFilters = {};

		if (req.query.category) {
			filters.category = req.query.category as string;
		}
		if (req.query.tag) {
			filters.tag = req.query.tag as string;
		}
		if (req.query.title) {
			filters.title = req.query.title as string;
		}
		if (req.query.limit) {
			filters.limit = parseInt(req.query.limit as string);
		}
		if (req.query.offset) {
			filters.offset = parseInt(req.query.offset as string);
		}
		if (req.query.isActive === "false") {
			filters.isActive = false;
		}
		if (req.query.my === "true" && req.user) {
			filters.userId = req.user.id;
		}
		if (req.query.author) {
			filters.authorId = parseInt(req.query.author as string);
		}
		if (req.query.onlyPublic === "true") {
			filters.onlyPublic = true;
		}

		const recipes = await recipeService.findAllRecipes(
			filters,
			req.user?.id,
		);

		res.json({
			success: true,
			data: recipes,
			count: recipes.length,
			message: "Recetas obtenidas exitosamente",
		});
	} catch (error) {
		next(error);
	}
};

// Buscar por ID
export const findRecipeById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const id = parseInt(req.params.id as string);
	if (isNaN(id)) {
		return next(new AppError("ID inválido", 400));
	}

	try {
		const recipe = await recipeService.findRecipeById(id, req.user?.id);

		if (!recipe) {
			return next(new AppError("Receta no encontrada", 404));
		}

		return res.status(200).json({
			success: true,
			data: recipe,
			message: "Receta encontrada",
		});
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}
		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al obtener el receta",
			),
		);
	}
};

// Crear receta
export const createRecipe = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const {
			title,
			description,
			image_url,
			ingredients,
			instructions,
			category,
			tags,
			is_public,
			is_active,
		} = req.body;
		const user_id = Number(req.user?.id);

		const newRecipe = await recipeService.createRecipe(
			{
				title,
				description,
				image_url,
				ingredients,
				instructions,
				category,
				tags,
				is_public,
				is_active,
			},
			user_id,
		);

		return res.status(201).json({
			success: true,
			data: newRecipe,
			message: "Receta creada exitosamente",
		});
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}

		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al crear la receta",
			),
		);
	}
};

// Actualizar receta
export const updateRecipe = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = parseInt(req.params.id as string);
		const authenticatedUserId = Number(req.user?.id);

		if (isNaN(id)) {
			return next(new AppError("ID inválido", 400));
		}

		if (!req.user) {
			return next(new AppError("Usuario no autenticado", 401));
		}

		const updates = req.body;
		if (Object.keys(updates).length === 0) {
			return next(new AppError("No hay datos para actualizar", 400));
		}

		const updatedRecipe = await recipeService.updateRecipe(
			id,
			updates,
			authenticatedUserId,
		);
		if (!updatedRecipe) {
			return next(new AppError("Receta no encontrada", 404));
		}

		return res.status(200).json({
			success: true,
			data: updatedRecipe,
			message: "Receta actualizado exitosamente",
		});
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}

		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al actualizar el receta",
			),
		);
	}
};

// Borrado lógico (desactivar)
export const softDeleteRecipe = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = parseInt(req.params.id as string);
		const authenticatedUserId = Number(req.user?.id);

		if (isNaN(id)) {
			return next(new AppError("ID inválido", 400));
		}

		if (!req.user) {
			return next(new AppError("Usuario no autenticado", 401));
		}

		const updatedRecipe = await recipeService.softDeleteRecipe(
			id,
			authenticatedUserId,
		);

		return res.status(200).json({
			success: true,
			data: updatedRecipe,
			message: "Receta desactivada exitosamente",
		});
	} catch (error) {
		next(error);
	}
};

// Reactivar receta
export const reactivateRecipe = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = parseInt(req.params.id as string);
		const authenticatedUserId = Number(req.user?.id);

		if (isNaN(id)) {
			return next(new AppError("ID inválido", 400));
		}

		if (!req.user) {
			return next(new AppError("Usuario no autenticado", 401));
		}

		const updatedRecipe = await recipeService.reactivateRecipe(
			id,
			authenticatedUserId,
		);

		return res.status(200).json({
			success: true,
			data: updatedRecipe,
			message: "Receta activada exitosamente",
		});
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}

		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al reactivar la receta",
			),
		);
	}
};

// Borrado físico (solo admin y autor)
export const hardDeleteRecipe = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = parseInt(req.params.id as string);
		const authenticatedUserId = Number(req.user?.id);

		if (isNaN(id)) {
			return next(new AppError("ID inválido", 400));
		}

		if (!req.user) {
			return next(new AppError("Usuario no autenticado", 401));
		}

		const deleted = await recipeService.hardDeleteRecipe(
			id,
			authenticatedUserId,
		);

		if (!deleted) {
			return next(new AppError("No se pudo eliminar la receta", 500));
		}

		return res.status(204).send(); // 204 No Content
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}

		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al eliminar la receta",
			),
		);
	}
};
