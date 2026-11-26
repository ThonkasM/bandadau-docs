# Colección Postman · Admin GraphQL

`bandada-admin-graphql.postman_collection.json` — consultas al `admin-gateway`
(`https://api.bandadau.lat/graphql`) con scripts de prueba.

1. En Postman: **Import** → este archivo.
2. En la colección → **Variables**: completa `email` y `password` de un usuario ADMIN (valor actual, no se guardan en el archivo).
3. Ejecuta **1. Login**: guarda `accessToken` (dura 15 min; repite el login si expira).
4. **Run collection**: corre las 8 peticiones con sus pruebas (códigos, ausencia de errores GraphQL, contadores, roles, prueba negativa sin token).

No se necesitan credenciales de AWS: se autentica con el token del usuario administrador. Nunca guardes
contraseñas ni tokens en este archivo.
