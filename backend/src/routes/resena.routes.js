const express = require('express');
const verificarToken = require('../middleware/auth.middleware');
const {
  obtenerResenas,
  obtenerResena,
  crearResena,
  actualizarResena,
  eliminarResena
} = require('../controllers/resena.controller');

const router = express.Router();

// Todas las rutas de reseñas necesitan token
router.use(verificarToken);

router.get('/', obtenerResenas);
router.get('/:id', obtenerResena);
router.post('/', crearResena);
router.put('/:id', actualizarResena);
router.delete('/:id', eliminarResena);

module.exports = router;
