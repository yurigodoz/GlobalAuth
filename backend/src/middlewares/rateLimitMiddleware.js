const { rateLimit } = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  limit: 10,
  message: { error: 'Muitas tentativas. Tente novamente em 5 minutos.' },
  standardHeaders: 'draft-8',
  legacyHeaders: false
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 20,
  message: { error: 'Muitas requisições. Tente novamente mais tarde.' },
  standardHeaders: 'draft-8',
  legacyHeaders: false
});

module.exports = { loginLimiter, generalLimiter };
