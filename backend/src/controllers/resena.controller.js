const mongoose = require('mongoose');
const Resena = require('../models/resena.model');

// IMPORTANTE: en todas las consultas se filtra por usuario: req.usuarioId
// asi un usuario nunca puede ver ni modificar reseñas de otro usuario.

// GET /api/resenas -> lista las reseñas del usuario logueado
async function obtenerResenas(req, res) {
  try {
    const resenas = await Resena.find({ usuario: req.usuarioId }).sort({ fechaVisita: -1 });
    res.json(resenas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las reseñas', error: error.message });
  }
}

// GET /api/resenas/:id -> una reseña (solo si es del usuario)
async function obtenerResena(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ mensaje: 'Id no valido' });
    }

    const resena = await Resena.findOne({ _id: req.params.id, usuario: req.usuarioId });
    if (!resena) {
      return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    }
    res.json(resena);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener la reseña', error: error.message });
  }
}

// POST /api/resenas -> crea una reseña para el usuario logueado
async function crearResena(req, res) {
  try {
    const { nombreRestaurante, calificacion, fechaVisita, observaciones } = req.body;

    if (!nombreRestaurante || !calificacion || !fechaVisita) {
      return res.status(400).json({ mensaje: 'Nombre, calificacion y fecha de visita son obligatorios' });
    }

    // El usuario se toma del token, NO del body
    const nuevaResena = await Resena.create({
      nombreRestaurante,
      calificacion,
      fechaVisita,
      observaciones,
      usuario: req.usuarioId
    });

    res.status(201).json(nuevaResena);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear la reseña', error: error.message });
  }
}

// PUT /api/resenas/:id -> actualiza una reseña propia
async function actualizarResena(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ mensaje: 'Id no valido' });
    }

    const { nombreRestaurante, calificacion, fechaVisita, observaciones } = req.body;

    // Solo se actualizan estos campos (el campo usuario no se puede cambiar)
    const resena = await Resena.findOneAndUpdate(
      { _id: req.params.id, usuario: req.usuarioId },
      { nombreRestaurante, calificacion, fechaVisita, observaciones },
      { returnDocument: 'after', runValidators: true }
    );

    if (!resena) {
      return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    }
    res.json(resena);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al actualizar la reseña', error: error.message });
  }
}

// DELETE /api/resenas/:id -> elimina una reseña propia
async function eliminarResena(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ mensaje: 'Id no valido' });
    }

    const resena = await Resena.findOneAndDelete({ _id: req.params.id, usuario: req.usuarioId });
    if (!resena) {
      return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    }
    res.json({ mensaje: 'Reseña eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar la reseña', error: error.message });
  }
}

module.exports = { obtenerResenas, obtenerResena, crearResena, actualizarResena, eliminarResena };
