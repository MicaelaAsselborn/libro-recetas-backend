// src/services/favorite.service.ts
import * as favoriteModel from "../models/favorite.model";
import { AppError } from "../middlewares/errorHandler";
import { IRecipe } from "../types/recipe";

// Listar favoritos
export const getFavorites = async (userId: number): Promise<IRecipe[]> => {
	// Obtener todas las recetas favoritas del usuario
	const favorites = await favoriteModel.findFavoritesByUserId(userId);

	// Devolver array
	return favorites;
};

// Agregar favorito
export const addFavorite = async (
	userId: number,
	recipeId: number,
): Promise<void> => {
	// 1. Verificar que la receta existe y está activa
	const isActive = await favoriteModel.isRecipeActive(recipeId);
	if (!isActive) {
		throw new AppError("La receta no existe o no está disponible", 404);
	}

	// 2. Verificar que no esté ya en favoritos
	const alreadyFavorite = await favoriteModel.isFavorite(userId, recipeId);
	if (alreadyFavorite) {
		throw new AppError("La receta ya está en favoritos", 409);
	}

	// 3. Insertar en favoritos
	await favoriteModel.addFavorite(userId, recipeId);
};

// Quitar favorito
export const removeFavorite = async (
	userId: number,
	recipeId: number,
): Promise<void> => {
	// 1. Verificar que exista
	const exists = await favoriteModel.isFavorite(userId, recipeId);
	if (!exists) {
		throw new AppError("La receta no está en favoritos", 404);
	}

	// 2. Eliminar
	await favoriteModel.removeFavorite(userId, recipeId);
};
