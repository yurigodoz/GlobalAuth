const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);

    // Garante que é token de admin
    if (decoded.type !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    if (!decoded.role) {
        return res.status(403).json({ error: 'Sem permissão' });
    }

    req.admin = decoded;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = adminAuthMiddleware;