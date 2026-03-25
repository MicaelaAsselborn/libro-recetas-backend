# USUARIOS

# Listar todos los usuarios (público)

curl -X GET http://localhost:3000/api/users

# Buscar usuario por ID (público)

curl -X GET http://localhost:3000/api/users/1

# Buscar por username o email (público)

curl -X GET "http://localhost:3000/api/users/search?username=cocinero"

# Actualizar usuario (protegido - usar token)

curl -X PATCH http://localhost:3000/api/users/1 \
 -H "Authorization: Bearer TU_TOKEN_AQUI" \
 -H "Content-Type: application/json" \
 -d '{
"full_name": "Chef Cocinero"
}'

# Borrado lógico (desactivar - protegido)

curl -X DELETE http://localhost:3000/api/users/1 \
 -H "Authorization: Bearer TU_TOKEN_AQUI"

# Reactivar usuario (solo admin)

curl -X PATCH http://localhost:3000/api/users/1/reactivate \
 -H "Authorization: Bearer TU_TOKEN_ADMIN"

# Borrado físico (solo admin)

curl -X DELETE http://localhost:3000/api/users/1/hard \
 -H "Authorization: Bearer TU_TOKEN_ADMIN"
