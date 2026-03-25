# AUTENTICACIÓN

# Registrar usuario

curl -X POST http://localhost:3000/api/auth/register \
 -H "Content-Type: application/json" \
 -d '{
"username": "cocinero",
"email": "cocinero@example.com",
"password": "MiPassword123!",
"full_name": "El Cocinero"
}'

# Iniciar sesión (guardar token)

curl -X POST http://localhost:3000/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{
"email": "cocinero@example.com",
"password": "MiPassword123!"
}'
