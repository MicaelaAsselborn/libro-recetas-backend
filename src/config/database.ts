// src/config/database.ts
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Configuración completa con tipos
const pool = mysql.createPool({
	host: process.env.DB_HOST,
	port: parseInt(process.env.DB_PORT || "3306"),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	waitForConnections: true,
	connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
	queueLimit: 0,
	connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || "10000"),
});

// Función para probar la conexión
export const testConnection = async (): Promise<boolean> => {
	try {
		const connection = await pool.getConnection();
		console.log("✅ Conexión a MySQL exitosa");
		console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
		console.log(`🔌 Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
		connection.release();
		return true;
	} catch (error) {
		console.error("❌ Error conectando a MySQL:");
		if (error instanceof Error) {
			console.error(`   ${error.message}`);
			// Mensajes de error más específicos
			if (error.message.includes("Access denied")) {
				console.error("   ⚠️  Usuario o contraseña incorrectos");
			} else if (error.message.includes("Unknown database")) {
				console.error(
					`   ⚠️  La base de datos '${process.env.DB_NAME}' no existe`,
				);
			} else if (error.message.includes("ECONNREFUSED")) {
				console.error("   ⚠️  No se pudo conectar al servidor MySQL");
			}
		}
		return false;
	}
};

// Exportar el pool como default
export default pool;
