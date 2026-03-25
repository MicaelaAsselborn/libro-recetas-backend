import { AppError } from "../middlewares/errorHandler";
import {
	IRecipe,
	FindRecipesFilters,
	Ingredient,
	InstructionStep,
	Category,
} from "../types/recipe";

import * as recipeModel from "../models/recipe.model";

// Buscar todas las recetas
export const findAllRecipes = async (
	filters: FindRecipesFilters,
	authenticatedUserId?: number,
): Promise<IRecipe[]> => {
	// Copia para no modificar el original
	const finalFilters: FindRecipesFilters = { ...filters };

	// Si pide "mis recetas" y hay usuario autenticado
	if (filters.userId && authenticatedUserId) {
		finalFilters.userId = authenticatedUserId;
		// Mis recetas: veo todas (públicas y privadas)
		finalFilters.onlyPublic = false;
	}

	// Si pide recetas de otro autor, solo públicas
	if (filters.authorId && filters.authorId !== authenticatedUserId) {
		finalFilters.onlyPublic = true;
	}

	// Si no hay filtro de usuario, solo públicas
	if (!finalFilters.userId && !finalFilters.authorId) {
		finalFilters.onlyPublic = true;
	}

	// Papelera: solo si es el dueño
	if (
		finalFilters.isActive === false &&
		finalFilters.userId !== authenticatedUserId
	) {
		// No puede ver papelera ajena, devolver vacío o activas
		finalFilters.isActive = true;
	}

	// Por defecto, activas
	if (finalFilters.isActive === undefined) {
		finalFilters.isActive = true;
	}

	return await recipeModel.findAllRecipes(finalFilters);
};

// Buscar por ID
export const findRecipeById = async (
	id: number,
	authenticatedUserId?: number,
): Promise<IRecipe | null> => {
	if (isNaN(id) || id <= 0) {
		throw new AppError("ID de receta inválida", 400);
	}

	const recipe = await recipeModel.findRecipeById(id);
	if (!recipe) return null;

	// Si está inactiva
	if (!recipe.is_active) {
		// Solo el dueño o admin pueden verla
		if (
			authenticatedUserId !== recipe.user_id &&
			authenticatedUserId !== 1
		) {
			// admin hardcodeado
			throw new AppError("Receta no encontrada", 404);
		}
	}

	// Si está activa pero es privada
	if (!recipe.is_public) {
		// Solo el dueño o admin pueden verla
		if (
			authenticatedUserId !== recipe.user_id &&
			authenticatedUserId !== 1
		) {
			throw new AppError("Receta no encontrada", 404);
		}
	}

	return recipe;
};

// Crear receta
export const createRecipe = async (
	recipeData: {
		title: string;
		description?: string;
		image_url?: string;
		ingredients: Ingredient[];
		instructions: InstructionStep[];
		category: Category;
		tags?: string[];
		is_public: boolean;
		is_active: boolean;
	},
	user_id: number,
): Promise<IRecipe | null> => {
	const recipeId = await recipeModel.createRecipe(
		{
			title: recipeData.title,
			description: recipeData.description,
			image_url: recipeData.image_url,
			ingredients: recipeData.ingredients,
			instructions: recipeData.instructions,
			category: recipeData.category,
			tags: recipeData.tags,
			is_public: recipeData.is_public,
			is_active: recipeData.is_active,
		},
		user_id,
	);

	return await recipeModel.findRecipeById(recipeId);
};

// Actualizar receta
export const updateRecipe = async (
	id: number,
	updateData: {
		title?: string;
		description?: string;
		image_url?: string;
		ingredients?: Ingredient[];
		instructions?: InstructionStep[];
		category?: Category;
		tags?: string[];
		is_public?: boolean;
		is_active?: boolean;
	},
	authenticatedUserId: number,
): Promise<IRecipe | null> => {
	// Verificar que la receta existe
	const existingRecipe = await recipeModel.findRecipeById(id);
	if (!existingRecipe) {
		throw new AppError("Receta no encontrada", 404);
	}

	// Verificar permisos: solo el dueño o admin
	if (
		existingRecipe.user_id !== authenticatedUserId &&
		authenticatedUserId !== 1
	) {
		throw new AppError("No tienes permiso para modificar esta receta", 403);
	}

	// Actualizar
	const updated = await recipeModel.updateRecipe(id, updateData);
	if (!updated) {
		throw new AppError("No se pudo actualizar la receta", 500);
	}

	// Devolver la receta actualizada
	return await recipeModel.findRecipeById(id);
};

// Borrado lógico (desactivar)
export const softDeleteRecipe = async (
	id: number,
	authenticatedUserId: number,
): Promise<IRecipe | null> => {
	// Verificar que la receta existe
	const existingRecipe = await recipeModel.findRecipeById(id);
	if (!existingRecipe) {
		throw new AppError("Receta no encontrada", 404);
	}

	// Verificar permisos: solo el dueño o admin
	if (
		existingRecipe.user_id !== authenticatedUserId &&
		authenticatedUserId !== 1
	) {
		throw new AppError("No tienes permiso para eliminar esta receta", 403);
	}

	// Verificar que no esté ya desactivada
	if (!existingRecipe.is_active) {
		throw new AppError("La receta ya esta desactivada", 409);
	}

	const updated = await recipeModel.softDeleteRecipe(id);
	if (!updated) {
		throw new AppError("No se pudo desactivar la receta", 500);
	}

	return await recipeModel.findRecipeById(id);
};

// Reactivar receta
export const reactivateRecipe = async (
	id: number,
	authenticatedUserId: number,
): Promise<IRecipe | null> => {
	const existingRecipe = await recipeModel.findRecipeById(id);
	if (!existingRecipe) {
		throw new AppError(`No se encontró la receta con ID: ${id}`, 404);
	}

	// Verificar permisos: solo el dueño o admin
	if (
		existingRecipe.user_id !== authenticatedUserId &&
		authenticatedUserId !== 1
	) {
		throw new AppError("No tienes permiso para reactivar esta receta", 403);
	}

	if (existingRecipe.is_active) {
		throw new AppError("La receta ya está activa", 409);
	}

	const updated = await recipeModel.reactivateRecipe(id);
	if (!updated) {
		throw new AppError("No se pudo reactivar la receta", 500);
	}

	return await recipeModel.findRecipeById(id);
};

// Borrado físico (solo admin y autor de la receta)
export const hardDeleteRecipe = async (
	id: number,
	authenticatedUserId: number,
): Promise<boolean> => {
	const existingRecipe = await recipeModel.findRecipeById(id);
	if (!existingRecipe) {
		throw new AppError(`No se encontró la receta con ID: ${id}`, 404);
	}

	// Verificar permisos: solo el dueño o admin
	if (
		existingRecipe.user_id !== authenticatedUserId &&
		authenticatedUserId !== 1
	) {
		throw new AppError("No tienes permiso para eliminar esta receta", 403);
	}

	return await recipeModel.hardDeleteRecipe(id);
};
