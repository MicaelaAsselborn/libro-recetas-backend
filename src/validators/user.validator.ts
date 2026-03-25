import { body, ValidationChain } from "express-validator";
import { UserRole } from "../types/auth";

export const validatePassword: ValidationChain[] = [
	body("password")
		.isLength({ min: 8 })
		.withMessage("La contraseña debe tener al menos 8 caracteres")
		.matches(/\d/)
		.withMessage("La contraseña debe contener al menos un número")
		.matches(/[A-Z]/)
		.withMessage("La contraseña debe contener al menos una mayúscula")
		.matches(/[^A-Za-z0-9]/)
		.withMessage(
			"La contraseña debe contener al menos un carácter especial",
		),
];

export const validateEmail: ValidationChain[] = [
	body("email")
		.isEmail()
		.withMessage("Debe ser un email válido")
		.normalizeEmail(),
];

export const createUserValidator: ValidationChain[] = [
	...validateEmail,
	...validatePassword,
	body("username")
		.isLength({ min: 3 })
		.withMessage("Username debe tener al menos 3 caracteres")
		.matches(/^[a-zA-Z0-9_]+$/)
		.withMessage(
			"Username solo puede contener letras, números y guiones bajos",
		),
	body("role")
		.optional()
		.isIn(Object.values(UserRole))
		.withMessage(
			"El rol debe ser uno de los valores permitidos: user, admin",
		),
];

export const updateUserValidator: ValidationChain[] = [
	body("username")
		.optional()
		.isLength({ min: 3 })
		.withMessage("Username debe tener al menos 3 caracteres")
		.matches(/^[a-zA-Z0-9_]+$/)
		.withMessage(
			"Username solo puede contener letras, números y guiones bajos",
		),
	body("email")
		.optional()
		.isEmail()
		.withMessage("Debe ser un email válido")
		.normalizeEmail(),
	body("password")
		.optional()
		.isLength({ min: 8 })
		.withMessage("La contraseña debe tener al menos 8 caracteres")
		.matches(/\d/)
		.withMessage("La contraseña debe contener al menos un número")
		.matches(/[A-Z]/)
		.withMessage("La contraseña debe contener al menos una mayúscula")
		.matches(/[^A-Za-z0-9]/)
		.withMessage(
			"La contraseña debe contener al menos un carácter especial",
		),
	body("role")
		.optional()
		.isIn(Object.values(UserRole))
		.withMessage(
			"El rol debe ser uno de los valores permitidos: user, admin",
		),
];

import { param } from "express-validator";

export const idParamValidator = [
	param("id")
		.isInt({ min: 1 })
		.withMessage("El ID debe ser un número entero positivo"),
];
