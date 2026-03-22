import { UserRole } from "../types/auth";
import * as userModel from "../models/users.model";
import { IUser } from "../types/IUser";
import { UserWithoutPassword } from "../models/users.model";
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
		throw new Error("ID de usuario inválido");
	}

	return await userModel.findUserById(id);
};

// Buscar por usuario o email
export const findUserByEmail = async (
	identifier: string,
): Promise<Pick<IUser, "id" | "username" | "email"> | null> => {
	if (!identifier || identifier.trim() === "") {
		throw new Error("Debe proporcionar un identificador");
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
	isActive?: boolean;
}): Promise<UserWithoutPassword | null> => {
	const existingUser = await userModel.findUserByUsernameOrEmail(
		userData.username || userData.email,
	);

	if (existingUser) {
		throw new Error("El nombre de usuario o email ya está registrado");
	}

	const hashedPassword = await bcrypt.hash(userData.password, 10);

	const userId = await userModel.createUser({
		username: userData.username,
		email: userData.email,
		password: hashedPassword,
		full_name: userData.full_name,
		role: userData.role || UserRole.USER,
		isActive: userData.isActive !== undefined ? userData.isActive : true,
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
		throw new Error(`No se encontró el usuario con ID: ${id}`);
	}

	// Verificar que email no esté en uso por OTRO usuario
	if (userData.email) {
		const userWithEmail = await userModel.findUserByUsernameOrEmail(
			userData.email,
		);
		if (userWithEmail && userWithEmail.id !== id) {
			throw new Error("El email ya está en uso por otro usuario");
		}
	}

	// Verificar que username no esté en uso por OTRO usuario
	if (userData.username) {
		const userWithUsername = await userModel.findUserByUsernameOrEmail(
			userData.username,
		);
		if (userWithUsername && userWithUsername.id !== id) {
			throw new Error(
				"El nombre de usuario ya está en uso por otro usuario",
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
		throw new Error("No se pudo actualizar el usuario");
	}

	return await userModel.findUserById(id);
};

// Borrado lógico
export const softDeleteUser = async (
	id: number,
): Promise<UserWithoutPassword | null> => {
	// Verificar que el usuario existe
	const existingUser = await userModel.findUserById(id);
	if (!existingUser) {
		throw new Error(`No se encontró el usuario con ID: ${id}`);
	}

	// Verificar que no esté ya desactivado
	if (!existingUser.isActive) {
		throw new Error("El usuario ya está desactivado");
	}

	const updated = await userModel.softDeleteUser(id);
	if (!updated) {
		throw new Error("No se pudo desactivar el usuario");
	}

	return await userModel.findUserById(id);
};

// Reactivar usuario
export const reactivateUser = async (
	id: number,
): Promise<UserWithoutPassword | null> => {
	const existingUser = await userModel.findUserById(id);
	if (!existingUser) {
		throw new Error(`No se encontró el usuario con ID: ${id}`);
	}

	if (existingUser.isActive) {
		throw new Error("El usuario ya está activo");
	}

	const updated = await userModel.reactivateUser(id);
	if (!updated) {
		throw new Error("No se pudo reactivar el usuario");
	}

	return await userModel.findUserById(id);
};

// Borrado físico (solo admin)
export const hardDeleteUser = async (id: number): Promise<boolean> => {
	const existingUser = await userModel.findUserById(id);
	if (!existingUser) {
		throw new Error(`No se encontró el usuario con ID: ${id}`);
	}

	// // Verificar que no tenga recetas
	// const recipes = await recipeModel.findByUserId(id);
	// if (recipes.length > 0) {
	// 	throw new Error(
	// 		"No se puede eliminar un usuario con recetas asociadas",
	// 	);
	// }

	return await userModel.hardDeleteUser(id);
};
