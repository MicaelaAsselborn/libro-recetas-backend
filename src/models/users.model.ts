// src/models/userModel.ts
import pool from "../config/database";
import { RowDataPacket } from "mysql2";
import { IUser } from "../types/IUser";
import { UserRole } from "../types/auth";

export interface UserRow extends IUser, RowDataPacket {}
export declare type UserWithoutPassword = Omit<IUser, "password">;

// Crear usuario (solo inserta, no hashea)
export const createUser = async (userData: {
	username: string;
	email: string;
	password: string;
	full_name?: string;
	role: UserRole;
	isActive: boolean;
}): Promise<number> => {
	const [result] = await pool.query(
		"INSERT INTO users (username, email, password, full_name, role, isActive) VALUES (?, ?, ?, ?, ?, ?)",
		[
			userData.username,
			userData.email,
			userData.password,
			userData.full_name || null,
			userData.role,
			userData.isActive,
		],
	);
	return (result as any).insertId;
};

// Buscar todos los usuarios
export const findAllUsers = async (): Promise<
	Pick<IUser, "id" | "username" | "email">[]
> => {
	const [rows] = await pool.query<UserRow[]>(
		"SELECT id, username, email FROM users",
	);
	return rows;
};

// Buscar por ID
export const findUserById = async (
	id: number,
): Promise<UserWithoutPassword | null> => {
	const [rows] = await pool.query<UserRow[]>(
		"SELECT id, username, email, full_name, role, isActive, created_on, updated_on FROM users WHERE id = ?",
		[id],
	);
	return rows[0] || null;
};

//Buscar por usuario o por email
export const findUserByUsernameOrEmail = async (
	identifier: string,
): Promise<Pick<IUser, "id" | "username" | "email"> | null> => {
	if (!identifier || identifier.trim() === "") {
		throw new Error("Debe proporcionar un usuario o email");
	}

	const [rows] = await pool.query<UserRow[]>(
		"SELECT id, username, email FROM users WHERE username = ? OR email = ?",
		[identifier, identifier],
	);
	return rows[0] || null;
};
