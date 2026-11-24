// Punto de entrada del backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const resenaRoutes = require('./routes/resena.routes');

// Si no existe el archivo .env se usa una clave por defecto (solo para desarrollo)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'clave_secreta_desarrollo';
}

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/resenas_db';

// Middlewares
app.use(cors()); // para que Angular (puerto 4200) pueda consumir la API
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de reseñas de restaurantes funcionando' });
});
app.use('/api/auth', authRoutes);
app.use('/api/resenas', resenaRoutes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Manejo de errores generales (por ejemplo un JSON mal formado en el body)
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la peticion no es un JSON valido' });
  }
  console.error(err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// Conexion a MongoDB y arranque del servidor
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error al conectar con MongoDB:', error.message);
  });
