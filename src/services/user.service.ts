import { UserRole } from "../types/auth";
import * as userModel from "../models/users.model";
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
	const existingEmail = await userModel.findByEmail(userData.email);
	const existingUsername = await userModel.findByUsername(userData.username);

	if (existingEmail) {
		throw new Error("El email ya está registrado");
	} else if (existingUsername) {
		throw new Error("El nombre de usuario ya está en uso");
	}

	const hashedPassword = await bcrypt.hash(userData.password, 10);

	const userId = await userModel.create({
		username: userData.username,
		email: userData.email,
		password: hashedPassword,
		full_name: userData.full_name,
		role: userData.role || UserRole.USER,
		isActive: userData.isActive !== undefined ? userData.isActive : true,
	});

	const newUser = await userModel.findById(userId);

	return newUser;
};
