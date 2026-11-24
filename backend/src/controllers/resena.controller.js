const mongoose = require('mongoose');
const Resena = require('../models/resena.model');

// IMPORTANTE: en todas las consultas se filtra por usuario: req.usuarioId
// asi un usuario nunca puede ver ni modificar reseñas de otro usuario.

// Valida los datos que llegan en el body (se usa al crear y al actualizar).
// Devuelve un mensaje de error o null si todo esta bien.
function validarDatos(body) {
  const { nombreRestaurante, calificacion, fechaVisita, observaciones } = body;

  if (!nombreRestaurante || typeof nombreRestaurante !== 'string' || !nombreRestaurante.trim()) {
    return 'El nombre del restaurante es obligatorio';
  }

  const nota = Number(calificacion);
  if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
    return 'La calificacion debe ser un numero entero de 1 a 5';
  }

  const fecha = new Date(fechaVisita);
  if (!fechaVisita || isNaN(fecha.getTime())) {
    return 'La fecha de visita no es valida';
  }
  if (fecha > new Date()) {
    return 'La fecha de visita no puede ser una fecha futura';
  }

  if (observaciones != null && typeof observaciones !== 'string') {
    return 'Las observaciones deben ser texto';
  }

  return null;
}

// Arma el objeto solo con los campos permitidos (el campo usuario nunca se toma del body)
function datosResena(body) {
  return {
    nombreRestaurante: body.nombreRestaurante.trim(),
    calificacion: Number(body.calificacion),
    fechaVisita: body.fechaVisita,
    observaciones: (body.observaciones || '').trim()
  };
}

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
    const errorValidacion = validarDatos(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    // El usuario se toma del token, NO del body
    const nuevaResena = await Resena.create({
      ...datosResena(req.body),
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

    const errorValidacion = validarDatos(req.body);
    if (errorValidacion) {
      return res.status(400).json({ mensaje: errorValidacion });
    }

    const resena = await Resena.findOneAndUpdate(
      { _id: req.params.id, usuario: req.usuarioId },
      datosResena(req.body),
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
