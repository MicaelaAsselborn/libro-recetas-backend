import { authenticate } from "../middlewares/auth.middleware";
import {
	createRecipeValidator,
	updateRecipeValidator,
	findAllRecipesValidator,
	idParamValidator,
} from "../validators/recipe.validator";
import { Router } from "express";

import * as recipeController from "../controllers/recipe.controller";

const router = Router();

// Rutas públicas
router.get("/", findAllRecipesValidator, recipeController.findAllRecipes);
router.get("/:id", idParamValidator, recipeController.findRecipeById);

// Rutas protegidas (Requieren autenticación)
router.post(
	"/",
	authenticate,
	createRecipeValidator,
	recipeController.createRecipe,
);
router.patch(
	"/:id",
	authenticate,
	idParamValidator,
	updateRecipeValidator,
	recipeController.updateRecipe,
);
router.delete("/:id", authenticate, recipeController.softDeleteRecipe);
router.patch(
	"/:id/reactivate",
	authenticate,
	idParamValidator,
	recipeController.reactivateRecipe,
);
router.delete(
	"/:id/hard",
	authenticate,
	idParamValidator,
	recipeController.hardDeleteRecipe,
);

export default router;
