const authService = require('../services/authService');

class authController {
  async register(req, res) {
    try {
      const { email, password, app } = req.body;

      const user = await authService.register({
        email,
        password,
        appSlug: app
      });

      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password, app } = req.body;

      const data = await authService.login({
        email,
        password,
        appSlug: app
      });

      res.json(data);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }

  async validateToken(req, res) {
    return res.json({
        valid: true,
        user: req.user
    });
  }

  async requestPasswordReset(req, res) {
    try {
      const { email, app } = req.body;

      const data = await authService.requestPasswordReset({
        email,
        appSlug: app
      });

      res.json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      const data = await authService.resetPassword({ token, newPassword });

      res.json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      const data = await authService.refresh({ refreshToken });

      res.json(data);
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  }
}

module.exports = new authController();