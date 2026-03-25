import { AppError } from "../middlewares/errorHandler";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { UserRole } from "../types/auth";

import * as userService from "../services/user.service";

// Buscar todos los usuarios
export const findAllUsers = async (
	_req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const users = await userService.findAllUsers();
		if (users.length === 0) {
			return next(new AppError("No hay usuarios registrados", 404));
		}

		return res.status(200).json({
			success: true,
			data: users,
			message: "Usuarios encontrados",
		});
	} catch (error) {
		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al obtener los usuarios",
			),
		);
	}
};

// Buscar por ID
export const findUserById = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const id = parseInt(req.params.id as string);
	if (isNaN(id)) {
		return next(new AppError("ID inválido", 400));
	}

	try {
		const user = await userService.findUserById(id);

		if (!user) {
			return next(new AppError("Usuario no encontrado", 404));
		}

		return res.status(200).json({
			success: true,
			data: user,
			message: "Usuario encontrado",
		});
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}
		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al obtener el usuario",
			),
		);
	}
};

// Buscar por usuario o email
export const findUserByUsernameOrEmail = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const { username = "", email = "" } = req.query;
	const identifier = username || email;
	if (!identifier) {
		return next(new AppError("Debe proporcionar username o email", 400));
	}
	try {
		const user = await userService.findUserByUsernameOrEmail(
			String(identifier),
		);

		if (!user) {
			return next(new AppError("Usuario no encontrado", 404));
		}

		return res.status(200).json({
			success: true,
			data: user,
			message: "Usuario encontrado",
		});
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}
		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al obtener el usuario",
			),
		);
	}
};

// Crear usuario
export const createUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// Verifica errores de validación
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			errors: errors.array(),
		});
	}

	try {
		const { username, email, password, full_name } = req.body;

		const newUser = await userService.createUser({
			username,
			email,
			password,
			full_name,
			role: UserRole.USER,
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
			),
		);
	}
};

// Actualizar usuario
export const updateUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = parseInt(req.params.id as string);

		if (isNaN(id)) {
			return next(new AppError("ID inválido", 400));
		}

		if (!req.user) {
			return next(new AppError("Usuario no autenticado", 401));
		}

		if (Number(req.user.id) !== id && req.user.role !== "admin") {
			return next(
				new AppError(
					"No tienes permiso para modificar este usuario",
					403,
				),
			);
		}

		const updates = req.body;
		if (Object.keys(updates).length === 0) {
			return next(new AppError("No hay datos para actualizar", 400));
		}

		const updatedUser = await userService.updateUser(id, updates);
		if (!updatedUser) {
			return next(new AppError("Usuario no encontrado", 404));
		}

		return res.status(200).json({
			success: true,
			data: updatedUser,
			message: "Usuario actualizado exitosamente",
		});
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}

		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al actualizar el usuario",
			),
		);
	}
};

// Borrado lógico (desactivar)
export const softDeleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = parseInt(req.params.id as string);
		if (isNaN(id)) {
			return next(new AppError("ID debe ser un número válido", 400));
		}

		if (!req.user) {
			return next(new AppError("Usuario no autenticado", 401));
		}

		if (Number(req.user.id) !== id && req.user.role !== "admin") {
			return next(
				new AppError(
					"No tienes permiso para desactivar este usuario",
					403,
				),
			);
		}

		const updatedUser = await userService.softDeleteUser(id);

		return res.status(200).json({
			success: true,
			data: updatedUser,
			message: "Usuario desactivado exitosamente",
		});
	} catch (error) {
		next(error);
	}
};

// Reactivar usuario
export const reactivateUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = parseInt(req.params.id as string);
		if (isNaN(id)) {
			return next(new AppError("ID debe ser un número válido", 400));
		}

		if (!req.user || req.user.role !== "admin") {
			return next(
				new AppError(
					"Acceso denegado. Se requieren permisos de administrador",
					403,
				),
			);
		}

		const updatedUser = await userService.reactivateUser(id);

		return res.status(200).json({
			success: true,
			data: updatedUser,
			message: "Usuario reactivado exitosamente",
		});
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}

		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al reactivar el usuario",
			),
		);
	}
};

// Borrado físico (solo admin)
export const hardDeleteUser = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const id = parseInt(req.params.id as string);
		if (isNaN(id)) {
			return next(new AppError("ID debe ser un número válido", 400));
		}

		if (!req.user || req.user.role !== "admin") {
			return next(
				new AppError(
					"Acceso denegado. Se requieren permisos de administrador",
					403,
				),
			);
		}

		const deleted = await userService.hardDeleteUser(id);

		if (!deleted) {
			return next(new AppError("No se pudo eliminar el usuario", 500));
		}

		return res.status(204).send(); // 204 No Content
	} catch (error) {
		if (error instanceof AppError) {
			return next(error);
		}

		next(
			new AppError(
				error instanceof Error
					? error.message
					: "Error al eliminar el usuario",
			),
		);
	}
};
