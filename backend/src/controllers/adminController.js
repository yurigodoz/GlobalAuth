const adminService = require('../services/adminService');

class AdminController {
    async create(req, res) {
        try {
            if (req.admin.role !== 'superadmin') {
                throw new Error('Sem permissão para criar admin');
            }

            const { email, password, role } = req.body;

            const user = await adminService.create({
                email,
                password,
                role
            });

            res.status(201).json(user);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;

            const data = await adminService.login({ email, password });

            res.json(data);
        } catch (err) {
            res.status(401).json({ error: err.message });
        }
    }
}

module.exports = new AdminController();