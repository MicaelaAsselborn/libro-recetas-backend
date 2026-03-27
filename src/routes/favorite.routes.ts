import { authenticate } from "../middlewares/auth.middleware";
import { recipeIdParamValidator } from "../validators/favorite.validators";
import { Router } from "express";

import * as favoriteController from "../controllers/favorite.controller";

const router = Router();

// Rutas protegidas
router.get("/", authenticate, favoriteController.getFavorites);
router.post(
	"/:id",
	authenticate,
	recipeIdParamValidator,
	favoriteController.addFavorite,
);
router.delete(
	"/:id",
	authenticate,
	recipeIdParamValidator,
	favoriteController.removeFavorite,
);

export default router;
