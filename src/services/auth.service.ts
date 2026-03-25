import { AppError } from "../middlewares/errorHandler";
import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload, UserRole } from "../types/auth";
import { UserWithoutPassword } from "../models/user.model";

import * as userService from "../services/user.service";
import * as userModel from "../models/user.model";

import bcrypt from "bcrypt";

if (!process.env.JWT_SECRET) {
	throw new Error("JWT_SECRET no definido");
}

const secretKey: string = process.env.JWT_SECRET;

// Registrar nuevo usuario
export const register = async (userData: {
	username: string;
	email: string;
	password: string;
	full_name?: string;
	role?: UserRole;
}): Promise<UserWithoutPassword> => {
	const user = await userService.createUser({
		username: userData.username,
		email: userData.email,
		password: userData.password,
		full_name: userData.full_name,
		role: userData.role,
	});

	if (!user) {
		throw new AppError("Error al registrar el usuario", 500);
	}

	return user;
};

// Iniciar sesión
export const login = async (
	email: string,
	password: string,
): Promise<{ token: string; user: UserWithoutPassword }> => {
	// Buscar usuario con contraseña (necesario para comparar)
	const user = await userModel.findUserByEmailWithPassword(email);
	if (!user) {
		throw new AppError("Credenciales inválidas", 401);
	}

	// Verificar contraseña
	const isValid = await bcrypt.compare(password, user.password);
	if (!isValid) {
		throw new AppError("Credenciales inválidas", 401);
	}

	// Verificar que el usuario esté activo
	if (!user.is_active) {
		throw new AppError(
			"La cuenta está desactivada. Contacta al administrador.",
			403,
		);
	}

	// Payload del token
	const payload: JwtPayload = {
		id: user.id,
		username: user.username,
		role: user.role,
	};

	// Opciones del token
	const options: SignOptions = {
		expiresIn: (process.env.JWT_EXPIRES_IN as any) || "7d",
		issuer: "libro-recetas-backend",
	};

	// Generar token
	const token = jwt.sign(payload, secretKey, options);

	// Devolver token y usuario sin contraseña
	const { password: _, ...userWithoutPassword } = user;
	return { token, user: userWithoutPassword };
};
