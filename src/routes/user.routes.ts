import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import * as userController from "../controllers/user.controller";

const router = Router();

// Rutas públicas
router.post("/", userController.createUser);
router.get("/", userController.findAllUsers);
router.get("/:id", userController.findUserById);
router.get("/search", userController.findUserByUsernameOrEmail);

// Rutas protegidas (Requieren autenticación)
router.patch("/:id", authenticate, userController.updateUser);
router.delete("/:id", authenticate, userController.softDeleteUser);

// Rutas solo Admin
router.patch(
	"/:id/reactivate",
	authenticate,
	authorize(["admin"]),
	userController.reactivateUser,
);
router.delete(
	"/:id/hard",
	authenticate,
	authorize(["admin"]),
	userController.hardDeleteUser,
);

export default router;
