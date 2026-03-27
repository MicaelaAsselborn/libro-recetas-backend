import pool from "../config/database";

import { IRecipe } from "../types/recipe";
import { RowDataPacket } from "mysql2";

export interface FavoriteRow extends RowDataPacket {
	user_id: number;
	recipe_id: number;
	created_on: Date;
}

// Listar favoritos
export const findFavoritesByUserId = async (
	userId: number,
): Promise<IRecipe[]> => {
	const query = `
        SELECT 
            r.id, 
            r.title, 
            r.user_id, 
            r.description, 
            r.image_url, 
            r.ingredients, 
            r.instructions, 
            r.category, 
            r.tags, 
            r.is_public, 
            r.is_active, 
            r.created_on, 
            r.updated_on
        FROM favorites f
        JOIN recipes r ON f.recipe_id = r.id
        WHERE f.user_id = ?
            AND r.is_active = true
            AND (r.is_public = true OR r.user_id = ?)
        ORDER BY r.created_on DESC
    `;

	const [rows] = await pool.query<RowDataPacket[]>(query, [userId, userId]);

	return rows as IRecipe[];
};

// Verificar si una receta está activa
export const isRecipeActive = async (recipeId: number): Promise<boolean> => {
	const [rows] = await pool.query<RowDataPacket[]>(
		"SELECT is_active FROM recipes WHERE id = ?",
		[recipeId],
	);
	if (rows.length === 0) {
		return false; // no existe
	}
	return rows[0].is_active === 1; // existe y está activa
};

// Verificar si ya es favorita
export const isFavorite = async (
	userId: number,
	recipeId: number,
): Promise<boolean> => {
	const [rows] = await pool.query<FavoriteRow[]>(
		"SELECT * FROM favorites WHERE user_id = ? AND recipe_id = ?",
		[userId, recipeId],
	);
	return rows.length > 0;
};

// Agregar favorito
export const addFavorite = async (
	userId: number,
	recipeId: number,
): Promise<void> => {
	// Verificar que la receta existe y está activa
	const recipeExists = await isRecipeActive(recipeId);
	if (!recipeExists) {
		throw new Error("La receta no existe o no está disponible");
	}

	// Verificar que no esté ya marcada
	const alreadyFavorite = await isFavorite(userId, recipeId);
	if (alreadyFavorite) {
		throw new Error("La receta ya está en favoritos");
	}

	await pool.query(
		"INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)",
		[userId, recipeId],
	);
};

// Quitar favorito
export const removeFavorite = async (
	userId: number,
	recipeId: number,
): Promise<void> => {
	// Verificar que exista
	const exists = await isFavorite(userId, recipeId);
	if (!exists) {
		throw new Error("La receta no está en favoritos");
	}

	await pool.query(
		"DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?",
		[userId, recipeId],
	);
};
