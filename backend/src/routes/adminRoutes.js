const express = require('express');
const router = express.Router();
const adminController  = require('../controllers/adminController');
const appController = require('../controllers/appController');
const adminAuthMiddleware = require('../middlewares/adminAuthMiddleware');

router.post('/create', adminController.create);
router.post('/login', adminController.login);

// Demais rotas protegidas por autenticação de admin
router.use(adminAuthMiddleware);

router.post('/apps', appController.create);
router.get('/apps', appController.list);
router.patch('/apps/:id/toggle-active', appController.toggleActive);

module.exports = router;