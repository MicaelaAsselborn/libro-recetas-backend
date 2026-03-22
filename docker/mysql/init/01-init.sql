-- Crear base de datos (ya se crea con MYSQL_DATABASE, pero por si acaso)
CREATE DATABASE IF NOT EXISTS libro_de_recetas;

USE libro_de_recetas;

-- Crear tabla de usuarios
CREATE TABLE
    IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100),
        role ENUM ('user', 'admin') DEFAULT 'user',
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );