# 📚 Libro de Recetas - Backend

API REST para una aplicación de recetas donde los usuarios pueden crear, compartir y guardar sus recetas favoritas.

## 🚀 Tecnologías

- **Node.js** + **Express** - Framework backend
- **TypeScript** - Tipado estático
- **MySQL** - Base de datos relacional
- **JWT** - Autenticación
- **bcrypt** - Encriptación de contraseñas
- **express-validator** - Validación de datos

## 📁 Estructura del Proyecto

```bash
src/
├── config/ # Configuración (base de datos)
├── controllers/ # Controladores (manejo de HTTP)
├── middlewares/ # Middlewares (autenticación, errores)
├── models/ # Modelos (queries SQL)
├── routes/ # Rutas (endpoints)
├── services/ # Servicios (lógica de negocio)
├── types/ # Tipos e interfaces TypeScript
├── validators/ # Validadores express-validator
└── index.ts # Punto de entrada
```

## 🗄️ Base de Datos

### Usuarios (`users`)

- `id` - Identificador único
- `username` - Nombre de usuario único
- `email` - Email único
- `password` - Contraseña hasheada
- `full_name` - Nombre completo
- `role` - Rol (`user` | `admin`)
- `is_active` - Borrado lógico
- `created_on`, `updated_on` - Fechas

### Recetas (`recipes`)

- `id` - Identificador único
- `title` - Título de la receta
- `description` - Descripción breve
- `image_url` - URL de la imagen
- `user_id` - Autor (FK → users)
- `ingredients` - JSON con ingredientes
- `instructions` - JSON con pasos
- `category` - Categoría principal (principal, postre, aperitivo, salsa, bebida, panes, ensalada)
- `tags` - JSON con etiquetas opcionales
- `is_public` - Visibilidad
- `is_active` - Borrado lógico
- `created_on`, `updated_on` - Fechas

### Favoritos (`favorites`)

- `user_id` - Usuario (FK → users)
- `recipe_id` - Receta (FK → recipes)

## 🔐 Autenticación

### Endpoints públicos

| Método | Endpoint             | Descripción                           |
| ------ | -------------------- | ------------------------------------- |
| POST   | `/api/auth/register` | Registro de usuario                   |
| POST   | `/api/auth/login`    | Inicio de sesión (devuelve token JWT) |

## 👥 Usuarios

### Endpoints públicos

| Método | Endpoint                                   | Descripción                 |
| ------ | ------------------------------------------ | --------------------------- |
| GET    | `/api/users`                               | Listar todos los usuarios   |
| GET    | `/api/users/:id`                           | Obtener usuario por ID      |
| GET    | `/api/users/search?username=...&email=...` | Buscar por username o email |

### Endpoints protegidos (requieren autenticación)

| Método | Endpoint         | Descripción                             |
| ------ | ---------------- | --------------------------------------- |
| PATCH  | `/api/users/:id` | Actualizar usuario (solo dueño o admin) |
| DELETE | `/api/users/:id` | Borrado lógico (solo dueño o admin)     |

### Endpoints solo admin

| Método | Endpoint                    | Descripción       |
| ------ | --------------------------- | ----------------- |
| PATCH  | `/api/users/:id/reactivate` | Reactivar usuario |
| DELETE | `/api/users/:id/hard`       | Borrado físico    |

## 📝 Recetas

### Endpoints públicos

| Método | Endpoint           | Descripción                |
| ------ | ------------------ | -------------------------- |
| GET    | `/api/recipes`     | Listar recetas con filtros |
| GET    | `/api/recipes/:id` | Obtener receta por ID      |

**Filtros disponibles para GET /api/recipes:**

- `category` - Filtrar por categoría principal
- `tag` - Filtrar por etiqueta
- `title` - Búsqueda por título
- `my` - Mis recetas (requiere autenticación)
- `author` - Recetas de un autor específico
- `onlyPublic` - Forzar solo públicas
- `isActive` - Ver papelera (`isActive=false`)
- `limit` / `offset` - Paginación

### Endpoints protegidos (requieren autenticación)

| Método | Endpoint                      | Descripción                            |
| ------ | ----------------------------- | -------------------------------------- |
| POST   | `/api/recipes`                | Crear receta                           |
| PATCH  | `/api/recipes/:id`            | Actualizar receta (solo dueño o admin) |
| DELETE | `/api/recipes/:id`            | Borrado lógico (solo dueño o admin)    |
| PATCH  | `/api/recipes/:id/reactivate` | Reactivar receta (solo dueño o admin)  |
| DELETE | `/api/recipes/:id/hard`       | Borrado físico (solo dueño o admin)    |

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/libro-recetas-backend.git

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Crear base de datos
# Ejecutar el script SQL en src/database/schema.sql

# Iniciar en modo desarrollo
npm run dev

# Compilar y ejecutar en producción
npm run build
npm start
```
