const appRepository = require('../repositories/appRepository');
const crypto = require('crypto');

class AppService {

  async create({ name, slug, accessTokenTtl, refreshTokenTtl }) {
    const existing = await appRepository.findBySlug(slug);

    if (existing) {
      throw new Error('Slug já existe');
    }

    const jwtSecret = crypto.randomBytes(64).toString('hex');

    const app = await appRepository.create({
      name,
      slug,
      active: true,
      jwtSecret,
      accessTokenTtl,
      refreshTokenTtl
    });

    return app;
  }

  async list() {
    const apps = await appRepository.findAll();
    
    return { apps }
  }

  async toggleActive(id) {
    const app = await appRepository.findById(Number(id));

    if (!app) {
      throw new Error('App não encontrado');
    }

    return appRepository.update(app.id, {
      active: !app.active
    });
  }
}

module.exports = new AppService();