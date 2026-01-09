import { RowDataPacket } from "mysql2";
import pool from "../database";

// INTERFACES

// Interfaz para tag
export interface Tag extends RowDataPacket {
    id: number,
    name: string
}

// Interfaz para crear tag
export interface CreateTagData {
    name: string
}

// Interfaz para actualizar tag
export interface UpdateTagData {
    name?: string
}

// FUNCIONES DEL MODEL

export const tagModel = {

    // CREAR TAG
    async createTag(tagData: CreateTagData): Promise<Tag> {
        //Verificar si el tag ya existe
        const existingTag = await this.findByName(tagData.name)
        if (existingTag) {
            return existingTag;
        }

        // Si no existe, crear Tag
        const [result] = await pool.query(
            `INSERT INTO tags (name)
            VALUES (?)`,
            [tagData.name]
        );

        // Obtener y devolver al tag recien creado
        const insertId = (result as any).insertId;
        return this.findById(insertId) as Promise<Tag>;
    },

    // ENCONTRAR POR ID
    async findById(id: number): Promise<Tag | null> {
        const [rows] = await pool.query<Tag[]>(
            `SELECT * FROM tags WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    },

    // ENCONTRAR POR NAME
    async findByName(name: string): Promise<Tag | null> {
        const [rows] = await pool.query<Tag[]>(
            `SELECT * FROM tags WHERE name = ?`,
            [name]
        );
        return rows[0] || null;
    },

    // ACTUALIZAR USUARIO
    async updateTag(id: number, tagData: UpdateTagData): Promise<Tag> {
        // Verifica que el tag exista
        const existingTag = await this.findById(id);
        if(!existingTag) {
            // Si no existe, lanza un error
            throw new Error(`updateTag: Etiqueta con ID: ${id} no encontrada`);
        }

        //Si existe, continua la actualización
        const updates: string[] = [];
        const values: any[] = [];
        
        if (tagData.name !== undefined) {
            updates.push("name = ?");
            values.push(tagData.name);
        }

        // Si no hay cambios, devolver tag actual
        if (updates.length === 0) {
            return existingTag;
        }

        // Ejecutar UPDATE
        values.push(id);
        const query = `UPDATE tags SET ${updates.join(", ")} WHERE id = ?`;
        await pool.query(query, values);

        // Devolver tag actualizado
        const updatedTag = await this.findById(id);
        if (!updatedTag) {
            throw new Error(`La etiqueta con ID: ${id} fue eliminado durante la actualización`)
        }
        return updatedTag;
    },

    // BUSCAR TODOS LOS TAGS
    async findAllTags(): Promise<Tag[]> {
        const [rows] = await pool.query<Tag[]>(
            `SELECT * FROM tags ORDER BY name ASC`
        );
        return rows;
    },

    // ELIMINAR TAG
    async deleteTag(id: number): Promise<boolean> {
        // Verifica que el tag exista
        const existingTag = await this.findById(id);
        if(!existingTag) {
            // Si no existe, lanza un error
            throw new Error(`deleteTag: Etiqueta con ID: ${id} no encontrada`);
        }
        const [result] = await pool.query(
            `DELETE FROM tags WHERE id = ?`,
            [id]
        );
        return (result as any).affectedRows > 0;
    }
}
