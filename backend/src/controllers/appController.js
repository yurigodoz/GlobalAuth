const appService = require('../services/appService');

class AppController {

  async create(req, res) {
    try {
      const { name, slug, accessTokenTtl, refreshTokenTtl, frontendUrl, emailFromAddress, emailFromName } = req.body;

      const app = await appService.create({
        name,
        slug,
        accessTokenTtl,
        refreshTokenTtl,
        frontendUrl,
        emailFromAddress,
        emailFromName
       });

      res.status(201).json({
        name: app.name,
        slug: app.slug,
        jwtsecret: app.jwtSecret,
        accessTokenTtl: app.accessTokenTtl,
        refreshTokenTtl: app.refreshTokenTtl,
        active: app.active,
        createdAt: app.createdAt,
        frontendUrl: app.frontendUrl,
        emailFromAddress: app.emailFromAddress,
        emailFromName: app.emailFromName
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

  async updateConfig(req, res) {
    try {
      const { id } = req.params;
      const { frontendUrl, emailFromAddress, emailFromName } = req.body;

      const app = await appService.updateConfig(id, { frontendUrl, emailFromAddress, emailFromName });

      res.json(app);
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