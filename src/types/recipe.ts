export enum Category {
	MAIN = "principal",
	DESSERT = "postre",
	SNACKS = "aperitivos",
	SAUCES = "salsas",
	BEVERAGES = "bebidas",
	BREADS = "panes",
	SALADS = "ensaladas",
}

export interface Ingredient {
	name: string;
	quantity: number;
	unit: string;
}

export interface InstructionStep {
	step: number;
	text: string;
}

export interface IRecipe {
	id: number;
	title: string;
	user_id: number;
	description?: string;
	image_url?: string;
	ingredients: Ingredient[];
	instructions: InstructionStep[];
	category: Category;
	tags?: string[];
	is_public: boolean;
	is_active: boolean;
	created_on: Date;
	updated_on: Date;
}

export interface FindRecipesFilters {
	userId?: number; // Para "mis recetas" (filtra por usuario autenticado)
	authorId?: number; // Para recetas de un autor específico
	category?: string; // Filtro por category
	tag?: string; // Filtro por tags (JSON)
	title?: string; // Búsqueda por título
	onlyPublic?: boolean; // Si es true, solo recetas públicas
	isActive?: boolean; // Si es false, trae recetas inactivas (papelera)
	limit?: number; // Paginación: cantidad de registros
	offset?: number; // Paginación: desde dónde empezar
}
