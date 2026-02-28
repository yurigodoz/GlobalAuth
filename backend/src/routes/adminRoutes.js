const express = require('express');
const router = express.Router();

const adminController  = require('../controllers/adminController');
const appController = require('../controllers/appController');
const userController = require('../controllers/userController');
const adminAuthMiddleware = require('../middlewares/adminAuthMiddleware');
const { loginLimiter } = require('../middlewares/rateLimitMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { adminLoginSchema, adminCreateSchema } = require('../validators/adminValidator');
const { appCreateSchema } = require('../validators/appValidator');

router.post('/login', loginLimiter, validate(adminLoginSchema), adminController.login);

// Demais rotas protegidas por autenticação de admin
router.use(adminAuthMiddleware);

router.post('', validate(adminCreateSchema), adminController.create);

// Apps
router.post('/apps', validate(appCreateSchema), appController.create);
router.get('/apps', appController.list);
router.patch('/apps/:id/toggle-active', appController.toggleActive);

// Users
router.get('/users', userController.list);
router.patch('/users/:id/block', userController.block);
router.patch('/users/:id/unblock', userController.unblock);

module.exports = router;