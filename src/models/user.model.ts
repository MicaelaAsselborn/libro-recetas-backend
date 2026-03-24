// src/models/userModel.ts
import pool from "../config/database";
import { RowDataPacket } from "mysql2";
import { IUser } from "../types/IUser";
import { UserRole } from "../types/auth";

export interface UserRow extends IUser, RowDataPacket {}
export declare type UserWithoutPassword = Omit<IUser, "password"> | null;

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
		"SELECT id, username, email, full_name, role, is_active, created_on, updated_on FROM users WHERE id = ?",
		[id],
	);
	return rows[0] || null;
};

// Buscar por usuario o por email
export const findUserByUsernameOrEmail = async (
	identifier: string,
): Promise<Pick<IUser, "id" | "username" | "email"> | null> => {
	const [rows] = await pool.query<UserRow[]>(
		"SELECT id, username, email FROM users WHERE username = ? OR email = ?",
		[identifier, identifier],
	);
	return rows[0] || null;
};

// Buscar por email con contraseña (para login)
export const findUserByEmailWithPassword = async (
	email: string,
): Promise<IUser | null> => {
	const [rows] = await pool.query<UserRow[]>(
		"SELECT * FROM users WHERE email = ?",
		[email],
	);
	return rows[0] || null;
};

// Crear usuario (solo inserta, no hashea)
export const createUser = async (userData: {
	username: string;
	email: string;
	password: string;
	full_name?: string;
	role: UserRole;
	is_active: boolean;
}): Promise<number> => {
	const [result] = await pool.query(
		"INSERT INTO users (username, email, password, full_name, role, is_active) VALUES (?, ?, ?, ?, ?, ?)",
		[
			userData.username,
			userData.email,
			userData.password,
			userData.full_name || null,
			userData.role,
			userData.is_active,
		],
	);
	return (result as any).insertId;
};

// Actualizar usuario
export const updateUser = async (
	id: number,
	updateData: {
		username?: string;
		email?: string;
		password?: string;
		full_name?: string;
		role?: UserRole;
		is_active?: boolean;
	},
): Promise<boolean> => {
	// Construir la query dinámicamente
	const fields: string[] = [];
	const values: any[] = [];

	if (updateData.username !== undefined) {
		fields.push("username = ?");
		values.push(updateData.username);
	}
	if (updateData.email !== undefined) {
		fields.push("email = ?");
		values.push(updateData.email);
	}
	if (updateData.password !== undefined) {
		fields.push("password = ?");
		values.push(updateData.password);
	}
	if (updateData.full_name !== undefined) {
		fields.push("full_name = ?");
		values.push(updateData.full_name);
	}
	if (updateData.role !== undefined) {
		fields.push("role = ?");
		values.push(updateData.role);
	}
	if (updateData.is_active !== undefined) {
		fields.push("is_active = ?");
		values.push(updateData.is_active);
	}

	// Si no hay campos para actualizar, no hacer nada
	if (fields.length === 0) {
		return false;
	}

	// Agregar el ID al final
	values.push(id);

	const query = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
	const [result] = await pool.query(query, values);

	return (result as any).affectedRows > 0;
};

// Borrado lógico (solo desactivar)
export const softDeleteUser = async (id: number): Promise<boolean> => {
	const [result] = await pool.query(
		"UPDATE users SET is_active = false, updated_on = NOW() WHERE id = ?",
		[id],
	);
	return (result as any).affectedRows > 0;
};

// Reactivar usuario
export const reactivateUser = async (id: number): Promise<boolean> => {
	const [result] = await pool.query(
		"UPDATE users SET is_active = true, updated_on = NOW() WHERE id = ?",
		[id],
	);
	return (result as any).affectedRows > 0;
};

// Borrado físico (eliminar definitivamente)
export const hardDeleteUser = async (id: number): Promise<boolean> => {
	// Primero verificar si tiene recetas
	const [recipes] = await pool.query(
		"SELECT COUNT(*) as count FROM recipes WHERE user_id = ?",
		[id],
	);

	const [result] = await pool.query("DELETE FROM users WHERE id = ?", [id]);
	return (result as any).affectedRows > 0;
};
