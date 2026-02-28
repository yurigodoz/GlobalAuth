const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { loginLimiter, generalLimiter } = require('../middlewares/rateLimitMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { registerSchema, loginSchema, requestPasswordResetSchema, resetPasswordSchema, refreshSchema } = require('../validators/authValidator');

router.post('/register', generalLimiter, validate(registerSchema), controller.register);
router.post('/login', loginLimiter, validate(loginSchema), controller.login);
router.get('/validate-token', authMiddleware, controller.validateToken);
router.post('/request-password-reset', generalLimiter, validate(requestPasswordResetSchema), controller.requestPasswordReset);
router.post('/reset-password', generalLimiter, validate(resetPasswordSchema), controller.resetPassword);
router.post('/refresh', generalLimiter, validate(refreshSchema), controller.refresh);

module.exports = router;
