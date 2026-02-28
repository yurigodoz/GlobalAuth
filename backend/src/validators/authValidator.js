const { z } = require('zod');

const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  app: z.string().min(1, 'App é obrigatório')
});

const loginSchema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
  app: z.string().min(1, 'App é obrigatório')
});

const requestPasswordResetSchema = z.object({
  email: z.string().email('E-mail inválido'),
  app: z.string().min(1, 'App é obrigatório')
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  newPassword: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres')
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório')
});

module.exports = {
  registerSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  refreshSchema
};
