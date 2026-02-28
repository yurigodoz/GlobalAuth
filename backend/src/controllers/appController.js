const appService = require('../services/appService');

class AppController {

  async create(req, res) {
    try {
      const { name, slug, accessTokenTtl, refreshTokenTtl } = req.body;

      const app = await appService.create({
        name,
        slug,
        accessTokenTtl,
        refreshTokenTtl
       });

      res.status(201).json({
        name: app.name,
        slug: app.slug,
        jwtsecret: app.jwtSecret,
        accessTokenTtl: app.accessTokenTtl,
        refreshTokenTtl: app.refreshTokenTtl,
        active: app.active,
        createdAt: app.createdAt
      });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async list(req, res) {
    try {
      const apps = await appService.list();
      res.json(apps);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async toggleActive(req, res) {
    try {
      const { id } = req.params;

      const app = await appService.toggleActive(id);

      res.json(app);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new AppController();