const userRepository = require('../repositories/userRepository');
const appRepository = require('../repositories/appRepository');

class UserService {

  async listByApp(appSlug) {
    if (!appSlug) {
      throw new Error('App é obrigatório');
    }

    const app = await appRepository.findBySlug(appSlug);

    if (!app) {
      throw new Error('App não encontrado');
    }

    const users = await userRepository.findByApp(app.id);

    return users.map(user => ({
      id: user.id,
      email: user.email,
      active: user.active,
      blockedAt: user.blockedAt,
      createdAt: user.createdAt
    }));
  }

    async blockUser(userId) {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        return userRepository.update(userId, {
            active: false,
            blockedAt: new Date()
        });
    }

    async unblockUser(userId) {
        const user = await userRepository.findById(userId);

        if (!user) {
            throw new Error('Usuário não encontrado');
        }

        return userRepository.update(userId, {
            active: true,
            blockedAt: null
        });
    }
}

module.exports = new UserService();
