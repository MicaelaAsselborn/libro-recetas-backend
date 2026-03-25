import pool from "../config/database";

import { RowDataPacket } from "mysql2";
import {
	IRecipe,
	Category,
	Ingredient,
	InstructionStep,
	FindRecipesFilters,
} from "../types/recipe";

export interface RecipeRow extends IRecipe, RowDataPacket {}

// Buscar todas las recetas
export const findAllRecipes = async (
	filters: FindRecipesFilters = {},
): Promise<IRecipe[]> => {
	let query = `
        SELECT id, title, user_id, description, image_url, ingredients, instructions, category, tags, is_public, is_active, created_on updated_on FROM recipes WHERE 1=1
    `;
	const values: any[] = [];

	// Filtro por usuario (mis recetas)
	if (filters.userId !== undefined) {
		query += ` AND user_id = ?`;
		values.push(filters.userId);
	}

	// Filtro por autor específico
	if (filters.authorId !== undefined) {
		query += ` AND user_id = ?`;
		values.push(filters.authorId);
	}

	// Filtro por categoría principal
	if (filters.category) {
		query += ` AND category = ?`;
		values.push(filters.category);
	}

	// Filtro por etiqueta (búsqueda en JSON array)
	if (filters.tag) {
		query += ` AND JSON_CONTAINS(tags, ?)`;
		values.push(JSON.stringify(filters.tag));
	}

	// Búsqueda por título (coincidencia parcial)
	if (filters.title) {
		query += ` AND title LIKE ?`;
		values.push(`%${filters.title}%`);
	}

	// Filtro por visibilidad (públicas/privadas)
	if (filters.onlyPublic === true) {
		query += ` AND is_public = TRUE`;
	}

	// Filtro por estado activo (para papelera)
	if (filters.isActive !== undefined) {
		query += ` AND is_active = ?`;
		values.push(filters.isActive);
	} else {
		// Por defecto, solo recetas activas
		query += ` AND is_active = TRUE`;
	}

	// Ordenamiento
	query += ` ORDER BY created_on DESC`;

	// Paginación
	if (filters.limit !== undefined) {
		query += ` LIMIT ?`;
		values.push(filters.limit);

		if (filters.offset !== undefined) {
			query += ` OFFSET ?`;
			values.push(filters.offset);
		}
	}

	const [rows] = await pool.query<RecipeRow[]>(query, values);
	return rows;
};

// Buscar por ID
export const findRecipeById = async (id: number): Promise<IRecipe | null> => {
	const [rows] = await pool.query<RecipeRow[]>(
		"SELECT * FROM recipes WHERE id = ?",
		[id],
	);
	return rows[0] || null;
};

// Buscar recetas por user_id (para borrado fisico en userService)
export const findRecipesByUserId = async (
	userId: number,
): Promise<IRecipe[]> => {
	const [rows] = await pool.query<RecipeRow[]>(
		"SELECT * FROM recipes WHERE user_id = ?",
		[userId],
	);
	return rows;
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
): Promise<number> => {
	const [result] = await pool.query(
		"INSERT INTO recipes (title, user_id, description, image_url, ingredients, instructions, category, tags, is_public, is_active VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
		[
			recipeData.title,
			user_id,
			recipeData.description || null,
			recipeData.image_url || null,
			JSON.stringify(recipeData.ingredients),
			JSON.stringify(recipeData.instructions),
			recipeData.category,
			recipeData.tags ? JSON.stringify(recipeData.tags) : null,
			recipeData.is_public,
			recipeData.is_active,
		],
	);
	return (result as any).insertId;
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
): Promise<boolean> => {
	// Construir la query dinámicamente
	const fields: string[] = [];
	const values: any[] = [];

	if (updateData.title !== undefined) {
		fields.push("title = ?");
		values.push(updateData.title);
	}
	if (updateData.description !== undefined) {
		fields.push("description = ?");
		values.push(updateData.description);
	}
	if (updateData.image_url !== undefined) {
		fields.push("image_url = ?");
		values.push(updateData.image_url);
	}
	if (updateData.ingredients !== undefined) {
		fields.push("ingredients = ?");
		values.push(JSON.stringify(updateData.ingredients));
	}
	if (updateData.instructions !== undefined) {
		fields.push("instructions = ?");
		values.push(JSON.stringify(updateData.instructions));
	}
	if (updateData.category !== undefined) {
		fields.push("category = ?");
		values.push(updateData.category);
	}
	if (updateData.tags !== undefined) {
		fields.push("tags = ?");
		values.push(JSON.stringify(updateData.tags));
	}
	if (updateData.is_public !== undefined) {
		fields.push("is_public = ?");
		values.push(updateData.is_public);
	}
	if (updateData.is_active !== undefined) {
		fields.push("is_active = ?");
		values.push(updateData.is_active);
	}

	// Si no hay campos para actualizar, no hacer nada
	if (fields.length === 0) {
		return false;
	}

	// Agregar el ID al final
	values.push(id);

	const query = `UPDATE recipes SET ${fields.join(", ")} WHERE id = ?`;
	const [result] = await pool.query(query, values);

	return (result as any).affectedRows > 0;
};

// Borrado lógico (solo desactivar)
export const softDeleteRecipe = async (id: number): Promise<boolean> => {
	const [result] = await pool.query(
		"UPDATE recipes SET is_active = false, updated_on = NOW() WHERE id = ?",
		[id],
	);
	return (result as any).affectedRows > 0;
};

// Reactivar receta
export const reactivateRecipe = async (id: number): Promise<boolean> => {
	const [result] = await pool.query(
		"UPDATE recipes SET is_active = true, updated_on = NOW() WHERE id = ?",
		[id],
	);
	return (result as any).affectedRows > 0;
};

// Borrado físico (eliminar definitivamente)
export const hardDeleteRecipe = async (id: number): Promise<boolean> => {
	const [result] = await pool.query("DELETE FROM recipes WHERE id = ?", [id]);
	return (result as any).affectedRows > 0;
};
