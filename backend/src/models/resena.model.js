const mongoose = require('mongoose');

// Reseña Restaurante: Nombre Restaurante, Calificacion, FechaVisita, Observaciones
const resenaSchema = new mongoose.Schema(
  {
    nombreRestaurante: { type: String, required: true, trim: true },
    calificacion: { type: Number, required: true, min: 1, max: 5 },
    fechaVisita: { type: Date, required: true },
    observaciones: { type: String, default: '', trim: true },
    // Dueño de la reseña, sirve para que cada usuario solo vea las suyas
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resena', resenaSchema);
