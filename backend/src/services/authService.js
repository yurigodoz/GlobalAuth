const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userRepository = require('../repositories/userRepository');
const appRepository = require('../repositories/appRepository');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const emailService = require('./emailService');

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

  async _issueVerificationToken(user) {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await userRepository.update(user.id, {
      emailVerificationToken: verificationToken,
      emailVerificationExpiresAt: verificationExpiresAt
    });

    return verificationToken;
  }

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

    const verificationToken = await this._issueVerificationToken(user);

    emailService
      .sendVerificationEmail(user, app, verificationToken)
      .catch((error) => console.error('Falha ao disparar e-mail de verificação', { userId: user.id, error }));

    return user;
  }

  async verifyEmail({ token }) {
    const user = await userRepository.findByVerificationToken(token);

    if (!user) {
      throw new Error('Token inválido');
    }

    if (!user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
      throw new Error('Token expirado');
    }

    await userRepository.update(user.id, {
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiresAt: null
    });

    return { message: 'E-mail verificado com sucesso' };
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

    if (!user.emailVerifiedAt) {
      const error = new Error('E-mail não verificado');
      error.code = 'EMAIL_NOT_VERIFIED';
      throw error;
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

  async resendVerification({ email, appSlug }) {
    // Resposta sempre genérica, independentemente de o e-mail existir ou já estar verificado
    // (mesmo padrão de requestPasswordReset — NFR-2, previne enumeração de usuários).
    const genericResponse = { message: 'Se os dados estiverem corretos, um e-mail de verificação foi enviado' };

    const app = await appRepository.findBySlug(appSlug);

    if (!app || !app.active) {
      throw new Error('App inválido');
    }

    try {
      const user = await userRepository.findByEmailAndApp(email, app.id);

      if (user && !user.emailVerifiedAt) {
        const verificationToken = await this._issueVerificationToken(user);

        emailService
          .sendVerificationEmail(user, app, verificationToken)
          .catch((error) => console.error('Falha ao disparar e-mail de verificação', { userId: user.id, error }));
      }
    } catch (error) {
      console.error('Falha ao processar reenvio de verificação de e-mail', { appSlug: app.slug, error });
    }

    return genericResponse;
  }

  async requestPasswordReset({ email, appSlug }) {
    // Resposta sempre genérica, independentemente de o e-mail existir, estar verificado ou bloqueado
    // (NFR-2 — previne enumeração de usuários; ver decisions.md ADR-001).
    const genericResponse = { message: 'Se os dados estiverem corretos, um e-mail de redefinição de senha foi enviado' };

    const app = await appRepository.findBySlug(appSlug);

    if (!app || !app.active) {
      throw new Error('App inválido');
    }

    try {
      const user = await userRepository.findByEmailAndApp(email, app.id);

      if (user && user.active) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await userRepository.update(user.id, {
          passwordResetToken: token,
          passwordResetExpiresAt: expiresAt
        });

        emailService
          .sendPasswordResetEmail(user, app, token)
          .catch((error) => console.error('Falha ao disparar e-mail de redefinição de senha', { userId: user.id, error }));
      }
    } catch (error) {
      console.error('Falha ao processar solicitação de redefinição de senha', { appSlug: app.slug, error });
    }

    return genericResponse;
  }

  async resetPassword({ token, newPassword }) {
    const user = await userRepository.findByResetToken(token);

    if (!user) {
      throw new Error('Token inválido');
    }

    if (!user.active) {
      // Mesma mensagem do token inválido: não revelar que a conta está bloqueada (NFR-2).
      throw new Error('Token inválido');
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
