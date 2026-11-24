// Punto de entrada del backend
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth.routes');
const resenaRoutes = require('./routes/resena.routes');

const app = express();
// Si no existe el archivo .env se usa una clave por defecto (solo para desarrollo)
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'clave_secreta_desarrollo';
}

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
