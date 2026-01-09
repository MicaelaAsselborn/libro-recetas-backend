import { RowDataPacket } from "mysql2";
import pool from "../database";

// INTERFACES

//Interfaz para usuario completo
export interface User extends RowDataPacket {
    id: number,
    email: string, 
    password: string,
    name: string,
    role: "user" | "admin",
    created_at: Date
}

//Interfaz para crear usuario
export interface CreateUserData {
    email: string,
    password: string,
    name: string,
    role?: "user" | "admin"
}

// Interfaz para actualizar usuario
export interface UpdateUserData {
    email?: string,
    password?: string,
    name?: string,
    role?: "user" | "admin"
}

// FUNCIONES DEL MODEL

export const userModel = {

    // CREAR USUSARIO
    async createUser(userData: CreateUserData): Promise<User> {
        // Validar rol por defecto
        const role = userData.role || "user";

        // Ejecutar INSERT
        const [result] = await pool.query(
            `INSERT INTO users (email, password, name, role)
            VALUES (?,?,?,?)`,
            [userData.email, userData.password, userData.name, role]
        );

        // Obtener y devolver al usuario recien creado
        const insertId = (result as any).insertId;
        return this.findById(insertId) as Promise<User>;
    },

    // ENCONTRAR POR ID
    async findById(id: number): Promise<User | null> {
        const [rows] = await pool.query<User[]>(
            `SELECT * FROM users WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    },

    // ENCONTRAR POR EMAIL
    async findByEmail(email: string): Promise<User | null> {
        const [rows] = await pool.query<User[]>(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );
        return rows[0] || null;
    },

    // ACTUALIZAR USUARIO
    async updateUser(id: number, userData: UpdateUserData): Promise<User> {
        // Verifica que el usuario exista
        const existingUser = await this.findById(id);
        if(!existingUser) {
            // Si no existe, lanza un error
            throw new Error(`updateUser: Usuario con ID: ${id} no encontrado`);
        }

        //Si existe, continua la actualización
        const updates: string[] = [];
        const values: any[] = [];
        
        if (userData.email !== undefined) {
            updates.push("email = ?");
            values.push(userData.email);
        }
        if (userData.password !== undefined) {
            updates.push("password = ?");
            values.push(userData.password);
        }
        if (userData.name !== undefined) {
            updates.push("name = ?");
            values.push(userData.name);
        }
        if (userData.role !== undefined) {
            updates.push("role = ?");
            values.push(userData.role);
        }

        // Si no hay cambios, devolver usuario actual
        if (updates.length === 0) {
            return existingUser;
        }

        // Ejecutar UPDATE
        values.push(id);
        const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
        await pool.query(query, values);

        // Devolver usuario actualizado
        const updatedUser = await this.findById(id);
        if (!updatedUser) {
            throw new Error(`El usuario con ID: ${id} fue eliminado durante la actualización`)
        }
        return updatedUser;
    },

    // ELIMINAR USUARIO
    async deleteUser(id: number): Promise<boolean> {
        // Verifica que el usuario exista
        const existingUser = await this.findById(id);
        if(!existingUser) {
            // Si no existe, lanza un error
            throw new Error(`updateUser: Usuario con ID: ${id} no encontrado`);
        }
        const [result] = await pool.query(
            `DELETE FROM users WHERE id = ?`,
            [id]
        );
        return (result as any).affectedRows > 0;
    }
}