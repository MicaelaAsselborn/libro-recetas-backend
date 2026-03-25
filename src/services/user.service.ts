import { AppError } from "../middlewares/errorHandler";
import { IUser } from "../types/user";
import { UserRole } from "../types/auth";
import { UserWithoutPassword } from "../models/user.model";

import * as userModel from "../models/user.model";
import * as recipeModel from "../models/recipe.model";

import bcrypt from "bcrypt";

// Buscar todos los usuarios
export const findAllUsers = async (): Promise<
	Pick<IUser, "id" | "username" | "email">[]
> => {
	return await userModel.findAllUsers();
};

// Buscar por ID
export const findUserById = async (
	id: number,
): Promise<UserWithoutPassword | null> => {
	if (isNaN(id) || id <= 0) {
		throw new AppError("ID de usuario inválido", 400);
	}

	return await userModel.findUserById(id);
};

// Buscar por usuario o email
export const findUserByUsernameOrEmail = async (
	identifier: string,
): Promise<Pick<IUser, "id" | "username" | "email"> | null> => {
	if (!identifier || identifier.trim() === "") {
		throw new AppError("Debe proporcionar un identificador", 400);
	}

	return await userModel.findUserByUsernameOrEmail(identifier);
};

// Crear usuario
export const createUser = async (userData: {
	username: string;
	email: string;
	password: string;
	full_name?: string;
	role?: UserRole;
	is_active?: boolean;
}): Promise<UserWithoutPassword | null> => {
	const existingUser = await userModel.findUserByUsernameOrEmail(
		userData.username || userData.email,
	);

	if (existingUser) {
		throw new AppError(
			"El nombre de usuario o email ya está registrado",
			409,
		);
	}

	const hashedPassword = await bcrypt.hash(userData.password, 10);

	const userId = await userModel.createUser({
		username: userData.username,
		email: userData.email,
		password: hashedPassword,
		full_name: userData.full_name,
		role: userData.role || UserRole.USER,
		is_active: userData.is_active !== undefined ? userData.is_active : true,
	});

	return await userModel.findUserById(userId);
};

// Actualizar usuario
export const updateUser = async (
	id: number,
	userData: {
		username?: string;
		email?: string;
		password?: string;
		full_name?: string;
	},
): Promise<UserWithoutPassword | null> => {
	// Validar que el usuario existe
	const existingUser = await userModel.findUserById(id);
	if (!existingUser) {
		throw new AppError(`No se encontró el usuario con ID: ${id}`, 404);
	}

	// Verificar que email no esté en uso por OTRO usuario
	if (userData.email) {
		const userWithEmail = await userModel.findUserByUsernameOrEmail(
			userData.email,
		);
		if (userWithEmail && userWithEmail.id !== id) {
			throw new AppError("El email ya está en uso por otro usuario", 409);
		}
	}

	// Verificar que username no esté en uso por OTRO usuario
	if (userData.username) {
		const userWithUsername = await userModel.findUserByUsernameOrEmail(
			userData.username,
		);
		if (userWithUsername && userWithUsername.id !== id) {
			throw new AppError(
				"El nombre de usuario ya está en uso por otro usuario",
				409,
			);
		}
	}

	// Hashear contraseña si viene
	let hashedPassword: string | undefined;
	if (userData.password) {
		hashedPassword = await bcrypt.hash(userData.password, 10);
	}

	// Actualizar
	const updated = await userModel.updateUser(id, {
		username: userData.username,
		email: userData.email,
		password: hashedPassword,
		full_name: userData.full_name,
	});

	if (!updated) {
		throw new AppError("No se pudo actualizar el usuario", 500);
	}

	return await userModel.findUserById(id);
};

// Borrado lógico (desactivar)
export const softDeleteUser = async (
	id: number,
): Promise<UserWithoutPassword | null> => {
	// Verificar que el usuario existe
	const existingUser = await userModel.findUserById(id);
	if (!existingUser) {
		throw new AppError(`No se encontró el usuario con ID: ${id}`, 404);
	}

	// Verificar que no esté ya desactivado
	if (!existingUser.is_active) {
		throw new AppError("El usuario ya está desactivado", 409);
	}

	const updated = await userModel.softDeleteUser(id);
	if (!updated) {
		throw new AppError("No se pudo desactivar el usuario", 500);
	}

	return await userModel.findUserById(id);
};

// Reactivar usuario
export const reactivateUser = async (
	id: number,
): Promise<UserWithoutPassword | null> => {
	const existingUser = await userModel.findUserById(id);
	if (!existingUser) {
		throw new AppError(`No se encontró el usuario con ID: ${id}`, 404);
	}

	if (existingUser.is_active) {
		throw new AppError("El usuario ya está activo", 409);
	}

	const updated = await userModel.reactivateUser(id);
	if (!updated) {
		throw new AppError("No se pudo reactivar el usuario", 500);
	}

	return await userModel.findUserById(id);
};

// Borrado físico (solo admin)
export const hardDeleteUser = async (id: number): Promise<boolean> => {
	const existingUser = await userModel.findUserById(id);
	if (!existingUser) {
		throw new AppError(`No se encontró el usuario con ID: ${id}`, 404);
	}

	// Verificar que no tenga recetas
	const recipes = await recipeModel.findRecipesByUserId(id);
	if (recipes.length > 0) {
		throw new AppError(
			"No se puede eliminar un usuario con recetas asociadas. Primero elimina sus recetas.",
			409,
		);
	}

	return await userModel.hardDeleteUser(id);
};
