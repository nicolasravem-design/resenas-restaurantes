const jwt = require('jsonwebtoken');

// Verifica que la peticion traiga un token valido en el header Authorization
// Formato esperado: Authorization: Bearer <token>
function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'No se envio el token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);
    // Guardamos el id del usuario para usarlo en los controladores
    req.usuarioId = datos.id;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token invalido o expirado' });
  }
}

module.exports = verificarToken;
