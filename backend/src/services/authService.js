const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userRepository = require('../repositories/userRepository');
const appRepository = require('../repositories/appRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');

function parseTtlToMs(ttl) {
  const unit = ttl.slice(-1);
  const value = parseInt(ttl.slice(0, -1));

  const map = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000
  };

  if (!map[unit] || isNaN(value)) {
    throw new Error(`TTL inválido: "${ttl}". Use o formato: 30s, 15m, 2h, 7d`);
  }

  return value * map[unit];
}

class AuthService {

  async register({ email, password, appSlug }) {
    const app = await appRepository.findBySlug(appSlug);
    if (!app || !app.active) {
      throw new Error('App inválido');
    }

    const existingUser = await userRepository.findByEmailAndApp(email, app.id);
    if (existingUser) {
      throw new Error('Usuário já existe');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      email,
      password: passwordHash,
      appId: app.id
    });

    return user;
  }

  async login({ email, password, appSlug }) {
    const app = await appRepository.findBySlug(appSlug);
    if (!app || !app.active) {
      throw new Error('App inválido');
    }

    const user = await userRepository.findByEmailAndApp(email, app.id);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    if (!user.active) {
      throw new Error('Usuário bloqueado');
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciais inválidas');
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        app: app.slug
      },
      app.jwtSecret,
      { expiresIn: app.accessTokenTtl }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');

    const refreshExpires = new Date(Date.now() + parseTtlToMs(app.refreshTokenTtl));

    await refreshTokenRepository.create({
      token: refreshToken,
      userId: user.id,
      appId: app.id,
      expiresAt: refreshExpires
    });

    return {
      userId: user.id,
      accessToken,
      refreshToken
    };
  }

  async requestPasswordReset({ email, appSlug }) {
    /*
      Apesar desse endpoint retornar exatamente o motivo do erro, o front não deve informar o usuário
      sobre se a solicitação teve sucesso ou não, para evitar dar pistas para possíveis atacantes.
      O front deve sempre exibir uma mensagem genérica como "Se as informações estiverem corretas, um email de reset será enviado".
    */
    const app = await appRepository.findBySlug(appSlug);

    if (!app || !app.active) {
      throw new Error('App inválido');
    }

    const user = await userRepository.findByEmailAndApp(email, app.id);

    if (!user) {
      throw new Error('E-mail não encontrado');
    }

    if (!user.active) {
      throw new Error('Usuário bloqueado');
    }

    const token = crypto.randomBytes(32).toString('hex');

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await userRepository.update(user.id, {
      passwordResetToken: token,
      passwordResetExpiresAt: expiresAt
    });

    return { resetToken: token};
  }

  async resetPassword({ token, newPassword }) {
    const user = await userRepository.findByResetToken(token);

    if (!user) {
      throw new Error('Token inválido');
    }

    if (!user.active) {
      throw new Error('Usuário bloqueado');
    }

    if (!user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new Error('Token expirado');
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await userRepository.update(user.id, {
      password: hash,
      passwordResetToken: null,
      passwordResetExpiresAt: null
    });

    return { message: 'Senha redefinida com sucesso' };
  }

  async refresh({ refreshToken }) {
    const stored = await refreshTokenRepository.findByToken(refreshToken);

    if (!stored) {
      throw new Error('Refresh token inválido');
    }

    if (stored.expiresAt < new Date()) {
      await refreshTokenRepository.delete(refreshToken);
      throw new Error('Refresh token expirado');
    }

    const app = await appRepository.findById(stored.appId);

    if (!app || !app.active) {
      await refreshTokenRepository.delete(refreshToken);
      throw new Error('App inválido');
    }

    const user = await userRepository.findById(stored.userId);

    if (!user || !user.active) {
      await refreshTokenRepository.delete(refreshToken);
      throw new Error('Usuário bloqueado');
    }

    // ROTATION (segurança)
    await refreshTokenRepository.delete(refreshToken);

    const newRefreshToken = crypto.randomBytes(40).toString('hex');

    const newExpires = new Date(
      Date.now() + parseTtlToMs(app.refreshTokenTtl)
    );

    await refreshTokenRepository.create({
      token: newRefreshToken,
      userId: user.id,
      appId: app.id,
      expiresAt: newExpires
    });

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        app: app.slug
      },
      app.jwtSecret,
      { expiresIn: app.accessTokenTtl }
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }
}

module.exports = new AuthService();
