export enum MainCategory {
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
	main_category: MainCategory;
	optional_categories: string[];
	is_public: boolean;
	is_active: boolean;
	created_on: Date;
	updated_on: Date;
}
