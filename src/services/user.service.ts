import { UserRole } from "../types/auth";
import * as userModel from "../models/users.model";
import { IUser } from "../types/IUser";
import { UserWithoutPassword } from "../models/users.model";
import bcrypt from "bcrypt";

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
		throw new Error("El nombre de usuario o email ya se esta registrado");
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

	const newUser = await userModel.findUserById(userId);

	return newUser;
};

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
