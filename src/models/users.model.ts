// src/models/userModel.ts
import pool from "../config/database";
import { RowDataPacket } from "mysql2";
import { IUser } from "../types/IUser";
import { UserRole } from "../types/auth";

export interface UserRow extends IUser, RowDataPacket {}
export declare type UserWithoutPassword = Omit<IUser, "password">;

// Crear usuario (solo inserta, no hashea)
export const create = async (userData: {
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

// Buscar por ID
export const findById = async (
	id: number,
): Promise<UserWithoutPassword | null> => {
	const [rows] = await pool.query<UserRow[]>(
		"SELECT id, username, email, full_name, role, isActive, created_on, updated_on FROM users WHERE id = ?",
		[id],
	);
	return rows[0] || null;
};

// Buscar por email
export const findByEmail = async (
	email: string,
): Promise<Pick<IUser, "id" | "email"> | null> => {
	const [rows] = await pool.query<UserRow[]>(
		"SELECT id, email FROM users WHERE email = ?",
		[email],
	);
	return rows[0] || null;
};

// Buscar por email con constraseña
export const findByEmailWithPassword = async (
	email: string,
): Promise<IUser | null> => {
	const [rows] = await pool.query<UserRow[]>(
		"SELECT * FROM users WHERE email = ?",
		[email],
	);
	return rows[0] || null;
};

// Buscar por username
export const findByUsername = async (
	username: string,
): Promise<Pick<IUser, "id" | "username" | "email"> | null> => {
	const [rows] = await pool.query<UserRow[]>(
		"SELECT id, username, email FROM users WHERE username = ?",
		[username],
	);
	return rows[0] || null;
};
