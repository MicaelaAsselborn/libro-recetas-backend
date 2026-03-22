-- Crear base de datos (ya se crea con MYSQL_DATABASE, pero por si acaso)
CREATE DATABASE IF NOT EXISTS recetario_db;

USE recetario_db;

-- Crear tabla de usuarios
CREATE TABLE
    IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Insertar un usuario de prueba (opcional)
-- INSERT INTO users (username, email, password_hash, full_name) 
-- VALUES ('testuser', 'test@example.com', '$2a$10$...', 'Test User');