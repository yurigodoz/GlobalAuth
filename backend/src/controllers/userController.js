const userService = require('../services/userService');

class UserController {

  async list(req, res) {
    try {
      const { app } = req.query;

      const users = await userService.listByApp(app);

      res.json(users);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

    async block(req, res) {
    try {
        const { id } = req.params;

        const user = await userService.blockUser(id);

        res.json({
        message: 'Usuário bloqueado',
        user
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
    }

    async unblock(req, res) {
    try {
        const { id } = req.params;

        const user = await userService.unblockUser(id);

        res.json({
        message: 'Usuário desbloqueado',
        user
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
    }
}

module.exports = new UserController();
