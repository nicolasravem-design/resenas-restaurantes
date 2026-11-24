# Reseñas de Restaurantes

Aplicación para que un usuario inicie sesión y gestione (CRUD) **sus propias** reseñas de restaurantes.

| Capa      | Tecnología                         |
|-----------|------------------------------------|
| Frontend  | Angular 20                         |
| Backend   | Node.js + Express + JWT            |
| Base de datos | MongoDB (Mongoose)             |

Cada reseña tiene: **Nombre Restaurante, Calificación (1 a 5), Fecha de Visita y Observaciones**.

## Estructura

```
resenas-restaurantes/
├── backend/
│   ├── src/
│   │   ├── controllers/   # logica de login y del CRUD
│   │   ├── middleware/    # verificacion del token JWT
│   │   ├── models/        # esquemas de Mongoose (Usuario, Resena)
│   │   ├── routes/        # rutas de la API
│   │   └── index.js       # servidor Express
│   ├── .env.example
│   └── package.json
└── frontend/
    └── src/app/
        ├── guards/        # protege la ruta /resenas
        ├── interceptors/  # agrega el token a cada peticion
        ├── models/
        ├── pages/         # login, registro, resenas
        └── services/      # AuthService y ResenaService
```

## Cómo ejecutarlo

Requisitos: Node.js 20 o superior y MongoDB corriendo en `localhost:27017`.

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env    # en Windows: copy .env.example .env
npm start
```

Queda en `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

Abrir `http://localhost:4200`, crear una cuenta en **Regístrate**, iniciar sesión y gestionar las reseñas.

## API

| Método | Ruta                  | Descripción                         | Token |
|--------|-----------------------|-------------------------------------|-------|
| POST   | `/api/auth/registro`  | Registrar usuario                   | No    |
| POST   | `/api/auth/login`     | Iniciar sesión, devuelve el token   | No    |
| GET    | `/api/resenas`        | Listar mis reseñas                  | Sí    |
| GET    | `/api/resenas/:id`    | Ver una reseña mía                  | Sí    |
| POST   | `/api/resenas`        | Crear reseña                        | Sí    |
| PUT    | `/api/resenas/:id`    | Actualizar reseña mía               | Sí    |
| DELETE | `/api/resenas/:id`    | Eliminar reseña mía                 | Sí    |

El token se envía en el header `Authorization: Bearer <token>`.

## Funcionalidades del frontend

- Login y registro (con confirmación de contraseña y botón para mostrar/ocultar la contraseña).
- El token se guarda en el **sessionStorage** y un interceptor lo envía en cada petición.
- Un guard protege la ruta `/resenas`: si no hay sesión redirige al login. Si el token expira se cierra la sesión.
- Panel con estadísticas: total de reseñas, calificación promedio, mejor calificado y última visita.
- Búsqueda por texto, filtro por calificación y ordenamiento (recientes, antiguas, mejores, peores, nombre).
- Crear y editar reseñas en un modal con calificación por estrellas y validaciones (no se permiten fechas futuras).
- Confirmación antes de eliminar y mensajes de éxito/error.
- Diseño responsive (se adapta a celular).

## Validaciones del backend

- Registro: correo válido, contraseña de mínimo 6 caracteres y correo no repetido.
- Reseñas: nombre obligatorio, calificación entera de 1 a 5, fecha válida y no futura, observaciones de máximo 500 caracteres.
- Respuestas en JSON para rutas inexistentes (404) y para un body mal formado (400).

## Seguridad: cada usuario solo ve sus reseñas

- Al iniciar sesión el backend genera un **JWT** con el id del usuario y el frontend lo guarda en el **sessionStorage**.
- El middleware `verificarToken` valida el token y saca de ahí el id del usuario (`req.usuarioId`).
- Todas las consultas a la base de datos filtran por `usuario: req.usuarioId`. Si alguien intenta ver, editar o borrar
  una reseña de otro usuario, la API responde **404**.
- Al crear una reseña, el dueño se toma del token y no del body, así no se puede crear una reseña a nombre de otra persona.
- Las contraseñas se guardan encriptadas con **bcrypt**.
