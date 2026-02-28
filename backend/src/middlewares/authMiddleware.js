const jwt = require('jsonwebtoken');
const appRepository = require('../repositories/appRepository');
const userRepository = require('../repositories/userRepository');

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    const appSlug = req.headers.appslug;

    if (!authHeader || !appSlug) {
        return res.status(401).json({ message: 'Token ou app não informado!' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ message: 'Token mal formatado!' });
    }

    const [scheme, token] = parts;

    if (scheme !== 'Bearer') {
        return res.status(401).json({ message: 'Scheme inválido!' });
    }

    try {
        const app = await appRepository.findBySlug(appSlug);

        if (!app || !app.active) {
            return res.status(401).json({ message: 'App inválido!' });
        }

        const decoded = jwt.verify(token, app.jwtSecret);

        const user = await userRepository.findById(decoded.userId);

        if (!user || !user.active) {
            return res.status(401).json({ message: 'Usuário bloqueado!' });
        }

        req.user = decoded;

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado!' });
    }
}

module.exports = authMiddleware;