const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');

// POST /api/auth/registro
async function registro(req, res) {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const existe = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (existe) {
      return res.status(400).json({ mensaje: 'El correo ya esta registrado' });
    }

    const passwordEncriptada = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, correo, password: passwordEncriptada });

    res.status(201).json({ mensaje: 'Usuario registrado correctamente', id: usuario._id });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar el usuario', error: error.message });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });
    }

    const usuario = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const passwordCorrecta = await bcrypt.compare(password, usuario.password);
    if (!passwordCorrecta) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    // Generamos el token con el id del usuario
    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.json({
      mensaje: 'Inicio de sesion exitoso',
      token: token,
      usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesion', error: error.message });
  }
}

module.exports = { registro, login };
