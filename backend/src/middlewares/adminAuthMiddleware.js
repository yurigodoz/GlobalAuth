const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const adminRepository = require('../repositories/adminRepository');

async function adminAuthMiddleware(req, res, next) {
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

    const admin = await adminRepository.findById(decoded.adminId);

    if (!admin || !admin.active) {
      return res.status(401).json({ error: 'Admin bloqueado' });
    }

    req.admin = decoded;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

module.exports = adminAuthMiddleware;