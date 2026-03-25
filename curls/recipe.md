# RECETAS

# Listar recetas públicas (con filtros)

curl -X GET "http://localhost:3000/api/recipes?category=principal&limit=10"

# Buscar receta por ID

curl -X GET http://localhost:3000/api/recipes/1

# Crear receta (protegido)

curl -X POST http://localhost:3000/api/recipes \
 -H "Authorization: Bearer TU_TOKEN_AQUI" \
 -H "Content-Type: application/json" \
 -d '{
"title": "Paella Valenciana",
"description": "La auténtica paella",
"ingredients": [
{ "name": "arroz", "quantity": 400, "unit": "gramos" },
{ "name": "pollo", "quantity": 500, "unit": "gramos" },
{ "name": "mariscos", "quantity": 300, "unit": "gramos" }
],
"instructions": [
{ "step": 1, "text": "Sofreír el pollo" },
{ "step": 2, "text": "Agregar el arroz" },
{ "step": 3, "text": "Añadir el caldo y cocinar 20 minutos" }
],
"category": "principal",
"tags": ["valenciana", "mariscos"],
"is_public": true
}'

# Actualizar receta (protegido)

curl -X PATCH http://localhost:3000/api/recipes/1 \
 -H "Authorization: Bearer TU_TOKEN_AQUI" \
 -H "Content-Type: application/json" \
 -d '{
"title": "Paella Mixta",
"description": "Paella con pollo y mariscos"
}'

# Borrado lógico (desactivar - protegido)

curl -X DELETE http://localhost:3000/api/recipes/1 \
 -H "Authorization: Bearer TU_TOKEN_AQUI"

# Reactivar receta (protegido)

curl -X PATCH http://localhost:3000/api/recipes/1/reactivate \
 -H "Authorization: Bearer TU_TOKEN_AQUI"

# Borrado físico (protegido)

curl -X DELETE http://localhost:3000/api/recipes/1/hard \
 -H "Authorization: Bearer TU_TOKEN_AQUI"

# ==================== RECETAS CON FILTROS ====================

# Mis recetas (requiere token)

curl -X GET "http://localhost:3000/api/recipes?my=true" \
 -H "Authorization: Bearer TU_TOKEN_AQUI"

# Mis recetas en papelera

curl -X GET "http://localhost:3000/api/recipes?my=true&isActive=false" \
 -H "Authorization: Bearer TU_TOKEN_AQUI"

# Recetas por categoría

curl -X GET "http://localhost:3000/api/recipes?category=postre"

# Recetas por etiqueta

curl -X GET "http://localhost:3000/api/recipes?tag=vegetariana"

# Búsqueda por título

curl -X GET "http://localhost:3000/api/recipes?title=paella"

# Recetas de un autor específico

curl -X GET "http://localhost:3000/api/recipes?author=1"

# Paginación

curl -X GET "http://localhost:3000/api/recipes?limit=10&offset=20"
