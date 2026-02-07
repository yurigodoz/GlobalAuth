const express = require('express');
const router = express.Router();

const adminController  = require('../controllers/adminController');
const appController = require('../controllers/appController');
const userController = require('../controllers/userController');
const adminAuthMiddleware = require('../middlewares/adminAuthMiddleware');

router.post('/login', adminController.login);

// Demais rotas protegidas por autenticação de admin
router.use(adminAuthMiddleware);

router.post('', adminController.create);

// Apps
router.post('/apps', appController.create);
router.get('/apps', appController.list);
router.patch('/apps/:id/toggle-active', appController.toggleActive);

// Users
router.get('/users', userController.list);
router.patch('/users/:id/block', userController.block);
router.patch('/users/:id/unblock', userController.unblock);

module.exports = router;