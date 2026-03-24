import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { validationResult } from "express-validator";
import { AppError } from "../middlewares/errorHandler";

// Registrar usuario
export const register = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// Verifica errores de validación
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({ success: false, errors: errors.array() });
	}

	try {
		const { username, email, password, full_name, role } = req.body;

		const newUser = await authService.register({
			username,
			email,
			password,
			full_name,
			role,
		});

		return res.status(201).json({
			success: true,
			data: newUser,
			message: "Usuario creado exitosamente",
		});
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}

		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al crear el usuario",
				500,
			),
		);
	}
};

export const login = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		// Verifica errores de validación
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res
				.status(400)
				.json({ success: false, errors: errors.array() });
		}

		const { email, password } = req.body;
		const { token, user } = await authService.login(email, password);

		return res.json({
			success: true,
			token,
			user,
			message: "Inicio de sesión exitoso",
		});
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}

		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al iniciar sesión",
				500,
			),
		);
	}
};
