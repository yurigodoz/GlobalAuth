const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userRepository = require('../repositories/userRepository');
const appRepository = require('../repositories/appRepository');

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

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        app: app.slug
      },
      app.jwtSecret,
      { expiresIn: app.accessTokenTtl }
    );

    return { token, tokenType: 'Bearer' };
  }
}

module.exports = new AuthService();
