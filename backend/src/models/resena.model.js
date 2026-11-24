const mongoose = require('mongoose');

// Reseña Restaurante: Nombre Restaurante, Calificacion, FechaVisita, Observaciones
const resenaSchema = new mongoose.Schema(
  {
    nombreRestaurante: { type: String, required: true, trim: true, maxlength: 100 },
    calificacion: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: 'La calificacion debe ser un numero entero de 1 a 5'
      }
    },
    fechaVisita: { type: Date, required: true },
    observaciones: { type: String, default: '', trim: true, maxlength: 500 },
    // Dueño de la reseña, sirve para que cada usuario solo vea las suyas
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resena', resenaSchema);
