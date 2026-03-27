// src/controllers/favorite.controller.ts
import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { AppError } from "../middlewares/errorHandler";

import * as favoriteService from "../services/favorite.service";

// Listar favoritos del usuario
export const getFavorites = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return next(new AppError("Usuario no autenticado", 401));
		}

		const favorites = await favoriteService.getFavorites(userId);

		res.status(200).json({
			success: true,
			data: favorites,
			count: favorites.length,
			message: "Favoritos obtenidos exitosamente",
		});
	} catch (error) {
		next(error);
	}
};

// Agregar favorito
export const addFavorite = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Validar errores de express-validator
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res
				.status(400)
				.json({ success: false, errors: errors.array() });
		}

		const recipeId = parseInt(req.params.recipeId as string);
		const userId = req.user?.id;

		if (!userId) {
			return next(new AppError("Usuario no autenticado", 401));
		}

		await favoriteService.addFavorite(userId, recipeId);

		res.status(201).json({
			success: true,
			message: "Receta agregada a favoritos",
		});
	} catch (error) {
		next(error);
	}
};

// Quitar favorito
export const removeFavorite = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res
				.status(400)
				.json({ success: false, errors: errors.array() });
		}

		const recipeId = parseInt(req.params.recipeId as string);
		const userId = req.user?.id;

		if (!userId) {
			return next(new AppError("Usuario no autenticado", 401));
		}

		await favoriteService.removeFavorite(userId, recipeId);

		res.status(200).json({
			success: true,
			message: "Receta removida de favoritos",
		});
	} catch (error) {
		next(error);
	}
};
