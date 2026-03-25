import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import {
	createUserValidator,
	updateUserValidator,
	idParamValidator,
} from "../validators/user.validator";

import * as userController from "../controllers/user.controller";

const router = Router();

// Rutas públicas
router.post("/", createUserValidator, userController.createUser);
router.get("/", userController.findAllUsers);
router.get("/:id", idParamValidator, userController.findUserById);
router.get("/search", userController.findUserByUsernameOrEmail);

// Rutas protegidas (Requieren autenticación)
router.patch(
	"/:id",
	authenticate,
	idParamValidator,
	updateUserValidator,
	userController.updateUser,
);
router.delete(
	"/:id",
	authenticate,
	idParamValidator,
	userController.softDeleteUser,
);

// Rutas solo Admin
router.patch(
	"/:id/reactivate",
	authenticate,
	authorize(["admin"]),
	idParamValidator,
	userController.reactivateUser,
);
router.delete(
	"/:id/hard",
	authenticate,
	authorize(["admin"]),
	idParamValidator,
	userController.hardDeleteUser,
);

export default router;
